# RD Ready

คู่มือเตรียมตัวนักศึกษาวิชาทหาร พร้อมเช็กลิสต์ คู่มือภาพ และระบบค้นข้อมูลประกอบคำตอบ AI ข้อมูลอยู่ระหว่างตรวจสอบ ควรตรวจประกาศของหน่วยและสถานศึกษาปัจจุบัน

เว็บ React ที่ deploy ปัจจุบันอยู่ใน `prototypes/rd-ready-visual-handbook` ส่วนโค้ด Next.js และข้อมูลเดิมอยู่ที่ repository root

## เริ่มพัฒนา

ติดตั้ง Node.js 24 แล้วรัน `npm ci` ที่ root และรัน `npm ci` อีกครั้งภายใน `prototypes/rd-ready-visual-handbook` จากนั้นใช้ `npm run serve` ในโฟลเดอร์ prototype เพื่อเปิดเว็บพร้อม API ในเครื่อง ตัวอย่างตัวแปรอยู่ที่ `.env.example` ของแต่ละโปรเจกต์ อย่านำ API key ขึ้น Git

## Deploy บน Vercel

ตั้ง Root Directory เป็น `prototypes/rd-ready-visual-handbook`; build command `npm run build:cloud`; output `dist/client`; Node.js 24. ตั้งค่า environment variables ฝั่ง server ตาม prototype `.env.example` และเตรียม Supabase gateway/database ก่อนเปิด Gemini สำหรับโควตาร่วม รายละเอียด schema อยู่ใน `prototypes/rd-ready-visual-handbook/supabase`.

การ push repository เพียงอย่างเดียวยังไม่เชื่อม GitHub เข้ากับ Vercel โดยอัตโนมัติ ต้องเชื่อม repository ผ่าน Vercel ก่อนหากต้องการ deploy ทุกครั้งที่ push.

หมายเหตุ: สคริปต์ QA เฉพาะเครื่องและผลลัพธ์ในโฟลเดอร์ qa/output ไม่ได้รวมในชุดนี้ บางคำสั่งทดสอบ UI เดิมจึงยังรันจาก clone ไม่ได้; โค้ดแอปและ build:cloud ถูกรวมไว้

