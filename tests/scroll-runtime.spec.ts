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
      const maxScroll =
        document.documentElement.scrollHeight - viewportHeight;
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
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
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

test("desktop section tracking follows the complete smooth-scroll range", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready"
  );
  await page.locator('[data-language="en"]').click();

  await page.getByRole("button", { name: "Works", exact: true }).click();
  await expect
    .poll(() =>
      page.locator("#partfolio").evaluate((element) => {
        return Math.abs(element.getBoundingClientRect().top);
      })
    )
    .toBeLessThan(2);
  await expect(page.locator(".nav-entry.nav-active .nav-entry-text")).toHaveText(
    "Works"
  );

  await page.getByRole("button", { name: "Contact", exact: true }).click();
  await expect(page.locator(".nav-entry.nav-active .nav-entry-text")).toHaveText(
    "Contact"
  );
  await expect
    .poll(() =>
      page.locator("#contact .contact-text-box").evaluate((element) => {
        return element.getBoundingClientRect().top;
      })
    )
    .toBeLessThan(900 * 0.65);
  expect(pageErrors).toEqual([]);
});

test("desktop intro portrait keeps its top visible as the mask expands", async ({
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

  // Mid-way through the pinned scene: past the mask expansion, before the push.
  const sceneTop = await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer",
    );
    if (!scene) throw new Error("Missing first intro story");
    return scene.getBoundingClientRect().top + window.scrollY - window.scrollY;
  });
  await scrollToContentY(page, sceneTop + 3.3 * 724, 0);

  await expect
    .poll(() => photo.evaluate((image) => getComputedStyle(image).objectPosition))
    .toBe("50% 0%");

  const framing = await photo.evaluate((image: HTMLImageElement) => {
    const scale = Math.max(
      image.clientWidth / image.naturalWidth,
      image.clientHeight / image.naturalHeight,
    );
    const renderedHeight = image.naturalHeight * scale;
    const objectPositionY = Number.parseFloat(
      getComputedStyle(image).objectPosition.split(" ")[1],
    );
    return {
      width: image.clientWidth,
      croppedFromTop:
        Math.max(0, renderedHeight - image.clientHeight) *
        (objectPositionY / 100),
    };
  });

  expect(framing.width).toBeGreaterThan(widthBefore * 1.8);
  expect(framing.croppedFromTop).toBeLessThanOrEqual(1);
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
  // Quarter-viewport steps: the scene now has an explicit hold beat between
  // the approach and the push, and the assertion below ("the copy lands
  // complete while the portrait is parked") needs samples inside that hold.
  for (let step = 0; step <= 24; step += 1) {
    await scrollToContentY(page, sceneTop + step * 0.25 * viewportHeight, 0);
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
      email: read(".contact-email"),
      copyright: read(".contact-inner h3"),
      credit: read(".contact-inner > p"),
      creditText: document.querySelector(".contact-inner > p")?.textContent ?? "",
      scrollY: window.scrollY,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

  expect(lastScreen.scrollY).toBe(lastScreen.maxScroll);
  for (const key of ["headline", "lastHeadline", "marquee", "email", "copyright", "credit"] as const) {
    expect(lastScreen[key].visible).toBe(true);
  }
  expect(lastScreen.creditText).toContain("Bottom Think");
  expect(pageErrors).toEqual([]);
});

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

