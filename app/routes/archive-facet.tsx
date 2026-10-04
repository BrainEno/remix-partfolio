import { useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  getArchiveCreator,
  getArchiveItemsByCreator,
  getArchiveItemsByKind,
  getArchiveItemsByTag,
  getArchiveItemsByYear,
} from "../archive/catalog";
import { archiveContent } from "../archive/content";
import type { ArchiveItem, ArchiveKind } from "../archive/types";
import ArchiveCard from "../components/archive/ArchiveCard";
import ArchiveShell from "../components/archive/ArchiveShell";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import archiveStylesUrl from "../styles/archive.css?url";
import archiveIndexesStylesUrl from "../styles/archive-indexes.css?url";

export const links = () => [
  { rel: "stylesheet", href: archiveStylesUrl },
  { rel: "stylesheet", href: archiveIndexesStylesUrl },
];

const validKinds: readonly ArchiveKind[] = ["book", "audio", "video"];

function resolveFacet(facet: string, value: string) {
  let items: readonly ArchiveItem[] = [];
  let label = value;

  if (facet === "type" && validKinds.includes(value as ArchiveKind)) {
    const kind = value as ArchiveKind;
    items = getArchiveItemsByKind(kind);
    label = kind;
  } else if (facet === "tag") {
    items = getArchiveItemsByTag(value);
    label = `#${value}`;
  } else if (facet === "year") {
    items = getArchiveItemsByYear(value);
    label = value;
  } else if (facet === "creator") {
    items = getArchiveItemsByCreator(value);
  }

  return { items, label, valid: items.length > 0 };
}

export default function ArchiveFacetRoute() {
  const { facet = "", value = "" } = useParams();
  const { language, setLanguage, languageReady } = useSiteLanguage();
  const resolved = resolveFacet(facet, value);
  const creator = facet === "creator" ? getArchiveCreator(value) : undefined;
  const displayLabel = creator
    ? creator.name[language]
    : facet === "type" && validKinds.includes(value as ArchiveKind)
      ? archiveContent.labels[
          value === "book" ? "books" : value === "audio" ? "audio" : "video"
        ][language]
      : resolved.label;
  const description = creator?.bio?.[language] ??
    (language === "zh"
      ? `${resolved.items.length} 项`
      : `${resolved.items.length} item${resolved.items.length === 1 ? "" : "s"}`);

  useEffect(() => {
    if (!languageReady) return;
    document.title = `${displayLabel} — ${archiveContent.identity.title[language]}`;
  }, [displayLabel, language, languageReady]);

  if (!resolved.valid || (facet === "creator" && !creator)) {
    return (
      <ArchiveShell
        language={language}
        setLanguage={setLanguage}
        title="404"
        description={language === "zh" ? "未找到该档案索引。" : "Archive index not found."}
      >
        <Link to="/archive" className="archive-back-link">
          ← {archiveContent.labels.backToArchive[language]}
        </Link>
      </ArchiveShell>
    );
  }

  return (
    <ArchiveShell
      language={language}
      setLanguage={setLanguage}
      title={displayLabel}
      description={description}
    >
      {creator?.externalUrl ? (
        <a
          className="archive-external-link archive-creator-external"
          href={creator.externalUrl}
          target="_blank"
          rel="noreferrer"
        >
          {archiveContent.labels.externalLink[language]} ↗
        </a>
      ) : null}

      <section className="archive-grid">
        {resolved.items.map((item) => (
          <ArchiveCard key={item.id} item={item} language={language} />
        ))}
      </section>

      <Link to="/archive" className="archive-back-link">
        ← {archiveContent.labels.backToArchive[language]}
      </Link>
    </ArchiveShell>
  );
}
