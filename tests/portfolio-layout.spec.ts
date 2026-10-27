import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

async function loadHome(
  page: Page,
  width: number,
  height: number,
  language = "en",
) {
  await page.setViewportSize({ width, height });
  await page.addInitScript(
    (lang) => localStorage.setItem("portfolio-language", lang),
    language,
  );
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".page-home")).toHaveAttribute(
    "data-scroll-runtime",
    "ready",
  );
}

/** Map the untransformed content coordinate to native scroll for Smoother. */
async function contentMetrics(page: Page, selector: string) {
  return page.evaluate((selector) => {
    const content = document.querySelector<HTMLElement>("#smooth-content")!;
    const target = document.querySelector<HTMLElement>(selector)!;
    const height = innerHeight;
    const contentHeight = content.getBoundingClientRect().height;
    const scrollHeight = document.documentElement.scrollHeight;
    return {
      top: target.getBoundingClientRect().top,
      factor: (contentHeight - height) / (scrollHeight - height),
    };
  }, selector);
}

async function moveToContent(page: Page, y: number, factor: number) {
  await page.evaluate(({ y, factor }) => window.scrollTo(0, y / factor), {
    y,
    factor,
  });
  // Wait for rendered content, not just native scrollY: desktop Smoother can
  // take longer on software WebGL or a busy CI machine to catch up.
  await expect
    .poll(
      () =>
        page.evaluate((target) => {
          const content =
            document.querySelector<HTMLElement>("#smooth-content")!;
          return Math.abs(content.getBoundingClientRect().top + target);
        }, y),
      { timeout: 15_000 },
    )
    .toBeLessThan(3);
  await page.waitForTimeout(80);
}