test("the biography is set at its designed size, not a shrunken one", async ({
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

  // The 2022-2023 build set this paragraph at 2.5vw. A later clamp to
  // 1.85vw/28px dropped it to ~26px on a 1440 stage, which made the whole
  // introduction read like a footnote beside the artwork. The floor is now
  // ~33px at 1440 and the paragraph is capped only at the extremes.
  const size = await page
    .locator(".intro-subheadline-text1")
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(size).toBeGreaterThan(30);

  // ...and it is a readable measure: the column is wide enough that the
  // paragraph does not run to a single character per line on any desktop.
  const measure = await page
    .locator(".intro-subheadline-text-box1")
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(measure).toBeGreaterThan(500);

  expect(pageErrors).toEqual([]);
});

test("the portrait enters from above the frame instead of being born clipped", async ({
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

  const sceneTop = await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer",
    );
    if (!scene) throw new Error("Missing first intro story");
    return scene.getBoundingClientRect().top + window.scrollY;
  });

  // The portrait used to start at y:-22vw, i.e. already above the viewport, so
  // its head was sliced off for the whole settle beat. It now starts a whole
  // stage above the frame and descends into it.
  await scrollToContentY(page, sceneTop, 0);
  const entering = await page.evaluate(() => {
    const mask = document.querySelector<HTMLElement>(
      ".intro-subheadline-photo-mask",
    );
    if (!mask) throw new Error("Missing portrait mask");
    return mask.getBoundingClientRect().top;
  });
  expect(entering).toBeLessThan(-40);

  // ...and once it has settled, the whole mask - head included - is inside the
  // viewport, which is what makes the photograph read as the original portrait.
  await scrollToContentY(page, sceneTop + 3.3 * 900, 0);
  const settled = await page.evaluate(() => {
    const mask = document.querySelector<HTMLElement>(
      ".intro-subheadline-photo-mask",
    );
    if (!mask) throw new Error("Missing portrait mask");
    const rect = mask.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: rect.height };
  });
  expect(settled.top).toBeGreaterThan(-60);
  expect(settled.bottom).toBeLessThan(900 + 1);
  expect(settled.height).toBeGreaterThan(400);

  expect(pageErrors).toEqual([]);
});

test("the gallery opens on the navy plate with no dead scroll before it", async ({
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

  const stages = await page.evaluate(() => {
    const first = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer",
    );
    const second = document.querySelector<HTMLElement>(
      ".intro-subheadline-stickytainer2",
    );
    if (!first || !second) throw new Error("Missing intro stories");
    return {
      first: Math.round(first.getBoundingClientRect().top + window.scrollY),
      second: Math.round(second.getBoundingClientRect().top + window.scrollY),
      firstHeight: first.offsetHeight,
      secondHeight: second.offsetHeight,
    };
  });

  // Both stages are zero-height, so the pin spacer of the first one is the only
  // thing between them. A stage that kept its own 100vh in the flow left a
  // whole viewport of empty navy here.
  expect(stages.firstHeight).toBe(0);
  expect(stages.secondHeight).toBe(0);

  const storyOnePin = 4.8 * 900;
  // One pin distance, not one pin distance plus a dead viewport.
  expect(stages.second - stages.first).toBeLessThanOrEqual(storyOnePin + 60);

  // The wash to the 2022-2023 navy has to have arrived by the time the gallery
  // pins: it used to finish only after the pin had already released, so the
  // imagery slid in over black.
  await scrollToContentY(page, stages.second, 0);
  const luma = await page.evaluate(() => {
    const match = getComputedStyle(
      document.querySelector<HTMLElement>("#intro")!,
    ).backgroundColor.match(/\d+/g);
    if (!match) throw new Error("Could not read #intro background");
    return match.reduce((sum, part) => sum + Number(part), 0) / match.length;
  });
  expect(luma).toBeGreaterThan(20);

  expect(pageErrors).toEqual([]);
});

