import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/csr/PlayCircle";
import {rankSearch} from '../search';
import type { Context } from "../content";
import life from "../data/camp-life.json";
import { ExternalLink, References } from "./Shared";

export function LifeView({
  context,
  onContext,
  initialTopic,
}: {
  context: Context;
  onContext: (next: Context) => void;
  initialTopic?:string;
}) {
  const [query, setQuery] = useState(()=>life.find(c=>c.id===initialTopic)?.title??'');
  const [expanded, setExpanded] = useState(true);
  const ids=new Set(rankSearch(life.map(card=>({id:card.id,title:card.title,text:[...card.paragraphs,...card.blocks.flatMap(b=>b.entries.map(e=>e.text))].join(' ')})),query).map(card=>card.id));
  const visible=life.filter(card=>ids.has(card.id));
  return (
    <section className="surface life-section" aria-labelledby="life-heading">
      <span className="status-tag">ประสบการณ์และข้อมูลประกอบ · รอตรวจสอบ</span>
      <h2 id="life-heading">ชีวิตในเขาชนไก่เป็นยังไง?</h2>
      <p className="muted">26 เรื่องจากหลายแหล่ง · อ่านข้อความพร้อมต้นทาง</p>
      <details className="scope-details">
        <summary>ประสบการณ์หลายปี/ผลัด ไม่ใช่ข้อกำหนดปัจจุบัน</summary>
        <p>
          ใช้เห็นภาพชีวิต ไม่รับรองบริการของผลัดปัจจุบัน
          เรื่องสุขภาพเป็นข้อมูลประกอบ ไม่ใช้วินิจฉัยหรือกำหนดยา
        </p>
      </details>
      {context === "center" && (
        <div className="life-context-note">
          <p>หมวดนี้เป็นภาคสนาม แยกจากศูนย์ฝึกที่คุณเลือก</p>
          <button className="text-button" onClick={() => onContext("field")}>
            เปลี่ยนไปบริบทเขาชนไก่
          </button>
        </div>
      )}
      <div className="checklist-toolbar">
        <label className="search-field">
          <MagnifyingGlassIcon size={22} />
          <span className="sr-only">ค้นหาเรื่องชีวิตในค่าย</span>
          <input
            type="search"
            placeholder="เช่น ห้องน้ำ อาหาร ฝนตก..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button className="text-button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "ย่อเนื้อหาทั้งหมด" : "เปิดเนื้อหาทั้งหมด"}
        </button>
      </div>
      <p className="muted results-count" role="status">
        พบ {visible.length} เรื่อง
      </p>
      {visible.length ? (
        visible.map((card) => (
          <details key={card.id} className="life-card" open={expanded}>
            <summary>{card.title}</summary>
            <div className="life-card-body">
              {card.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {card.blocks.map((block, i) => (
                <section key={i}>
                  <h3>{block.title}</h3>
                  <ul>
                    {block.entries.map((entry, j) => (
                      <li key={j}>
                        <p>{entry.text}</p>
                        <References items={entry.references} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {card.limits.length > 0 && (
                <div className="review-note">
                  {card.limits.map((limit, i) => (
                    <p key={i}>{limit}</p>
                  ))}
                </div>
              )}
              <div className="reference-links">
                {card.videos.map((video, i) => (
                  <div className="video-reference" key={i}>
                    <ExternalLink href={video.url}>
                      <PlayCircleIcon size={20} />
                      {video.title}
                    </ExternalLink>
                    <small>{video.note}</small>
                  </div>
                ))}
              </div>
              <details className="scope-details">
                <summary>
                  แหล่งอ้างอิงทั้งหมดของเรื่องนี้ ({card.references.length})
                </summary>
                <References items={card.references} />
              </details>
            </div>
          </details>
        ))
      ) : (
        <div className="empty-state">
          <h3>ยังไม่พบเรื่องที่ค้นหา</h3>
          <button className="primary-button" onClick={() => setQuery("")}>
            ดูทั้งหมด 26 เรื่อง
          </button>
        </div>
      )}
    </section>
  );
}