const viewports = [
  { name: "small phone", width: 320, height: 568 },
  { name: "phone", width: 390, height: 844 },
  { name: "narrow tablet", width: 600, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide short desktop", width: 1568, height: 724 },
  { name: "wide desktop", width: 2560, height: 1440 },
] as const;

for (const viewport of viewports) {
  test(`contact headline, marquee and sculpture fit on ${viewport.name}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await loadHome(page, viewport.width, viewport.height);
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect
      .poll(() =>
        page
          .locator(".contact-headlines")
          .evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBeGreaterThan(0.99);
    await expect(page.locator(".canvas-container")).toHaveAttribute(
      "data-scene-status",
      "ready",
      { timeout: 20_000 },
    );

    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector)!;
        const r = element.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      };
      const textRects = Array.from(
        document.querySelectorAll<HTMLElement>(".contact-headline"),
        (element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const r = range.getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            text: element.textContent,
          };
        },
      );
      return {
        textRects,
        canvas: rect(".canvas-container"),
        firstLine: rect(".contact-hl1"),
        lastLine: rect(".contact-hl3"),
        marquee: rect(".runningtext"),
        word: rect(".runningtext-word"),
        emailHref: document
          .querySelector(".contact-email-link")
          ?.getAttribute("href"),
        phoneHref: document
          .querySelector(".contact-phone-link")
          ?.getAttribute("href"),
      };
    });

    expect(geometry.textRects.map((line) => line.text)).toEqual([
      "CALL ME",
      "FOR THE",
      "MARQUEE MOON",
    ]);
    for (const line of geometry.textRects) {
      expect(line.left).toBeGreaterThanOrEqual(0);
      expect(line.right).toBeLessThanOrEqual(viewport.width);
      expect(line.top).toBeGreaterThanOrEqual(0);
      expect(line.bottom).toBeLessThanOrEqual(viewport.height + 1);
    }
    expect(geometry.word.top).toBeGreaterThanOrEqual(geometry.marquee.top - 1);
    expect(geometry.word.bottom).toBeLessThanOrEqual(
      geometry.marquee.bottom + 1,
    );
    expect(geometry.canvas.left).toBeGreaterThanOrEqual(0);
    expect(geometry.canvas.right).toBeLessThanOrEqual(viewport.width);
    if (viewport.width < 768) {
      expect(geometry.canvas.bottom).toBeLessThanOrEqual(
        geometry.firstLine.top + 1,
      );
    } else {
      expect(geometry.canvas.bottom).toBeLessThanOrEqual(
        geometry.lastLine.top + 1,
      );
    }
    expect(geometry.emailHref).toMatch(/^mailto:/);
    expect(geometry.phoneHref).toBe("tel:+8618971113243");
    expect(errors).toEqual([]);
  });
}

test("marquee keeps a complete Contact me visible throughout its loop on narrow screens", async ({
  page,
}) => {
  await loadHome(page, 320, 568);
  for (const width of [320, 360, 390, 600]) {
    await page.setViewportSize({ width, height: 844 });
    const sample = await page.evaluate(() => {
      const marquee = document.querySelector<HTMLElement>(".runningtext")!;
      const bounds = marquee.getBoundingClientRect();
      const tracks = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".runningtext-l1, .runningtext-l2",
        ),
      );
      const animations = tracks.flatMap((track) => track.getAnimations());
      const words = Array.from(
        document.querySelectorAll<HTMLElement>(".runningtext-word"),
      );
      animations.forEach((animation) => animation.pause());
      const missing: number[] = [];
      for (let time = 0; time < 80_000; time += 200) {
        animations.forEach((animation) => {
          animation.currentTime = time;
        });
        const complete = words.some((word) => {
          const node = word.firstChild!;
          const range = document.createRange();
          range.setStart(node, 0);
          range.setEnd(node, "Contact me".length);
          const rect = range.getBoundingClientRect();
          return (
            rect.left >= bounds.left - 0.5 && rect.right <= bounds.right + 0.5
          );
        });
        if (!complete) missing.push(time);
      }
      return {
        animationCount: animations.length,
        missing: missing.slice(0, 5),
      };
    });
    expect(sample.animationCount).toBe(2);
    expect(sample.missing, `width ${width}`).toEqual([]);
  }
});

for (const viewport of [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test(`booth preloads, enters after the TV and reverses smoothly on ${viewport.name}`, async ({
    page,
  }) => {
    let release: () => void = () => undefined;
    const holdModel = new Promise<void>((resolve) => {
      release = resolve;
    });
    let requested = false;
    const modelRequests: string[] = [];
    page.on("request", (request) => {
      if (/telephone\.(glb|gltf)/.test(request.url()))
        modelRequests.push(request.url());
    });
    await page.route("**/generated/telephone.glb", async (route) => {
      requested = true;
      await holdModel;
      await route.continue();
    });
    await loadHome(page, viewport.width, viewport.height);
    const metrics = await contentMetrics(page, ".contact-inner");
    const container = page.locator(".canvas-container");

    await expect(container).toHaveAttribute("data-scene-status", "idle");
    await moveToContent(
      page,
      metrics.top - viewport.height * 1.4,
      metrics.factor,
    );
    await expect.poll(() => requested).toBe(true);
    await expect(container).toHaveAttribute("data-scene-active", "true");
    await expect(container).toHaveAttribute("data-scene-status", "loading");
    expect(
      Number(await container.evaluate((el) => getComputedStyle(el).opacity)),
    ).toBe(0);

    if (viewport.width < 768) {
      await moveToContent(
        page,
        metrics.top - viewport.height * 0.75,
        metrics.factor,
      );
      expect(
        Number(await container.evaluate((el) => getComputedStyle(el).opacity)),
      ).toBe(0);
    }

    // Mobile waits until the TV/number beat is complete; desktop can enter
    // earlier because the booth has its own side column.
    const entranceOffset = viewport.width < 768 ? 0.35 : 0.6;
    await moveToContent(
      page,
      metrics.top - viewport.height * entranceOffset,
      metrics.factor,
    );
    const during = await page.evaluate(() => {
      const element = document.querySelector<HTMLElement>(".canvas-container")!;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return {
        opacity: Number(getComputedStyle(element).opacity),
        x: matrix.e,
        y: matrix.f,
        tvOpacity: Number(
          getComputedStyle(document.querySelector(".tv-box")!).opacity,
        ),
        canvasOpacity: Number(
          getComputedStyle(element.querySelector("canvas")!).opacity,
        ),
      };
    });
    expect(during.tvOpacity).toBeLessThan(0.1);
    expect(during.opacity).toBeGreaterThan(0.1);
    expect(during.opacity).toBeLessThan(0.9);
    expect(during.x).toBeLessThan(0);
    expect(during.y).toBeGreaterThan(0);
    expect(during.canvasOpacity).toBe(0); // chunk loaded, actual model still decoding

    release();
    await expect(container).toHaveAttribute("data-scene-status", "ready", {
      timeout: 20_000,
    });
    await expect
      .poll(() =>
        container
          .locator("canvas")
          .evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBeGreaterThan(0.95);
    expect(
      modelRequests.filter((url) => url.endsWith("telephone.gltf")),
    ).toHaveLength(0);

    await moveToContent(
      page,
      metrics.top - viewport.height * 0.03,
      metrics.factor,
    );
    expect(
      Number(await container.evaluate((el) => getComputedStyle(el).opacity)),
    ).toBeGreaterThan(0.99);
    await moveToContent(
      page,
      metrics.top - viewport.height * entranceOffset,
      metrics.factor,
    );
    const reversed = Number(
      await container.evaluate((el) => getComputedStyle(el).opacity),
    );
    expect(Math.abs(reversed - during.opacity)).toBeLessThan(0.08);

    // Leaving the preload zone unmounts the canvas; re-entering must not show
    // a blank, previously-ready canvas before the cached model remounts.
    await moveToContent(
      page,
      metrics.top - viewport.height * 2.6,
      metrics.factor,
    );
    await expect(container).toHaveAttribute("data-scene-active", "false");
    await expect(container).toHaveAttribute("data-scene-status", "idle");
    await expect(container.locator("canvas")).toHaveCount(0);
    await moveToContent(
      page,
      metrics.top - viewport.height * entranceOffset,
      metrics.factor,
    );
    await expect(container).toHaveAttribute("data-scene-status", "ready", {
      timeout: 20_000,
    });
    await expect
      .poll(() =>
        container
          .locator("canvas")
          .evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBeGreaterThan(0.95);
  });
}

test("mobile portrait and full biography have separate, unclipped reading space", async ({
  page,
}) => {
  await loadHome(page, 320, 568);
  const bio = page.locator(".intro-subheadline-text1");
  await bio.scrollIntoViewIfNeeded();
  const layout = await page.evaluate(() => {
    const image = document.querySelector<HTMLImageElement>(
      ".intro-subheadline-photo",
    )!;
    const portrait = image.getBoundingClientRect();
    const paragraph = document.querySelector<HTMLElement>(
      ".intro-subheadline-text1",
    )!;
    const text = paragraph.getBoundingClientRect();
    return {
      portraitBottom: portrait.bottom,
      textTop: text.top,
      left: text.left,
      right: text.right,
      textHeight: text.height,
      scrollHeight: paragraph.scrollHeight,
      fontSize: parseFloat(getComputedStyle(paragraph).fontSize),
      fit: getComputedStyle(image).objectFit,
    };
  });
  expect(layout.fit).toBe("contain");
  expect(layout.portraitBottom).toBeLessThanOrEqual(layout.textTop);
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(320);
  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.textHeight + 1);
  expect(layout.fontSize).toBeGreaterThanOrEqual(21);
});

test("mobile TV waits for the last work and restores previews after a fast reverse", async ({
  page,
}) => {
  await loadHome(page, 390, 844);
  const metrics = await contentMetrics(page, ".tv-exit-spacer");
  // At this point the last work still overlaps the glass.
  const readingPosition = metrics.top - 844 * 0.7;
  await moveToContent(page, readingPosition, metrics.factor);
  const screen = page.locator(".tv-all-vids");
  await expect(screen).toHaveAttribute("data-preview-active", "true");
  const previewBefore = await screen.locator(".tv-cover").getAttribute("src");
  const state = await page.evaluate(() => {
    const matrix = new DOMMatrixReadOnly(
      getComputedStyle(document.querySelector(".tv-box")!).transform,
    );
    const last = document
      .querySelector(".work-item:last-of-type")
      ?.getBoundingClientRect();
    return {
      scale: Math.hypot(matrix.a, matrix.b),
      exiting: document
        .querySelector("#partfolio")!
        .classList.contains("is-tv-exiting"),
      lastBottom: last?.bottom,
    };
  });
  expect(state.scale).toBeLessThan(1.02);
  expect(state.exiting).toBe(false);
  expect(state.lastBottom).toBeGreaterThan(0);

  await moveToContent(page, metrics.top + 844 * 1.4, metrics.factor);
  await expect(page.locator("#partfolio")).toHaveClass(/is-tv-exiting/);
  await expect(screen).toHaveAttribute("data-preview-active", "false");
  // Skip the whole exit trigger in one frame, as a fast swipe / nav jump can.
  await moveToContent(page, readingPosition, metrics.factor);
  await expect(page.locator("#partfolio")).not.toHaveClass(/is-tv-exiting/);
  await expect(screen).toHaveAttribute("data-preview-active", "true");
  await expect(screen.locator(".tv-cover")).toHaveAttribute(
    "src",
    previewBefore!,
  );
});

test("desktop TV relinquishes exit ownership when returning to a work", async ({
  page,
}) => {
  await loadHome(page, 1440, 900);
  const metrics = await contentMetrics(page, ".work-item:last-of-type");
  const readingPosition = metrics.top - 900 * 0.5;
  await moveToContent(page, readingPosition, metrics.factor);
  const lastWork = page.locator(".work-item:last-of-type");
  const waitForLastWork = () =>
    expect
      .poll(
        () =>
          lastWork.evaluate((el) =>
            Math.abs(el.getBoundingClientRect().top - 450),
          ),
        { timeout: 20_000 },
      )
      .toBeLessThan(2);
  await waitForLastWork();
  const screen = page.locator(".tv-all-vids");
  await expect(screen).toHaveAttribute("data-preview-active", "true");
  const previewBefore = await screen.locator(".tv-cover").getAttribute("src");
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await page.waitForTimeout(1_050);
  await expect(page.locator("#partfolio")).toHaveClass(/is-tv-exiting/);
  await moveToContent(page, readingPosition, metrics.factor);
  await waitForLastWork();
  await expect(page.locator("#partfolio")).not.toHaveClass(
    /is-tv-exiting|is-tv-phone/,
  );
  await expect(screen).toHaveAttribute("data-preview-active", "true");
  await expect(screen.locator(".tv-cover")).toHaveAttribute(
    "src",
    previewBefore!,
  );
});

test("Chinese fallback fonts cover both scripts and the biography uses real characters", async ({
  page,
}) => {
  await loadHome(page, 390, 844, "zh");
  const fonts = await page.evaluate(async () => {
    const tc = await document.fonts.load('20px "Noto Sans TC"', "趙");
    const sc = await document.fonts.load('20px "Noto Sans SC"', "档");
    return {
      tc: tc.length,
      sc: sc.length,
      bio:
        document.querySelector(".intro-subheadline-text1")?.textContent ?? "",
    };
  });
  expect(fonts.tc).toBeGreaterThan(0);
  expect(fonts.sc).toBeGreaterThan(0);
  expect(fonts.bio).toContain("經濟學");
  expect(fonts.bio).not.toMatch(/[\u2e80-\u2fdf]/);
});

for (const viewport of [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test(`reduced motion keeps stories unpinned on ${viewport.name}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await loadHome(page, viewport.width, viewport.height);
    expect(await page.locator(".pin-spacer").count()).toBe(0);
    await expect(page.locator(".intro-subheadline-photo")).toBeVisible();
    await expect(page.locator(".intro-subheadline-text1")).toBeVisible();
    await expect(page.locator(".intro-subheadline-text2")).toBeVisible();
    expect(
      await page
        .locator(".runningtext-l1")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await expect(page.locator(".contact-hl3")).toBeVisible();
  });
}

test("changing viewport across the breakpoint rebuilds the correct choreography", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await loadHome(page, 1440, 900);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const visual = page.locator(".intro-subheadline-visual-group");
  await expect
    .poll(() =>
      visual.evaluate((el) =>
        el.parentElement?.classList.contains("pin-spacer"),
      ),
    )
    .toBe(true);
  const mobilePosition = await page
    .locator(".intro-subheadline-text-box1")
    .evaluate((el) => getComputedStyle(el).position);
  expect(mobilePosition).toBe("relative");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await expect
    .poll(() =>
      page
        .locator(".intro-subheadline-stickytainer")
        .evaluate((el) => el.parentElement?.classList.contains("pin-spacer")),
    )
    .toBe(true);
  expect(
    await page
      .locator(".intro-subheadline-text-box1")
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("absolute");
  expect(errors).toEqual([]);
});

test("failed model sources leave readable contact details and release the mobile slot", async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route(
    /\/generated\/telephone\.glb|\/gltfs\/telephone\.gltf/,
    async (route) => {
      requests.push(new URL(route.request().url()).pathname);
      await route.fulfill({ status: 503, body: "unavailable" });
    },
  );
  await loadHome(page, 390, 844);
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  const container = page.locator(".canvas-container");
  await expect(container).toHaveAttribute("data-scene-status", "error", {
    timeout: 20_000,
  });
  await expect(container).toBeHidden();
  await expect(page.locator(".contact-hl3")).toBeVisible();
  await expect(page.locator(".contact-email-link")).toBeVisible();
  expect(requests).toEqual([
    "/generated/telephone.glb",
    "/gltfs/telephone.gltf",
  ]);
});
