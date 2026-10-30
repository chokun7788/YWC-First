# RD Ready — React visual handbook + local intent assistant

## Owner deployment verified — 2026-10-30

Public site: https://rd-ready-preview-nine.vercel.app (owner `chokun7788`). Final READY deployment `dpl_CBtcDrtcSWkXZ5TP5SWe3YJuYwdi`; native Node24ESM imports fixed. Real hosted browser→API→Supabase→Gemini passed30checks; separate public-alias browser test without auth headers passed7checks, including real cited AI answer at390/1440px. New Thai single-character false-match regression passes;20assistant/8cloud/68retrieval cases and32preserved hashes pass. Data remains experimental251chunks/102sources; shared20/day,8/session/day,5/IP/minute limits apply. No owner account/key action remains for trying the public URL. See D:/Chokun/docs/OWNER-DEPLOY-2026-10-30.md for files, commands, results and limits. Earlier pending sections below are chronological history superseded by this result.

## Vercel staging + Supabase connected (2026-10-30)

Latest READY preview: https://rd-ready-preview-ajde3koi3-68010556-3482.vercel.app . Supabase project `socwfxnmblepifjshpfn` now contains the immutable experimental release: 251 chunks / 102 source URLs / 164 topics / 40 media links. Native Supabase migration/import/RLS checks and real local cloud API→hosted Supabase→Gemini calls passed. Cloud AI uses shared atomic quotas (20/day total, 8/session/day, 5/IP/minute). A scoped Edge gateway keeps the service-role credential inside Supabase; app secrets are encrypted in Vercel preview env. Hosted Vercel HTTP/browser verification remains blocked by the team's connection grant; READY means build success, not a verified hosted request. The paragraph below records the earlier deployment stage.

New isolated project rd-ready-preview has a READY staging deployment: https://rd-ready-preview-8g47s2mq3-68010556-3482.vercel.app . Hosted checks currently stop at Vercel SSO/team403; owner authorization is required to inspect. Supabase is not connected/migrated yet; cloud AI isoff and snapshot fallback is prepared. Local4175Gemini remains working. Cloud handler/migration6tests and local end-to-end9checks pass. See D:/Chokun/docs/VERCEL-DEPLOY-2026-10-30.md for exact files/commands/results and next actions.

## Current: draft-assisted AI answers enabled

User explicitly authorized using drafts for this local experiment. RD_READY_RESEARCH_MODE=true in ignored .env.local now enables Gemini-generated Thai answers from retrieved research, with bullet points, source references, clips and packing image. Research is still labelled draft; source approval statuses unchanged. This supersedes the earlier no-draft-answer descriptions below for the active experiment. Set flagfalse to restore strict mode. No extra key/setup needed; server4175 is running.

Live packing17items/poster and knot5steps/5clip links succeeded. Current checks:19assistant tests,29research browser checks,160strict UI checks/7viewports,9strict focused browser checks,4worker tests and32original hashes. Full files/commands/limitations: D:/Chokun/docs/RESEARCH-ANSWER-MODE-2026-10-30.md.

## Active setup: Gemini intent integration 2026-10-30

เว็บที่เปิดอยู่ http://127.0.0.1:4175/ ใช้ local backend แล้ว. แก้ `.env.local` ในโฟลเดอร์นี้: ใส่ GEMINI_API_KEY และตั้ง GEMINI_ENABLED=true. Default GEMINI_MODEL=gemini-3.5-flash-lite, GEMINI_LOCAL_DAILY_CALLS=20. Serverโหลดใหม่อัตโนมัติเมื่อบันทึกไฟล์; refreshแล้วลองถาม. คีย์อยู่serverเท่านั้น ห้ามใช้VITE_. ไม่ได้เรียก providerจริงระหว่างทดสอบ

เริ่มภายหลังด้วย scripts/start-assistant.cmd หรือ npm run serve. ใช้portable Nodeใน D:/Chokun/.rd-ready-build/tools/node-v24.22.1-win-x64. npm run preview เป็นstatic-only ไม่มีAPI; npm run dev ที่4174 proxy /api ไป backend4175. หากserver4175รันอยู่แล้วใช้ตัวเดิม

ค้นไทยด้วยการตัดคำ/aliases/prefix/fuzzy. Geminiรับคำถาม/บริบท/ชื่อและIDหัวข้อแล้วเลือกintent/IDด้วยstructured JSON. ServerตรวจID/ขอบเขตและใช้verified-only engineเดิมสร้างคำตอบจากหลักฐานเท่านั้น. Researchเปิดอ่านเป็นเอกสารประกอบรอตรวจ ไม่ใช้ยืนยันกฎ. ปัจจุบันproductionมี0รายการverified จึงยังไม่มีคำตอบยืนยันกฎ. ทดสอบกรณีตอบพร้อมหลักฐานด้วยsynthetic fixtureเท่านั้น

