import { expect, test, type Page } from "@playwright/test";

async function waitForScroll(page: Page, ms = 250) {
  await page.waitForTimeout(ms);
}

async function scrollUntilAttribute(
  page: Page,
  selector: string,
  attribute: string,
  expectedValue: string,
  options: { maxSteps: number; stepViewport: number },
) {
  for (let step = 0; step < options.maxSteps; step += 1) {
    const value = await page.locator(selector).getAttribute(attribute);
    if (value === expectedValue) return;

    await page.evaluate(
      ({ stepViewport }: { stepViewport: number }) =>
        window.scrollBy(0, window.innerHeight * stepViewport),
      options,
    );
    await waitForScroll(page, 100);
  }

  await expect(page.locator(selector)).toHaveAttribute(
    attribute,
    expectedValue,
  );
}

/**
 * Scroll so that a document (content) position sits at `viewportFraction` of
 * the viewport height.
 *
 * Desktop runs ScrollSmoother, whose `speed` multiplier makes scroll distance
 * and content distance differ (Locomotive's old 0.9 feel). ScrollSmoother
 * writes the proxy body height, so the ratio is derived from the DOM instead
 * of being hard-coded, and these tests keep working if the feel is retuned.
 */
async function scrollToContentY(
  page: Page,
  contentY: number,
  viewportFraction = 0,
) {
  const target = await page.evaluate(
    ({
      contentY,
      viewportFraction,
    }: {
      contentY: number;
      viewportFraction: number;
    }) => {
      const viewportHeight = window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - viewportHeight;
      const content = document.querySelector("#smooth-content");
      const contentHeight = content?.getBoundingClientRect().height ?? 0;
      const bodyHeight =
        Number.parseFloat(getComputedStyle(document.body).height) ||
        document.documentElement.scrollHeight;
      const factor =
        content && bodyHeight > viewportHeight && contentHeight > viewportHeight
          ? (contentHeight - viewportHeight) / (bodyHeight - viewportHeight)
          : 1;
      const desired = (contentY - viewportHeight * viewportFraction) / factor;
      return Math.max(0, Math.min(desired, maxScroll));
    },
    { contentY, viewportFraction },
  );

  // ScrollSmoother eases towards the target over several frames, and this
  // headless WebKit/Chromium is slow, so wait for the content to settle rather
  // than assuming a fixed delay.
  await page.evaluate(async (next: number) => {
    window.scrollTo(0, next);
    const content = document.querySelector("#smooth-content");
    if (!content) return;
    const offset = () => -content.getBoundingClientRect().top;
    let previous = offset();
    let stable = 0;
    const started = performance.now();
    while (performance.now() - started < 8_000 && stable < 3) {
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(null)),
      );
      const current = offset();
      if (Math.abs(current - previous) < 0.5) stable += 1;
      else stable = 0;
      previous = current;
    }
  }, target);
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
      Number.parseInt(hex.slice(offset, offset + 2), 16),
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
  property: string,
) {
  const color = await page
    .locator(selector)
    .evaluate(
      (element, cssProperty: string) =>
        getComputedStyle(element).getPropertyValue(cssProperty).trim(),
      property,
    );
  const rgb = parseCssRgb(color);
  if (!rgb) throw new Error(`Could not parse ${property}: ${color}`);
  return rgb.reduce((sum, component) => sum + component, 0) / 3;
}

test("desktop section tracking follows the complete smooth-scroll range", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
  );
  await page.locator('[data-language="en"]').click();

  await page.getByRole("button", { name: "Works", exact: true }).click();
  await expect
    .poll(() =>
      page.locator("#partfolio").evaluate((element) => {
        return Math.abs(element.getBoundingClientRect().top);
      }),
    )
    .toBeLessThan(2);
  await expect(
    page.locator(".nav-entry.nav-active .nav-entry-text"),
  ).toHaveText("Works");

  await page.getByRole("button", { name: "Contact", exact: true }).click();
  await expect(
    page.locator(".nav-entry.nav-active .nav-entry-text"),
  ).toHaveText("Contact");
  await expect
    .poll(() =>
      page.locator("#contact .contact-inner").evaluate((element) => {
        return element.getBoundingClientRect().top;
      }),
    )
    .toBeLessThan(900 * 0.65);
  expect(pageErrors).toEqual([]);
});

