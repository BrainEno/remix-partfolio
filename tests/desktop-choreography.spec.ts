import { expect, test, type Page } from "@playwright/test";

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

async function introProgress(page: Page, progress: number) {
  await page.evaluate((targetProgress) => {
    const scene = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer"
    );
    if (!scene) throw new Error("Missing intro story scene");

    const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
    const start = sceneTop - window.innerHeight * 0.28;
    const distance = Math.max(scene.offsetHeight, window.innerHeight * 5.6);
    window.scrollTo(0, start + distance * targetProgress);
  }, progress);
  await waitForMotion(page);
}

async function exitProgress(page: Page, progress: number) {
  await page.evaluate((targetProgress) => {
    const spacer = document.querySelector<HTMLElement>(".tv-exit-spacer");
    if (!spacer) throw new Error("Missing TV exit spacer");

    const top = spacer.getBoundingClientRect().top + window.scrollY;
    const start = top - window.innerHeight * 0.72;
    const distance = spacer.offsetHeight + window.innerHeight * 0.72;
    window.scrollTo(0, start + distance * targetProgress);
  }, progress);
  await waitForMotion(page, 800);
}

async function readScale(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (!transform || transform === "none") return 1;
    const matrix = new DOMMatrix(transform);
    return Math.hypot(matrix.a, matrix.b);
  });
}

async function readCssRgbAverage(
  page: Page,
  selector: string,
  property: string
) {
  return page.locator(selector).evaluate(
    (element, cssProperty) => {
      const value = getComputedStyle(element)
        .getPropertyValue(cssProperty as string)
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

  await expect(page.locator(".intro-subheadline-stickytainer")).toHaveAttribute(
    "data-intro-choreography",
    "desktop-push"
  );

  await introProgress(page, 0.01);
  const photoStart = await readBox(page, ".intro-subheadline-photo-box");
  const titleStart = await readBox(page, ".intro-subheadline-title");

  await introProgress(page, 0.17);
  const photoMid = await readBox(page, ".intro-subheadline-photo-box");
  const titleMid = await readBox(page, ".intro-subheadline-title");

  await introProgress(page, 0.35);
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
  await introProgress(page, 0.61);
  const copyApproached = await readBox(page, ".intro-subheadline-text-box1");
  const titleApproached = await readBox(page, ".intro-subheadline-title");
  expect(copyApproached.x).toBeLessThan(copyBeforeApproach.x - 80);
  expect(titleApproached.x).toBeLessThanOrEqual(titleSettled.x + 12);

  await introProgress(page, 0.9);
  const copyPushed = await readBox(page, ".intro-subheadline-text-box1");
  const titlePushed = await readBox(page, ".intro-subheadline-title");
  const visualPushed = await readBox(page, ".intro-subheadline-visual-group");
  expect(copyPushed.x).toBeLessThan(copyApproached.x - 120);
  expect(titlePushed.x).toBeLessThan(titleApproached.x - 120);
  expect(visualPushed.x).toBeLessThan(-window.innerWidth * 0.25);
  expect(pageErrors).toEqual([]);
});

test("Given a work preview, its image fills the CRT clipping rectangle without drifting from the TV artwork", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await loadChineseDesktop(page);

  await page.locator("#partfolio").scrollIntoViewIfNeeded();
  await waitForMotion(page, 850);

  for (let step = 0; step < 60; step += 1) {
    const active = await page
      .locator(".tv-all-vids")
      .getAttribute("data-preview-active");
    if (active === "true") break;
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.06));
    await waitForMotion(page, 90);
  }

  await expect(page.locator(".tv-all-vids")).toHaveAttribute(
    "data-preview-active",
    "true"
  );
  await expect(page.locator(".tv-cover")).toHaveCount(1);

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
  expect(screenCenter).toBeGreaterThan(viewportHeight * 0.48);
  expect(screenCenter).toBeLessThan(viewportHeight * 0.72);
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
      clone.removeAttribute("id");
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

  await page.evaluate(() => {
    const spacer = document.querySelector<HTMLElement>(".tv-phone-spacer");
    if (!spacer) throw new Error("Missing phone spacer");
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.46);
  });
  await waitForMotion(page, 900);

  await expect(page.locator("#partfolio")).toHaveAttribute(
    "data-tv-phase",
    "phone"
  );
  await expect(page.locator(".tv-all-vids")).toHaveAttribute(
    "data-preview-active",
    "false"
  );

  const phoneOpacity = Number(
    await page
      .locator(".tv-contact-number")
      .evaluate((element) => getComputedStyle(element).opacity)
  );
  expect(phoneOpacity).toBeGreaterThan(0.65);

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

  const phoneScale = await readScale(page, ".tv-box");
  expect(phoneScale).toBeLessThan(1.3);

  const boothBefore = await readBox(page, ".canvas-container");
  const viewportWidth = page.viewportSize()?.width ?? 1440;
  expect(boothBefore.x).toBeGreaterThan(viewportWidth * 0.82);

  await exitProgress(page, 0.42);
  await expect(page.locator("#partfolio")).toHaveAttribute(
    "data-tv-phase",
    "exit"
  );
  const darkLuma = await readCssRgbAverage(
    page,
    ".tv-blackscreen",
    "--tv-screen-mid"
  );
  expect(darkLuma).toBeGreaterThanOrEqual(0);
  expect(darkLuma).toBeLessThan(75);
  expect(await readScale(page, ".tv-box")).toBeGreaterThan(1.45);

  const boothDuring = await readBox(page, ".canvas-container");
  expect(boothDuring.x).toBeLessThan(boothBefore.x - viewportWidth * 0.18);

  await exitProgress(page, 0.82);
  const brightLuma = await readCssRgbAverage(
    page,
    ".tv-blackscreen",
    "--tv-screen-mid"
  );
  expect(brightLuma).toBeGreaterThan(150);
  const boothLate = await readBox(page, ".canvas-container");
  expect(boothLate.x).toBeLessThan(viewportWidth * 0.45);
  expect(pageErrors).toEqual([]);
});