test("the 3D booth enters by transform and never leaves its slot", async ({
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

  const contactTop = await page.evaluate(() => {
    const contact = document.querySelector<HTMLElement>("#contact");
    if (!contact) throw new Error("Missing contact");
    return contact.getBoundingClientRect().top + window.scrollY;
  });

  const readBooth = () =>
    page.evaluate(() => {
      const canvas = document.querySelector<HTMLElement>(".canvas-container");
      if (!canvas) throw new Error("Missing canvas container");
      const style = getComputedStyle(canvas);
      const rect = canvas.getBoundingClientRect();
      return {
        position: style.position,
        right: style.right,
        // Layout slot: transforms do not touch these, so a constant pair is
        // proof that the entrance is transform-only.
        offsetLeft: canvas.offsetLeft,
        offsetTop: canvas.offsetTop,
        opacity: style.opacity,
        transform: style.transform,
        matrix: style.transform.startsWith("matrix")
          ? style.transform
              .slice(7, -1)
              .split(",")
              .map((part) => Number.parseFloat(part))
          : [],
        rect: {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        },
      };
    });

  // Still well outside the contact screen: the entrance has not started.
  await scrollToContentY(page, contactTop - 3 * 900, 0);
  const before = await readBooth();

  // Half way up the last screen: the booth is mid-entrance.
  await scrollToContentY(page, contactTop - 600, 0);
  const during = await readBooth();

  // Arrived: settled in its slot on the right of the composition.
  await scrollToContentY(page, contactTop, 0);
  const after = await readBooth();

  // Positioned by right + top. The old timeline wrote `left: 75vw` on top of
  // that, which over-constrains the box and dragged the booth off screen.
  expect(after.position).toBe("absolute");

  // The layout slot never moves...
  expect(during.offsetLeft).toBe(before.offsetLeft);
  expect(during.offsetTop).toBe(before.offsetTop);
  expect(after.offsetLeft).toBe(before.offsetLeft);
  expect(after.offsetTop).toBe(before.offsetTop);

  // ...the entrance is a transform, and it fades up rather than popping in...
  expect(Number(before.opacity)).toBeLessThan(0.2);
  expect(during.matrix.length).toBe(6);
  expect(during.matrix[0]).toBeGreaterThan(before.matrix[0]);
  expect(during.matrix[0]).toBeLessThan(1);
  // ...and it ends settled: unscaled, untranslated, fully opaque.
  expect(after.matrix[0]).toBeCloseTo(1, 2);
  expect(after.matrix[5]).toBeCloseTo(0, 1);
  expect(Number(after.opacity)).toBeCloseTo(1, 1);

  // The booth never shares space with the headline lockup, and it never leaves
  // the viewport.
  const headline = await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>(".contact-hl3");
    if (!element) throw new Error("Missing contact headline");
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right };
  });
  expect(after.rect.left).toBeGreaterThanOrEqual(headline.right);
  expect(after.rect.right).toBeLessThanOrEqual(1440);
  expect(after.rect.top).toBeGreaterThanOrEqual(0);
  expect(after.rect.bottom).toBeLessThanOrEqual(900);

  expect(pageErrors).toEqual([]);
});

test("the contact headline lockup is never clipped", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const [width, height] of [
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".page-home")).toHaveAttribute(
      "data-scroll-runtime",
      "ready",
    );

    await scrollToContentY(
      page,
      await page.evaluate(
        () => document.querySelector("#smooth-content")!.getBoundingClientRect().height,
      ),
      1,
    );

    const layout = await page.evaluate(() => {
      const read = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, right: rect.right };
      };
      const inner = document.querySelector<HTMLElement>(".contact-inner");
      if (!inner) throw new Error("Missing .contact-inner");
      let lowest = 0;
      for (const child of Array.from(inner.children)) {
        lowest = Math.max(lowest, child.getBoundingClientRect().bottom);
      }
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        firstHeadline: read(".contact-hl1"),
        lastHeadline: read(".contact-hl3"),
        marquee: read(".runningtext"),
        credit: read(".contact-inner > p"),
        lowest,
      };
    });

    const message = `${width}x${height}`;
    // The UA stylesheet's h2 bottom margin used to cost three full line boxes,
    // which pushed CALL ME above the top edge and the credit below the bottom.
    expect(layout.firstHeadline.top, message).toBeGreaterThanOrEqual(0);
    expect(layout.lastHeadline.bottom, message).toBeLessThanOrEqual(
      layout.viewport.height,
    );
    expect(layout.credit.bottom, message).toBeLessThanOrEqual(
      layout.viewport.height,
    );
    // "MARQUEE MOON" stays inside the stage horizontally...
    expect(layout.lastHeadline.right, message).toBeLessThanOrEqual(
      layout.viewport.width,
    );
    // ...and the running line is a full-bleed track, not a shrink-to-fit flex
    // item that only gets clipped by the section.
    const marquee = await page.evaluate(
      () =>
        document.querySelector<HTMLElement>(".runningtext")!.getBoundingClientRect()
          .width,
    );
    expect(marquee, message).toBeGreaterThan(layout.viewport.width * 0.85);
  }

  expect(pageErrors).toEqual([]);
});

