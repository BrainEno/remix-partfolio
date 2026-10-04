import { Link } from "react-router";
import type { ArchiveItem } from "../../archive/types";
import type { Language } from "../../portfolio/types";

interface ArchiveCardProps {
  item: ArchiveItem;
  language: Language;
  rank?: number;
  note?: string;
}

export default function ArchiveCard({
  item,
  language,
  rank,
  note,
}: ArchiveCardProps) {
  return (
    <article className="archive-card" data-archive-kind={item.kind}>
      <Link to={`/archive/${item.id}`} className="archive-card-link">
        <div className="archive-card-index" aria-hidden="true">
          {rank ? String(rank).padStart(2, "0") : item.kind.toUpperCase()}
        </div>

        <div className="archive-card-body">
          <div className="archive-card-meta">
            <span>{item.kind}</span>
            {item.year ? <span>{item.year}</span> : null}
            {item.demo ? <span>template data</span> : null}
          </div>
          <h2>{item.title[language]}</h2>
          <p className="archive-card-creators">{item.creators.join(" · ")}</p>
          {item.summary ? (
            <p className="archive-card-summary">{item.summary[language]}</p>
          ) : null}
          {note ? <p className="archive-card-note">{note}</p> : null}
          {item.tags.length > 0 ? (
            <ul className="archive-card-tags" aria-label="Tags">
              {item.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="archive-card-visual" aria-hidden={item.image ? undefined : true}>
          {item.image ? (
            <img
              src={item.image.src}
              alt={item.image.alt[language]}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span>{item.kind}</span>
          )}
        </div>
      </Link>
    </article>
  );
}
