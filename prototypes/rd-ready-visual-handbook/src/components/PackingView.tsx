import { useState } from "react";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { datasets, datasetFor } from "../content";
import type { Context, ChecklistItem } from "../content";
import type { useChecklist } from "../useChecklist";
import { rankSearch } from "../search";
import { itemMedia } from "../item-media";
import { packingStatus } from "../packing-structure";

export function PackingView({
  context,
  checklist,
  onItem,
  onPoster,
  onContext,
  compact = false,
}: {
  context: Context;
  checklist: ReturnType<typeof useChecklist>;
  onItem: (item: ChecklistItem) => void;
  onPoster: () => void;
  onContext: (context: Context) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [remainingOnly, setRemainingOnly] = useState(false);
  const dataset = datasetFor(context);
  if (!dataset)
    return (
      <section className="surface choose-list">
        <span className="eyebrow">เช็กลิสต์ที่ตรงกับการฝึก</span>
        <h2>เลือกว่าจะเตรียมไปที่ไหนก่อน</h2>
        <p>
          วันฝึกปกติและภาคสนามใช้คนละรายการ เราจะแยกจำนวนและแหล่งข้อมูลให้ชัดเจน
        </p>
        <div className="quick-links">
          <button onClick={() => onContext("center")}>รายการศูนย์ฝึก</button>
          <button onClick={() => onContext("field")}>รายการเขาชนไก่</button>
        </div>
      </section>
    );
  const items = datasets[dataset];
  const checked = checklist.lists[dataset] ?? [];
  const filtered = rankSearch(items, query).filter(
    (item) => !remainingOnly || !checked.includes(item.id),
  );
  const groups = [...new Set(items.map((item) => item.group))];
  return (
    <section
      className={`surface checklist-section ${compact ? "checklist-compact" : ""}`}
      aria-labelledby="checklist-heading"
    >
      <div className="section-heading">
        <div>
          <span className="status-tag">
            {context === "field"
              ? "ภาพภาคสนามปี 2566"
              : "รายการประกอบวันฝึกปกติ"}{" "}
            · รอตรวจสอบ
          </span>
          <h2 id="checklist-heading">เช็กลิสต์เตรียมของ</h2>
        </div>
        {context === "field" && (
          <button className="text-button" onClick={onPoster}>
            ดูภาพต้นฉบับ
          </button>
        )}
      </div>
      <p className="review-note">
        {context === "field"
          ? "ถอดรายการ 17 รายการจากภาพปี 2566 ไม่ใช่ข้อกำหนดของผลัดปัจจุบัน"
          : `${items.length} รายการแยกสิ่งที่สวมไป เอกสาร ของใช้แนะนำ และของตามเงื่อนไข ไม่ใช่รายการบังคับของศูนย์ฯ`}{" "}
        การติ๊กครบไม่รับรองความพร้อมฝึก
      </p>
      <div className="checklist-progress-label">
        <p className="progress" role="status">
          <CheckIcon size={19} />
          ติ๊กแล้ว {checked.length} / {items.length}
        </p>
        <span>เหลือ {items.length - checked.length} รายการ</span>
      </div>
      <progress
        className="checklist-progress"
        max={items.length}
        value={checked.length}
        aria-label="จำนวนที่ติ๊กตามรายการนี้"
      />
      <div className="checklist-toolbar">
        <label className="search-field">
          <MagnifyingGlassIcon size={22} />
          <span className="sr-only">ค้นหาในรายการ</span>
          <input
            type="search"
            placeholder="ค้นหาชื่อสิ่งของ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          className={`filter-button ${remainingOnly ? "selected" : ""}`}
          aria-pressed={remainingOnly}
          onClick={() => setRemainingOnly((v) => !v)}
        >
          เฉพาะที่ยังไม่เตรียม
        </button>
      </div>
      <div className="remember-row">
        <label>
          <input
            type="checkbox"
            checked={checklist.remember}
            disabled={!checklist.loaded}
            onChange={(e) => checklist.setRemember(e.target.checked)}
          />
          จำรายการในเครื่องนี้
        </label>
        <span>บันทึกเฉพาะรายการที่ติ๊ก แยกชุดข้อมูลศูนย์ฝึก/ภาคสนาม</span>
      </div>
      {checklist.storageNote && (
        <p className="review-note" role="status">
          {checklist.storageNote}
        </p>
      )}
      {filtered.length ? (
        groups.map((group) => {
          const groupItems = filtered.filter((item) => item.group === group);
          return (
            groupItems.length > 0 && (
              <section className="checklist-group" key={group}>
                <h3>
                  {group}
                  <span>{groupItems.length} รายการ</span>
                </h3>
                <ul className="checklist">
                  {groupItems.map((item) => (
                    <li
                      key={item.id}
                      className={checked.includes(item.id) ? "is-checked" : ""}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={checked.includes(item.id)}
                          onChange={() => checklist.toggle(dataset, item.id)}
                        />
                        <span>
                          <strong>{item.title}</strong>
                          <small className="list-item-status">
                            {packingStatus(item.id, item.source)}
                            {item.source === "field"
                              ? " · " + item.quantity
                              : ""}
                          </small>
                        </span>
                      </label>
                      <button
                        className="icon-button"
                        aria-label={`รายละเอียด ${item.title}`}
                        onClick={() => onItem(item)}
                      >
                        <img
                          className="list-item-photo"
                          src={itemMedia[item.id].src}
                          alt=""
                          loading="lazy"
                        />
                        <CaretRightIcon size={21} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          );
        })
      ) : (
        <div className="empty-state">
          <h3>
            {remainingOnly && checked.length === items.length
              ? "ติ๊กครบตามรายการนี้แล้ว"
              : "ไม่พบรายการที่ค้นหา"}
          </h3>
          <p>เปลี่ยนตัวกรองเพื่อกลับไปดูรายการทั้งหมด</p>
          <button
            className="primary-button"
            onClick={() => {
              setQuery("");
              setRemainingOnly(false);
            }}
          >
            แสดงทั้งหมด
          </button>
        </div>
      )}
      <div className="checklist-footer">
        <p className="muted">
          {checklist.remember
            ? "จำรายการไว้เฉพาะเบราว์เซอร์นี้ ไม่มีการส่งไปเซิร์ฟเวอร์"
            : "ยังไม่บันทึก การติ๊กจะหายเมื่อรีโหลด"}
        </p>
        <button
          className="text-button"
          disabled={!checked.length}
          onClick={() => checklist.clear(dataset)}
        >
          ล้างรายการที่ติ๊ก
        </button>
      </div>
    </section>
  );
}