test("desktop intro portrait retains the complete image and clears the header", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1568, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
  );

  const photo = page.locator(".intro-subheadline-photo");
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  const widthBefore = await photo.evaluate((image) => image.clientWidth);
  const sceneTop = await page
    .locator(".intro-subheadline-stickytainer")
    .evaluate((element) => element.getBoundingClientRect().top);
  await scrollToContentY(page, sceneTop + 4.2 * 724);

  const framing = await photo.evaluate((image: HTMLImageElement) => {
    const mask = image.parentElement!;
    const rect = mask.getBoundingClientRect();
    const title = document
      .querySelector(".intro-subheadline-title")!
      .getBoundingClientRect();
    const header = document.querySelector(".header")!.getBoundingClientRect();
    return {
      width: image.clientWidth,
      fit: getComputedStyle(image).objectFit,
      imageRatio: image.naturalWidth / image.naturalHeight,
      maskRatio: rect.width / rect.height,
      top: rect.top,
      bottom: rect.bottom,
      titleTop: title.top,
      headerBottom: header.bottom,
      radius: Number.parseFloat(getComputedStyle(mask).borderTopLeftRadius),
    };
  });

  expect(framing.width).toBeGreaterThan(widthBefore * 1.2);
  expect(framing.fit).toBe("contain");
  expect(framing.maskRatio).toBeCloseTo(framing.imageRatio, 2);
  expect(framing.top).toBeGreaterThan(framing.headerBottom);
  expect(framing.bottom).toBeLessThan(framing.titleTop);
  expect(framing.radius).toBeLessThan(framing.width * 0.1);
  expect(pageErrors).toEqual([]);
});

test("desktop telephone number holds on the tube before the exit zoom", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
  );

  // 1. The idle tube is a live grey-green CRT, never a black hole.
  const idleLuma = await readCssColorLuma(
    page,
    ".tv-blackscreen",
    "--tv-screen-mid",
  );
  expect(idleLuma).toBeGreaterThan(60);

  const readTube = () =>
    page.evaluate(() => {
      const number = document.querySelector<HTMLElement>(".tv-contact-number");
      const television = document.querySelector<HTMLElement>(".tv-box");
      const screen = document.querySelector<HTMLElement>(".tv-all-vids");
      const partfolio = document.getElementById("partfolio");
      if (!number || !television || !screen) throw new Error("Missing tube");
      const numberStyle = getComputedStyle(number);
      const matrix = new DOMMatrixReadOnly(
        getComputedStyle(television).transform,
      );
      return {
        opacity: Number(numberStyle.opacity),
        visibility: numberStyle.visibility,
        fontSize: Number.parseFloat(numberStyle.fontSize),
        numberWidth:
          number.querySelector("span")?.getBoundingClientRect().width ?? 0,
        screenWidth: screen.getBoundingClientRect().width,
        numberTop: number.getBoundingClientRect().top,
        scale: Math.hypot(matrix.a, matrix.b),
        televisionOpacity: Number(getComputedStyle(television).opacity),
        preview: screen.dataset.previewActive,
        covers: document.querySelectorAll(".tv-cover").length,
        phaseClass: partfolio?.className ?? "",
      };
    });

  const positions = await page.evaluate(() => {
    const top = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      return element.getBoundingClientRect().top;
    };
    return {
      phone: top(".tv-phone-spacer"),
      exit: top(".tv-exit-spacer"),
    };
  });

  // 2. The number has been written onto the tube.
  await scrollToContentY(page, positions.phone + 250, 0);
  const written = await readTube();
  expect(written.opacity).toBeGreaterThan(0.9);
  expect(written.visibility).toBe("visible");
  // Screen ownership: the works preview is off, no project image on the tube.
  expect(written.preview).toBe("false");
  expect(written.covers).toBe(0);
  expect(written.phaseClass).toContain("is-tv-phone");
  // Sized against the glass: legible, comfortable, and not overflowing.
  expect(written.fontSize).toBeGreaterThan(11);
  expect(written.numberWidth).toBeLessThan(written.screenWidth * 0.8);
  // The set is still parked, so the number is not lost inside a zoom.
  expect(written.scale).toBeLessThan(1.2);

  // 3. It holds: still fully on a good while later in the plateau.
  await scrollToContentY(page, positions.phone + 700, 0);
  const holding = await readTube();
  expect(holding.opacity).toBeGreaterThan(0.9);
  expect(holding.scale).toBeLessThan(1.7);
  expect(holding.numberTop).toBeGreaterThan(0);

  // 4. Only after that plateau does the set zoom out and take it along.
  await scrollToContentY(page, positions.exit + 1250, 0);
  const gone = await readTube();
  expect(gone.scale).toBeGreaterThan(3);
  expect(gone.televisionOpacity).toBeLessThan(0.2);
  expect(gone.opacity).toBeLessThan(0.1);
  expect(pageErrors).toEqual([]);
});

