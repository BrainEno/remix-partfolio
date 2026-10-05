import { expect, test, type Page } from "@playwright/test";

type ScrollRange = { start: number; end: number };

async function waitForMotion(page: Page, ms = 650) {
  await page.waitForTimeout(ms);
}

async function loadChineseDesktop(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("portfolio-language", "zh");
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready"
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
}

async function readBox(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`Missing visible box for ${selector}`);
  return box;
}

async function readTriggerRange(page: Page, selector: string): Promise<ScrollRange> {
  const locator = page.locator(selector);
  await expect(locator).toHaveAttribute("data-trigger-start", /-?\d+/);
  await expect(locator).toHaveAttribute("data-trigger-end", /-?\d+/);

  const start = Number(await locator.getAttribute("data-trigger-start"));
  const end = Number(await locator.getAttribute("data-trigger-end"));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error(`Invalid ScrollTrigger range for ${selector}: ${start}..${end}`);
  }
  return { start, end };
}

/**
 * The intro contract needs exact samples inside one timeline, so walk toward
 * each target instead of teleporting across pinned scenes in a single call.
 */
async function scrollLikeUser(page: Page, target: number, settleMs = 650) {
  const viewportHeight = page.viewportSize()?.height ?? 900;
  const maxStep = viewportHeight * 0.42;

  for (let stepIndex = 0; stepIndex < 180; stepIndex += 1) {
    const current = await page.evaluate(() => window.scrollY);
    const delta = target - current;
    if (Math.abs(delta) < 3) break;

    const step = Math.sign(delta) * Math.min(Math.abs(delta), maxStep);
    await page.evaluate((distance) => window.scrollBy(0, distance), step);
    await page.waitForTimeout(22);
  }

  await page.evaluate((position) => window.scrollTo(0, position), target);
  await waitForMotion(page, settleMs);
}

async function scrollRangeProgress(
  page: Page,
  range: ScrollRange,
  progress: number,
  wait = 650
) {
  const target = range.start + (range.end - range.start) * progress;
  await scrollLikeUser(page, target, wait);
}

async function wheelUntil(
  page: Page,
  predicate: () => Promise<boolean>,
  options: { maxSteps?: number; stepViewport?: number; settleMs?: number } = {}
) {
  const viewportHeight = page.viewportSize()?.height ?? 900;
  const maxSteps = options.maxSteps ?? 60;
  const stepViewport = options.stepViewport ?? 0.48;
  const settleMs = options.settleMs ?? 110;

  for (let step = 0; step < maxSteps; step += 1) {
    if (await predicate()) return true;
    await page.mouse.wheel(0, viewportHeight * stepViewport);
    await page.waitForTimeout(settleMs);
  }

  return predicate();
}

async function enterWorks(page: Page) {
  await page.getByRole("button", { name: "作品集" }).click();
  await waitForMotion(page, 1100);
}

async function readScale(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (!transform || transform === "none") return 1;
    const matrix = new DOMMatrix(transform);
    return Math.hypot(matrix.a, matrix.b);
  });
}

async function readOpacity(page: Page, selector: string) {
  return Number(
    await page
      .locator(selector)
      .evaluate((element) => getComputedStyle(element).opacity)
  );
}

