import { expect, test } from "@playwright/test";

test("template renders from config and persists language without navigation", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  const home = page.locator(".page-home");
  await expect(home).toHaveAttribute("data-portfolio-template", "ready");
  await expect(home).toHaveAttribute("data-language-ready", "true");
  await expect(home).toHaveAttribute("data-scroll-runtime", "ready");

  await page.evaluate(() => window.scrollTo(0, 360));
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.scrollY);
  const urlBefore = page.url();

  await page.locator('button[data-language="en"]').click();
  await expect(page.locator(".intro-headline-word.word-1 h1")).toHaveText(
    "Performance Art"
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.waitForTimeout(350);

  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThan(100);
  expect(page.url()).toBe(urlBefore);
  expect(
    await page.evaluate(() => window.localStorage.getItem("portfolio-language"))
  ).toBe("en");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-language-ready",
    "true"
  );
  await expect(page.locator(".intro-headline-word.word-1 h1")).toHaveText(
    "Performance Art"
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(pageErrors).toEqual([]);
});
