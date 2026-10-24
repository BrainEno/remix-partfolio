import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { archiveContent } from "../archive/content";
import { getArchiveItem, resolveArchiveCreators } from "../archive/catalog";
import ArchiveShell from "../components/archive/ArchiveShell";
import MediaPreview from "../components/archive/MediaPreview";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import archiveStylesUrl from "../styles/archive.css?url";
import archiveIndexesStylesUrl from "../styles/archive-indexes.css?url";

export const links = () => [
  { rel: "stylesheet", href: archiveStylesUrl },
  { rel: "stylesheet", href: archiveIndexesStylesUrl },
];

export default function ArchiveItemRoute() {
  const { itemId = "" } = useParams();
  const item = getArchiveItem(itemId);
  const { language, setLanguage, languageReady } = useSiteLanguage();
  const creators = item ? resolveArchiveCreators(item) : [];

  useEffect(() => {
    if (!languageReady || !item) return;
    document.title = `${item.title[language]} — ${archiveContent.identity.title[language]}`;
  }, [item, language, languageReady]);

  if (!item) {
    return (
      <ArchiveShell
        language={language}
        setLanguage={setLanguage}
        title="404"
        description="Archive item not found."
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
      title={item.title[language]}
      description={creators.map((creator) => creator.name[language]).join(" · ")}
    >
      <article className="archive-detail">
        <div className="archive-detail-meta">
          <Link to={`/archive/type/${item.kind}`}>{item.kind.toUpperCase()}</Link>
          {item.year ? (
            <Link to={`/archive/year/${encodeURIComponent(item.year)}`}>{item.year}</Link>
          ) : null}
          {item.demo ? <span>TEMPLATE DATA</span> : null}
        </div>

        <div className="archive-detail-creators" aria-label="Creators">
          {creators.map((creator) => (
            <Link key={creator.id} to={`/archive/creator/${creator.id}`}>
              {creator.name[language]}
            </Link>
          ))}
        </div>

        {item.image ? (
          <figure className="archive-detail-image">
            <img
              src={item.image.src}
              alt={item.image.alt[language]}
              decoding="async"
            />
          </figure>
        ) : null}

        {item.facts && item.facts.length > 0 ? (
          <dl className="archive-detail-facts">
            {item.facts.map((fact) => (
              <div key={`${fact.label.en}-${fact.value.en}`}>
                <dt>{fact.label[language]}</dt>
                <dd>{fact.value[language]}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {item.summary ? <p className="archive-detail-copy">{item.summary[language]}</p> : null}
        {item.note ? <p className="archive-detail-note">{item.note[language]}</p> : null}

        {item.kind === "audio" || item.kind === "video" ? (
          <MediaPreview item={item} language={language} />
        ) : null}

        {item.externalUrl ? (
          <a
            className="archive-external-link"
            href={item.externalUrl}
            target="_blank"
            rel="noreferrer"
          >
            {archiveContent.labels.externalLink[language]} ↗
          </a>
        ) : null}

        <ul className="archive-detail-tags" aria-label="Tags">
          {item.tags.map((tag) => (
            <li key={tag}>
              <Link to={`/archive/tag/${encodeURIComponent(tag)}`}>#{tag}</Link>
            </li>
          ))}
        </ul>

        <Link to="/archive" className="archive-back-link">
          ← {archiveContent.labels.backToArchive[language]}
        </Link>
      </article>
    </ArchiveShell>
  );
}
