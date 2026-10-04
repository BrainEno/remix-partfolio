import { useEffect, useMemo, useState } from "react";
import { archiveContent } from "../archive/content";
import type { ArchiveKind } from "../archive/types";
import ArchiveCard from "../components/archive/ArchiveCard";
import ArchiveShell from "../components/archive/ArchiveShell";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import archiveStylesUrl from "../styles/archive.css?url";

export const links = () => [{ rel: "stylesheet", href: archiveStylesUrl }];

export default function ArchiveIndex() {
  const { language, setLanguage, languageReady } = useSiteLanguage();
  const [filter, setFilter] = useState<ArchiveKind | "all">("all");

  useEffect(() => {
    if (!languageReady) return;
    document.title = `${archiveContent.identity.title[language]} — Archive`;
  }, [language, languageReady]);

  const items = useMemo(
    () =>
      filter === "all"
        ? archiveContent.items
        : archiveContent.items.filter((item) => item.kind === filter),
    [filter]
  );

  const filters: ReadonlyArray<{ value: ArchiveKind | "all"; label: string }> = [
    { value: "all", label: archiveContent.labels.all[language] },
    { value: "book", label: archiveContent.labels.books[language] },
    { value: "audio", label: archiveContent.labels.audio[language] },
    { value: "video", label: archiveContent.labels.video[language] },
  ];

  return (
    <ArchiveShell
      language={language}
      setLanguage={setLanguage}
      title={archiveContent.identity.title[language]}
      description={archiveContent.identity.subtitle[language]}
    >
      <section className="archive-toolbar" aria-label="Archive filters">
        {filters.map((option) => (
          <button
            type="button"
            key={option.value}
            className={filter === option.value ? "is-active" : undefined}
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </section>

      <section className="archive-grid" aria-live="polite">
        {items.map((item) => (
          <ArchiveCard key={item.id} item={item} language={language} />
        ))}
      </section>
    </ArchiveShell>
  );
}
