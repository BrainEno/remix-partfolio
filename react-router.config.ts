import type { Config } from "@react-router/dev/config";
import {
  getArchiveCreators,
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
const creatorPaths = getArchiveCreators().map(
  ({ value }) => `/archive/creator/${encodeURIComponent(value)}`
);

export default {
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
    ...creatorPaths,
  ],
} satisfies Config;
