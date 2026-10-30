import Link from "next/link";
import { BookOpen, MessageCircle, PackageCheck, ShieldCheck } from "lucide-react";

export function AppHeader() {
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="RD Ready หน้าแรก"><ShieldCheck size={26} aria-hidden="true" /><span>RD <strong>Ready</strong></span></Link>
    <nav aria-label="เมนูหลัก" className="desktop-nav">
      <Link href="/#ask">ถามเรื่องเตรียมตัว</Link><Link href="/#guides">คู่มือ</Link><Link href="/#items">เตรียมของ</Link>
    </nav>
    <span className="header-note">โครงการอิสระ</span>
  </div></header>;
}
export function MobileNav() {
  return <nav aria-label="เมนูมือถือ" className="mobile-nav">
    <Link href="/#ask"><MessageCircle size={20} aria-hidden="true" />ถาม</Link>
    <Link href="/#guides"><BookOpen size={20} aria-hidden="true" />คู่มือ</Link>
    <Link href="/#items"><PackageCheck size={20} aria-hidden="true" />เตรียมของ</Link>
  </nav>;
}
export function SiteFooter() {
  return <footer className="site-footer">RD Ready เป็นโครงการอิสระ ไม่ใช่เว็บไซต์ทางการ<br />ตรวจประกาศล่าสุดของหน่วยฝึกก่อนปฏิบัติจริงเสมอ</footer>;
}
