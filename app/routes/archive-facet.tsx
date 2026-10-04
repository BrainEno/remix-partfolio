import { useEffect } from "react";
import { Link, useParams } from "react-router";
import {
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

export const links = () => [{ rel: "stylesheet", href: archiveStylesUrl }];

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
  }

  return { items, label, valid: items.length > 0 };
}

export default function ArchiveFacetRoute() {
  const { facet = "", value = "" } = useParams();
  const { language, setLanguage, languageReady } = useSiteLanguage();
  const decodedValue = decodeURIComponent(value);
  const resolved = resolveFacet(facet, decodedValue);

  useEffect(() => {
    if (!languageReady) return;
    document.title = `${resolved.label} — ${archiveContent.identity.title[language]}`;
  }, [language, languageReady, resolved.label]);

  if (!resolved.valid) {
    return (
      <ArchiveShell
        language={language}
        setLanguage={setLanguage}
        title="404"
        description="Archive index not found."
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
      title={resolved.label}
      description={`${resolved.items.length} item${resolved.items.length === 1 ? "" : "s"}`}
    >
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
