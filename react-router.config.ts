import type { Config } from "@react-router/dev/config";
import {
  getArchiveKinds,
  getArchiveTags,
  getArchiveYears,
} from "./app/archive/catalog";
import { archiveContent } from "./app/archive/content";

const archiveItemPaths = archiveContent.items.map(
  (item) => `/archive/${item.id}`
);
const listPaths = archiveContent.lists.map((list) => `/lists/${list.id}`);
const kindPaths = getArchiveKinds()
  .filter(({ count }) => count > 0)
  .map(({ value }) => `/archive/type/${encodeURIComponent(value)}`);
const tagPaths = getArchiveTags().map(
  ({ value }) => `/archive/tag/${encodeURIComponent(value)}`
);
const yearPaths = getArchiveYears().map(
  ({ value }) => `/archive/year/${encodeURIComponent(value)}`
);

export default {
  // The site has no runtime server data. Build-time prerendering keeps complete
  // HTML responses for the animated landing page and every configured archive
  // index/detail URL while production remains static-only.
  ssr: false,
  prerender: [
    "/",
    "/archive",
    "/lists",
    ...archiveItemPaths,
    ...listPaths,
    ...kindPaths,
    ...tagPaths,
    ...yearPaths,
  ],
} satisfies Config;
