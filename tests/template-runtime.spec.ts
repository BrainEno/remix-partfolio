import { expect, test } from "@playwright/test";

test("template renders from config and language changes do not navigate away from the current scroll position", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-portfolio-template",
    "ready"
  );
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready"
  );

  await page.evaluate(() => window.scrollTo(0, 360));
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.scrollY);

  await page.locator('button[name="lang"][value="en"]').click();
  await expect(page.locator(".intro-headline-word.word-1 h1")).toHaveText(
    "Performance Art"
  );
  await page.waitForTimeout(350);

  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThan(100);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".intro-headline-word.word-1 h1")).toHaveText(
    "Performance Art"
  );
  expect(pageErrors).toEqual([]);
});
