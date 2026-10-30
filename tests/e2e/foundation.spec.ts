import { expect, test } from "@playwright/test";
test("health contains only liveness and security headers", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});
for (const width of [360, 390, 1280]) {
  test(`honest empty foundation, navigation and no overflow at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ยังไม่มีข้อมูลที่ตรวจแล้วในระบบ" })).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    const nav = page.getByRole("navigation", { name: width < 640 ? "เมนูมือถือ" : "เมนูหลัก", exact: true });
    await nav.getByRole("link", { name: "คู่มือ", exact: true }).click();
    await expect(page).toHaveURL(/#guides$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `test-results/foundation-${width}.png`, fullPage: true });
  });
}
