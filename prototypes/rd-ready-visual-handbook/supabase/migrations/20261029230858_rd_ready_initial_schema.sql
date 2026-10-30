-- Additive RD Ready schema. No existing application tables are changed.
create table if not exists public.rd_ready_releases (
 version text primary key check(version ~ '^[a-f0-9]{64}$'),
 bundle jsonb not null check(bundle->>'schemaVersion'='1'),
 created_at timestamptz not null default now()
);
create table if not exists public.rd_ready_sources (
 version text not null references public.rd_ready_releases(version),
 id text not null,url text not null check(url ~ '^https?://'),review_status text not null check(review_status='draft'),
 primary key(version,id)
);
create table if not exists public.rd_ready_topics (
 version text not null references public.rd_ready_releases(version),id text not null,
 primary key(version,id)
);
create table if not exists public.rd_ready_chunks (
 version text not null,id text not null,topic_id text not null,title text not null,body text not null,
 kind text not null,context text not null check(context in ('center','field','any')),
 aliases jsonb not null default '[]',scope jsonb not null,review_status text not null check(review_status='draft'),
 primary key(version,id),foreign key(version,topic_id) references public.rd_ready_topics(version,id)
);
create table if not exists public.rd_ready_citations (
 version text not null,chunk_id text not null,source_id text not null,attribution text not null,locator text not null,
 primary key(version,chunk_id,source_id,attribution,locator),
 foreign key(version,chunk_id) references public.rd_ready_chunks(version,id),
 foreign key(version,source_id) references public.rd_ready_sources(version,id)
);
create table if not exists public.rd_ready_media (
 version text not null references public.rd_ready_releases(version),id text not null,body jsonb not null,
 primary key(version,id)
);
create table if not exists public.rd_ready_usage (
 bucket text primary key,calls integer not null default 0 check(calls>=0),expires_at timestamptz not null
);
create index if not exists rd_ready_chunks_topic_idx on public.rd_ready_chunks(version,topic_id);
create index if not exists rd_ready_citations_source_idx on public.rd_ready_citations(version,source_id);
create index if not exists rd_ready_usage_expiry_idx on public.rd_ready_usage(expires_at);
alter table public.rd_ready_releases enable row level security;
alter table public.rd_ready_sources enable row level security;
alter table public.rd_ready_topics enable row level security;
alter table public.rd_ready_chunks enable row level security;
alter table public.rd_ready_citations enable row level security;
alter table public.rd_ready_media enable row level security;
alter table public.rd_ready_usage enable row level security;
revoke all on public.rd_ready_releases,public.rd_ready_sources,public.rd_ready_topics,public.rd_ready_chunks,public.rd_ready_citations,public.rd_ready_media,public.rd_ready_usage from public,anon,authenticated;
grant select,insert,update,delete on public.rd_ready_releases,public.rd_ready_sources,public.rd_ready_topics,public.rd_ready_chunks,public.rd_ready_citations,public.rd_ready_media,public.rd_ready_usage to service_role;

create or replace function public.rd_ready_import_release(p_version text,p_bundle jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r jsonb;c jsonb;existing jsonb;
begin
 if p_version is null or p_version !~ '^[a-f0-9]{64}$' or coalesce(p_bundle->>'schemaVersion','')<>'1' or coalesce(p_bundle->>'releaseChannel','')<>'experimental' then raise exception 'Invalid release';end if;
 perform pg_advisory_xact_lock(hashtext(p_version));
 select bundle into existing from public.rd_ready_releases where version=p_version;
 if found and existing<>p_bundle then raise exception 'Version is immutable';end if;
 insert into public.rd_ready_releases(version,bundle) values(p_version,p_bundle) on conflict do nothing;
 for r in select value from jsonb_array_elements(p_bundle->'sources') loop
  insert into public.rd_ready_sources(version,id,url,review_status) values(p_version,r->>'id',r->>'url',r->>'reviewStatus') on conflict do nothing;
 end loop;
 for r in select value from jsonb_array_elements(p_bundle->'topics') loop
  insert into public.rd_ready_topics(version,id) values(p_version,r->>'id') on conflict do nothing;
 end loop;
 for r in select value from jsonb_array_elements(p_bundle->'chunks') loop
  insert into public.rd_ready_chunks(version,id,topic_id,title,body,kind,context,aliases,scope,review_status)
  values(p_version,r->>'id',r->>'topicId',r->>'title',r->>'text',r->>'kind',r->>'context',r->'aliases',jsonb_build_object('academicYearBE',r->'academicYearBE','studyYears',r->'studyYears','uniformGroups',r->'uniformGroups','requiresScopeReview',r->'requiresScopeReview'),r->>'status') on conflict do nothing;
  for c in select value from jsonb_array_elements(r->'citations') loop
   insert into public.rd_ready_citations(version,chunk_id,source_id,attribution,locator) values(p_version,r->>'id',c->>'sourceId',c->>'attribution',c->>'locator') on conflict do nothing;
  end loop;
 end loop;
 for r in select value from jsonb_array_elements(p_bundle->'media') loop
  insert into public.rd_ready_media(version,id,body) values(p_version,r->>'id',r) on conflict do nothing;
 end loop;
 return jsonb_build_object('version',p_version,'chunks',(select count(*) from public.rd_ready_chunks where version=p_version),'sources',(select count(*) from public.rd_ready_sources where version=p_version));
end;
$$;
revoke all on function public.rd_ready_import_release(text,jsonb) from public,anon,authenticated;
grant execute on function public.rd_ready_import_release(text,jsonb) to service_role;

create or replace function public.rd_ready_reserve_usage(p_session_hash text,p_ip_hash text,p_daily_limit integer,p_session_limit integer,p_minute_limit integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare day_key text;session_key text;ip_key text;utc_day text;
begin
 if p_session_hash is null or p_ip_hash is null or p_daily_limit is null or p_session_limit is null or p_minute_limit is null or p_session_hash !~ '^[a-f0-9]{64}$' or p_ip_hash !~ '^[a-f0-9]{64}$' or p_daily_limit<1 or p_daily_limit>1000 or p_session_limit<1 or p_session_limit>100 or p_minute_limit<1 or p_minute_limit>100 then return false;end if;
 -- Global lock serializes check+reservation across all function instances.
 perform pg_advisory_xact_lock(624101030);
 utc_day:=to_char(now() at time zone 'UTC','YYYY-MM-DD');
 day_key:='rd-ready:day:'||utc_day;
 session_key:='rd-ready:session:'||utc_day||':'||p_session_hash;
 ip_key:='rd-ready:minute:'||to_char(now() at time zone 'UTC','YYYY-MM-DD-HH24-MI')||':'||p_ip_hash;
 if coalesce((select calls from public.rd_ready_usage where bucket=day_key),0)>=p_daily_limit or coalesce((select calls from public.rd_ready_usage where bucket=session_key),0)>=p_session_limit or coalesce((select calls from public.rd_ready_usage where bucket=ip_key),0)>=p_minute_limit then return false;end if;
 insert into public.rd_ready_usage(bucket,calls,expires_at) values(day_key,1,now()+interval '2 days'),(session_key,1,now()+interval '2 days'),(ip_key,1,now()+interval '2 days') on conflict(bucket) do update set calls=public.rd_ready_usage.calls+1;
 delete from public.rd_ready_usage where expires_at<now();
 return true;
end;
$$;
revoke all on function public.rd_ready_reserve_usage(text,text,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.rd_ready_reserve_usage(text,text,integer,integer,integer) to service_role;
