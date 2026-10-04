import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  getArchiveKinds,
  getArchiveTags,
  getArchiveYears,
} from "../archive/catalog";
import { archiveContent } from "../archive/content";
import type { ArchiveItem, ArchiveKind } from "../archive/types";
import ArchiveCard from "../components/archive/ArchiveCard";
import ArchiveShell from "../components/archive/ArchiveShell";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import archiveStylesUrl from "../styles/archive.css?url";
import archiveIndexesStylesUrl from "../styles/archive-indexes.css?url";
import archiveSearchStylesUrl from "../styles/archive-search.css?url";

export const links = () => [
  { rel: "stylesheet", href: archiveStylesUrl },
  { rel: "stylesheet", href: archiveIndexesStylesUrl },
  { rel: "stylesheet", href: archiveSearchStylesUrl },
];

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
    const allItems: readonly ArchiveItem[] = archiveContent.items;

    return allItems.filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        item.title.zh,
        item.title.en,
        ...item.creators,
        item.year ?? "",
        ...item.tags,
        item.summary?.zh ?? "",
        item.summary?.en ?? "",
        item.note?.zh ?? "",
        item.note?.en ?? "",
        ...(item.facts?.flatMap((fact) => [
          fact.label.zh,
          fact.label.en,
          fact.value.zh,
          fact.value.en,
        ]) ?? []),
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

  const kinds = getArchiveKinds().filter(({ count }) => count > 0);
  const years = getArchiveYears();
  const tags = getArchiveTags();

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

      <section className="archive-facets" aria-label="Browse archive indexes">
        <div>
          <h2>{language === "zh" ? "类型" : "Types"}</h2>
          <ul>
            {kinds.map(({ value, count }) => (
              <li key={value}>
                <Link to={`/archive/type/${encodeURIComponent(value)}`}>
                  {value} <span>{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>{language === "zh" ? "年份" : "Years"}</h2>
          <ul>
            {years.map(({ value, count }) => (
              <li key={value}>
                <Link to={`/archive/year/${encodeURIComponent(value)}`}>
                  {value} <span>{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>{language === "zh" ? "标签" : "Tags"}</h2>
          <ul>
            {tags.map(({ value, count }) => (
              <li key={value}>
                <Link to={`/archive/tag/${encodeURIComponent(value)}`}>
                  #{value} <span>{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="archive-grid" aria-live="polite">
        {items.map((item) => (
          <ArchiveCard key={item.id} item={item} language={language} />
        ))}
      </section>
    </ArchiveShell>
  );
}
