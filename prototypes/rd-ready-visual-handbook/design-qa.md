# Design QA — student-flow iteration / 2026-10-30

## Target and normalization

- Visual identity remains selected direction4: `D:/Chokun/design/2026-10-29/visual-directions-234848/direction-04-desktop-mobile.png`.
- User approved the proposed student journey in `D:/Chokun/docs/USER-NEEDS-POSITIONING-2026-10-30.md`: neutral first-training headline; center/field/unsure; visible Ask; four task entries; grouped checklist; clearer guides; dated camp-life review material. These changes intentionally replace the former mock's exact homepage hierarchy.
- Before screenshots: `output/playwright/student-flow/before-desktop.png` (1440×1024) and `qa/audit-polish/02-home-mobile.png` (390×844). Old frontend/report archived in `output/playwright/student-flow/before/`.
- Implementation URL: http://127.0.0.1:4175/ — compiled frontend served locally. Captured in isolated Chromium; no user browser profile accessed.
- Final screenshots: `output/playwright/student-flow/desktop-home-final.png` (1440×1024), `mobile-home-final.png` (390×844), plus 1136×919, 820×1180, 780×1024, 360×800 and 320×740. All CSS/pixel viewports match, deviceScaleFactor1. Screenshots disable finite CSS transitions to capture resting state.
- Full combined comparison inputs opened and inspected: `comparison-desktop.png`, `comparison-mobile.png` in the same output folder. Before/after show each version's default home state; changed copy/context controls are approved differences, not a pixel-clone claim.
- Focused inputs opened together: `comparison-desktop-hero.png` and `comparison-mobile-tasks.png`. Hero crops remove the intentional new80px outer desktop gutter for frame alignment; both focused crops700×284. Mobile task crop390×614 each. Comparison headers/gap are outside the content.

## Findings / fix history

1. **P2 — mobile task discoverability.** First implementation had a two-row context selector, wrapped example chips and large task cards; tasks started around the viewport bottom. Evidence: `home-mobile-initial.png`. Changed context to one row, made example chips scroll, reduced mobile hero/card height and used compact task buttons. Recapture: `home-mobile-revised.png`, then `mobile-home-final.png`. Primary input and all4 tasks fit the tested390×844 initial viewport. On320/360 shorter viewports some tasks follow by scrolling; Ask remains in view and no content is clipped horizontally.
2. **P2 — interior-page repeated setup.** Full context panel consumed guide space. Evidence: `guides-mobile-initial.png`. Added compact context summary with explicit Change action on interior views. Recapture: `mobile-guides-final.png`; first text step is visible sooner while context remains editable.
3. **P2 — tablet hero copy contrast.** 820px capture placed body copy across detailed cadets. Initial tablet evidence was opened during QA. Added tablet-only opacity treatment and constrained subtitle width; recaptured `tablet-home-final.png` and opened it. Body copy is legible over the lighter image; desktop photo and mobile style remain intact.
4. **P2 — life scope/reading density.** Added explicit separation when center is selected while reading field experiences. Shortened the visible scope summary with expandable details, preserving all source limits/body text. Recapture: `mobile-life-final.png`; matching topic heading/text is now visible beneath search rather than only introductory notices.
5. Core life Expand/Collapse control corrected so a single search match does not force itself open against the master control. Both states now checked in the browser suite.

No remaining actionable P0/P1/P2 visual findings after recapture. Original fixed source-year/unknown-answer protections remain in place.

## Required fidelity surfaces

| Surface | Result |
|---|---|
| Fonts / typography | Local Noto Sans Thai retained. Readable primary headings,16px question input, labelled source status and clear step hierarchy. Thai wraps checked at320–1440px; no missing glyphs observed. Small secondary labels remain P3 polish opportunities rather than a claim of measured WCAG compliance. |
| Spacing / layout rhythm | Approved task-first hierarchy implemented. Desktop width capped1280 for shorter rows; mobile4 tasks compact. Interior hero/context shortened. Native selects expose all12 guide titles; no clipped horizontal guide menu. |
| Colors / tokens | Existing olive/warm-white/ink identity retained; source status labels remain neutral pending status. Check marks indicate checklist selections, not verified content. Visible focus and selected states retained. |
| Images / asset quality | Existing optimized raster hero/equipment reused.3 unmodified document-page PNGs copied from prior research; male page explicitly says scouts also appear above the RD example. Full pages are enlargeable with original links. No generated instructional uniform-position drawings or CSS art added. |
| Copy / content | New outcome-first hero and4 task labels match approved brief. Center23 and field17 are separate datasets. Field2566 scope never relabeled current. Camp26 topics remain review material with references.3 internal editorial phrases rewritten into plain reader-facing scope notes; changes recorded in `editorial-copy.json`, raw research preserved. |
| Interaction / accessibility | Semantic buttons/select/checkboxes/progress, keyboard focus styling, native dialog Escape and labelled form. Optional storage has explicit opt-in, error feedback, dataset separation and removal on opt-out. Reduced-motion rules retained. Physical assistive-technology behavior not certified. |

