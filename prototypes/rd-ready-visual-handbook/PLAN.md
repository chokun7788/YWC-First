# RD Ready — แบบ 4 / React frontend

- [x] ตรวจ environment และโครงงานเดิมใน D:/Chokun โดยไม่ scaffold ทับ
- [x] ล็อกภาพแบบ 4 คู่คอม–มือถือใน selected-design.json
- [x] ใช้ React + Vite + TypeScript strict + CSS และฟอนต์ไทยในเครื่อง
- [x] ทำหน้าแรก เมนู คู่มือ รายการ 17 ชิ้น และภาพต้นฉบับขยายได้
- [x] แยกข้อมูล research รอตรวจออกจากระบบตอบจริง ไม่เปลี่ยน production content
- [x] ตรวจ browser ทั้ง desktop/mobile และ interaction states — 110 assertions / 6 viewports ทั้ง dev และ compiled preview
- [x] เทียบภาพที่ render กับภาพแบบ 4 แล้วแก้ข้อแตกต่างที่สำคัญ — design-qa.md passed
- [x] typecheck / build / worker tests 4/4 / preservation 32/32 ผ่าน
- [x] ส่ง preview ที่เปิดอยู่ พร้อมข้อจำกัดและผลตรวจจริง — http://127.0.0.1:4175/ และ README.md

ขอบเขตนี้เป็น frontend prototype ไม่ใช่การประกาศว่า Milestone 3–7 ของ Master Spec เสร็จ ไม่มีการเชื่อม AI/API/ฐานข้อมูล ไม่มี Login, Vision หรือ Admin

## รอบ student-flow ที่ผู้ใช้อนุมัติ 2026-10-30

- [x] ปรับ headline/บริบท/ช่องถาม/ปุ่มงาน4เรื่อง โดยคงธีมและภาพแบบ4
- [x] แยกฝึกปกติ23กับภาพภาคสนาม2566จำนวน17 ไม่ใช้ตัวเลขข้ามบริบท
- [x] แบ่งหมวด/ตัวกรอง/ความคืบหน้า/ชื่อเรียกจากคลังเดิม/opt-inจำรายการในเครื่อง
- [x] คู่มือ12เรื่อง46ขั้นตอน เลือกครบชื่อบนมือถือ และเพิ่มภาพเอกสารเดิมในเรื่องที่เกี่ยวข้อง
- [x] ชีวิตในค่าย26เรื่องแบบอ่านเนื้อหา พร้อมต้นทาง/ขอบเขต/ค้นหา/ย่อหรือเปิดทั้งหมด
- [x] แก้ข้อค้นพบมือถือและtablet แล้วเทียบภาพก่อน/หลังแบบfull+focused; design-qa.md passed
- [x] typecheck/build ผ่าน; UI160assertionsใน7ขนาด; worker4/4; original32hashไม่เปลี่ยน
- [x] เก็บbackupและรายงานในoutput/playwright/student-flow และdocs/FRONTEND-STUDENT-FLOW-2026-10-30.md

งานถัดไปที่แยกจากรอบFrontendนี้: ทดสอบกับนักศึกษาจริง5–8คน, ตรวจข้อมูล/สิทธิภาพ, หารูปสอนรองเท้า/ร้อยเชือก/พับแขนจากแหล่งที่ตรวจแล้ว และเชื่อมระบบคำตอบหลังมีapproved content
