type ItemMedia = { src: string; alt: string; illustrationOnly: true };
const photo = (file: string, label: string): ItemMedia => ({
  src: "/assets/" + file,
  alt: "ภาพประกอบ " + label,
  illustrationOnly: true,
});
const generated = (file: string, label: string) =>
  photo("items/" + file + ".webp", label);
const uniform = photo("uniform.webp", "ตัวอย่างชุดฝึก"),
  under = photo("undershirt.webp", "เสื้อยืด"),
  socks = photo("socks.webp", "ถุงเท้า"),
  bath = photo("toiletries.webp", "ของใช้ทำความสะอาด");
export const itemMedia: Record<string, ItemMedia> = {
  "day-uniform": uniform,
  "pack-uniform": uniform,
  "day-shirt": generated("shirt", "เสื้อฝึก"),
  "day-pants": generated("pants", "กางเกงฝึก"),
  "day-under": under,
  "pack-undershirt": under,
  "day-hat": generated("beret", "ตัวอย่างหมวก"),
  "day-belt": generated("belt", "ตัวอย่างเข็มขัด"),
  "day-socks": socks,
  "pack-socks": socks,
  "day-boots": generated("boots", "รองเท้าฝึกพร้อมเชือก"),
  "day-insignia": generated(
    "patches",
    "ผ้าป้ายเปล่าสำหรับอธิบายตำแหน่งเครื่องหมาย ไม่ใช่ตราจริง",
  ),
  "day-id": generated("id-card", "ซองใส่บัตรเปล่า ไม่ใช่บัตรจริง"),
  "pack-id": generated("id-card", "ซองใส่บัตรเปล่า ไม่ใช่บัตรจริง"),
  "day-papers": generated("papers", "เอกสารเปล่า"),
  "day-writing": generated("writing", "สมุดและปากกา"),
  "pack-writing": generated("writing", "สมุดและปากกา"),
  "day-water": generated("water", "ภาชนะใส่น้ำ"),
  "day-medicine": generated("medicine", "ซองยาส่วนตัว ไม่มีชื่อหรือขนาดยา"),
  "pack-personal-meds": generated(
    "medicine",
    "ซองยาส่วนตัว ไม่มีชื่อหรือขนาดยา",
  ),
  "day-cash": generated("wallet", "กระเป๋าเงิน"),
  "day-tissue": generated("tissue", "กระดาษชำระ"),
  "day-period": generated("period", "อุปกรณ์ดูแลประจำเดือน"),
  "day-sun": generated("sun", "ภาชนะผลิตภัณฑ์กันแดดแบบไม่มีฉลาก"),
  "day-mask": generated("mask", "หน้ากาก"),
  "day-bag": generated("bag", "กระเป๋าเล็ก"),
  "day-rain": generated("rain", "เสื้อกันฝน"),
  "day-phone": generated("phone", "โทรศัพท์"),
  "day-powerbank": generated("powerbank", "พาวเวอร์แบงก์และสายชาร์จ"),
  "pack-field-kit": generated(
    "field-kit",
    "ตัวอย่างเครื่องสนาม ไม่ใช่รายการเบิกครบชุด",
  ),
  "pack-bath-kit": bath,
  "pack-sleeping": generated(
    "sleeping",
    "ผ้าห่มและถุงนอนเป็นตัวอย่างเครื่องนอน",
  ),
  "pack-shorts": generated("shorts", "กางเกงขาสั้น"),
  "pack-underwear": generated("underwear", "กางเกงชั้นใน"),
  "pack-sneakers": generated("sneakers", "รองเท้าผ้าใบ"),
  "pack-sandals": generated("sandals", "รองเท้าฟองน้ำ"),
  "pack-shoe-care": generated("shoe-care", "แปรงและอุปกรณ์ขัดรองเท้า"),
  "pack-spoon": generated("cutlery", "ช้อน ส้อม และแก้วน้ำ"),
  "pack-sewing": generated("sewing", "เข็มและด้าย"),
  "pack-jacket": generated("jacket", "เสื้อกันหนาว"),
};
const guides: Record<string, string> = {
  "day-shirt": "guide-shirt",
  "day-pants": "guide-pants",
  "day-under": "guide-under",
  "day-hat": "guide-hat",
  "day-belt": "guide-belt",
  "day-socks": "guide-boots",
  "day-boots": "guide-boots",
  "day-insignia": "guide-insignia",
  "pack-uniform": "guide-full",
  "pack-undershirt": "guide-under",
  "pack-socks": "guide-boots",
};
export function itemGuide(id: string) {
  return guides[id];
}