test("desktop television stays off until a work row is hovered", async ({
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

  const screen = page.locator(".tv-all-vids");
  const partfolioTop = await page.evaluate(() => {
    const section = document.getElementById("partfolio");
    if (!section) throw new Error("Missing portfolio section");
    return section.getBoundingClientRect().top + window.scrollY;
  });

  // Arriving at the television, and even scrolling the works list past it,
  // must not light the screen: with no hover yet the tube is powered off.
  // (A pin onEnter and per-row scroll triggers used to show the first
  // project here before the visitor pointed at anything.) The pointer is
  // parked in the upper stage area, which the rows never sweep during this
  // scroll segment, so a passively crossed row cannot fake a hover.
  await page.mouse.move(720, 200);
  await scrollToContentY(page, partfolioTop + 100, 0);
  await expect(screen).toHaveAttribute("data-preview-active", "false");
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  await scrollToContentY(page, partfolioTop + 1.4 * 900, 0);
  await expect(screen).toHaveAttribute("data-preview-active", "false");
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  // Hovering a row is what turns the television on...
  const secondRow = page.locator(".work-item").nth(1);
  await secondRow.evaluate((element) =>
    element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })),
  );
  await expect(screen).toHaveAttribute("data-preview-active", "true");
  await expect(page.locator(".tv-cover")).toHaveCount(1);
  await expect(page.locator(".tv-cover")).toHaveAttribute(
    "src",
    /plague\.jpg/,
  );
  await expect(secondRow).toHaveClass(/is-active/);

  // ...and the picture is sticky: leaving the row does not black out the
  // screen (the phone/exit beats own the blank states).
  await page.mouse.move(8, 8);
  await expect(screen).toHaveAttribute("data-preview-active", "true");

  // Scrolling on into the phone-number beat blanks the tube again.
  const phoneTop = await page.evaluate(() => {
    const spacer = document.querySelector<HTMLElement>(".tv-phone-spacer");
    if (!spacer) throw new Error("Missing phone spacer");
    return spacer.getBoundingClientRect().top + window.scrollY;
  });
  await scrollToContentY(page, phoneTop + 400, 0);
  await expect(screen).toHaveAttribute("data-preview-active", "false");
  await expect(page.locator(".tv-cover")).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});

test("the hero artwork floats above the headline words that surround it", async ({
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

  const layers = await page.evaluate(() => {
    const photoBox = document.querySelector<HTMLElement>(".intro-photo-box");
    const photo = document.querySelector<HTMLElement>(".intro-photo");
    const word = document.querySelector<HTMLElement>(".intro-headline-word");
    if (!photoBox || !photo || !word) throw new Error("Missing hero layers");
    const rect = photoBox.getBoundingClientRect();
    const hit = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + Math.min(rect.height / 2, window.innerHeight / 2),
    );
    return {
      photoZ: Number.parseInt(getComputedStyle(photoBox).zIndex, 10),
      wordZ: Number.parseInt(getComputedStyle(word).zIndex, 10),
      photoBlend: getComputedStyle(photo).mixBlendMode,
      hitInsidePhoto: Boolean(hit?.closest(".intro-photo-box")),
    };
  });

  // The portrait is the top layer; the headline type arranges around it and
  // no difference blend inverts the artwork against that type.
  expect(layers.photoZ).toBeGreaterThan(layers.wordZ);
  expect(layers.photoBlend).toBe("normal");
  expect(layers.hitInsidePhoto).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("works headline and second-paragraph measure are set at reading scale", async ({
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

  const type = await page.evaluate(() => {
    const headline = document.querySelector<HTMLElement>(
      ".work-items-headline",
    );
    const second = document.querySelector<HTMLElement>(
      ".intro-subheadline-text2",
    );
    if (!headline || !second) throw new Error("Missing type");
    return {
      headlineSize: Number.parseFloat(getComputedStyle(headline).fontSize),
      secondWidth: second.getBoundingClientRect().width,
      viewportWidth: window.innerWidth,
    };
  });

  // The works headline was reset to the 16px document default by the global
  // heading reset; it now scales with the list it titles.
  expect(type.headlineSize).toBeGreaterThan(20);
  // The second biography paragraph was a 70vw full-bleed line; it now shares
  // the first paragraph's reading measure.
  expect(type.secondWidth).toBeLessThanOrEqual(type.viewportWidth * 0.55);
  expect(type.secondWidth).toBeGreaterThan(320);
  expect(pageErrors).toEqual([]);
});
