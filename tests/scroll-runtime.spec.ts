import { expect, test } from "@playwright/test";

test("mobile GSAP runtime creates triggers and animates the page", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });

  const pageHome = page.locator(".page-home");
  await expect(pageHome).toHaveAttribute("data-scroll-runtime", "ready");

  await expect
    .poll(async () => {
      const count = await pageHome.getAttribute("data-scroll-trigger-count");
      return Number(count ?? 0);
    })
    .toBeGreaterThanOrEqual(10);

  const headline = page.locator(".intro-headline-word.word-1");
  const heroPhoto = page.locator(".intro-photo");

  const headlineBefore = await headline.evaluate(
    (element) => getComputedStyle(element).transform
  );
  const heroBefore = await heroPhoto.evaluate(
    (element) => getComputedStyle(element).transform
  );

  await page.evaluate(() => window.scrollTo(0, Math.min(360, document.body.scrollHeight)));
  await page.waitForTimeout(450);

  const headlineAfter = await headline.evaluate(
    (element) => getComputedStyle(element).transform
  );
  const heroAfter = await heroPhoto.evaluate(
    (element) => getComputedStyle(element).transform
  );

  expect(headlineAfter).not.toBe(headlineBefore);
  expect(heroAfter).not.toBe(heroBefore);

  const portraitBox = page.locator(".intro-subheadline-photo-box");
  const portraitBefore = await portraitBox.evaluate(
    (element) => getComputedStyle(element).transform
  );

  await page.evaluate(() => {
    const target = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer"
    );
    if (!target) throw new Error("Missing first intro story trigger");
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + window.innerHeight * 0.65);
  });
  await page.waitForTimeout(450);

  const portraitAfter = await portraitBox.evaluate(
    (element) => getComputedStyle(element).transform
  );
  expect(portraitAfter).not.toBe(portraitBefore);

  const tvPinner = page.locator(".tv-box-pinner");
  await expect
    .poll(async () =>
      tvPinner.evaluate((element) =>
        element.parentElement?.classList.contains("pin-spacer") ?? false
      )
    )
    .toBe(true);

  expect(pageErrors).toEqual([]);
});