test("desktop intro paragraph pushes the portrait instead of covering it", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
  );

  const readScene = () =>
    page.evaluate(() => {
      const box = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      };
      const paragraph = document.querySelector<HTMLElement>(
        ".intro-subheadline-text1",
      );
      if (!paragraph) throw new Error("Missing paragraph");
      const rect = paragraph.getBoundingClientRect();
      return {
        portraitLeft: box(".intro-subheadline-photo-mask").left,
        portraitRight: box(".intro-subheadline-photo-mask").right,
        groupLeft: box(".intro-subheadline-visual-group").left,
        paragraphLeft: rect.left,
        paragraphRight: rect.right,
      };
    });

  const sceneTop = await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer",
    );
    if (!scene) throw new Error("Missing first intro story");
    return scene.getBoundingClientRect().top + window.scrollY;
  });

  const viewportHeight = 900;
  const viewportWidth = 1440;
  const samples: Array<Awaited<ReturnType<typeof readScene>>> = [];
  for (let step = 0; step <= 12; step += 1) {
    await scrollToContentY(page, sceneTop + step * 0.5 * viewportHeight, 0);
    samples.push(await readScene());
  }

  const onScreen = samples.filter((sample) => sample.paragraphRight > 0);
  expect(onScreen.length).toBeGreaterThan(6);

  // The paragraph starts off to the right...
  expect(onScreen[0].paragraphRight).toBeGreaterThan(viewportWidth * 0.95);

  // ...and it never crosses the portrait's edge on the way in, nor while the
  // portrait is being pushed out. The copy pushes; it never overlays.
  const crossing = samples.filter(
    (sample) =>
      sample.portraitRight > 0 &&
      sample.paragraphRight > 0 &&
      sample.paragraphLeft < sample.portraitRight - 40,
  );
  expect(crossing).toEqual([]);

  // The portrait is genuinely held still for a stretch while the paragraph
  // approaches it.
  const parked = samples.filter((sample, index) => {
    if (index === 0) return false;
    const previous = samples[index - 1];
    return (
      Math.abs(sample.portraitLeft - previous.portraitLeft) < 1.5 &&
      sample.paragraphRight > 0 &&
      sample.paragraphLeft < viewportWidth
    );
  });
  expect(parked.length).toBeGreaterThan(1);

  // The copy lands *complete*: while the portrait is parked, the paragraph is
  // fully inside the viewport and clear of the portrait, so it can be read
  // before anything is pushed out. (It used to park half outside the right
  // edge, which cropped the end of every line.)
  const parkedComplete = samples.filter(
    (sample) =>
      sample.paragraphLeft > sample.portraitRight &&
      sample.paragraphLeft >= 0 &&
      sample.paragraphRight <= viewportWidth,
  );
  expect(parkedComplete.length).toBeGreaterThan(1);

  // Then the group is pushed out of frame...
  const pushed = samples.filter((sample) => sample.groupLeft < -400);
  expect(pushed.length).toBeGreaterThan(1);
  // ...and the paragraph leaves with it instead of staying behind.
  expect(samples[samples.length - 1].paragraphRight).toBeLessThan(
    viewportWidth * 0.5,
  );
  expect(pageErrors).toEqual([]);
});

