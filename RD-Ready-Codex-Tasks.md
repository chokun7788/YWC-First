# RD Ready — Copy/Paste Prompts และลำดับทำงานสำหรับ Codex

ใช้คู่กับ RD-Ready-Codex-Master-Spec.md ซึ่งเป็นข้อกำหนดหลัก ไม่จำเป็นต้อง paste เอกสารยาวทั้งหมดในทุกข้อความ ให้วางไฟล์ไว้ใน repository และสั่งอ่านจาก path

## 1. วิธีเริ่มจากเครื่องของคุณ

1. สร้างโฟลเดอร์ repository เช่น rd-ready แล้วเปิดด้วยเครื่องมือที่ใช้ Codex
2. นำไฟล์เหล่านี้วางไว้ใน docs/:
   - RD-Ready-Codex-Master-Spec.md
   - RD-Ready-Codex-Tasks.md
   - RD-Ready-Content-Pack.md
   - rd-ready-content-template.json
3. ถ้ามีโค้ดเดิมให้ commit/snapshot ก่อน ไม่สร้างโปรเจกต์ทับ
4. ส่ง Prompt 0 ด้านล่าง
5. ให้ Codex ทำทีละ milestone เพื่อให้ตรวจและแก้ได้ อย่าสั่งทำ optional features พร้อมกัน
6. คุณกรอกเนื้อหาและสมัครบริการควบคู่ไป ระหว่าง Codex ทำ core ที่ไม่ต้องใช้ keys

ชื่อหรือรุ่นของ coding model ไม่เปลี่ยน spec นี้ หาก session context หมดให้เปิด session ใหม่และใช้ Resume prompt ท้ายไฟล์ ไม่รับประกันว่า one-shot จะสร้างแอปสมบูรณ์โดยไม่ตรวจผล

## 2. Prompt 0 — คัดลอกอันนี้เริ่มได้เลย

```text
สร้างเว็บ RD Ready ตามเอกสารใน docs/ ให้เป็น MVP ใช้งานได้จริงสำหรับทำคนเดียวภายใน 3 วัน

อ่านไฟล์ต่อไปนี้ให้ครบก่อน:
1. docs/RD-Ready-Codex-Master-Spec.md
2. docs/RD-Ready-Codex-Tasks.md
3. docs/RD-Ready-Content-Pack.md
4. docs/rd-ready-content-template.json

เริ่มจากตรวจ repository ปัจจุบันและ environment อย่าลบงานเดิมหรือ scaffold ทับ ตรวจ package manager และ Node version ก่อนเลือก Next.js stable ที่รองรับ

เป้าหมายหลัก: Chatbot แบบ grounded AI + rule-based fallback, คู่มือแต่งกาย, ค้นสิ่งของ/ข้อกำหนด, citations, anonymous session, opt-in analytics และ operational logs บน Supabase ไม่ทำ login หรือ admin dashboard

ข้อห้าม:
- ห้ามแต่งกฎ รด. อ้างอิง URL หรือวันที่ตรวจ
- draft content ห้ามใช้ตอบเป็นข้อมูลจริง
- ห้ามให้ AI กำหนดสถานะอนุญาต/ห้ามเอง ต้องใช้ deterministic policy resolver
- ห้ามเผย secrets ใน browser/repo/logs
- ห้ามเปิด paid AI สาธารณะโดยไม่มี shared atomic usage cap
- ห้ามบอกว่าทดสอบหรือ deploy แล้วถ้ายังไม่ได้ทำ
- ห้ามเริ่ม Vision ก่อน core flow ผ่าน tests

เขียน PLAN.md และ DECISIONS.md แล้วลงมือ Milestone 1–2 ก่อน ไม่หยุดแค่เสนอแผน หากขาด credentials ให้ใช้ rule-only mode และ test fixtures ที่แยกจาก production content ทำงานส่วนอื่นต่อได้

ทุก milestone ต้องรายงานไฟล์ที่เปลี่ยน คำสั่งที่รัน ผลจริง blocker และขั้นต่อไป เมื่อทำ core ได้แล้วใช้ prompt ถัดไปตามเอกสาร Tasks
```

## 3. Milestone 1 — Foundation

