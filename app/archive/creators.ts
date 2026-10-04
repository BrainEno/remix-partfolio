import type { ArchiveCreator } from "./types";

/**
 * Creator entities use stable IDs so public URLs do not change when a display
 * name changes or contains spaces, slashes or non-Latin characters.
 */
export const archiveCreators = [
  {
    id: "sample-author",
    name: { zh: "示例作者", en: "Replace with author" },
  },
  {
    id: "sample-audio-creator",
    name: { zh: "示例声音创作者", en: "Replace with artist / speaker" },
  },
  {
    id: "sample-video-creator",
    name: { zh: "示例影像创作者", en: "Replace with filmmaker / artist" },
  },
] as const satisfies readonly ArchiveCreator[];