## Browser verification

- `output/playwright/student-flow/results-final.json`: **160 assertions passed**,7 viewports.
- Tested4 tasks, context selection/confirmation/cancellation, unknown packing state, center23/field17 separation, alias filtering, remaining filter, grouped counts, progress, opted-in reload restoration and opt-out removal.
- Tested blocked storage and corrupt/duplicate/unknown stored IDs; validated versioned IDs-only storage. Initial blocked-storage test needed an explicit wait for the React effect's user-visible error state; this was a harness timing correction, not a suppressed failure.
- Tested all12 guides/46 text steps, original document caption/modal, poster enlargement, unknown-answer form/sample input, life26 topic search/empty/reset and master expand/collapse.
- No browser console errors, failed local assets/chunks, third-party requests or API/write requests observed.
- `typecheck`, `build`, worker tests4/4 and original32-file SHA256 preservation pass. Old110-assertion suite describes the preceding UI and was not used to claim the redesigned flow passes.

## Residual notes and limits

- P3: example-question chips scroll horizontally on narrow screens; primary tasks remain separate visible buttons. Hero/metadata optical spacing can be refined after real student feedback.
- Actual step-by-step boot/lacing/sleeve photos remain unavailable as reviewed assets; text/video links retained, no authoritative images invented. Original document galleries are supporting references, not complete visual tutorials.
- No physical Android/iOS/Safari, touch keyboard, screen-reader or human student usability study performed. Proposed5–8-person trial remains an owner follow-up; no contacts/messages sent.
- No API/AI/backend activation or deployment. Current-unit content approval, external clip/audio verification and media republication rights remain outside this frontend verification. Draft research is not used as real rule-answer evidence.

final result: passed

## Gemini/local assistant update — 2026-10-30

Approved handbook appearance preserved. Added compact pre-submit Google disclosure, async pending/error states, evidence/clarification output and review-only route buttons. Real mobile answer screenshot inspected; disclosure readable, cards retain hierarchy. Privacy spacing initially caused0.39px overflow of fourth task below viewport, corrected and full160assertions/7viewports pass. Additional9 browser checks pass for real local API/schema/route, failed-send text retention/manual retry, pending duplicate prevention and context abort/stale response. Existing no-write claim above describes historical frontend only: current writes are same-origin POST/api/assistant; no third-party browser requests in local mode. API SDK remains server-only. Client schema lazy chunk avoids growing main bundle above500kB. No new content approvals or generated tutorial visuals. Provider live/physical devices/Safari/screen-reader/human usability remain unverified. Final result for scoped UI update: passed.
Provider-status fix2026-10-30: explicit local-fallback reason added. Mock402 browser5checks pass; mobile notice screenshot inspected, no runtime errors; provider remains local fallback and draft guard remains.10assistant tests/typechecks/build/32hashes pass. Actual provider returns402; no live-generation success claimed.
Knowledge-state UI2026-10-30: connected Gemini vs no approved content shown separately.160assertions/7viewports passed against isolated local-only4177,9focusedbrowser checks passed;7mockstatus checks passed and mobile knowledge-empty-notice.png visually inspected. Main424.38kB/101.02kBgzip. Provider live request succeeded for intent, approved corpus still0; no factual-answer success claimed. Scoped result: passed; physical devices/student testing unchanged.
Draft-assisted AI answer UI2026-10-30: explicit owner override permits experimental draft answers. New research view shows draft label,17packing bullets with historical2566 poster and source,5knot steps/5timestamp links, original source citations and read-more. Actual successful live outputs replayed in29browser checks across1440/390/320px; no overflow/runtime errors/third-party browser requests. Mobile packing/knot screenshots visually inspected. Strict mode160UIchecks/7viewports+9focused checks preserved.19backend tests/4worker/32original hashes pass. No human claim verification/real-device/Safari/screen-reader study claimed. Scoped UI result: passed.
Cloud adapter preparation2026-10-30:9local browserchecks pass desktop/mobile through actual cloud handler and canonical snapshot, showing sourced fallback and honest cloud-AI-pending state. cloud-local-mobile.png inspected. Hosted stagingREADY but303/302SSO/team403prevents remote browser verification, so hostedvisualpassnotclaimed.6cloud/PGlite tests+19assistant+68retrieval+4worker+32hash checks pass; original approvedlayoutpreserved.

Supabase integration2026-10-30: no visual changes. Real local cloud HTTP handler→hosted Supabase gateway/database→Gemini succeeds for vape (4points,5citations) and field packing (19points,2citations,1image). Hosted Vercel browser verification still pending team grant; do not treat these local-origin live integrations as hosted UI verification. Gateway/core8tests and frontend/server typechecks pass;32original hashes unchanged.

