import { expect, test } from "@playwright/test";

const ARTWORK = {
  width: 2560,
  height: 1707,
  screen: { x: 1110, y: 980, width: 328, height: 268 },
} as const;

const viewports = [
  { name: "mobile portrait", width: 390, height: 844 },
  { name: "small tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide desktop", width: 2560, height: 1440 },
] as const;

for (const viewport of viewports) {
  test(`TV screen stays registered to its artwork on ${viewport.name}`, async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".page-home")).toHaveAttribute(
      "data-scroll-runtime",
      "ready",
    );
    await expect
      .poll(() =>
        page.locator(".tv-bg").evaluate((image: HTMLImageElement) => ({
          loaded: image.complete && image.naturalWidth > 0,
          width: image.naturalWidth,
          height: image.naturalHeight,
        })),
      )
      .toEqual({ loaded: true, width: ARTWORK.width, height: ARTWORK.height });

    const geometry = await page.evaluate(() => {
      const scene = document.querySelector(".tv-box")?.getBoundingClientRect();
      const frame = document.querySelector(".tv-bg")?.getBoundingClientRect();
      const screen = document
        .querySelector(".tv-all-vids")
        ?.getBoundingClientRect();
      if (!scene || !frame || !screen)
        throw new Error("Missing television scene geometry");

      return {
        scene: { width: scene.width, height: scene.height },
        frameOffset: {
          x: Math.abs(frame.x - scene.x),
          y: Math.abs(frame.y - scene.y),
          width: Math.abs(frame.width - scene.width),
          height: Math.abs(frame.height - scene.height),
        },
        screen: {
          x: (screen.x - scene.x) / scene.width,
          y: (screen.y - scene.y) / scene.height,
          width: screen.width / scene.width,
          height: screen.height / scene.height,
        },
      };
    });

    expect(geometry.scene.width / geometry.scene.height).toBeCloseTo(
      ARTWORK.width / ARTWORK.height,
      3,
    );
    for (const difference of Object.values(geometry.frameOffset)) {
      expect(difference).toBeLessThan(0.6);
    }

    const expected = {
      x: ARTWORK.screen.x / ARTWORK.width,
      y: ARTWORK.screen.y / ARTWORK.height,
      width: ARTWORK.screen.width / ARTWORK.width,
      height: ARTWORK.screen.height / ARTWORK.height,
    };
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(geometry.screen[key] - expected[key])).toBeLessThan(
        0.0002,
      );
    }
    expect(pageErrors).toEqual([]);
  });
}
