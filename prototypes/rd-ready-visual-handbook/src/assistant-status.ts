export function fallbackNotice(mode:string,reason:string):string|null{
  if(mode==='gemini')return null;
  const messages:Record<string,string>={
    cloud_ai_pending:'Preview นี้ยังรอเชื่อมต่อฐานข้อมูลโควตา AI — แสดงข้อมูลที่ค้นพบในระบบให้ก่อน',
    disabled:'Gemini ยังปิดอยู่ — ขณะนี้ค้นหาในเครื่อง',
    no_key:'เซิร์ฟเวอร์ยังไม่มี API key — ขณะนี้ค้นหาในเครื่อง',
    usage_limit:'ถึงเพดานเรียก Gemini ที่ตั้งไว้ในเว็บ — ขณะนี้ค้นหาในเครื่อง',
    provider_payment_required:'Gemini ปฏิเสธคำขอ (402): ตรวจเครดิตและการเรียกเก็บเงินของโปรเจกต์ใน Google AI Studio — ขณะนี้ค้นหาในเครื่อง',
    provider_access_denied:'Gemini ปฏิเสธสิทธิ์เข้าถึง: ตรวจ API key และสิทธิ์ของโปรเจกต์ — ขณะนี้ค้นหาในเครื่อง',
    provider_model_unavailable:'โมเดล Gemini ที่ตั้งค่าไว้ยังใช้ไม่ได้: ตรวจชื่อโมเดลและสิทธิ์ของบัญชี — ขณะนี้ค้นหาในเครื่อง',
    provider_quota:'Gemini แจ้งว่าเกินโควตาหรืออัตราการเรียก — ขณะนี้ค้นหาในเครื่อง',
  };
  return messages[reason]??'เรียก Gemini ไม่สำเร็จ — ขณะนี้ค้นหาในเครื่อง';
}