Owner hosted verification2026-10-30: current owner chokun7788/public https://rd-ready-preview-nine.vercel.app now fully tested through actual hosted browser→API→Supabase→Gemini.30checks pass at1440/390/320px; additional7public checks without auth headers pass at390/1440px. Mobile packing17bullets with2566poster and desktop public vape answer screenshots inspected; hierarchy/draft labels/source links retain approved handbook layout, no overflow/runtime errors. Native ESM imports fixed after real500, Thai single-consonant false match fixed with regression;20assistant/8cloud/68retrieval/32hash checks pass. Final deployment logs0error/fatal. Physical devices/Safari/screen-reader/student usability and content/media approval remain unverified. Scoped hosted UI result: passed; older hosted-pending notes describe previous stages.

AI answer images2026-10-30: uniform male/female and hair document images now accompany matching used answer topics, with original scope captions/source links and localfullsizeopen. Actual public Supabase/Gemini responses verified16browserchecks at1440/390and320px; every attached image decoded, full-size popup opened, no overflow/runtimeerrors. Mobile hair screenshot inspected. Existing layout retained.21assistant/8cloud tests and32original hashes pass; scoped resultpassed. Physicaldevice/Safari/current source/media-rights review remain unverified.

## PACK & GO selected redesign — 2026-10-30
Source: latest displayed option1, D:/Chokun/design/2026-10-30/ux-redesign-options/displayed-01.png. Exact numeric choice recorded in selected-redesign.json. Existing project modified; no scaffold. Rendered local4182at1440x1024,390x844,320x740,834x1194. Compared source+implementation together in output/playwright/pack-go/comparison.png, then focused mobile typography/spacing/images in comparison-focus.png. Both comparison inputs were opened and inspected. Blank file-protocol capture and stale hash-only focus capture were rejected and replaced via localHTTP comparison viewer.

First review: [P2] inherited context-panel !important padding delayed first items; [P2] desktop masthead nav aligned at top; [P2] narrow right rail understated reference imagery. Fixed padding reset, full-height centered headerlinks,390pxrail and tighter mobile row rhythm. Re-captured both states; current comparison passes. Real selected1/23state established by checking actual first item, not faked count.

Required fidelity surfaces:
- Fonts: existing self-hosted NotoSansThai; bold34mobile/46desktop headline,16body/18itemlabelsdesktop. Source board font scaling is approximate; no clipped essential labels at320px.
- Spacing: white page, three-column checklist rows, desktop photo rail, compact context/status/progress, mobile fixed bottomnav; responsive actual viewport used. Source composite1586x992contains illustrative viewport proportions, not exact native1440/390pixel frames; focused crop preserves aspect ratio. Third unsure choice retained for real scope handling. Three clothing rows visible at390px rather than stretching mock into a false viewport.
- Colors: olive505f35/ink111b22/offwhite/sand match selected direction; minimal borders, no generic cardstack/largechat hero.
- Images: original local cutouts retained; new illustrative stilllife680x879/132616bytes generated from actual references by scoped asset agent. It is explicitly labelled illustration, not uniform regulation. Unavailable ID/demonstration photos in generated mock were not turned into evidence; quicklinks use existing icon system and real guides.
- Copy: canonical real records23center/17historicalfield, original details/source/year preserved. No invented mock quantities/colors or current official approval. All shortened item names open original metadata. Draft/privacy remain visible. Answer initially6points with all remaining points/citations/media available on expansion.

Actual interaction verification:89browser checks across4viewports pass, no runtimeerrors. Includes tick/progress, full list, search, remaining filter, opt-in persistence, context-separatedlists, guidejump, secondarysearchfocus,17point live-response replay through6pointpreview/expand andposter/citations. Replay is UIvalidation, not new liveAI claim.21assistant/8cloud/68retrieval/4worker tests and32originalhashespass;frontend/servertypechecks+buildpass. Existing SDK and datarelease unchanged.

P3 follow-up: further compact source controls/optional contextual thumbnails once real referenced media exists. Physicaldevices/Safari/screenreader/student usability and source/media approval remain unverified. Deployment/live hosted follow-up recorded in rootdocs.

final result: passed

## Item-modal photographs / packing structure follow-up 2026-10-30
Scoped user screenshot requested photographs inside existing item details. Preserved PACK&GO layout; photo, illustrationcaption, larger-image link and stickycloseheader added; sourceparagraph reduced from oversizedbold to15pxreadablebody. Olduserreference had noitemphoto; currentcenter/fieldmodal screenshots openedandinspected after actualpublicrun. New30photos match existing warmoffwhite catalogue artdirection,600x400WebP; generatedillustrations explicitlynotregulationevidence.39IDscover22center/17historicalfield.127livepublicmodalcheckspass (allimagesdecode/captions/enlarge,320pxnooverflow),93publicUIchecks(replay)+8realSupabase/Geminicheckspass.21assistant/10cloud+packing/68retrieval/32preservationpass. Onlypacking-centerchunkupdatedto newimmutableversion; originalsourceJSONdates retained. No P0/P1/P2 issues remain in this scoped change. Physicaldevices/Safari/screenreader/human content and rights review remainunverified.
final result: passed
