import { expect, test, type Page } from "@playwright/test";

async function waitForScroll(page: Page) {
  await page.waitForTimeout(500);
}

test("mobile choreography synchronizes the hero and moves the second photo rail in from the right", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  const pageHome = page.locator(".page-home");
  await expect(pageHome).toHaveAttribute("data-scroll-runtime", "ready");

  const headline = page.locator(".intro-headline-word.word-1");
  const heroPhoto = page.locator(".intro-photo");
  const heroPhotoBox = page.locator(".intro-photo-box");

  const headlineBefore = await headline.evaluate(
    (element) => getComputedStyle(element).transform
  );
  const photoBefore = await heroPhoto.evaluate(
    (element) => getComputedStyle(element).transform
  );
  const photoBoxBefore = await heroPhotoBox.evaluate(
    (element) => getComputedStyle(element).transform
  );

  await page.evaluate(() => window.scrollTo(0, Math.min(340, document.body.scrollHeight)));
  await waitForScroll(page);

  expect(
    await headline.evaluate((element) => getComputedStyle(element).transform)
  ).not.toBe(headlineBefore);
  expect(
    await heroPhoto.evaluate((element) => getComputedStyle(element).transform)
  ).not.toBe(photoBefore);
  expect(
    await heroPhotoBox.evaluate((element) => getComputedStyle(element).transform)
  ).not.toBe(photoBoxBefore);

  const secondScene = page.locator(".intro-subheadline-stickytainer2");
  const secondPhotoRail = page.locator(".intro-subheadline-photo-box2");
  const secondText = page.locator(".intro-subheadline-text-box2");

  await secondScene.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer2"
    );
    if (!scene) throw new Error("Missing second intro story trigger");
    const top = scene.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top);
  });
  await waitForScroll(page);

  const railAtStart = await secondPhotoRail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, viewport: window.innerWidth };
  });
  expect(railAtStart.left).toBeGreaterThan(railAtStart.viewport * 0.95);

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.32));
  await waitForScroll(page);

  const railAfter = await secondPhotoRail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: window.innerWidth };
  });
  const textAfter = await secondText.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: window.innerWidth };
  });

  expect(railAfter.left).toBeLessThan(railAfter.viewport);
  expect(railAfter.right).toBeGreaterThan(0);
  expect(textAfter.left).toBeLessThan(textAfter.viewport);
  expect(pageErrors).toEqual([]);
});

test("mobile TV is grey before works, shows only the work crossing its screen, then returns to grey and becomes the transition", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready"
  );

  await page.evaluate(() => {
    const section = document.getElementById("partfolio");
    if (!section) throw new Error("Missing portfolio section");
    section.scrollIntoView({ block: "start" });
  });
  await waitForScroll(page);

  const tvScreen = page.locator(".tv-all-vids");
  const tvBackground = page.locator(".tv-bg");
  const tvPinner = page.locator(".tv-box-pinner");

  await expect(tvScreen).toHaveAttribute("data-preview-active", "false");
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  await expect
    .poll(async () =>
      tvPinner.evaluate((element) =>
        element.parentElement?.classList.contains("pin-spacer") ?? false
      )
    )
    .toBe(true);

  const firstWork = page.locator(".work-item").first();
  await firstWork.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.63);
  });
  await waitForScroll(page);

  await expect(tvScreen).toHaveAttribute("data-preview-active", "true");
  await expect(page.locator(".tv-cover")).toHaveCount(1);

  const workRect = await firstWork.boundingBox();
  const screenRect = await tvScreen.boundingBox();
  expect(workRect).not.toBeNull();
  expect(screenRect).not.toBeNull();
  if (workRect && screenRect) {
    expect(workRect.height).toBeLessThan(screenRect.height * 1.05);
  }

  const lastWork = page.locator(".work-item").last();
  await lastWork.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.42);
  });
  await waitForScroll(page);

  await expect(tvScreen).toHaveAttribute("data-preview-active", "false");
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  await page.evaluate(() => {
    const spacer = document.querySelector<HTMLElement>(".tv-exit-spacer");
    if (!spacer) throw new Error("Missing TV exit spacer");
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    const start = top - window.innerHeight * 0.56;
    window.scrollTo(0, start + spacer.offsetHeight * 0.62);
  });
  await waitForScroll(page);

  const tvBox = page.locator(".tv-box");
  const exitState = await tvBox.evaluate((element) => ({
    transform: getComputedStyle(element).transform,
  }));
  const backgroundOpacity = Number(
    await tvBackground.evaluate((element) => getComputedStyle(element).opacity)
  );
  const idleScreen = await page.locator(".tv-blackscreen").evaluate((element) =>
    getComputedStyle(element).backgroundColor
  );

  expect(exitState.transform).not.toBe("none");
  expect(backgroundOpacity).toBeLessThan(1);
  expect(idleScreen).toMatch(/rgb/);
  await expect(page.locator(".contact-headline").first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("mobile WebGL scene is mounted only near Contact and survives repeated navigation", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready"
  );

  await expect(page.locator("canvas")).toHaveCount(0);

  for (let cycle = 0; cycle < 2; cycle += 1) {
    await page.evaluate(() => {
      const contact = document.querySelector<HTMLElement>(".contact-inner");
      if (!contact) throw new Error("Missing contact section");
      contact.scrollIntoView({ block: "center" });
    });

    await expect(page.locator(".canvas-container")).toHaveAttribute(
      "data-scene-active",
      "true"
    );
    await expect(page.locator("canvas")).toHaveCount(1);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await expect(page.locator(".canvas-container")).toHaveAttribute(
      "data-scene-active",
      "false"
    );
    await expect(page.locator("canvas")).toHaveCount(0);
  }

  await expect(page.locator(".header")).toBeVisible();
  expect(pageErrors).toEqual([]);
});