test("the last screen of the page is the complete contact composition", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
  );

  await scrollToContentY(
    page,
    await page.evaluate(
      () =>
        document.querySelector("#smooth-content")!.getBoundingClientRect()
          .height,
    ),
    1,
  );

  const lastScreen = await page.evaluate(() => {
    const viewportBottom = window.innerHeight;
    const read = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        visible: rect.top >= -1 && rect.bottom <= viewportBottom + 1,
      };
    };
    return {
      headline: read(".contact-hl1"),
      lastHeadline: read(".contact-hl3"),
      marquee: read(".runningtext"),
      email: read(".contact-email-link"),
      copyright: read(".contact-details h3"),
      credit: read(".contact-details p"),
      creditText:
        document.querySelector(".contact-details p")?.textContent ?? "",
      scrollY: window.scrollY,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

  expect(lastScreen.scrollY).toBe(lastScreen.maxScroll);
  for (const key of [
    "headline",
    "lastHeadline",
    "marquee",
    "email",
    "copyright",
    "credit",
  ] as const) {
    expect(lastScreen[key].visible).toBe(true);
  }
  expect(lastScreen.creditText).toContain("Bottom Think");
  expect(pageErrors).toEqual([]);
});

test("mobile GSAP runtime animates the required scenes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });

  const pageHome = page.locator(".page-home");
  await expect(pageHome).toHaveAttribute("data-scroll-runtime", "ready");

  const headline = page.locator(".intro-headline-word.word-1");
  const heroPhoto = page.locator(".intro-photo");

  const headlineBefore = await headline.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  const heroBefore = await heroPhoto.evaluate(
    (element) => getComputedStyle(element).transform,
  );

  await page.evaluate(() =>
    window.scrollTo(0, Math.min(360, document.body.scrollHeight)),
  );
  await page.waitForTimeout(450);

  const headlineAfter = await headline.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  const heroAfter = await heroPhoto.evaluate(
    (element) => getComputedStyle(element).transform,
  );

  expect(headlineAfter).not.toBe(headlineBefore);
  expect(heroAfter).not.toBe(heroBefore);

  const portraitBox = page.locator(".intro-subheadline-photo-box");
  const portraitBefore = await portraitBox.evaluate(
    (element) => getComputedStyle(element).transform,
  );

  await page.evaluate(() => {
    const target = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer",
    );
    if (!target) throw new Error("Missing first intro story trigger");
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + window.innerHeight * 0.65);
  });
  await page.waitForTimeout(450);

  const portraitAfter = await portraitBox.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  expect(portraitAfter).not.toBe(portraitBefore);

  const tvPinner = page.locator(".tv-box-pinner");
  await expect
    .poll(async () =>
      tvPinner.evaluate(
        (element) =>
          element.parentElement?.classList.contains("pin-spacer") ?? false,
      ),
    )
    .toBe(true);

  expect(pageErrors).toEqual([]);
});

test("mobile gallery moves above the copy without covering its reading column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
  );

  const scene = page.locator(".intro-subheadline-stickytainer2");
  const gallery = page.locator(".intro-subheadline-photo-box2");
  const copy = page.locator(".intro-subheadline-text-box2");
  const sceneTop = await scene.evaluate(
    (element) => element.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate(
    (y) => window.scrollTo(0, y - window.innerHeight * 0.75),
    sceneTop,
  );
  await waitForScroll(page, 300);
  const galleryBefore = await gallery.boundingBox();
  const copyBefore = await copy.boundingBox();
  expect(galleryBefore).not.toBeNull();
  expect(copyBefore).not.toBeNull();

  await page.evaluate(
    (y) => window.scrollTo(0, y + window.innerHeight * 0.35),
    sceneTop,
  );
  await waitForScroll(page, 400);
  const galleryAfter = await gallery.boundingBox();
  const copyAfter = await copy.boundingBox();
  expect(galleryAfter).not.toBeNull();
  expect(copyAfter).not.toBeNull();
  if (galleryBefore && galleryAfter && copyBefore && copyAfter) {
    expect(galleryAfter.x).toBeLessThan(galleryBefore.x - 30);
    expect(Math.abs(copyAfter.x - copyBefore.x)).toBeLessThan(1);
    expect(copyAfter.y).toBeGreaterThanOrEqual(
      galleryAfter.y + galleryAfter.height,
    );
    expect(copyAfter.x).toBeGreaterThanOrEqual(0);
    expect(copyAfter.x + copyAfter.width).toBeLessThanOrEqual(
      (page.viewportSize()?.width ?? 390) + 1,
    );
  }
});

