import { ArrowDown, BookOpen, CircleHelp, FileSearch, PackageCheck } from "lucide-react";

export default function Home() {
  return <>
    <section id="ask" className="hero" aria-labelledby="welcome-title">
      <span className="eyebrow">เตรียมตัว รด. อย่างมีข้อมูล</span>
      <h1 id="welcome-title">เริ่มจากคำถาม<br /><span>มั่นใจด้วยหลักฐาน</span></h1>
      <p className="hero-copy">ค้นข้อมูลการแต่งกายและการเตรียมของให้ตรงกับชั้นปี หน่วยฝึก สถานที่ และปีการศึกษาของคุณ</p>
      <a className="primary-link" href="#content-status">ดูสถานะข้อมูล <ArrowDown size={18} aria-hidden="true" /></a>
    </section>
    <section id="content-status" className="status-card" aria-labelledby="status-title">
      <div className="icon-tile"><FileSearch size={26} aria-hidden="true" /></div>
      <div><span className="status-label">รอตรวจข้อมูล</span><h2 id="status-title">ยังไม่มีข้อมูลที่ตรวจแล้วในระบบ</h2>
      <p>เมื่อมีประกาศและคู่มือที่ผ่านการตรวจ จะค้นคำตอบพร้อมแหล่งอ้างอิงได้ ขณะนี้ยังไม่เปิดรับคำถาม</p>
      <p className="muted">หากต้องเตรียมตัวตอนนี้ กรุณาตรวจประกาศหรือสอบถามหน่วยฝึกของคุณโดยตรง</p></div>
    </section>
    <div className="content-grid">
      <section id="guides" className="topic-card" aria-labelledby="guides-title"><BookOpen aria-hidden="true" size={24} /><h2 id="guides-title">คู่มือแต่งกาย</h2><p>ยังไม่มีคู่มือที่ตรวจแล้วพร้อมเผยแพร่</p></section>
      <section id="items" className="topic-card" aria-labelledby="items-title"><PackageCheck aria-hidden="true" size={24} /><h2 id="items-title">สิ่งของและข้อกำหนด</h2><p>ยังไม่มีรายการที่มีหลักฐานตรวจแล้ว</p></section>
    </div>
    <aside className="scope-note"><CircleHelp size={20} aria-hidden="true" /><p>ข้อกำหนดอาจต่างกันตามบริบท การไม่พบข้อมูลไม่ได้หมายความว่าอนุญาต</p></aside>
  </>;
}
