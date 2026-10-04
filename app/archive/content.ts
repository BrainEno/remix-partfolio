import type { ArchiveContent } from "./types";

/**
 * EDIT THIS FILE to turn the site into a personal books / audio / video archive.
 *
 * The three demo records intentionally ship without heavy media files. Replace
 * them with your own items, covers and media sources. Local files can live
 * under public/media/ (for example /media/audio/example.mp3), while large
 * audio/video may use an external CDN/object-storage URL instead.
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
      zh: "尚未配置媒体文件。可在 app/archive/content.ts 中添加。",
      en: "No media source yet. Add one in app/archive/content.ts.",
    },
    externalLink: { zh: "打开外部链接", en: "Open external link" },
    backToArchive: { zh: "返回档案", en: "Back to archive" },
    backToLists: { zh: "返回榜单", en: "Back to lists" },
  },
  items: [
    {
      id: "sample-book",
      kind: "book",
      title: { zh: "示例书目", en: "Sample Book" },
      creators: ["Replace with author"],
      year: "2026",
      summary: {
        zh: "这是一个占位条目。后续可替换为你的书目、短评、标签和外部链接。",
        en: "A placeholder entry for your own books, notes, tags and links.",
      },
      tags: ["demo", "book"],
      demo: true,
    },
    {
      id: "sample-audio",
      kind: "audio",
      title: { zh: "示例声音", en: "Sample Audio" },
      creators: ["Replace with artist / speaker"],
      year: "2026",
      summary: {
        zh: "可配置本地 MP3 / M4A / OGG，或指向你自己的对象存储/CDN。播放器默认不自动加载整段音频。",
        en: "Supports local audio or your own object-storage/CDN URL. Playback never autoloads the full file.",
      },
      tags: ["demo", "audio"],
      demo: true,
    },
    {
      id: "sample-video",
      kind: "video",
      title: { zh: "示例影像", en: "Sample Video" },
      creators: ["Replace with filmmaker / artist"],
      year: "2026",
      summary: {
        zh: "可配置本地视频或外部媒体地址，并可提供 poster。视频默认 playsInline 且不自动播放。",
        en: "Supports local or external video with an optional poster. Video is inline and never autoplayed.",
      },
      tags: ["demo", "video"],
      demo: true,
    },
  ],
  lists: [
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
  ],
} as const satisfies ArchiveContent;
