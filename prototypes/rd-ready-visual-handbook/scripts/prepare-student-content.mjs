import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const research = "D:/Chokun/research/2026-10-29/run-text-guide-223732";
const before = path.join(root, "output/playwright/student-flow/before");
fs.mkdirSync(before, { recursive: true });
for (const file of [
  "src/App.tsx",
  "src/styles.css",
  "design-qa.md",
  "README.md",
  "PLAN.md",
]) {
  const target = path.join(before, path.basename(file));
  if (!fs.existsSync(target)) fs.copyFileSync(path.join(root, file), target);
}
const all = JSON.parse(fs.readFileSync(`${research}/guide-data.json`, "utf8"));
const references = (refs) =>
  (refs ?? [])
    .filter((r) => /^https?:\/\//.test(r.url ?? ""))
    .map(({ url, locator, attribution, sourceKey }) => ({
      url,
      locator: locator ?? "",
      attribution: attribution ?? "",
      sourceKey: sourceKey ?? "",
    }));
const videos = (values) =>
  (values ?? [])
    .filter((v) => /^https?:\/\//.test(v.url ?? ""))
    .map(({ url, title, seconds, note }) => ({
      url,
      title,
      seconds: seconds ?? null,
      note: note ?? "",
    }));
const daily = all.cards.find((c) => c.id === "daily-checklist");
const life = all.cards.filter((c) => c.section === "life");
if (life.length !== 26 || daily.blocks[0].entries.length !== 23)
  throw new Error("Unexpected review counts");
for (const c of [daily, ...life])
  if (c.status !== "draft" || c.useAsAnswerEvidence !== false)
    throw new Error("Review-only guard");
const guideImages = {};
for (const c of all.cards.filter((c) => c.section === "guides")) {
  guideImages[c.id] = (c.images ?? [])
    .filter((i) =>
      ["uniform-male", "uniform-female", "hair-example"].includes(i.assetId),
    )
    .map((i) => ({
      id: i.assetId,
      path: `/assets/${i.assetId}.png`,
      alt: i.alt,
      caption:
        i.assetId === "uniform-male"
          ? "ภาพชุดฝึกชายอยู่ส่วนล่างของหน้า 22; ด้านบนมีภาพเนตรนารี เป็นเอกสารตัวอย่างเฉพาะโรงเรียน"
          : i.caption,
      sourceUrl: i.sourceUrl,
    }));
}
const output = {
  status: "draft",
  useAsAnswerEvidence: false,
  daily: daily.blocks[0].entries.map((e) => ({
    id: e.originId,
    text: e.text,
    references: references(e.references),
  })),
  life: life.map((c) => ({
    id: c.id,
    title: c.title,
    paragraphs: c.paragraphs ?? [],
    blocks: (c.blocks ?? []).map((b) => ({
      title: b.title,
      entries: (b.entries ?? []).map((e) => ({
        text: e.text,
        references: references(e.references),
      })),
    })),
    limits: c.limits ?? [],
    references: references(c.references),
    videos: videos(c.videos),
    status: "draft",
    useAsAnswerEvidence: false,
  })),
  guideImages,
};
const { life: lifeCards, ...basic } = output;
// Editorial UI copy only: retain all source records, scopes and references in research.
const copyEdits = new Map([
  ['ไม่สรุปว่าปี1ต้องไปเขาชนไก่ ไม่เหมารวมชายหญิงหรือปี1–3เหมือนกันทุกเรื่อง ส่วนปี4–5คงเป็นบริบทเปรียบเทียบและกันออกจาก native export ตามขอบเขต MVP', 'ข้อมูลนี้ไม่ยืนยันว่าปี1ต้องไปเขาชนไก่ และไม่เหมารวมข้อกำหนดชาย/หญิงหรือชั้นปี1–3 ข้อมูลปี4–5ใช้เปรียบเทียบเท่านั้น'],
  ['อ่านภาพชีวิตและเตรียมรายการสิ่งที่ต้องตรวจได้แล้ว เมื่อจะนำไปใช้กับกลุ่มจริงค่อยจับคู่ประกาศกับสถานศึกษา ชั้นปี กลุ่มเครื่องแบบ ปีการศึกษา และผลัด ไม่ต้องเลือกตัวเลขปีเพื่อให้ทำวิจัยต่อได้', 'ก่อนนำรายการไปใช้ ต้องเทียบประกาศให้ตรงสถานศึกษา ชั้นปี กลุ่มเครื่องแบบ ปีการศึกษา และผลัดของตน'],
  ['สุขอนามัยทั่วไปมีแหล่งรองรับ ส่วนรีวิว Momean.รวมปี3–5และไม่ระบุชั้นปีของเหตุการณ์แรก จึงอยู่เป็นบริบทเปรียบเทียบและไม่ส่งเข้า native export ปี1–3', 'คำแนะนำสุขอนามัยทั่วไปกับรีวิวเป็นข้อมูลคนละประเภท รีวิวของ Momean.รวมปี3–5และไม่ระบุชั้นปีของเหตุการณ์แรก จึงใช้เป็นข้อมูลเปรียบเทียบ ไม่ยืนยันสำหรับปี1–3'],
]);
for (const card of lifeCards) {
  card.paragraphs = card.paragraphs.map(text => copyEdits.get(text) ?? text);
  card.limits = card.limits.map(text => copyEdits.get(text) ?? text);
  for (const block of card.blocks) for (const entry of block.entries) entry.text = copyEdits.get(entry.text) ?? entry.text;
}
fs.writeFileSync(path.join(root,'output/playwright/student-flow/editorial-copy.json'),JSON.stringify([...copyEdits].map(([original,display])=>({original,display,scopeChanged:false})),null,2));
fs.writeFileSync(
  path.join(root, "src/data/review-content.json"),
  JSON.stringify(basic, null, 2),
);
fs.writeFileSync(
  path.join(root, "src/data/camp-life.json"),
  JSON.stringify(lifeCards, null, 2),
);
const catalog = JSON.parse(
  fs.readFileSync(
    "D:/Chokun/research/2026-10-29/run-community-evidence-180122/review-data.json",
    "utf8",
  ),
);
fs.writeFileSync(
  path.join(root, "src/data/item-names.json"),
  JSON.stringify(
    catalog.items.map(({ id, label, aliases }) => ({
      id,
      label,
      aliases,
      status: "draft",
    })),
    null,
    2,
  ),
);
for (const asset of ["uniform-male", "uniform-female", "hair-example"])
  fs.copyFileSync(
    `${research}/assets/${asset}.png`,
    path.join(root, `public/assets/${asset}.png`),
  );
fs.writeFileSync(
  path.join(root, "output/playwright/student-flow/content-provenance.json"),
  JSON.stringify(
    {
      source: `${research}/guide-data.json`,
      daily: 23,
      life: 26,
      guideImageAssets: 3,
      status: "draft",
      useAsAnswerEvidence: false,
      productionContentModified: false,
    },
    null,
    2,
  ),
);
console.log(
  "Prepared 23 center review entries,26 life topics,3 original document images; all remain draft.",
);
