import { expect, test, type Page } from "@playwright/test";

async function waitForScroll(page: Page) {
  await page.waitForTimeout(500);
}

test("mobile choreography has no dead intro phase and keeps the TV composited", async ({
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
    .toBeGreaterThanOrEqual(9);

  const headline = page.locator(".intro-headline-word.word-1");
  const heroPhoto = page.locator(".intro-photo");

  const headlineBefore = await headline.evaluate(
    (element) => getComputedStyle(element).transform
  );
  const heroBefore = await heroPhoto.evaluate(
    (element) => getComputedStyle(element).transform
  );

  await page.evaluate(() => window.scrollTo(0, Math.min(360, document.body.scrollHeight)));
  await waitForScroll(page);

  expect(
    await headline.evaluate((element) => getComputedStyle(element).transform)
  ).not.toBe(headlineBefore);
  expect(
    await heroPhoto.evaluate((element) => getComputedStyle(element).transform)
  ).not.toBe(heroBefore);

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
  await waitForScroll(page);

  expect(
    await portraitBox.evaluate((element) => getComputedStyle(element).transform)
  ).not.toBe(portraitBefore);

  // The second intro story used to start one full viewport offscreen and then
  // placed its paragraph another viewport to the right. A small amount of
  // scroll must now reveal the paragraph immediately while the photo rail exits.
  await page.evaluate(() => {
    const target = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer2"
    );
    if (!target) throw new Error("Missing second intro story trigger");
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + window.innerHeight * 0.2);
  });
  await waitForScroll(page);

  const secondText = page.locator(".intro-subheadline-text-box2");
  const secondPhotoRail = page.locator(".intro-subheadline-photo-box2");
  const secondScene = await secondText.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: window.innerWidth };
  });
  expect(secondScene.left).toBeLessThan(secondScene.viewport);
  expect(secondScene.right).toBeGreaterThan(0);
  await expect(secondPhotoRail).toBeVisible();

  // At the beginning of Works the full-height background must already own the
  // viewport; this prevents the white seam that was visible before TV pinning.
  await page.evaluate(() => {
    const section = document.getElementById("partfolio");
    if (!section) throw new Error("Missing portfolio section");
    section.scrollIntoView({ block: "start" });
  });
  await waitForScroll(page);

  const tvBackground = page.locator(".tv-bg");
  const tvScreen = page.locator(".tv-all-vids");
  const tvPinner = page.locator(".tv-box-pinner");

  await expect
    .poll(async () =>
      tvPinner.evaluate((element) =>
        element.parentElement?.classList.contains("pin-spacer") ?? false
      )
    )
    .toBe(true);

  const backgroundRect = await tvBackground.boundingBox();
  const screenRect = await tvScreen.boundingBox();
  const viewport = page.viewportSize();
  expect(backgroundRect).not.toBeNull();
  expect(screenRect).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (backgroundRect && screenRect && viewport) {
    expect(Math.abs(backgroundRect.y)).toBeLessThanOrEqual(2);
    expect(backgroundRect.height).toBeGreaterThanOrEqual(viewport.height - 2);
    expect(screenRect.x).toBeGreaterThan(viewport.width * 0.28);
    expect(screenRect.x + screenRect.width).toBeLessThan(viewport.width * 0.7);
  }

  // Halfway through the exit, the screen image must still exist while the
  // entire TV scene scales/rotates/fades as one composited unit.
  await page.evaluate(() => {
    const spacer = document.querySelector<HTMLElement>(".tv-exit-spacer");
    if (!spacer) throw new Error("Missing TV exit spacer");
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    const start = top - window.innerHeight;
    window.scrollTo(0, start + spacer.offsetHeight * 0.55);
  });
  await waitForScroll(page);

  const tvBox = page.locator(".tv-box");
  const tvCover = page.locator(".tv-cover");
  const exitState = await tvBox.evaluate((element) => ({
    opacity: Number(getComputedStyle(element).opacity),
    transform: getComputedStyle(element).transform,
  }));
  const coverOpacity = Number(
    await tvCover.evaluate((element) => getComputedStyle(element).opacity)
  );
  expect(exitState.transform).not.toBe("none");
  expect(exitState.opacity).toBeLessThan(1);
  expect(exitState.opacity).toBeGreaterThan(0);
  expect(coverOpacity).toBeGreaterThan(0.2);

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
