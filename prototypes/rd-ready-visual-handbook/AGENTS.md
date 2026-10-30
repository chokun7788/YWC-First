# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Selected implementation

- User selected direction 4: `D:/Chokun/design/2026-10-29/visual-directions-234848/direction-04-desktop-mobile.png` (paired desktop/mobile visual handbook).
- User explicitly chose React + Vite + TypeScript + CSS on 2026-10-30. This is a responsive web frontend, not a framed mobile app. Work only inside this prototype; preserve original Next.js source and verified-only content engine.
- Historical poster and research guides are review material only. Never turn draft records into real answers or silently relabel the academic year. Keep unknown/no-approved-answer behavior until an approved backend is connected.
- No Login, Vision, Admin, paid API calls, deployment, third-party embeds, or server persistence in this scope.
- Native browser tools are unavailable in this session. Authorized verification uses isolated headless Chromium via existing D:/Chokun Playwright, not the user's browser profile.

## Student-flow iteration approved 2026-10-30

User approved the recommendations in D:/Chokun/docs/USER-NEEDS-POSITIONING-2026-10-30.md. Preserve direction4's olive/white/photo handbook identity while changing hierarchy: neutral first-training hero, explicit center/field/unsure choices, immediately visible question form, four task shortcuts, clearer guide selection, grouped checklist/progress/optional local memory and access to dated camp-life review material. These approved changes supersede the old mock's exact homepage hierarchy. Keep all research pending and separate from approved answers. Do not ask again to choose a new visual direction for this scoped iteration.

## Gemini intent integration approved 2026-10-30

User authorized a local Gemini integration and will supply their own API key. This supersedes the earlier no-API/backend restriction only for this feature: server-only env, official SDK, strict intent/ID selection, original verified-only answer engine, local fallback, count-only local usage persistence. Never persist questions. No real paid calls made during implementation; mocks verify provider transport. Local server is loopback-only; existing Sites worker does not host the assistant backend. Do not publish it as a public AI service. Vision/Login/Admin remain excluded.

## Knowledge integration follow-up 2026-10-30

User reported missing data linkage/role. The provider now receives filtered approved evidence text/source metadata plus a separate review-navigation catalogue; it chooses validated evidence IDs and server resolver emits original facts/citations. Prompt in server/assistant-prompt.ts; retrieval in server/knowledge.ts. Current production verified count0, pending navigation40. Never approve research to bypass this state. One live intent request now succeeded; original no-live-test notes above describe earlier implementation. See root docs/KNOWLEDGE-INTEGRATION-2026-10-30.md and generated KNOWLEDGE-MAP-2026-10-30.md/.json.

## Explicit user override: draft-assisted answers

User now explicitly withdrew the earlier prohibition on using drafts as answers and asked to try them. Enable RD_READY_RESEARCH_MODE locally and allow Gemini to summarize sourced draft research as clearly labelled experimental answers. This supersedes earlier draft-answer restrictions for this local experiment. Preserve draft/verified status in original data and never claim owner review/current official permission. Cite supplied references, preserve historical years and source attribution, distinguish community experience from official regulations. Keep original strict mode available when flag is off. No deployment/Vision/Login/Admin.

## Broad coverage and deployment preparation

User requested many-case evaluation and backend/deploy recommendations, explicitly requiring data organization before deployment. Import all sourced research categories, not just visible frontend cards; preserve comment attribution, historical scope and unknown permissions. Current68case evaluator is retrieval/scope coverage, not live model quality for all questions. Canonical experimental migration snapshot lives in data/deploy outside public, generated by prepare:deploy-data. Public deployment requires API handler adaptation, approved environment setup and shared atomic budget controls; local filesystem counters are insufficient. Do not upload raw workspace/tool caches or claim cloud deployment is done.

## Deployment authorized 2026-10-30

Owner explicitly chose redeployment in authenticated `chokun7788`, team `team_Ejvf6g4RFBBKRyhIgUU39Nb2`, slug `chokuns-projects-908117b8`. Current local project link is `prj_Aa3QNqB8KfGj7Zg982nAWpVXIkb8`; verify this target before consequential actions. Vercel MCP remains connected to the older different account, so use authenticated owner CLI / owner-vercel helper for this project's management. Do not accidentally use MCP default-account mutations here. New public URL https://rd-ready-preview-nine.vercel.app is200without auth; deployment hostname remains protected. Final `dpl_CBtcDrtcSWkXZ5TP5SWe3YJuYwdi` isREADY and actually verified:30hosted browser checks +7public checks,4live generation requests. Explicit .js specifiers are required in the deployed ESM runtime graph. Source/media scope remains draft. Do not revisit resolved consent-link loops or request keys again. Prior Supabase/deployment-pending notes below are historical.

