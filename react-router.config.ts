import type { Config } from "@react-router/dev/config";
import { archiveContent } from "./app/archive/content";

const archiveItemPaths = archiveContent.items.map(
  (item) => `/archive/${item.id}`
);
const listPaths = archiveContent.lists.map((list) => `/lists/${list.id}`);

export default {
  // The site has no runtime server data. Build-time prerendering keeps complete
  // HTML responses for the animated landing page and the text-first archive
  // while production remains static-only with no Netlify Function/runtime server.
  ssr: false,
  prerender: ["/", "/archive", "/lists", ...archiveItemPaths, ...listPaths],
} satisfies Config;
