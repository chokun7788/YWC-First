import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { TShirtIcon } from "@phosphor-icons/react/dist/csr/TShirt";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { contextLabels, posterUrl, relatedGuide } from "./content";
import { itemMedia, itemGuide } from "./item-media";
import { packingStatus } from "./packing-structure";
import type { ChecklistItem, Context, DocumentImage, View } from "./content";
import { useChecklist } from "./useChecklist";
import type { AssistantReply } from "./assistant-client";
import { AssistantAnswer } from "./components/AssistantAnswer";
import {
  ContextPicker,
  ExternalLink,
  Modal,
  References,
} from "./components/Shared";
import { GuideView } from "./components/GuideView";
import { PackingHome } from "./components/PackingHome";
const LifeView = lazy(() =>
  import("./components/LifeView").then((m) => ({ default: m.LifeView })),
);
type ModalState =
  | { kind: "poster" }
  | { kind: "about" }
  | { kind: "item"; item: ChecklistItem }
  | { kind: "image"; image: DocumentImage }
  | { kind: "context"; next: Context }
  | null;
type Message = {
  id: string;
  text: string;
  context: Context;
  reply?: AssistantReply;
  pending?: boolean;
  error?: boolean;
};
const nav = [
  { id: "packing" as const, label: "เตรียมของ", Icon: CheckSquareIcon },
  { id: "guides" as const, label: "แต่งตัว", Icon: TShirtIcon },
  { id: "life" as const, label: "ชีวิตในค่าย", Icon: BookOpenIcon },
];
const exampleQuestions = [
  "เอาบุหรี่ไฟฟ้าไปได้ไหม",
  "ผูกเชือกรองเท้ายังไง",
  "ใช้โทรศัพท์ได้ไหม",
];
export function App() {
  const [view, setView] = useState<View>("packing");
  const [context, setContext] = useState<Context>("center");
  const [modal, setModal] = useState<ModalState>(null);
  const [guideId, setGuideId] = useState("guide-full");
  const [lifeTopic, setLifeTopic] = useState<string | undefined>();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const pendingRequest = useRef<AbortController | null>(null),
    generation = useRef(0);
  const questionRef = useRef<HTMLInputElement>(null),
    latestMessage = useRef<HTMLDivElement>(null);
  const checklist = useChecklist();
  useEffect(() => () => pendingRequest.current?.abort(), []);
  useEffect(() => {
    if (messages.length)
      latestMessage.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);
  function changeView(next: View) {
    setView(next);
    window.scrollTo({ top: 0 });
  }
  function openGuide(id: string) {
    setGuideId(id);
    setModal(null);
    changeView("guides");
  }
  function focusQuestion(value?: string) {
    setView("ask");
    if (value !== undefined) setQuestion(value);
    requestAnimationFrame(() => {
      questionRef.current?.scrollIntoView({ block: "center" });
      questionRef.current?.focus({ preventScroll: true });
    });
  }
  function applyContext(next: Context) {
    generation.current++;
    pendingRequest.current?.abort();
    setBusy(false);
    setContext(next);
    setMessages([]);
    setModal(null);
  }
  function requestContext(next: Context) {
    if (next === context) return;
    if (messages.length) setModal({ kind: "context", next });
    else applyContext(next);
  }
  async function submitQuestion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!question.trim() || busy) return;
    const text = question.trim(),
      id = crypto.randomUUID(),
      revision = ++generation.current,
      controller = new AbortController();
    pendingRequest.current = controller;
    setBusy(true);
    setMessages((previous) => [
      ...previous,
      { id, text, context, pending: true },
    ]);
    try {
      const { askAssistant } = await import("./assistant-client");
      const reply = await askAssistant(text, context, controller.signal);
      if (revision !== generation.current) return;
      setMessages((previous) =>
        previous.map((m) =>
          m.id === id ? { ...m, pending: false, reply } : m,
        ),
      );
      setQuestion((current) => (current.trim() === text ? "" : current));
    } catch {
      if (revision === generation.current)
        setMessages((previous) =>
          previous.map((m) =>
            m.id === id ? { ...m, pending: false, error: true } : m,
          ),
        );
    } finally {
      if (revision === generation.current) setBusy(false);
    }
  }
  function renderNav(label: string) {
    return (
      <nav aria-label={label}>
        {nav.map(({ id, label: caption, Icon }) => (
          <button
            key={id}
            className={"nav-link " + (view === id ? "active" : "")}
            aria-current={view === id ? "page" : undefined}
            onClick={() => changeView(id)}
          >
            <Icon size={23} aria-hidden="true" />
            {caption}
          </button>
        ))}
      </nav>
    );
  }
  return (
    <div className={"app-shell student-flow pack-go view-" + view}>
      <a href="#main-content" className="skip-link">
        ข้ามไปเนื้อหา
      </a>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => changeView("packing")}
          aria-label="RD Ready หน้าแรก"
        >
          <span>RD</span> Ready
        </button>
        {renderNav("เมนูหลัก")}
        <button
          className="header-search"
          onClick={() => focusQuestion()}
          aria-label="ค้นเรื่องที่สงสัย"
        >
          <MagnifyingGlassIcon size={22} />
          <span>ค้นเรื่องที่สงสัย เช่น รองเท้า ทรงผม การใช้ของส่วนตัว</span>
        </button>
      </header>
      <main id="main-content" className="main-content" tabIndex={-1}>
        {view === "packing" && (
          <PackingHome
            key={context}
            context={context}
            checklist={checklist}
            onContext={requestContext}
            onItem={(item) => setModal({ kind: "item", item })}
            onPoster={() => setModal({ kind: "poster" })}
            onGuide={openGuide}
            onAbout={() => setModal({ kind: "about" })}
          />
        )}
        {view !== "packing" && (
          <>
            <div className="inner-heading">
              <h1>
                {view === "guides"
                  ? "แต่งตัวให้พร้อม ทีละขั้นตอน"
                  : view === "life"
                    ? "ชีวิตในค่ายเป็นยังไง?"
                    : "ค้นเรื่องที่สงสัย"}
              </h1>
              <p>
                {view === "guides"
                  ? "เลือกส่วนที่อยากรู้ อ่านขั้นตอน แล้วเปิดคลิปประกอบ"
                  : view === "life"
                    ? "อ่านประสบการณ์พร้อมแหล่งอ้างอิง แยกจากข้อกำหนดของหน่วย"
                    : "ถามเป็นภาษาของคุณ แล้วดูคำตอบพร้อมที่มา"}
              </p>
            </div>
            <ContextPicker value={context} onChange={requestContext} compact />
          </>
        )}
        {view === "ask" && (
          <>
            <section
              className="ask-panel surface"
              aria-labelledby="ask-heading"
            >
              <h2 id="ask-heading">อยากรู้เรื่องไหน?</h2>
              <form
                className="composer"
                onSubmit={submitQuestion}
                aria-label="ถามเรื่องเตรียมตัว"
              >
                <label className="sr-only" htmlFor="question">
                  คำถามเรื่องเตรียมตัว รด.
                </label>
                <input
                  ref={questionRef}
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="เช่น เอาพัดลมไปเขาชนไก่ได้ไหม..."
                  maxLength={1200}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  aria-label="ส่งคำถาม"
                  disabled={!question.trim() || busy}
                >
                  <ArrowRightIcon size={25} />
                </button>
              </form>
              <p className="assistant-privacy">
                เปิด Gemini: ส่งคำถามให้ Google · เว็บไม่เก็บประวัติ
              </p>
              <div className="question-examples">
                {exampleQuestions.map((q) => (
                  <button key={q} onClick={() => focusQuestion(q)}>
                    {q}
                    <CaretRightIcon size={15} />
                  </button>
                ))}
              </div>
            </section>
            {messages.length > 0 && (
              <section
                className="conversation"
                aria-label="คำถามในต้นแบบ"
                aria-live="polite"
              >
                {messages.map((message, i) => (
                  <div
                    key={message.id}
                    ref={i === messages.length - 1 ? latestMessage : undefined}
                  >
                    <p className="message-context">
                      บริบทตอนถาม: {contextLabels[message.context]}
                    </p>
                    <p className="user-question">{message.text}</p>
                    <AssistantAnswer
                      reply={message.reply}
                      pending={message.pending}
                      error={message.error}
                      onRoute={(route) => {
                        if (route.kind === "guides") openGuide(route.id);
                        else if (route.kind === "life") {
                          setLifeTopic(route.id);
                          changeView("life");
                        } else changeView("packing");
                      }}
                    />
                    {!message.pending && !message.error && (
                      <div className="quick-links">
                        <button
                          onClick={() => openGuide(relatedGuide(message.text))}
                        >
                          เปิดคู่มือที่เกี่ยวข้อง
                          <BookOpenIcon size={18} />
                        </button>
                        <button onClick={() => changeView("packing")}>
                          เปิดเช็กลิสต์
                          <CaretRightIcon size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </>
        )}
        {view === "guides" && (
          <GuideView
            selectedId={guideId}
            onSelect={setGuideId}
            onImage={(image) => setModal({ kind: "image", image })}
          />
        )}
        {view === "life" && (
          <Suspense
            fallback={
              <section role="status">กำลังเปิดเรื่องชีวิตในค่าย...</section>
            }
          >
            <LifeView
              key={lifeTopic ?? "all"}
              initialTopic={lifeTopic}
              context={context}
              onContext={requestContext}
            />
          </Suspense>
        )}
        <footer className="site-footer">
          <p>
            RD Ready · คู่มือเตรียมตัว รด. · โครงการอิสระ ไม่ใช่เว็บไซต์ทางการ
          </p>
          <button
            className="text-button"
            onClick={() => setModal({ kind: "about" })}
          >
            เกี่ยวกับข้อมูลและความเป็นส่วนตัว
          </button>
          <button className="text-button" onClick={() => focusQuestion()}>
            ค้นเรื่องที่สงสัย
            <MagnifyingGlassIcon size={18} />
          </button>
        </footer>
      </main>
      <div className="mobile-navigation">{renderNav("เมนูด้านล่าง")}</div>

      {modal?.kind === "poster" && (
        <Modal
          title="ภาพต้นฉบับ · ปีการศึกษา 2566"
          onClose={() => setModal(null)}
          wide
        >
          <img
            className="enlarged-poster"
            src="/assets/packing-poster-2566.png"
            alt="รายการเตรียมภาคสนาม 17 รายการ ปีการศึกษา 2566"
          />
          <p className="review-note">
            ภาพที่ผู้ใช้ส่งมา ใช้ดูรายการเดิม
            ไม่ยืนยันข้อกำหนดปัจจุบันหรือสิทธิการเผยแพร่สาธารณะ
          </p>
          <ExternalLink href={posterUrl}>เปิดโพสต์อ้างอิง</ExternalLink>
        </Modal>
      )}
      {modal?.kind === "image" && (
        <Modal
          title="ภาพจากเอกสารเดิม · รอตรวจสอบ"
          onClose={() => setModal(null)}
          wide
        >
          <p className="review-note">{modal.image.caption}</p>
          <img
            className="enlarged-document"
            src={modal.image.path}
            alt={modal.image.alt}
          />
          <ExternalLink href={modal.image.sourceUrl}>
            เปิดหน้าเอกสารต้นฉบับ
          </ExternalLink>
        </Modal>
      )}
      {modal?.kind === "context" && (
        <Modal title="เปลี่ยนบริบทการฝึก?" onClose={() => setModal(null)}>
          <p>
            จะเปลี่ยนเป็น “{contextLabels[modal.next]}” และล้างคำถามในหน้านี้
            เพื่อแยกบริบทให้ชัด
            รายการที่ติ๊กของแต่ละชุดข้อมูลยังแยกไว้เหมือนเดิม
          </p>
          <div className="quick-links">
            <button onClick={() => applyContext(modal.next)}>
              เปลี่ยนบริบทและล้างคำถาม
            </button>
            <button onClick={() => setModal(null)}>ใช้บริบทเดิม</button>
          </div>
        </Modal>
      )}
      {modal?.kind === "item" && (
        <Modal title={modal.item.title} onClose={() => setModal(null)}>
          <span className="status-tag">
            {modal.item.source === "field"
              ? "ภาพภาคสนามปี 2566"
              : "รายการวันฝึกปกติ"}{" "}
            · รอตรวจสอบ
          </span>
          <figure className="item-photo">
            <a
              href={itemMedia[modal.item.id].src}
              target="_blank"
              rel="noreferrer"
              aria-label={`ขยายรูป ${modal.item.title}`}
            >
              <img
                src={itemMedia[modal.item.id].src}
                alt={itemMedia[modal.item.id].alt}
              />
            </a>
            <figcaption>
              ภาพประกอบสิ่งของ · กดเพื่อดูรูปใหญ่ · ไม่กำหนดสี ยี่ห้อ
              หรือรุ่นที่ต้องใช้
            </figcaption>
          </figure>
          <p className="item-status">
            {packingStatus(modal.item.id, modal.item.source)}
          </p>
          <p className="item-source-text">{modal.item.text}</p>
          <dl className="item-details">
            <div>
              <dt>จำนวน / ขอบเขตที่อ่านได้</dt>
              <dd>{modal.item.quantity}</dd>
            </div>
            <div>
              <dt>การใช้ข้อมูล</dt>
              <dd>
                {modal.item.source === "field"
                  ? "เขาชนไก่ ปีการศึกษา 2566 ยังไม่ระบุชั้นปี หน่วย และผลัด"
                  : "ข้อมูลฝึกปกติจากเอกสารหลายช่วงเวลาและคำแนะนำ ไม่ยืนยันเป็นรายการของศูนย์ฯปีปัจจุบัน"}
              </dd>
            </div>
          </dl>
          <p className="review-note">
            ไม่ใช้ตัดสินข้ออนุญาตปัจจุบัน ภาพประกอบไม่ได้กำหนดสี ยี่ห้อ
            หรือแบบที่ต้องซื้อ
          </p>
          <References items={modal.item.references} />
          {modal.item.source === "field" ? (
            <div className="quick-links">
              <button onClick={() => setModal({ kind: "poster" })}>
                ดูภาพต้นฉบับ
                <CaretRightIcon size={18} />
              </button>
              <ExternalLink href={posterUrl}>เปิดโพสต์อ้างอิง</ExternalLink>
            </div>
          ) : (
            modal.item.references.length === 0 && (
              <p className="muted">
                รายการนี้ยังไม่มีลิงก์อ้างอิงเฉพาะที่ยืนยันข้อบังคับ
              </p>
            )
          )}
          {itemGuide(modal.item.id) && (
            <button
              className="text-button"
              onClick={() => openGuide(itemGuide(modal.item.id))}
            >
              ดูคู่มือที่เกี่ยวข้อง
              <BookOpenIcon size={18} />
            </button>
          )}
        </Modal>
      )}
      {modal?.kind === "about" && (
        <Modal title="เกี่ยวกับต้นแบบ RD Ready" onClose={() => setModal(null)}>
          <p>
            คู่มือภาพสำหรับนักศึกษาวิชาทหาร
            เริ่มจากศูนย์ฝึกวิภาวดีและการอ่านข้อมูลภาคสนามตามขอบเขตแหล่งข้อมูล
          </p>
          <ul className="about-list">
            <li>
              รายการ คู่มือ และประสบการณ์ยังรอตรวจ
              ไม่ใช้ตอบยืนยันข้อกำหนดปัจจุบัน
            </li>
            <li>
              คำถามส่งไปเซิร์ฟเวอร์ของเว็บเพื่อค้นข้อมูล หากเปิด Gemini
              จะส่งข้อความคำถามไปประมวลผลกับ Google ไม่บันทึกบทสนทนาลงดิสก์
            </li>
            <li>
              หากเลือก “จำรายการในเครื่องนี้”
              จะเก็บเฉพาะรหัสรายการที่ติ๊กในเบราว์เซอร์ แยกชุดข้อมูล
              ไม่มีการส่งไปเซิร์ฟเวอร์ ปิดตัวเลือกนี้เพื่อลบข้อมูลที่บันทึกไว้
            </li>
            <li>ไม่มีการขอข้อมูลสุขภาพหรือเลขบัตรของผู้ใช้</li>
            <li>
              ภาพเปิดหน้าและภาพอุปกรณ์เป็นภาพประกอบที่สร้างขึ้น
              ส่วนภาพเอกสารเก็บต้นฉบับและระบุแหล่ง
            </li>
            <li>
              คลิปและเว็บไซต์อ้างอิงเปิดในแท็บใหม่
              สิทธิภาพและข้อมูลต้องตรวจอีกครั้งก่อนเผยแพร่
            </li>
          </ul>
        </Modal>
      )}
    </div>
  );
}