Supabase is now connected: isolated `rd-ready-preview` project `socwfxnmblepifjshpfn`; migration history version `20261029230858` matches local migration filename. Data import twice left 251 chunks/102 sources/1 release. Seven tables RLS enabled with anon/authenticated access revoked; informational no-policy advisory is intentional for this server-only database. Scoped `rd-ready-gateway` verifies a dedicated hashed application key and only allows pinned release reads / bounded quota reservation, never arbitrary writes or SQL. Service-role key stays in Supabase; Vercel encrypted env holds app gateway key, session HMAC key and Gemini key. Never print `.local/cloud-secrets.json` or `.env.local`. Real local cloud API→hosted DB→Gemini passed for vape and packing; latest READY Vercel deployment `dpl_7eJkwGRAR1D7JNdNedYBaiRnSEYV` still needs hosted protected-access verification. Older pending notes below describe the earlier stage.

User authorized following the proposed backend/data plan and trying deployment. Supersedes previous no-deployment restriction for the isolated rd-ready-preview project. Latest staging deployment dpl_3F1bnNgAN6otZz5aLpEPDArtFwh9 isREADY; Vercel team access403blocks hosted verification and Supabase remains unconnected. Never disable protection as a shortcut. No further user approval needed for already authorized implementation/migration/deploy once account access is supplied. Cloud AI must remain off until atomic shared budget is configured; localGemini may remain enabled. Original code/content stays preserved. See root docs/VERCEL-DEPLOY-2026-10-30.md.

## AI answer image follow-up
User confirmed missing pictures were in AI responses. server/research-images.ts now reuses existing guide image metadata and related dress/hair FAQ topic links for actually used records; model never supplies image URLs. Retain document captions/scope and source link, deduplicate by localasset, keep2566poster. Current READY deployment dpl_6jvW4nqWxDmAW16KXPd2yqxoC9NQ; same public URL.21assistant/8cloud/16publicimagechecks/32preservedhashes pass. No new tutorial imagery fabricated; boot/lacing/sleeve topics remain text/video where no referenced photo exists. See root docs/AI-ANSWER-IMAGES-2026-10-30.md.

## PACK & GO redesign selected 2026-10-30
User selected first displayed latest ideation image D:/Chokun/design/2026-10-30/ux-redesign-options/displayed-01.png. This supersedes old direction4 homepage hierarchy for this iteration. App is checklist-first (packing default/center), desktop olive-nav/photo rail and mobile bottomnav, secondary header search opens existing assistant. New PackingHome reuses same scoped useChecklist/full PackingView; preview5items and23center/17field counts are real, not mock metrics. Canonical detail/source/year unchanged. ResearchAnswer initially6points with full expansion/citations/media; do not discard hidden facts. Single new stilllife is illustrative only. Current live deployment dpl_FNx482k6oKfnLsxhnJ2YR93jfzuE; same public URL. New current UI suite qa/pack-go-browser.mjs89checks across4viewports; main test:ui updated. Historical UI suites describe older layouts.8actual public live checks pass. See root docs/PACK-GO-REDESIGN-2026-10-30.md and final passed design-qa.md.

## Item detail photos and packing review 2026-10-30
User requested a photo in every item modal and review of apparently odd center/field lists. Currentcenter checklist22leafitems (day-uniform is an aggregate, not an extra object); field17poster rows kept verbatim. Shared pure packing-structure.ts derives grouping/status and AIcenter rows. New item-media.ts maps39leafIDs to existing+30illustrative WebPs; no fake actualID/crest/medicaldosing/photoevidence. All39dialogs tested live with127checks;93publicUIchecks(replay)+8actualAIchecks pass. Provenance underqa/item-image-provenance, neverpublic. Defaultdatarelease is23929f64ef48059e9f8c656e438988be89d1cc45297191c75c93aba75417d301; source251chunks/102URLs, onlypacking-centerchanged, olderreleasepreserved. Latest owner deploymentdpl_WyVK6edAv3hP6JBJikSfX7KBt3mB; samepublicURL. Dates remainhistorical and conditionals are not mandatory. See rootdocs/ITEM-PHOTOS-AND-PACKING-REVIEW-2026-10-30.md.
