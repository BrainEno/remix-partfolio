import { useEffect } from "react";
import { Link } from "react-router";
import { archiveContent } from "../archive/content";
import type { ArchiveList } from "../archive/types";
import ArchiveShell from "../components/archive/ArchiveShell";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import archiveStylesUrl from "../styles/archive.css?url";

export const links = () => [{ rel: "stylesheet", href: archiveStylesUrl }];

export default function ListsIndex() {
  const { language, setLanguage, languageReady } = useSiteLanguage();

  useEffect(() => {
    if (!languageReady) return;
    document.title = `${archiveContent.labels.lists[language]} — ${archiveContent.identity.title[language]}`;
  }, [language, languageReady]);

  return (
    <ArchiveShell
      language={language}
      setLanguage={setLanguage}
      title={archiveContent.labels.lists[language]}
      description={
        language === "zh"
          ? "按顺序保存年度榜、主题书单、电影十佳、声音档案或任何个人选择。"
          : "Ordered yearly lists, themed selections, top tens and personal canons."
      }
    >
      <section className="archive-lists-grid">
        {(archiveContent.lists as readonly ArchiveList[]).map((list) => (
          <article className="archive-list-card" key={list.id}>
            <Link to={`/lists/${list.id}`}>
              <div className="archive-list-card-meta">
                <span>{String(list.entries.length).padStart(2, "0")} items</span>
                {list.updatedAt ? <span>{list.updatedAt}</span> : null}
                {list.demo ? <span>template data</span> : null}
              </div>
              <h2>{list.title[language]}</h2>
              {list.description ? <p>{list.description[language]}</p> : null}
              <span className="archive-list-open">Open list →</span>
            </Link>
          </article>
        ))}
      </section>
    </ArchiveShell>
  );
}
