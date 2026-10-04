import { expect, test, type Page } from "@playwright/test";

async function waitForScroll(page: Page, milliseconds = 220) {
  await page.waitForTimeout(milliseconds);
}

async function scrollUntilAttribute(
  page: Page,
  selector: string,
  attribute: string,
  expected: string,
  options: { maxSteps?: number; stepViewport?: number } = {}
) {
  const maxSteps = options.maxSteps ?? 32;
  const stepViewport = options.stepViewport ?? 0.08;

  for (let step = 0; step < maxSteps; step += 1) {
    const current = await page.locator(selector).getAttribute(attribute);
    if (current === expected) return;

    await page.evaluate((viewportFraction) => {
      window.scrollBy(0, window.innerHeight * viewportFraction);
    }, stepViewport);
    await waitForScroll(page, 110);
  }

  await expect(page.locator(selector)).toHaveAttribute(attribute, expected);
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
  await waitForScroll(page, 420);

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
  await waitForScroll(page, 420);

  const railAtStart = await secondPhotoRail.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, viewport: window.innerWidth };
  });
  expect(railAtStart.left).toBeGreaterThan(railAtStart.viewport * 0.95);

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.32));
  await waitForScroll(page, 420);

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

test("mobile TV is grey before works, shows work only inside its screen zone, then returns to grey and becomes the transition", async ({
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
  await waitForScroll(page, 420);

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

  // Move through the scene in small increments like an actual touch scroll.
  // This avoids teleporting across both the TV pin and work trigger in one
  // animation frame, which is not representative of the real mobile UX.
  await scrollUntilAttribute(
    page,
    ".tv-all-vids",
    "data-preview-active",
    "true",
    { maxSteps: 28, stepViewport: 0.07 }
  );

  await expect(page.locator(".tv-cover")).toHaveCount(1);

  const activeWork = page.locator(".work-item.is-active");
  await expect(activeWork).toHaveCount(1);
  const workRect = await activeWork.boundingBox();
  const screenRect = await tvScreen.boundingBox();
  expect(workRect).not.toBeNull();
  expect(screenRect).not.toBeNull();
  if (workRect && screenRect) {
    expect(workRect.height).toBeLessThan(screenRect.height * 1.05);
  }

  // Continue naturally through the remaining works. Only the final row clears
  // the preview, at which point the television must be grey again.
  await scrollUntilAttribute(
    page,
    ".tv-all-vids",
    "data-preview-active",
    "false",
    { maxSteps: 48, stepViewport: 0.09 }
  );

  await expect(page.locator(".tv-cover")).toHaveCount(0);

  // Enter the exit scene incrementally so the TV's grey-to-black transition is
  // observed rather than skipped by a single large scroll jump.
  const tvBox = page.locator(".tv-box");
  const transformBeforeExit = await tvBox.evaluate(
    (element) => getComputedStyle(element).transform
  );

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.46));
  await waitForScroll(page, 420);

  const exitState = await tvBox.evaluate((element) => ({
    transform: getComputedStyle(element).transform,
  }));
  const backgroundOpacity = Number(
    await tvBackground.evaluate((element) => getComputedStyle(element).opacity)
  );
  const idleScreen = await page.locator(".tv-blackscreen").evaluate((element) =>
    getComputedStyle(element).backgroundColor
  );

  expect(exitState.transform).not.toBe(transformBeforeExit);
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
