import type { Language, LocalizedText } from "../portfolio/types";

export type ArchiveKind = "book" | "audio" | "video";

export type ArchiveImage = Readonly<{
  src: string;
  alt: LocalizedText;
}>;

export type ArchiveMediaSource = Readonly<{
  src: string;
  mimeType?: string;
  poster?: string;
}>;

export type ArchiveItem = Readonly<{
  id: string;
  kind: ArchiveKind;
  title: LocalizedText;
  creators: readonly string[];
  year?: string;
  image?: ArchiveImage;
  summary?: LocalizedText;
  note?: LocalizedText;
  tags: readonly string[];
  media?: ArchiveMediaSource;
  externalUrl?: string;
  demo?: boolean;
}>;

export type ArchiveListEntry = Readonly<{
  itemId: string;
  note?: LocalizedText;
}>;

export type ArchiveList = Readonly<{
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  updatedAt?: string;
  entries: readonly ArchiveListEntry[];
  demo?: boolean;
}>;

export type ArchiveContent = Readonly<{
  identity: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
  labels: {
    archive: LocalizedText;
    lists: LocalizedText;
    home: LocalizedText;
    all: LocalizedText;
    books: LocalizedText;
    audio: LocalizedText;
    video: LocalizedText;
    noMedia: LocalizedText;
    externalLink: LocalizedText;
    backToArchive: LocalizedText;
    backToLists: LocalizedText;
  };
  items: readonly ArchiveItem[];
  lists: readonly ArchiveList[];
}>;

export type ArchiveLanguage = Language;
