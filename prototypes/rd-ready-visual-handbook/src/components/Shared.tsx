import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { Context, Reference } from "../content";
import { contextLabels } from "../content";

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (!/^https?:\/\//.test(href)) return <span>{children}</span>;
  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRightIcon size={16} aria-hidden="true" />
      <span className="sr-only"> (เปิดแท็บใหม่)</span>
    </a>
  );
}
export function References({ items }: { items: Reference[] }) {
  return (
    <div className="reference-links">
      {items.map((r, i) => (
        <ExternalLink key={`${r.url}-${i}`} href={r.url}>
          {r.attribution || "ดูต้นฉบับ"}
        </ExternalLink>
      ))}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const element = ref.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
          >
            <XIcon size={24} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
export function ContextPicker({
  value,
  onChange,
  compact = false,
}: {
  value: Context;
  onChange: (next: Context) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [value]);
  if (compact && !expanded) {
    return (
      <section className="context-compact surface" aria-label="บริบทที่เลือก">
        <p>
          <span>บริบทการฝึก</span>
          <strong>{contextLabels[value]}</strong>
        </p>
        <button className="text-button" onClick={() => setExpanded(true)}>
          เปลี่ยนบริบท
        </button>
      </section>
    );
  }
  return (
    <section className="context-panel surface" aria-labelledby="context-title">
      <div>
        <span className="eyebrow">เริ่มจากการฝึกของคุณ</span>
        <h2 id="context-title">วันนี้เตรียมไปที่ไหน?</h2>
      </div>
      <div
        className="context-options"
        role="group"
        aria-label="เลือกบริบทการฝึก"
      >
        {(["center", "field", "unsure"] as Context[]).map((context) => (
          <button
            key={context}
            aria-pressed={value === context}
            className={value === context ? "selected" : ""}
            onClick={() => onChange(context)}
          >
            {contextLabels[context]}
          </button>
        ))}
      </div>
      <p className="context-caption">
        {value === "field"
          ? "ดูเอกสารภาคสนามปี 2566 · ยังไม่ยืนยันผลัดปัจจุบัน"
          : value === "center"
            ? "ดูรายการฝึกปกติฉบับรอตรวจ · ไม่ใช้จำนวนของจากภาคสนาม"
            : "เลือกเพื่อดูรายการที่เกี่ยวข้อง หรือเริ่มจากคู่มือได้เลย"}
      </p>
    </section>
  );
}
export function SourcePanel({ onEnlarge }: { onEnlarge: () => void }) {
  return (
    <aside className="source-panel" aria-label="แหล่งอ้างอิงรายการ">
      <h3>เห็นที่มาของข้อมูล</h3>
      <p className="source-subtitle">ภาพต้นฉบับ · ปีการศึกษา 2566</p>
      <button
        className="poster-button"
        onClick={onEnlarge}
        aria-label="ขยายภาพรายการเตรียมของ ปี 2566"
      >
        <img
          src="/assets/packing-poster-2566.png"
          width="495"
          height="619"
          alt="ภาพรายการเตรียมภาคสนาม ปีการศึกษา 2566"
          loading="lazy"
        />
      </button>
      <div className="source-description">
        <span className="status-tag">เอกสารเดิม · รอตรวจสอบ</span>
        <p>แสดงปีตามต้นฉบับ ใช้อ่านประกอบ ไม่ใช่รายการของผลัดปัจจุบัน</p>
        <button className="text-button" onClick={onEnlarge}>
          ดูภาพขยาย
          <CaretRightIcon size={17} />
        </button>
      </div>
    </aside>
  );
}
