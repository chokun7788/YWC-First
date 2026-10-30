import { useState } from "react";
import { TShirtIcon } from "@phosphor-icons/react/dist/csr/TShirt";
import { ToteIcon } from "@phosphor-icons/react/dist/csr/Tote";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/csr/PlayCircle";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { datasets, datasetFor } from "../content";
import type { Context, ChecklistItem } from "../content";
import type { useChecklist } from "../useChecklist";
import { ContextPicker } from "./Shared";
import { PackingView } from "./PackingView";
import { itemMedia } from "../item-media";

const presentation: Record<
  string,
  { title: string; image?: string; guide?: string }
> = {
  "day-shirt": {
    title: "เสื้อฝึก",
    image: "items/shirt.webp",
    guide: "guide-shirt",
  },
  "day-under": {
    title: "เสื้อยืด",
    image: "undershirt.webp",
    guide: "guide-under",
  },
  "day-socks": { title: "ถุงเท้า", image: "socks.webp", guide: "guide-boots" },
  "day-id": { title: "บัตรประชาชน / บัตร นศท." },
  "day-tissue": { title: "ของใช้สุขอนามัย", image: "toiletries.webp" },
  "pack-uniform": {
    title: "ชุดฝึก",
    image: "uniform.webp",
    guide: "guide-full",
  },
  "pack-undershirt": {
    title: "เสื้อยืดซับใน",
    image: "undershirt.webp",
    guide: "guide-under",
  },
  "pack-socks": {
    title: "ถุงเท้าแบบหนา",
    image: "socks.webp",
    guide: "guide-boots",
  },
  "pack-id": { title: "บัตรประชาชน / บัตร นศท." },
  "pack-bath-kit": {
    title: "เครื่องอาบน้ำ / ซักล้าง",
    image: "toiletries.webp",
  },
};
export function PackingHome({
  context,
  checklist,
  onContext,
  onItem,
  onPoster,
  onGuide,
  onAbout,
}: {
  context: Context;
  checklist: ReturnType<typeof useChecklist>;
  onContext: (c: Context) => void;
  onItem: (item: ChecklistItem) => void;
  onPoster: () => void;
  onGuide: (id: string) => void;
  onAbout: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dataset = datasetFor(context),
    items = dataset ? datasets[dataset] : [],
    checked = dataset ? (checklist.lists[dataset] ?? []) : [];
  const ids =
    context === "field"
      ? [
          "pack-uniform",
          "pack-undershirt",
          "pack-socks",
          "pack-id",
          "pack-bath-kit",
        ]
      : ["day-shirt", "day-under", "day-socks", "day-id", "day-tissue"];
  const preview = ids.flatMap((id) => {
    const item = items.find((x) => x.id === id);
    return item ? [item] : [];
  });
  function openAll() {
    setExpanded((v) => !v);
  }
  return (
    <div className="pack-workspace">
      <section className="pack-main">
        <div className="pack-context">
          <ContextPicker value={context} onChange={onContext} />
        </div>
        <div className="pack-heading">
          <div>
            <h1>เช็กของให้พร้อม</h1>
            <p>
              {context === "field"
                ? "17 รายการจากภาพปี 2566 · ตรวจประกาศผลัดปัจจุบัน"
                : "แยกชุดที่สวมไป ของพก และของตามเงื่อนไข"}
            </p>
          </div>
          {dataset && (
            <div className="pack-progress">
              <span role="status">
                เตรียมแล้ว {checked.length} / {items.length}
              </span>
              <progress
                value={checked.length}
                max={items.length}
                aria-label="ความคืบหน้าเตรียมของ"
              />
              <button
                className="pack-primary"
                onClick={openAll}
                aria-expanded={expanded}
                aria-controls="pack-list"
              >
                {expanded ? "ดูรายการเริ่มต้น" : "เปิดเช็กลิสต์ทั้งหมด"}
                <CaretRightIcon size={18} />
              </button>
            </div>
          )}
        </div>
        <div className="pack-evidence">
          <InfoIcon size={19} weight="fill" />
          <span>
            ข้อมูลประกอบ ·{" "}
            {context === "field"
              ? "ภาพย้อนหลังปี 2566"
              : "ตรวจประกาศของหน่วยอีกครั้ง"}
          </span>
          <button onClick={onAbout}>
            ที่มาของข้อมูล
            <CaretRightIcon size={16} />
          </button>
        </div>
        <div id="pack-list">
          {dataset && (
            <details className="packing-scope">
              <summary>
                {context === "field"
                  ? "ภาพเก่านี้ครอบคลุมอะไรบ้าง?"
                  : "รายการศูนย์ฝึกจัดใหม่อย่างไร?"}
              </summary>
              <p>
                {context === "field"
                  ? "คง 17 รายการและจำนวนตามภาพต้นฉบับปี 2566 ภาพไม่ได้แจกแจงเครื่องสนามหรือเครื่องแบบที่สวมไปทุกชิ้น และคำว่า “เช่น ผ้าห่ม ถุงนอน” ไม่ได้ยืนยันว่าต้องนำทั้งสองอย่าง นี่ไม่ใช่รายการครบของทุกชั้นปีหรือผลัดปัจจุบัน"
                  : "ไม่นับหัวข้อ “ชุดฝึกครบชุด” ซ้ำกับเสื้อ กางเกง และอุปกรณ์ย่อย เหลือ 22 รายการ แยกสิ่งที่สวมไป เอกสาร ของใช้แนะนำ ของตามความจำเป็น และของที่ยังต้องตรวจสิทธินำเข้า/ช่วงใช้ ไม่ใช่ของบังคับ 22 ชิ้น"}
              </p>
              <button onClick={() => onGuide("guide-full")}>
                ดูคู่มือตรวจชุดที่สวมไป
              </button>
              {context === "field" && (
                <button onClick={onPoster}>ดูภาพ 17 รายการต้นฉบับ</button>
              )}
            </details>
          )}
          {!dataset ? (
            <div className="pack-choose">
              <h2>เลือกการฝึกเพื่อเปิดรายการ</h2>
              <p>
                ศูนย์ฝึกวันปกติและเขาชนไก่ใช้คนละรายการ เลือกด้านบน
                หรือเปิดคู่มือแต่งตัวก่อนได้เลย
              </p>
              <button onClick={() => onGuide("guide-full")}>
                ดูวิธีแต่งตัว
                <ArrowRightIcon size={18} />
              </button>
            </div>
          ) : expanded ? (
            <PackingView
              context={context}
              checklist={checklist}
              onContext={onContext}
              onItem={onItem}
              onPoster={onPoster}
              compact
            />
          ) : (
            <>
              {["เครื่องแต่งกาย", "เอกสาร", "ของใช้ส่วนตัว"].map(
                (group, index) => (
                  <section className="pack-group" key={group}>
                    <header>
                      {index === 0 ? (
                        <TShirtIcon size={29} weight="fill" />
                      ) : (
                        <ToteIcon size={29} />
                      )}
                      <div>
                        <h2>{group}</h2>
                        <p>
                          {index === 0
                            ? "เสื้อผ้าและของใช้ในวันฝึก"
                            : index === 1
                              ? "พกตามการแจ้งของหน่วยและสถานศึกษา"
                              : "เลือกตามความจำเป็นในการใช้งาน"}
                        </p>
                      </div>
                    </header>
                    <ul>
                      {preview
                        .slice(
                          index === 0 ? 0 : index === 1 ? 3 : 4,
                          index === 0 ? 3 : index === 1 ? 4 : undefined,
                        )
                        .map((item) => {
                          const meta = presentation[item.id];
                          return (
                            <li
                              key={item.id}
                              className={
                                checked.includes(item.id) ? "prepared" : ""
                              }
                            >
                              <label className="pack-tick">
                                <input
                                  type="checkbox"
                                  checked={checked.includes(item.id)}
                                  onChange={() =>
                                    checklist.toggle(dataset!, item.id)
                                  }
                                  aria-label={`เตรียมแล้ว ${meta.title}`}
                                />
                                <span>
                                  <strong>{meta.title}</strong>
                                  <small>
                                    {item.source === "field"
                                      ? item.quantity
                                      : item.title}
                                  </small>
                                </span>
                              </label>
                              <button
                                className="pack-item-photo"
                                onClick={() => onItem(item)}
                                aria-label={`ดูรูปและรายละเอียด ${meta.title}`}
                              >
                                <img
                                  src={itemMedia[item.id].src}
                                  alt={itemMedia[item.id].alt}
                                  loading="lazy"
                                />
                              </button>
                              <button
                                className="pack-row-action"
                                onClick={() =>
                                  meta.guide
                                    ? onGuide(meta.guide)
                                    : onItem(item)
                                }
                                aria-label={
                                  meta.guide
                                    ? `ดูวิธีแต่งตัว ${meta.title}`
                                    : `ดูรายละเอียด ${meta.title}`
                                }
                              >
                                <PlayCircleIcon size={20} />
                                <span>
                                  {meta.guide
                                    ? "ดูวิธีแต่งตัว"
                                    : "ดูรายละเอียด"}
                                </span>
                                <CaretRightIcon size={17} />
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </section>
                ),
              )}
              <div className="pack-list-end">
                <p>
                  แสดงรายการเริ่มต้น {preview.length} จาก {items.length} รายการ
                  · ภาพเป็นภาพประกอบหัวข้อ
                </p>
                <button onClick={openAll}>
                  ดูรายการทั้งหมด {items.length} รายการ
                  <ArrowRightIcon size={19} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <aside className="pack-rail" aria-label="คู่มือแนะนำ">
        <figure>
          <img
            src="/assets/packing-stilllife.webp"
            alt="ภาพประกอบชุดฝึก ถุงเท้า และของใช้ส่วนตัว"
          />
          <figcaption>ภาพประกอบ · ไม่กำหนดสีหรือแบบที่ต้องใช้</figcaption>
        </figure>
        <button
          className="pack-guide-feature"
          onClick={() => onGuide("guide-full")}
        >
          <span>
            <small>HOW TO DRESS</small>
            <strong>
              ดูวิธีแต่งตัว
              <br />
              ทีละขั้นตอน
            </strong>
            <span>อ่านขั้นตอน แล้วเปิดคลิปช่วงที่ต้องการ</span>
          </span>
          <ArrowRightIcon size={26} />
        </button>
        <div className="pack-mini-guides">
          {[
            { id: "guide-knot", title: "ผูกเชือกรองเท้า" },
            { id: "guide-hair", title: "ผมและการเก็บผม" },
          ].map((g) => (
            <button key={g.id} onClick={() => onGuide(g.id)}>
              <PlayCircleIcon size={29} />
              <span>
                <strong>{g.title}</strong>
                <small>ดูขั้นตอนและสื่ออ้างอิง</small>
              </span>
              <CaretRightIcon size={18} />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