### งานของ Codex
- ตรวจ repo/Node/npm; หากเริ่มใหม่ใช้ create-next-app ผ่านคำสั่งที่ตรวจ help/version แล้ว
- Next.js App Router, TypeScript strict, Tailwind, src directory, alias @/*
- ติดตั้ง zod, openai, @supabase/supabase-js, server-only, lucide-react; test tools ตามจำเป็น
- .env.example, .gitignore, .nvmrc, README setup
- layout, header, mobile nav, basic tokens และหน้าแรก
- health route ไม่มีข้อมูลลับ
- npm scripts lint/typecheck/build/test ที่ใช้ได้กับ framework รุ่นจริง
- environment parser รองรับ rule-only แบบไม่มี keys

### Gate
- dev server เปิดได้
- build/typecheck ผ่าน
- ไม่มี secrets ฝังใน frontend
- หน้าเล็ก 360px ไม่มี horizontal overflow

### Prompt
```text
ทำ Milestone 1 ให้เสร็จตาม Master Spec: foundation ที่รันและ build ได้จริง ใช้ component แค่ที่จำเป็น ยังไม่ทำ Vision หรือ login ตรวจ env handling ให้ไม่มี key ก็รัน rule-only ได้ สรุปผล commands จริงและบันทึก PLAN.md
```

## 4. Milestone 2 — Content engine และ deterministic rules

### งานของ Codex
- สร้าง content/context schemas ด้วย Zod
- แตก template root JSON เป็น content/*.json ตาม collection keys
- สร้าง load/validate, cross-reference validation, source validity, content version hash
- production content เริ่ม draft/empty ไม่เพิ่ม facts เอง
- สร้าง fixtures ที่เป็นข้อมูลสังเคราะห์ มีป้าย TEST ONLY ใช้ local source fixture ไม่ทำลิงก์ปลอมที่ดูจริง
- scope matcher, item aliases, keyword retrieval, policy resolver
- supersedes relations และ conflict states
- rule answer builder คืน ChatResponse contract
- fixtures จำลอง regular/field, คนละ academic year, permission ต่างกัน, missing/expired/draft evidence

### Gate
- npm run content:validate ผ่านกับ draft starter แต่แจ้งจำนวน verified เป็น 0 อย่างชัดเจน
- tests ของ scope/conflict/draft/unknown ผ่าน
- เพิ่ม verified data ที่ reference ผิดแล้ว validator ต้อง fail
- ไม่มี production code import tests/fixtures

### Prompt
```text
ทำ Milestone 2 โดยยึด content schemas และ scope semantics ใน Master Spec ให้ engine ใช้งานและ unit test ได้ก่อนต่อ AI ตรวจ references, wildcard, missing context, academic year, expired sources และ conflicts ต้อง fail closed ห้ามเติมกฎ รด.จริงเอง ใช้ test fixtures แยกจาก production เท่านั้น
```

## 5. Milestone 3 — Chat vertical slice แบบไม่ใช้ AI

### งานของ Codex
- ContextPanel, context persistence, hydration-safe localStorage
- ไม่อ่าน localStorage ระหว่าง server render ใช้ client effect และ schema version
- ChatShell, composer, structured answer renderer, source cards, guide links
- POST /api/chat body size cap, Zod, error mapping, rule engine
- /api/session cookie และ origin checks ตาม spec; dev mode แยก production
- changes in context clear conversation after confirmation
- draft/empty/no-source/unsupported messages
- chat history อยู่ใน memory ไม่เก็บ server-side และไม่ persist transcript ใน localStorage โดยปริยาย
- last user messages จำกัดตาม contract; ไม่ส่ง trusted assistant text กลับไปให้ model
- ถ้า API failure เก็บ input ไว้ให้ส่งใหม่ ไม่ auto retry ไม่จำกัด

### Gate
- interaction ครบตั้งแต่ถาม → answer → citation โดยใช้ fixtures เฉพาะ tests
- production ไม่มี verified content ต้อง unknown ไม่แกล้งแสดง fact
- มี missing-context flow
- request invalid ได้ HTTP code ถูกต้อง

### Prompt
```text
ต่อ Milestone 3 ให้หน้า Chat และ POST /api/chat ใช้ rule engine จริง สร้าง UI states ทุกสถานะหลักและ source cards ตาม contract ต้องทำงานได้โดยไม่มี OpenAI/Supabase ใน local development ถ้า production data ยังไม่ verified ให้ unknown อย่างซื่อสัตย์ ห้ามเอา test fixtures มาแสดงจริง
```

## 6. Milestone 4 — Supabase logs, consent และ usage limiter

### งานของ Codex
- สร้าง migration 001_logs_and_limits.sql, RLS และ grants
- SQL RPC atomic usage reservation + duplicate request handling
- inbound limiter และ AI global cap
- server-only Supabase client
- signed cookie/HMAC and session hashing
- ConsentPanel แยก analytics กับ save question text
- operational logs ไม่บันทึก message/context/demographics
- analytics opt-in only และ redaction best effort
- cleanup dry-run script + SQL/job setup instructions
- logging timeout ไม่ทำ response หาย
- preview/public production ถ้าไม่มี shared limiter ต้อง AI off

### เจ้าของต้องทำ
1. สร้าง Supabase project
2. รัน migration ใน SQL editor หรือผ่าน CLI
3. ใส่ server-side credentials ใน .env.local ด้วยตัวเอง
4. ยืนยันด้วย dashboard ว่า log เข้าและสิทธิ anon อ่านไม่ได้

### Gate
- tests consent=false ไม่มี text/analytics
- write DB failure ไม่ทำ rule answer พัง
- atomic limiter ทดสอบ concurrency กับ dev DB ถ้ามี credentials; ถ้ายังไม่มีให้ระบุ UNVERIFIED
- RPC ไม่ public executable

### Prompt
```text
ทำ Milestone 4 ตาม Master Spec โดยใช้ Supabase เฉพาะ server-side สำหรับ operational logs, opt-in analytics และ shared atomic rate limits สร้าง SQL migration พร้อม RLS/grants/RPC ที่เรียกได้เฉพาะ service_role ห้ามทำ read-then-update counters ใน JS ถ้าไม่มี credentials ให้เขียน tests และขั้นตอน manual พร้อมระบุว่ายังไม่ integration-tested ห้ามแสร้งว่าต่อ DB แล้ว
```

## 7. Milestone 5 — Grounded AI adapter

### งานของ Codex
- OpenAI provider adapter โดยใช้ SDK version ที่ติดตั้งจริง
- ตรวจ API method กับ SDK types/docs; ใช้ structured output schema
- model name จาก env เท่านั้น
- AI_ENABLED=false เป็น default
- timeout 12s, no automatic retry, bounded tokens
- reserve shared usage ก่อน provider call เสมอ
- candidates allowlist; model คืน IDs/template เท่านั้น
- source/item facts render ด้วย server
- invalid output/refusal/timeout/unknown model → rule fallback
- record usage metrics เฉพาะที่ provider คืนจริง ไม่เดา tokens/cost
- smoke-ai script ไม่เรียกอัตโนมัติใน tests

### เจ้าของต้องทำ
1. เลือก provider account และสร้าง API key
2. ใส่ key/model ที่เข้าถึงได้ใน local env
3. รัน smoke test ดูว่า model รองรับ schema ที่ใช้
4. ตั้งเพดานและ alerts ฝั่ง provider ตามที่บัญชีมี

### Gate
- mock model คืน invalid IDs แล้ว fallback
- AI ปิดไม่สร้าง provider client โดยไม่จำเป็น
- shared limit fail ไม่มี paid call
- real smoke test ผ่านก่อนตั้ง AI_ENABLED=true สาธารณะ

### Prompt
```text
ทำ Milestone 5: เพิ่ม AI selection layer ตาม Master Spec ใช้ provider adapter ฝั่ง server และ output schema แบบ constrained IDs ห้าม generate facts/URLs/permission จาก model ใช้ model ID จาก env และตรวจ SDK จริง ทุก provider error ต้อง fallback ด้วยข้อมูลชุดเดียวกัน ไม่ทำ streaming และไม่ retry โดยอัตโนมัติ รัน real smoke test เฉพาะเมื่อฉันตั้ง credentials แล้ว
```

## 8. Milestone 6 — Guides, Items และ content integration

### งานของ Codex
- guides listing/detail พร้อม scope และ source per step
- items listing ค้นหา aliases และสถานะตาม context ไม่ใส่ default allowed
- sources registry page เฉพาะ verified sources ที่ใช้งานได้
- privacy/about ตามพฤติกรรมจริง
- ไม่มี empty links, fake images, fake video URLs
- วิดีโอใช้ external link ก่อน embed ลดภาระ privacy/โหลด third party
- placeholder images ใช้ neutral local SVG ที่ระบุ “รอภาพประกอบ” ไม่วาดเทคนิคแต่งกายให้ดูเหมือนคำสอนจริง
- local checklist หาก core เสร็จแล้วเท่านั้น; key แยก context hash; ข้อความ “จัดครบตามรายการนี้” ไม่รับรองพร้อมฝึก

### Gate
- verified guide ทุกขั้นมี evidence
- source cards เปิดได้จริง
- no draft detail page indexed/published
- metadata และ 404 ถูกต้อง

### Prompt
```text
ทำ Milestone 6: หน้าคู่มือ/รายละเอียด/สิ่งของ/แหล่งข้อมูล/ความเป็นส่วนตัวด้วย content จริงที่มี หากยังไม่มี verified content ให้ empty state ไม่สร้างข้อกำหนดเอง ออกแบบ mobile-first โทนสะอาด olive/slate ใช้ semantic HTML, keyboard navigation และสถานะที่มี label ไม่ใช้สีอย่างเดียว
```

## 9. Milestone 7 — Verification และ deploy

### งานของ Codex
- unit/integration tests ที่ spec กำหนด
- Playwright smoke flows 4–7 เส้นทางที่สำคัญ
- lint/typecheck/content validate/tests/build
- search repo/client code/loggers หา secret leakage
- verify request limits, source link protocols และ model cannot generate URLs
- manual mobile check list และ test logs
- README + HANDOFF + demo script
- deploy instructions ที่ตรง environment จริง

### Gate ก่อนส่ง
- ไม่มี error ที่หยุด core journey
- มี verified content อย่างน้อยชุดเล็กและขอบเขตหน้าเว็บตรงกับข้อมูลจริง
- API disabled path ทำงาน
- เปิดเว็บจากอีกเครื่องได้
- ทุกข้อที่ไม่ได้ทดสอบเขียนไว้ตรงไปตรงมา

### Prompt
```text
ทำ Milestone 7 ตรวจโปรเจกต์ทั้งระบบตาม acceptance criteria ใน Master Spec แก้ข้อผิดพลาดก่อนเพิ่มฟีเจอร์ใหม่ รัน check/build/tests ที่ทำได้จริง บันทึกผลและสิ่งที่ยังไม่ตรวจ จัดทำ README, HANDOFF และ runbook deploy Vercel + Supabase ถ้ายังไม่มีสิทธิ deploy ให้บอกขั้นตอนที่ฉันต้องทำ ไม่อ้างว่ามี production URL แล้ว
```

## 10. Optional prompt — Vision

ใช้เมื่อ core ทำงานครบจริงและเหลือเวลาอย่างน้อย 3–4 ชั่วโมงเท่านั้น

```text
ตรวจ core tests และเวลาที่เหลือก่อน ถ้ายังมี blocker ห้ามทำ Vision
ถ้า core พร้อม ให้ทำ optional image identification หลัง feature flag ตาม Master Spec: รับภาพจำกัดขนาด ตรวจ actual file type, identify catalog items only, ให้ผู้ใช้ยืนยัน แล้วส่ง confirmedItemIds เข้า Chat API เดิม ไม่ให้ Vision ตัดสิน allowed/prohibited ไม่เก็บภาพ/base64 ใน DB หรือ logs และต้องนับโควตาก่อนเรียก provider ปิด feature flag เป็น default จน smoke test ผ่าน
```

## 11. Resume prompt เมื่อ context ของ Codex เต็ม

```text
อ่าน docs/RD-Ready-Codex-Master-Spec.md, docs/RD-Ready-Codex-Tasks.md, PLAN.md, DECISIONS.md และ HANDOFF.md ถ้ามี
ตรวจ git status และโค้ดจริงก่อนเชื่อ checklist
สรุปว่าปัจจุบันอยู่ milestone ใด ข้อไหนเสร็จจริง ข้อไหนเป็น mock/ยังไม่ทดสอบ แล้วทำ milestone ถัดไป
ห้าม rewrite ทั้ง repo ห้ามลด safety/validation เพื่อให้ tests ผ่าน และห้ามสร้างข้อกำหนด รด.หรือ citations เอง
```

## 12. Bug-fix prompt

```text
มีปัญหาต่อไปนี้: [ใส่อาการ/ข้อความ error ที่ปิด secrets แล้ว]
ตรวจ root cause จากไฟล์จริงและทำ minimal fix เพิ่ม regression test ห้ามแก้ด้วยการปิด validation ลบ tests เปลี่ยนกฎเป็น default allowed หรือกลบ error เฉย ๆ
รายงานสาเหตุ ไฟล์ที่แก้ คำสั่งตรวจ ผลจริง และความเสี่ยงที่เหลือ
```

## 13. สิ่งที่ต้องไม่ปล่อยให้ agent ตัดสินใจแทนเจ้าของ
- ความถูกต้องและขอบเขตของประกาศ รด.
- ชื่อหน่วยฝึกทางการ/ปีการศึกษาที่รองรับ
- สิทธิการนำภาพ เอกสาร คลิปมาเผยแพร่
- บัญชี billing/API keys/provider retention settings
- privacy notice ก่อนเปิดกับผู้เยาว์ในวงกว้าง
- การเปิด AI จริงเมื่อยังไม่มี usage cap
- ยืนยันว่า smoke test บน URL จริงผ่านจากอุปกรณ์อื่น
