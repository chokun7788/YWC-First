/** The old day-uniform row summarizes the whole outfit; it is not an extra object. */
export function dailyChecklistRows<T extends { id: string }>(rows: T[]): T[] {
  return rows.filter((row) => row.id !== "day-uniform");
}
export function packingGroup(id: string, source: "center" | "field") {
  if (source === "field") {
    if (
      [
        "pack-uniform",
        "pack-undershirt",
        "pack-shorts",
        "pack-underwear",
        "pack-sneakers",
        "pack-sandals",
        "pack-socks",
        "pack-jacket",
      ].includes(id)
    )
      return "เสื้อผ้าและรองเท้า · ตามภาพปี 2566";
    if (["pack-field-kit", "pack-sleeping"].includes(id))
      return "เครื่องสนามและเครื่องนอน";
    if (["pack-id", "pack-writing"].includes(id))
      return "เอกสารและเครื่องเขียน";
    return "ของใช้ส่วนตัว · ตามภาพปี 2566";
  }
  if (
    [
      "day-shirt",
      "day-pants",
      "day-under",
      "day-hat",
      "day-belt",
      "day-socks",
      "day-boots",
      "day-insignia",
    ].includes(id)
  )
    return "เครื่องแต่งกาย · สวมไปฝึก";
  if (["day-id", "day-papers", "day-writing"].includes(id))
    return "เอกสารและเครื่องเขียน";
  if (["day-water", "day-tissue", "day-bag"].includes(id))
    return "ของใช้ระหว่างวัน · คำแนะนำ";
  if (["day-phone", "day-powerbank"].includes(id))
    return "ตรวจเงื่อนไขการนำเข้าและการใช้";
  return "ตามความจำเป็นของแต่ละคน";
}
export function packingStatus(id: string, source: "center" | "field") {
  if (source === "field") return "รายการจากภาพปี 2566";
  if (["day-phone", "day-powerbank"].includes(id))
    return "ยังไม่ยืนยันสิทธินำเข้า / ช่วงใช้";
  if (["day-medicine", "day-period"].includes(id))
    return "สำหรับผู้ที่จำเป็นต้องใช้";
  if (id === "day-papers") return "เมื่อสถานศึกษาหรือหน่วยแจ้ง";
  if (
    [
      "day-shirt",
      "day-pants",
      "day-under",
      "day-hat",
      "day-belt",
      "day-socks",
      "day-boots",
      "day-insignia",
    ].includes(id)
  )
    return "ตรวจแบบที่หน่วยของตนใช้";
  return "คำแนะนำ ไม่ใช่ของบังคับที่ยืนยันแล้ว";
}
