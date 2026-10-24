import type { ArchiveItem } from "./types";

/**
 * Main archive records. Keep stable item/creator IDs because lists, creator
 * indexes and public deep links reference them.
 */
export const archiveItems = [
  {
    id: "sample-book",
    kind: "book",
    title: { zh: "示例书目", en: "Sample Book" },
    creatorIds: ["sample-author"],
    year: "2026",
    summary: {
      zh: "这是一个占位条目。后续可替换为你的书目、短评、标签和外部链接。",
      en: "A placeholder entry for your own books, notes, tags and links.",
    },
    tags: ["demo", "book"],
    facts: [
      {
        label: { zh: "类型", en: "Format" },
        value: { zh: "书籍", en: "Book" },
      },
    ],
    demo: true,
  },
  {
    id: "sample-audio",
    kind: "audio",
    title: { zh: "示例声音", en: "Sample Audio" },
    creatorIds: ["sample-audio-creator"],
    year: "2026",
    summary: {
      zh: "可配置本地 MP3 / M4A / OGG，或指向你自己的对象存储/CDN。播放器默认不自动加载整段音频。",
      en: "Supports local audio or your own object-storage/CDN URL. Playback never autoloads the full file.",
    },
    tags: ["demo", "audio"],
    facts: [
      {
        label: { zh: "类型", en: "Format" },
        value: { zh: "声音", en: "Audio" },
      },
    ],
    demo: true,
  },
  {
    id: "sample-video",
    kind: "video",
    title: { zh: "示例影像", en: "Sample Video" },
    creatorIds: ["sample-video-creator"],
    year: "2026",
    summary: {
      zh: "可配置本地视频或外部媒体地址，并可提供 poster。视频默认 playsInline 且不自动播放。",
      en: "Supports local or external video with an optional poster. Video is inline and never autoplayed.",
    },
    tags: ["demo", "video"],
    facts: [
      {
        label: { zh: "类型", en: "Format" },
        value: { zh: "影像", en: "Video" },
      },
    ],
    demo: true,
  },
] as const satisfies readonly ArchiveItem[];