นี่คือ intent routing + lexical retrieval ยังไม่มีembedding/vector DB หรือLLMเรียบเรียงคำตอบใหม่. ไม่มีคีย์/หมดbudget/providerเสีย => local fallback. UIกันส่งซ้ำ/ทิ้งคำตอบเก่าเมื่อเปลี่ยนบริบท/เก็บข้อความให้แก้เมื่อส่งไม่สำเร็จ. คำถามไม่persist; เมื่อเปิดGeminiจะถูกส่งให้Googleตามเงื่อนไขบริการของบัญชี แม้store:false

Local backend bind127.0.0.1,ตรวจHost/Origin/JSON, concurrent2,30requests/min, timeout12s/no retries. .local/usage-YYYY-MM-DD.json เก็บเฉพาะจำนวน. เพดาน20calls/dayเป็นsingle-process local budget ไม่ใช่public limiter. Sites workerยังstatic-only ไม่รวมbackendนี้. ไม่deploy ไม่ทำVision/Login/Admin

ผลล่าสุด: typecheck/typecheck:server/buildผ่าน; test:assistant9/9; test:ui160assertions/7viewports; test:assistant:ui9checks; test:sites4/4; test:preserve original32SHA256ตรงเดิม. Bundle scanไม่พบSDK/provider endpoint/ชื่อenvคีย์/test key marker. ยังไม่ตรวจliveGemini/คุณภาพโมเดลจริง/มือถือจริง/Safari/screen reader/นักศึกษาจริง

รายงานไฟล์/คำสั่ง/ผล/ข้อจำกัด/งานต่อ: D:/Chokun/docs/GEMINI-INTENT-2026-10-30.md

## Historical frontend-only report (superseded by active setup above)

**Preview ที่เปิดไว้: http://127.0.0.1:4175/** — compiled build, local only. รีเฟรชแท็บเดิมเพื่อดูรุ่นล่าสุด

React + Vite + TypeScript strict + CSS ใน `D:/Chokun/prototypes/rd-ready-visual-handbook`. โฟลเดอร์src,content,publicของเว็บNextหลักในD:/Chokunไม่ถูกแก้. รุ่นก่อนอยู่ในoutput/playwright/student-flow/before

## ใช้งานได้แล้ว

- หน้าแรกเริ่มจากงานของนักศึกษา: เลือกศูนย์ฝึก/เขาชนไก่/ยังไม่แน่ใจ, ช่องถาม,4ทางลัด และตัวอย่างข้อมูลพร้อมปี/แหล่ง
- คู่มือ12เรื่อง46ขั้นตอน พร้อมข้อความ ลิงก์ช่วงคลิปเดิม รูปหน้าเอกสารต้นฉบับ3ภาพในเรื่องที่เกี่ยวข้อง และภาพขยาย
- เช็กลิสต์ศูนย์ฝึก23รายการแยกจากภาพภาคสนาม2566จำนวน17รายการ มีหมวด ค้นหา ตัวกรองของที่ยังขาด และความคืบหน้า
- การจำรายการในเครื่องเป็นopt-in ปิดไว้เริ่มต้น เก็บเฉพาะversion/dataset/IDs; ปิดตัวเลือกแล้วลบข้อมูลที่บันทึกไว้ คำถามไม่บันทึกหลังreload
- ชีวิตในค่าย26เรื่องจากresearchเดิม อ่านเนื้อหาเต็มพร้อมแหล่ง ข้อจำกัด ค้นหา ย่อ/เปิดทั้งหมดได้ และโหลดเป็นchunkเมื่อเปิดหมวด

ทุกชุดข้อมูลยังรอตรวจ. ช่องถามแสดงสถานะยังไม่มีคำตอบที่ผ่านตรวจ ไม่ใช้draftตัดสินข้อกำหนด. ภาพhero/อุปกรณ์เป็นภาพประกอบ ส่วนภาพเอกสารคงต้นฉบับและมีcaptionชัด. รูปชายหน้า22มีภาพเนตรนารีด้านบนและชุดฝึกชายด้านล่าง; ไม่ใช้ทั้งหน้าเป็นภาพสอนชุดรด.อย่างเดียว

## ตรวจจริงแล้ว

| คำสั่ง | ผลล่าสุด |
|---|---|
| npm run typecheck | ผ่าน |
| npm run build | ผ่าน พร้อมdist/client,dist/server,hosting artifacts |
| npm run test:ui | 160assertionsผ่าน /7viewports320–1440px |
| npm run test:sites | 4/4ผ่าน |
| npm run test:preserve | original32ไฟล์ SHA256ตรงbaseline |
| Python39 output/playwright/student-flow/compare.py | สร้างfull/focusedก่อน–หลัง เปิดตรวจแล้ว; design-qa.md passed |

UI suiteใช้Playwrightที่มีอยู่ในD:/Chokun/node_modulesและbrowsercacheD:/Chokun/.rd-ready-build/browsers. ไม่ต้องใส่API keys. ชุด110assertionsในqa/browser-check.mjsเป็นหลักฐานรุ่นก่อน ใช้test:uiสำหรับflowรุ่นใหม่

