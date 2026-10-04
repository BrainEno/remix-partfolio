import { useEffect, useMemo, useState } from "react";
import { archiveContent } from "../archive/content";
import type { ArchiveKind } from "../archive/types";
import ArchiveCard from "../components/archive/ArchiveCard";
import ArchiveShell from "../components/archive/ArchiveShell";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import archiveStylesUrl from "../styles/archive.css?url";

export const links = () => [{ rel: "stylesheet", href: archiveStylesUrl }];

export const meta = () => [
  { title: "书影音档案 / Media Archive" },
  {
    name: "description",
    content: "A personal archive of books, sound, moving image and ranked lists.",
  },
];

export default function ArchiveIndex() {
  const { language, setLanguage, languageReady } = useSiteLanguage();
  const [filter, setFilter] = useState<ArchiveKind | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!languageReady) return;
    document.title = `${archiveContent.identity.title[language]} — Archive`;
  }, [language, languageReady]);

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return archiveContent.items.filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        item.title.zh,
        item.title.en,
        ...item.creators,
        item.year ?? "",
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [filter, query]);

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
        <div className="archive-filter-group">
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
        </div>

        <label className="archive-search">
          <span className="sr-only">{archiveContent.labels.search[language]}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={archiveContent.labels.search[language]}
            autoComplete="off"
          />
        </label>
      </section>

      <section className="archive-grid" aria-live="polite">
        {items.map((item) => (
          <ArchiveCard key={item.id} item={item} language={language} />
        ))}
      </section>
    </ArchiveShell>
  );
}