async function readCssRgbAverage(
  page: Page,
  selector: string,
  property: string
) {
  return page.locator(selector).evaluate(
    (element, cssProperty) => {
      const value = getComputedStyle(element)
        .getPropertyValue(cssProperty)
        .trim();
      const hex = value.match(/^#([0-9a-f]{6})$/i);
      if (hex) {
        const rgb = [0, 2, 4].map((offset) =>
          Number.parseInt(hex[1].slice(offset, offset + 2), 16)
        );
        return rgb.reduce((sum, component) => sum + component, 0) / 3;
      }
      const rgb = value.match(/rgba?\(([^)]+)\)/i);
      if (!rgb) return -1;
      const components = rgb[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .slice(0, 3)
        .map(Number);
      return components.reduce((sum, component) => sum + component, 0) / 3;
    },
    property
  );
}

test("Given Chinese intro, portrait and 简介 descend together before copy pushes both left", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await loadChineseDesktop(page);

  const scene = page.locator(".intro-subheadline-stickytainer");
  await expect(scene).toHaveAttribute(
    "data-intro-choreography",
    "desktop-push"
  );
  const range = await readTriggerRange(
    page,
    ".intro-subheadline-stickytainer"
  );

  await scrollRangeProgress(page, range, 0.01);
  const photoStart = await readBox(page, ".intro-subheadline-photo-box");
  const titleStart = await readBox(page, ".intro-subheadline-title");

  await scrollRangeProgress(page, range, 0.17);
  const photoMid = await readBox(page, ".intro-subheadline-photo-box");
  const titleMid = await readBox(page, ".intro-subheadline-title");

  await scrollRangeProgress(page, range, 0.36);
  const photoSettled = await readBox(page, ".intro-subheadline-photo-box");
  const titleSettled = await readBox(page, ".intro-subheadline-title");

  expect(photoMid.y).toBeGreaterThan(photoStart.y + 20);
  expect(titleMid.y).toBeGreaterThan(titleStart.y + 20);
  expect(photoSettled.y).toBeGreaterThan(photoMid.y);
  expect(titleSettled.y).toBeGreaterThan(titleMid.y);

  const photoTravel = photoSettled.y - photoStart.y;
  const titleTravel = titleSettled.y - titleStart.y;
  const photoFraction = (photoMid.y - photoStart.y) / photoTravel;
  const titleFraction = (titleMid.y - titleStart.y) / titleTravel;
  expect(Math.abs(photoFraction - titleFraction)).toBeLessThan(0.28);

  const copyBeforeApproach = await readBox(page, ".intro-subheadline-text-box1");
  await scrollRangeProgress(page, range, 0.64);
  const copyApproached = await readBox(page, ".intro-subheadline-text-box1");
  const titleApproached = await readBox(page, ".intro-subheadline-title");
  expect(copyApproached.x).toBeLessThan(copyBeforeApproach.x - 80);
  expect(titleApproached.x).toBeLessThanOrEqual(titleSettled.x + 12);

  await scrollRangeProgress(page, range, 0.98, 800);
  const copyPushed = await readBox(page, ".intro-subheadline-text-box1");
  const titlePushed = await readBox(page, ".intro-subheadline-title");
  const visualPushed = await readBox(page, ".intro-subheadline-visual-group");
  const viewportWidth = page.viewportSize()?.width ?? 1440;
  expect(copyPushed.x).toBeLessThan(copyApproached.x - 120);
  expect(titlePushed.x).toBeLessThan(titleApproached.x - 120);
  expect(visualPushed.x).toBeLessThan(-viewportWidth * 0.45);
  expect(pageErrors).toEqual([]);
});

test("Given a work preview, its image fills the CRT clipping rectangle without drifting from the TV artwork", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await loadChineseDesktop(page);
  await enterWorks(page);

  const previewAppeared = await wheelUntil(
    page,
    async () =>
      (await page
        .locator(".tv-all-vids")
        .getAttribute("data-preview-active")) === "true",
    { maxSteps: 32, stepViewport: 0.32, settleMs: 130 }
  );
  expect(previewAppeared).toBe(true);

  await expect(page.locator(".tv-cover")).toHaveCount(1);
  await expect(page.locator("#partfolio")).toHaveAttribute(
    "data-tv-phase",
    "works"
  );

  const artwork = await readBox(page, ".tv-artwork");
  const screen = await readBox(page, ".tv-all-vids");
  const cover = await readBox(page, ".tv-cover");

  expect(screen.x).toBeGreaterThanOrEqual(artwork.x);
  expect(screen.y).toBeGreaterThanOrEqual(artwork.y);
  expect(screen.x + screen.width).toBeLessThanOrEqual(artwork.x + artwork.width);
  expect(screen.y + screen.height).toBeLessThanOrEqual(
    artwork.y + artwork.height
  );
  expect(Math.abs(cover.x - screen.x)).toBeLessThan(2.5);
  expect(Math.abs(cover.y - screen.y)).toBeLessThan(2.5);
  expect(Math.abs(cover.width - screen.width)).toBeLessThan(2.5);
  expect(Math.abs(cover.height - screen.height)).toBeLessThan(2.5);

  const viewportHeight = page.viewportSize()?.height ?? 900;
  const screenCenter = screen.y + screen.height / 2;
  expect(screenCenter).toBeGreaterThan(viewportHeight * 0.42);
  expect(screenCenter).toBeLessThan(viewportHeight * 0.68);
  expect(pageErrors).toEqual([]);
});

