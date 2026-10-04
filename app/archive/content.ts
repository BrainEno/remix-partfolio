import { archiveItems } from "./items";
import { archiveLists } from "./lists";
import type { ArchiveContent } from "./types";

/**
 * Site-level archive copy. Put actual records in `items.ts` and ranked/curated
 * collections in `lists.ts` so the archive can grow without turning this file
 * into a large data blob.
 */
export const archiveContent = {
  identity: {
    title: { zh: "书影音档案", en: "Media Archive" },
    subtitle: {
      zh: "个人榜单、书目、声音与影像的长期档案。",
      en: "A long-term personal archive of lists, books, sound and moving image.",
    },
  },
  labels: {
    archive: { zh: "档案", en: "Archive" },
    lists: { zh: "榜单", en: "Lists" },
    home: { zh: "首页", en: "Home" },
    all: { zh: "全部", en: "All" },
    books: { zh: "书", en: "Books" },
    audio: { zh: "声音", en: "Audio" },
    video: { zh: "影像", en: "Video" },
    search: {
      zh: "搜索标题、创作者或标签",
      en: "Search title, creator or tag",
    },
    noMedia: {
      zh: "尚未配置媒体文件。可在 app/archive/items.ts 中添加。",
      en: "No media source yet. Add one in app/archive/items.ts.",
    },
    externalLink: { zh: "打开外部链接", en: "Open external link" },
    backToArchive: { zh: "返回档案", en: "Back to archive" },
    backToLists: { zh: "返回榜单", en: "Back to lists" },
  },
  items: archiveItems,
  lists: archiveLists,
} as const satisfies ArchiveContent;