test("mobile TV follows the grey-green to black to white visual state order", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
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
      tvPinner.evaluate(
        (element) =>
          element.parentElement?.classList.contains("pin-spacer") ?? false,
      ),
    )
    .toBe(true);

  await scrollUntilAttribute(
    page,
    ".tv-all-vids",
    "data-preview-active",
    "true",
    { maxSteps: 28, stepViewport: 0.07 },
  );
  await expect(page.locator(".tv-cover")).toHaveCount(1);

  const activeWork = page.locator(".work-item.is-active");
  await expect(activeWork).toHaveCount(1);
  const workRect = await activeWork.boundingBox();
  const screenRect = await tvScreen.boundingBox();
  expect(workRect).not.toBeNull();
  expect(screenRect).not.toBeNull();
  if (workRect && screenRect) {
    // Rows can grow for long names, but an active row must overlap the tube.
    expect(workRect.y).toBeLessThan(screenRect.y + screenRect.height);
    expect(workRect.y + workRect.height).toBeGreaterThan(screenRect.y);
  }
  expect(
    await page
      .locator(".work-name")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(26);
  expect(
    await page
      .locator(".work-teaser")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(12);

  await scrollUntilAttribute(
    page,
    ".tv-all-vids",
    "data-preview-active",
    "false",
    { maxSteps: 48, stepViewport: 0.09 },
  );
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  const tvBox = page.locator(".tv-box");
  const transformBeforeExit = await tvBox.evaluate(
    (element) => getComputedStyle(element).transform,
  );

  const samples: Array<{
    luma: number;
    contactVisible: boolean;
    backgroundOpacity: number;
    transform: string;
  }> = [];

  for (let step = 0; step < 80; step += 1) {
    samples.push({
      luma: await readCssColorLuma(page, ".tv-blackscreen", "--tv-screen-mid"),
      contactVisible: await contactHeadline.isVisible(),
      backgroundOpacity: Number(
        await tvBackground.evaluate(
          (element) => getComputedStyle(element).opacity,
        ),
      ),
      transform: await tvBox.evaluate(
        (element) => getComputedStyle(element).transform,
      ),
    });

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.035));
    await waitForScroll(page, 80);
  }

  const darkestLuma = Math.min(...samples.map((sample) => sample.luma));
  const darkestIndex = samples.findIndex(
    (sample) => sample.luma === darkestLuma,
  );
  const firstContactIndex = samples.findIndex(
    (sample) => sample.contactVisible,
  );
  const brightestAfterDark = Math.max(
    ...samples.slice(darkestIndex).map((sample) => sample.luma),
  );

  expect(darkestIndex).toBeGreaterThan(0);
  expect(darkestLuma).toBeLessThan(70);
  expect(samples[darkestIndex].contactVisible).toBe(false);
  expect(firstContactIndex).toBeGreaterThan(darkestIndex);
  expect(brightestAfterDark).toBeGreaterThan(darkestLuma + 100);
  expect(brightestAfterDark).toBeGreaterThan(150);
  expect(
    samples.some((sample) => sample.transform !== transformBeforeExit),
  ).toBe(true);
  expect(samples.some((sample) => sample.backgroundOpacity < 1)).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("mobile WebGL scene mounts only when Contact is near the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
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
  await expect(sceneContainer).toHaveAttribute("data-scene-status", "idle");
  await expect(canvas).toHaveCount(0);

  await contactInner.scrollIntoViewIfNeeded();
  await expect(sceneContainer).toHaveAttribute("data-scene-active", "true");
  await expect(sceneContainer).toHaveAttribute("data-scene-status", "ready");
  await expect(canvas).toHaveCount(1);

  expect(pageErrors).toEqual([]);
});
