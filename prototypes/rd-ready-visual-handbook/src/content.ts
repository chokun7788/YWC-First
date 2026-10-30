import poster from "./data/poster.json";
import guides from "./data/guides.json";
import review from "./data/review-content.json";
import itemNames from "./data/item-names.json";
import { dailyChecklistRows, packingGroup } from "./packing-structure";

export { guides, review };
export type Context = "unsure" | "center" | "field";
export type View = "ask" | "guides" | "packing" | "life";
export type Guide = (typeof guides)[number];
export type Reference = {
  url: string;
  attribution: string;
  locator: string;
  sourceKey: string;
};
export type DocumentImage = {
  id: string;
  path: string;
  alt: string;
  caption: string;
  sourceUrl: string;
};
export type ChecklistItem = {
  id: string;
  text: string;
  title: string;
  quantity: string;
  group: string;
  references: Reference[];
  aliases: string[];
  source: "field" | "center";
};
export const contextLabels: Record<Context, string> = {
  unsure: "ยังไม่แน่ใจ",
  center: "ศูนย์ฝึกวิภาวดี",
  field: "เขาชนไก่",
};
export const posterUrl =
  "https://www.facebook.com/photo/?fbid=668885802086250&set=a.246542974320537";
export const featured = [
  {
    id: "pack-uniform",
    name: "ชุดฝึก",
    quantity: "อย่างน้อย 2 ชุด",
    image: "uniform.webp",
    guide: "guide-full",
  },
  {
    id: "pack-undershirt",
    name: "เสื้อยืดซับใน",
    quantity: "3–7 ตัว",
    image: "undershirt.webp",
    guide: "guide-under",
  },
  {
    id: "pack-socks",
    name: "ถุงเท้าแบบหนา",
    quantity: "3–7 คู่",
    image: "socks.webp",
    guide: "guide-boots",
  },
  {
    id: "pack-bath-kit",
    name: "เครื่องอาบน้ำ / ซักล้าง",
    quantity: "1 ชุด",
    image: "toiletries.webp",
    guide: null,
  },
];
export const fieldItems: ChecklistItem[] = poster.map((item) => ({
  id: item.itemId,
  text: item.text,
  title: featured.find((f) => f.id === item.itemId)?.name ?? item.text,
  quantity: item.quantityNote,
  group: packingGroup(item.itemId, "field"),
  references: [
    {
      url: posterUrl,
      attribution: "ศูนย์ประชาสัมพันธ์ ศศท. · ภาพที่ผู้ใช้ให้มา",
      locator: "รายการอุปกรณ์ภาคสนาม ปีการศึกษา 2566",
      sourceKey: "poster-2566",
    },
  ],
  aliases: itemNames.find((n) => n.id === item.itemId)?.aliases ?? [],
  source: "field",
}));
export const centerItems: ChecklistItem[] = dailyChecklistRows(
  review.daily,
).map((item) => ({
  id: item.id,
  text: item.text,
  title: item.text.split(" — ")[0],
  quantity: "ไม่มีจำนวนกลางที่ยืนยันสำหรับวันฝึกปกติในชุดข้อมูลนี้",
  group: packingGroup(item.id, "center"),
  references: item.references,
  aliases: [],
  source: "center",
}));
export const datasets: Record<string, ChecklistItem[]> = {
  "field-poster-2566": fieldItems,
  "center-review-20261029": centerItems,
};
export function datasetFor(context: Context) {
  return context === "field"
    ? "field-poster-2566"
    : context === "center"
      ? "center-review-20261029"
      : null;
}
export function normalized(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u200b–—-]/g, "");
}
export function relatedGuide(question: string) {
  return /ร้อย/.test(question)
    ? "guide-lacing"
    : /เชือก/.test(question)
      ? "guide-knot"
      : /แขน/.test(question)
        ? "guide-sleeves"
        : /รองเท้า|คอมแบท/.test(question)
          ? "guide-boots"
          : /หมวก/.test(question)
            ? "guide-hat"
            : "guide-full";
}