ผลชื่อfinalรันโดยตั้ง `$env:RD_READY_STUDENT_PASS='final'` ในPowerShellก่อนคำสั่งtest:ui

## ไฟล์/คำสั่ง/การตัดสินใจ

รายละเอียดรอบนี้: [FRONTEND-STUDENT-FLOW-2026-10-30.md](D:/Chokun/docs/FRONTEND-STUDENT-FLOW-2026-10-30.md)

- src/App.tsx, content.ts, useChecklist.ts, student.css, components/* และdata/*เป็นงานหลักรอบนี้
- scripts/prepare-student-content.mjsคัดข้อมูลรอตรวจ ไม่อนุมัติข้อมูล. คำอธิบายภายใน3วลีปรับเป็นภาษาผู้อ่านโดยเก็บoriginal/diffในoutput/playwright/student-flow/editorial-copy.json
- PLAN.md, DECISIONS.md, AGENTS.md และdesign-qa.mdบันทึกขอบเขต/ผลตรวจ
- output/playwright/student-flow/results-final.jsonและcomparison screenshotsเป็นหลักฐานรอบล่าสุด
- ไม่เพิ่มfrontend dependencyในรอบนี้. Hosting template/worker/testsเดิมคงไว้

## เริ่มใหม่ภายหลัง

Previewตอนนี้รันอยู่แล้ว. หากปิดหลังrestartให้ใช้portableNode/npmในD:/Chokun/.rd-ready-build/tools/node-v24.22.1-win-x64 แล้วรันจากโฟลเดอร์นี้:

```text
npm run build
npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
```

Devที่4174ใช้scripts/start-local.cmd. อย่าใช้D:/Chokun/scripts/npm-local.cmdสำหรับต้นแบบ เพราะscriptนั้นเปลี่ยนworking directoryไปเว็บหลัก

## ข้อจำกัดและงานต่อ

- ยังไม่เชื่อมAI/API/backend ไม่deploy ไม่ทำVision/Login/Admin และไม่อ้างว่าMaster Spec Milestones3–7เสร็จ
- ยังไม่ทดสอบนักศึกษาจริง5–8คน มือถือจริง Safari/iOS คีย์บอร์ดสัมผัส หรือscreen reader
- รูปสอนรองเท้า/ร้อยเชือก/พับแขนทีละขั้นยังต้องหาแหล่งที่ตรวจแล้ว; ไม่สร้างภาพเทคนิคขึ้นเอง. คลิปบางช่วงยังเป็นเวลาโดยประมาณตามป้ายเดิม
- ข้อมูล/ขอบเขตปัจจุบัน/สิทธิภาพต้องเจ้าของตรวจ ก่อนเปิดตอบหรือเผยแพร่ ไม่รับรองบริการ/ข้ออนุญาตจากประสบการณ์เก่า

## Latest knowledge integration

Gemini now receives eligible approved text and source metadata, not just navigation titles. Role: server/assistant-prompt.ts; retrieval: server/knowledge.ts. Strict evidence-ID selection then original resolver/citations; no model-authored facts. One live question now returnedmodegemini/reasonok/guide-knot. Factual corpus remains0verified;40research topics stillpending.13assistant tests,160UIchecks/7viewports,9focusedbrowser,7mockstatus,4worker and32hash preservation pass. Review/import queue: D:/Chokun/docs/KNOWLEDGE-MAP-2026-10-30.md. Full files/commands/limitations: D:/Chokun/docs/KNOWLEDGE-INTEGRATION-2026-10-30.md.

## Current frontend: selected PACK & GO redesign
Public https://rd-ready-preview-nine.vercel.app now uses checklist-first selected option1, responsive desktop/mobile nav, picture rows, same original data and backend. Local source preview http://127.0.0.1:4182/ is running; main test:ui now runs qa/pack-go-browser.mjs (local default4182, PACK_GO_URL override for public).89UIchecks pass local/public using disclosed answer replay; separate qa/pack-go-live.mjs8checks exercise actual Supabase/Gemini including2uniformimages/13citations. See D:/Chokun/docs/PACK-GO-REDESIGN-2026-10-30.md for latest files/commands/results/limits; previous layout sections are historical. Refresh old open tabs to load current assets.

## Item photos and reviewed packing structure (latest)
Every39current item details now has a local illustration and full-size link. Center22leafitems exclude duplicate aggregate outfit;17fieldposter rows/quantities remain2566historical. New publicrelease23929f64ef48059e fromSupabase. Public127item-dialog checks+93UIreplay checks+8actualAI checks pass. test:packing andtest:items:ui added. Full files/commands/limitations: D:/Chokun/docs/ITEM-PHOTOS-AND-PACKING-REVIEW-2026-10-30.md. Refresh an oldopen tab. Sources remainexperimental, not a confirmed currentunit packinglist.
