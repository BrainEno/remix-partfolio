import { expect, test, type Page } from "@playwright/test";

async function waitForScroll(page: Page, ms = 250) {
  await page.waitForTimeout(ms);
}

async function scrollUntilAttribute(
  page: Page,
  selector: string,
  attribute: string,
  expectedValue: string,
  options: { maxSteps: number; stepViewport: number }
) {
  for (let step = 0; step < options.maxSteps; step += 1) {
    const value = await page.locator(selector).getAttribute(attribute);
    if (value === expectedValue) return;

    await page.evaluate(
      ({ stepViewport }: { stepViewport: number }) =>
        window.scrollBy(0, window.innerHeight * stepViewport),
      options
    );
    await waitForScroll(page, 100);
  }

  await expect(page.locator(selector)).toHaveAttribute(attribute, expectedValue);
}

function parseCssRgb(value: string) {
  const normalized = value.trim();
  const hexMatch = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex =
      hexMatch[1].length === 3
        ? hexMatch[1]
            .split("")
            .map((character) => character + character)
            .join("")
        : hexMatch[1];
    return [0, 2, 4].map((offset) =>
      Number.parseInt(hex.slice(offset, offset + 2), 16)
    );
  }

  const rgbMatch = normalized.match(/rgba?\(([^)]+)\)/i);
  if (!rgbMatch) return null;

  const components = rgbMatch[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(Number);

  if (components.length !== 3 || components.some(Number.isNaN)) return null;
  return components;
}

async function readCssColorLuma(
  page: Page,
  selector: string,
  property: string
) {
  const color = await page.locator(selector).evaluate(
    (element, cssProperty: string) =>
      getComputedStyle(element).getPropertyValue(cssProperty).trim(),
    property
  );
  const rgb = parseCssRgb(color);
  if (!rgb) throw new Error(`Could not parse ${property}: ${color}`);
  return rgb.reduce((sum, component) => sum + component, 0) / 3;
}

test("mobile GSAP runtime animates the required scenes", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });

  const pageHome = page.locator(".page-home");
  await expect(pageHome).toHaveAttribute("data-scroll-runtime", "ready");

  const headline = page.locator(".intro-headline-word.word-1");
  const heroPhoto = page.locator(".intro-photo");

  const headlineBefore = await headline.evaluate(
    (element) => getComputedStyle(element).transform
  );
  const heroBefore = await heroPhoto.evaluate(
    (element) => getComputedStyle(element).transform
  );

  await page.evaluate(() =>
    window.scrollTo(0, Math.min(360, document.body.scrollHeight))
  );
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

test("mobile second intro gallery enters from the right while the copy travels with it", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready"
  );

  const scene = page.locator(".intro-subheadline-stickytainer2");
  const gallery = page.locator(".intro-subheadline-photo-box2");
  const copy = page.locator(".intro-subheadline-text-box2");

  await scene.scrollIntoViewIfNeeded();
  await waitForScroll(page, 350);

  const viewportWidth = page.viewportSize()?.width ?? 390;
  const galleryBefore = await gallery.boundingBox();
  const copyBefore = await copy.boundingBox();
  expect(galleryBefore).not.toBeNull();
  expect(copyBefore).not.toBeNull();
  if (galleryBefore)
    expect(galleryBefore.x).toBeGreaterThan(viewportWidth * 0.75);
  if (copyBefore) expect(copyBefore.x).toBeGreaterThan(viewportWidth * 0.7);

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.65));
  await waitForScroll(page, 450);

  const galleryAfter = await gallery.boundingBox();
  const copyAfter = await copy.boundingBox();
  expect(galleryAfter).not.toBeNull();
  expect(copyAfter).not.toBeNull();
  if (galleryBefore && galleryAfter)
    expect(galleryAfter.x).toBeLessThan(galleryBefore.x);
  if (copyBefore && copyAfter)
    expect(copyAfter.x).toBeLessThan(copyBefore.x);
});

test("mobile TV follows the grey-green to black to white visual state order", async ({
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
  const contactHeadline = page.locator(".contact-headline").first();

  await expect(tvScreen).toHaveAttribute("data-preview-active", "false");
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  await expect
    .poll(async () =>
      tvPinner.evaluate((element) =>
        element.parentElement?.classList.contains("pin-spacer") ?? false
      )
    )
    .toBe(true);

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

  await scrollUntilAttribute(
    page,
    ".tv-all-vids",
    "data-preview-active",
    "false",
    { maxSteps: 48, stepViewport: 0.09 }
  );
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  const tvBox = page.locator(".tv-box");
  const transformBeforeExit = await tvBox.evaluate(
    (element) => getComputedStyle(element).transform
  );

  const samples: Array<{
    luma: number;
    contactVisible: boolean;
    backgroundOpacity: number;
    transform: string;
  }> = [];

  for (let step = 0; step < 48; step += 1) {
    samples.push({
      luma: await readCssColorLuma(
        page,
        ".tv-blackscreen",
        "--tv-screen-mid"
      ),
      contactVisible: await contactHeadline.isVisible(),
      backgroundOpacity: Number(
        await tvBackground.evaluate((element) => getComputedStyle(element).opacity)
      ),
      transform: await tvBox.evaluate(
        (element) => getComputedStyle(element).transform
      ),
    });

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.035));
    await waitForScroll(page, 80);
  }

  const darkestLuma = Math.min(...samples.map((sample) => sample.luma));
  const darkestIndex = samples.findIndex((sample) => sample.luma === darkestLuma);
  const firstContactIndex = samples.findIndex((sample) => sample.contactVisible);
  const brightestAfterDark = Math.max(
    ...samples.slice(darkestIndex).map((sample) => sample.luma)
  );

  expect(darkestIndex).toBeGreaterThan(0);
  expect(darkestLuma).toBeLessThan(70);
  expect(samples[darkestIndex].contactVisible).toBe(false);
  expect(firstContactIndex).toBeGreaterThan(darkestIndex);
  expect(brightestAfterDark).toBeGreaterThan(darkestLuma + 100);
  expect(brightestAfterDark).toBeGreaterThan(150);
  expect(samples.some((sample) => sample.transform !== transformBeforeExit)).toBe(
    true
  );
  expect(samples.some((sample) => sample.backgroundOpacity < 1)).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("mobile WebGL scene mounts only when its observed Contact content is near the viewport", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  const sceneContainer = page.locator(".canvas-container");
  const contactInner = page.locator(".contact-inner");
  const canvas = sceneContainer.locator("canvas");

  await expect(sceneContainer).toHaveAttribute("data-scene-active", "false");
  await expect(sceneContainer).toHaveAttribute("data-scene-status", "idle");
  await expect(canvas).toHaveCount(0);

  await contactInner.scrollIntoViewIfNeeded();
  await expect(sceneContainer).toHaveAttribute("data-scene-active", "true");
  await expect(sceneContainer).toHaveAttribute("data-scene-status", "ready");
  await expect(canvas).toHaveCount(1);

  await page.locator("#intro").scrollIntoViewIfNeeded();
  await expect(sceneContainer).toHaveAttribute("data-scene-active", "false");
  await expect(sceneContainer).toHaveAttribute("data-scene-status", "ready");
  await expect(canvas).toHaveCount(0);

  await contactInner.scrollIntoViewIfNeeded();
  await expect(sceneContainer).toHaveAttribute("data-scene-active", "true");
  await expect(sceneContainer).toHaveAttribute("data-scene-status", "ready");
  await expect(canvas).toHaveCount(1);

  expect(pageErrors).toEqual([]);
});
