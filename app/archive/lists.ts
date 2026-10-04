import type { ArchiveList } from "./types";

/** Ranked and curated lists. Keep `itemId` references stable. */
export const archiveLists = [
  {
    id: "sample-top-three",
    title: { zh: "示例榜单：当前三项", en: "Sample List: Current Three" },
    description: {
      zh: "榜单按 entries 的顺序自动编号。后续可以做年度榜、主题书单、电影十佳、声音档案等。",
      en: "Entries are ranked by order. Replace this with yearly lists, themed selections, film top tens or sound archives.",
    },
    entries: [
      { itemId: "sample-book" },
      { itemId: "sample-audio" },
      { itemId: "sample-video" },
    ],
    demo: true,
  },
] as const satisfies readonly ArchiveList[];
