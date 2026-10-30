import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/csr/PlayCircle";
import { guides, review } from "../content";
import type { DocumentImage } from "../content";
import { ExternalLink, References } from "./Shared";

export function GuideView({
  selectedId,
  onSelect,
  onImage,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onImage: (image: DocumentImage) => void;
}) {
  const guide = guides.find((g) => g.id === selectedId) ?? guides[0];
  const images =
    (review.guideImages as Record<string, DocumentImage[]>)[guide.id] ?? [];
  return (
    <section className="guide-layout surface">
      <aside className="guide-menu" aria-label="เลือกคู่มือ">
        <h2>แต่งตัวทีละส่วน</h2>
        <p className="muted">12 เรื่อง · เริ่มจากส่วนที่อยากรู้</p>
        <label className="guide-select-label">
          เลือกคู่มือ (12 เรื่อง)
          <select value={guide.id} onChange={(e) => onSelect(e.target.value)}>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </label>
        <div className="guide-buttons">
          {guides.map((g) => (
            <button
              key={g.id}
              className={guide.id === g.id ? "selected" : ""}
              aria-pressed={guide.id === g.id}
              onClick={() => onSelect(g.id)}
            >
              {g.title}
              <CaretRightIcon size={17} />
            </button>
          ))}
        </div>
      </aside>
      <article className="guide-content" aria-labelledby="guide-title">
        <span className="status-tag">คู่มือฉบับรอตรวจสอบ</span>
        <h2 id="guide-title">{guide.title}</h2>
        <p className="muted">{guide.summary}</p>
        <details className="scope-details">
          <summary>ตรวจแบบของหน่วยและกลุ่มเครื่องแบบก่อนใช้</summary>
          <p>
            เนื้อหาและภาพเป็นเอกสารประกอบที่ยังรอตรวจ ไม่รับรองทุกปี ทุกหน่วย
            หรือทุกกลุ่ม ภาพจากโรงเรียนอื่นใช้ดูตัวอย่าง
            ไม่คัดลอกเครื่องหมายหรือชื่อของผู้สาธิต
          </p>
        </details>
        <div className="guide-step-count">
          <BookOpenIcon size={20} />
          {guide.steps.length} ขั้นตอน · อ่านข้อความก่อน เปิดคลิปประกอบได้
        </div>
        <ol className="steps">
          {guide.steps.map((step) => (
            <li key={step.order} id={`step-${step.order}`}>
              <div className="step-number" aria-hidden="true">
                {step.order}
              </div>
              <div>
                <p>{step.text}</p>
                <div className="reference-links">
                  {step.videos.map((video, i) => (
                    <div className="video-reference" key={`${video.url}-${i}`}>
                      <ExternalLink href={video.url}>
                        <PlayCircleIcon size={20} />
                        {video.title}
                        {video.seconds !== null && (
                          <>
                            {" "}
                            · {Math.floor(video.seconds / 60)}:
                            {String(video.seconds % 60).padStart(2, "0")}
                          </>
                        )}
                      </ExternalLink>
                      <small>{video.note}</small>
                    </div>
                  ))}
                </div>
                <References items={step.references} />
              </div>
            </li>
          ))}
        </ol>
        {images.length > 0 && (
          <section
            className="document-gallery"
            aria-label="ภาพจากเอกสารอ้างอิง"
          >
            <h3>เปิดดูภาพจากเอกสารเดิม</h3>
            <p className="muted">
              รูปชาย/หญิงแยกตามต้นฉบับ · ยังไม่ยืนยันข้อกำหนดศูนย์ฯปัจจุบัน
            </p>
            <div>
              {images.map((image) => (
                <figure key={image.id}>
                  <button
                    onClick={() => onImage(image)}
                    aria-label={`ขยาย ${image.alt}`}
                  >
                    <img
                      src={image.path}
                      alt={image.alt}
                      width="894"
                      height="1263"
                      loading="lazy"
                    />
                  </button>
                  <figcaption>{image.caption}</figcaption>
                  <ExternalLink href={image.sourceUrl}>
                    เปิดหน้าเอกสารต้นฉบับ
                  </ExternalLink>
                </figure>
              ))}
            </div>
          </section>
        )}
      </article>
    </section>
  );
}