test("Given ten work rows, phone and exit stages remain after the final work instead of using a four-item timing", async ({
  page,
}) => {
  await loadChineseDesktop(page);

  const geometry = await page.evaluate(() => {
    const list = document.querySelector<HTMLElement>(".work-items-box");
    const originalRows = Array.from(
      document.querySelectorAll<HTMLElement>(".work-item")
    );
    const phone = document.querySelector<HTMLElement>(".tv-phone-spacer");
    const exit = document.querySelector<HTMLElement>(".tv-exit-spacer");
    if (!list || originalRows.length === 0 || !phone || !exit) {
      throw new Error("Missing Works stage geometry");
    }

    const template = originalRows[originalRows.length - 1];
    for (let index = originalRows.length; index < 10; index += 1) {
      const clone = template.cloneNode(true) as HTMLElement;
      clone.dataset.workIndex = String(index);
      list.appendChild(clone);
    }

    const rows = Array.from(document.querySelectorAll<HTMLElement>(".work-item"));
    const last = rows[rows.length - 1].getBoundingClientRect();
    const phoneRect = phone.getBoundingClientRect();
    const exitRect = exit.getBoundingClientRect();

    return {
      count: rows.length,
      lastBottom: last.bottom,
      phoneTop: phoneRect.top,
      phoneBottom: phoneRect.bottom,
      exitTop: exitRect.top,
      phoneIsNext: list.nextElementSibling === phone,
      exitIsNext: phone.nextElementSibling === exit,
    };
  });

  expect(geometry.count).toBe(10);
  expect(geometry.phoneIsNext).toBe(true);
  expect(geometry.exitIsNext).toBe(true);
  expect(geometry.phoneTop).toBeGreaterThanOrEqual(geometry.lastBottom - 1);
  expect(geometry.exitTop).toBeGreaterThanOrEqual(geometry.phoneBottom - 1);
});

test("After works, phone holds inside CRT before grey-green -> black -> white transition and booth enters from right", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await loadChineseDesktop(page);
  await enterWorks(page);

  const phonePhaseReached = await wheelUntil(
    page,
    async () =>
      (await page.locator("#partfolio").getAttribute("data-tv-phase")) ===
      "phone",
    { maxSteps: 42, stepViewport: 0.34, settleMs: 125 }
  );
  expect(phonePhaseReached).toBe(true);

  const phoneVisible = await wheelUntil(
    page,
    async () => (await readOpacity(page, ".tv-contact-number")) > 0.65,
    { maxSteps: 8, stepViewport: 0.08, settleMs: 140 }
  );
  expect(phoneVisible).toBe(true);
  await expect(page.locator(".tv-all-vids")).toHaveAttribute(
    "data-preview-active",
    "false"
  );

  const phoneBox = await readBox(page, ".tv-contact-number");
  const screenBox = await readBox(page, ".tv-all-vids");
  expect(phoneBox.x).toBeGreaterThanOrEqual(screenBox.x - 1);
  expect(phoneBox.y).toBeGreaterThanOrEqual(screenBox.y - 1);
  expect(phoneBox.x + phoneBox.width).toBeLessThanOrEqual(
    screenBox.x + screenBox.width + 1
  );
  expect(phoneBox.y + phoneBox.height).toBeLessThanOrEqual(
    screenBox.y + screenBox.height + 1
  );
  expect(await readScale(page, ".tv-box")).toBeLessThan(1.3);

  const canvas = page.locator(".canvas-container");
  await expect(canvas).toHaveAttribute("data-scene-status", "ready", {
    timeout: 12_000,
  });
  const boothBefore = await readBox(page, ".canvas-container");
  const viewportWidth = page.viewportSize()?.width ?? 1440;
  expect(boothBefore.x).toBeGreaterThan(viewportWidth * 0.82);

  const exitPhaseReached = await wheelUntil(
    page,
    async () =>
      (await page.locator("#partfolio").getAttribute("data-tv-phase")) ===
      "exit",
    { maxSteps: 18, stepViewport: 0.12, settleMs: 130 }
  );
  expect(exitPhaseReached).toBe(true);

  let darkSeen = false;
  let boothMoved = false;
  let brightSeen = false;

  for (let step = 0; step < 30; step += 1) {
    const luma = await readCssRgbAverage(
      page,
      ".tv-blackscreen",
      "--tv-screen-mid"
    );
    const scale = await readScale(page, ".tv-box");
    const booth = await readBox(page, ".canvas-container");

    if (luma >= 0 && luma < 75 && scale > 1.45) darkSeen = true;
    if (darkSeen && booth.x < boothBefore.x - viewportWidth * 0.12) {
      boothMoved = true;
    }
    if (darkSeen && luma > 150) {
      brightSeen = true;
      break;
    }

    await page.mouse.wheel(0, (page.viewportSize()?.height ?? 900) * 0.075);
    await page.waitForTimeout(130);
  }

  expect(darkSeen).toBe(true);
  expect(boothMoved).toBe(true);
  expect(brightSeen).toBe(true);

  const boothLate = await readBox(page, ".canvas-container");
  expect(boothLate.x).toBeLessThan(viewportWidth * 0.55);
  expect(pageErrors).toEqual([]);
});
