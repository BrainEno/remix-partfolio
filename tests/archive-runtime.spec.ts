import { expect, test } from "@playwright/test";

test("archive supports filtering, deep links, facets and personal ranking lists", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/archive", { waitUntil: "networkidle" });
  await expect(page.locator(".archive-page")).toHaveAttribute(
    "data-archive-template",
    "ready"
  );

  await page.locator('button[data-language="en"]').click();
  await expect(page.locator(".archive-title-block h1")).toHaveText(
    "Media Archive"
  );
  await expect(page.getByRole("heading", { name: "Sample Book" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sample Audio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sample Video" })).toBeVisible();

  await expect(
    page.getByRole("link", { name: "audio 1", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "2026 3", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "#demo 3", exact: true })
  ).toBeVisible();

  await page.getByPlaceholder("Search title, creator or tag").fill("Format");
  await expect(page.getByRole("heading", { name: "Sample Book" })).toBeVisible();
  await page.getByPlaceholder("Search title, creator or tag").fill("");

  await page.getByRole("button", { name: "Audio" }).click();
  await expect(page.getByRole("heading", { name: "Sample Audio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sample Book" })).toHaveCount(0);

  await page.getByRole("button", { name: "All" }).click();
  await page.getByRole("heading", { name: "Sample Audio" }).click();
  await expect(page).toHaveURL(/\/archive\/sample-audio$/);
  await expect(page.getByText(/No media source yet/)).toBeVisible();
  await expect(page.locator(".archive-detail-facts")).toContainText("Format");

  await page.getByRole("link", { name: "#demo", exact: true }).click();
  await expect(page).toHaveURL(/\/archive\/tag\/demo$/);
  await expect(page.getByRole("heading", { name: "#demo" })).toBeVisible();
  await expect(page.locator(".archive-card")).toHaveCount(3);

  await page.getByRole("link", { name: "Archive", exact: true }).click();
  await page.getByRole("link", { name: "video 1", exact: true }).click();
  await expect(page).toHaveURL(/\/archive\/type\/video$/);
  await expect(page.getByRole("heading", { name: "Video" })).toBeVisible();
  await expect(page.locator(".archive-card")).toHaveCount(1);

  await page.getByRole("link", { name: "Lists", exact: true }).click();
  await expect(page).toHaveURL(/\/lists$/);
  await page.getByRole("heading", { name: "Sample List: Current Three" }).click();
  await expect(page).toHaveURL(/\/lists\/sample-top-three$/);
  await expect(page.locator(".archive-card-index").first()).toHaveText("01");
  await expect(page.getByRole("heading", { name: "Sample Book" })).toBeVisible();

  expect(pageErrors).toEqual([]);
});
