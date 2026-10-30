import type { Metadata } from "next";
import { AppHeader, MobileNav, SiteFooter } from "@/components/layout/AppLayout";
import { getServerEnv } from "@/lib/server/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "RD Ready — เตรียมตัวอย่างมีข้อมูล",
  description: "โครงการอิสระสำหรับค้นข้อมูลเตรียมตัว รด. พร้อมขอบเขตและแหล่งอ้างอิงที่ตรวจแล้ว",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  getServerEnv();
  return <html lang="th"><body>
    <a href="#main" className="skip-link">ข้ามไปเนื้อหา</a>
    <AppHeader />
    <main id="main" className="page-container">{children}</main>
    <SiteFooter /><MobileNav />
  </body></html>;
}
