import { archiveContent } from "../../archive/content";
import type { ArchiveItem } from "../../archive/types";
import type { Language } from "../../portfolio/types";

interface MediaPreviewProps {
  item: ArchiveItem;
  language: Language;
}

export default function MediaPreview({ item, language }: MediaPreviewProps) {
  if (!item.media) {
    return (
      <div className="archive-media-empty" role="note">
        {archiveContent.labels.noMedia[language]}
      </div>
    );
  }

  if (item.kind === "audio") {
    return (
      <audio className="archive-audio" controls preload="none">
        <source src={item.media.src} type={item.media.mimeType} />
      </audio>
    );
  }

  if (item.kind === "video") {
    return (
      <video
        className="archive-video"
        controls
        playsInline
        preload="metadata"
        poster={item.media.poster}
      >
        <source src={item.media.src} type={item.media.mimeType} />
      </video>
    );
  }

  return null;
}
