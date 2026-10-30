import type { AssistantReply } from "../assistant-client";
import { ExternalLink } from "./Shared";
import { fallbackNotice } from "../assistant-status";
import { useState } from "react";
export function ResearchAnswer({
  reply,
  onRoute,
}: {
  reply: AssistantReply;
  onRoute: (route: AssistantReply["routes"][number]) => void;
}) {
  const research = reply.research!;
  const [expanded, setExpanded] = useState(false);
  const count = reply.answer.sections.reduce((n, s) => n + s.blocks.length, 0);
  let remaining = 6;
  const sections = reply.answer.sections
    .map((section) => {
      const blocks = expanded
        ? section.blocks
        : section.blocks.slice(0, Math.max(0, remaining));
      remaining -= blocks.length;
      return { ...section, blocks };
    })
    .filter((s) => s.blocks.length);
  const packingRoute = reply.routes.find((route) => route.kind === "packing");
  const notice = fallbackNotice(reply.mode, reply.reason);
  const hasAnswer = reply.answer.sections.length > 0;
  return (
    <article className="unavailable-answer research-answer">
      <span className="eyebrow">
        {research.generated
          ? "สรุปจากข้อมูลที่รวบรวมไว้"
          : "ข้อมูลประกอบจากชุดร่าง"}
      </span>
      <h2>
        {hasAnswer
          ? "คำตอบจากข้อมูลทดลอง"
          : reply.reason === "out_of_scope"
            ? "คำถามนอกขอบเขตคู่มือ รด."
            : reply.clarification
              ? "ขอข้อมูลเพิ่มนิดหนึ่ง"
              : "ยังไม่พบข้อมูลตรงคำถาม"}
      </h2>
      <p className="review-note" role="note">
        โหมดทดลอง · ใช้ข้อมูลร่างที่ยังไม่ได้ตรวจรับรอง
        ข้อกำหนดและประสบการณ์อาจต่างกันตามปี หน่วย และผลัด
      </p>
      {notice &&
        !["no_research_match", "missing_context", "out_of_scope"].includes(
          reply.reason,
        ) && <p role="status">{notice}</p>}
      <p>{reply.answer.intro}</p>
      {reply.clarification && (
        <p className="review-note">{reply.clarification}</p>
      )}
      {packingRoute && (
        <button className="answer-expand" onClick={() => onRoute(packingRoute)}>
          เปิดเช็กลิสต์ที่ตรงกับคำตอบ
        </button>
      )}
      {sections.map((section, i) => (
        <section key={i}>
          <h3>{section.heading}</h3>
          <ul className="research-points">
            {section.blocks.map((block) => (
              <li key={block.id}>
                {block.text}
                <details className="point-sources">
                  <summary>ที่มา ({block.citationIds.length})</summary>
                  <span className="research-cite-links">
                    {block.citationIds.map((id) => (
                      <a
                        key={id}
                        href={`#${id}`}
                        onClick={() =>
                          document
                            .getElementById(id)
                            ?.closest("details")
                            ?.setAttribute("open", "")
                        }
                      >
                        [
                        {reply.answer.citations.findIndex((c) => c.id === id) +
                          1}
                        ]
                      </a>
                    ))}
                  </span>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {count > 6 && (
        <button
          className="answer-expand"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "ย่อรายการ" : `ดูรายการทั้งหมด (${count} ข้อ)`}
        </button>
      )}
      {research.images.map((image) => (
        <figure className="research-image" key={image.src}>
          <a href={image.src} target="_blank" rel="noreferrer">
            <img src={image.src} alt={image.alt} loading="lazy" />
          </a>
          <figcaption>
            {image.caption ?? image.alt} ·{" "}
            <ExternalLink href={image.sourceUrl}>ดูต้นฉบับ</ExternalLink>
          </figcaption>
        </figure>
      ))}
      {research.videos.length > 0 && (
        <section>
          <h3>คลิปประกอบ</h3>
          <ul>
            {research.videos.map((video) => (
              <li key={video.url}>
                <ExternalLink href={video.url}>{video.title}</ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      )}
      {reply.answer.citations.length > 0 && (
        <details
          className="research-sources"
          open={reply.answer.citations.length <= 4}
        >
          <summary>
            แหล่งอ้างอิงประกอบ ({reply.answer.citations.length})
          </summary>
          <ol>
            {reply.answer.citations.map((source, i) => (
              <li id={source.id} key={source.id}>
                <ExternalLink href={source.url}>
                  [{i + 1}] {source.title}
                </ExternalLink>
                <small>{source.locator}</small>
              </li>
            ))}
          </ol>
        </details>
      )}
      {reply.routes.length > 0 && (
        <div className="quick-links">
          {reply.routes.map((route) => (
            <button key={route.id} onClick={() => onRoute(route)}>
              อ่านต่อ: {route.title}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
