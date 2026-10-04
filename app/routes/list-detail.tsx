import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { archiveContent } from "../archive/content";
import { getArchiveList, resolveArchiveList } from "../archive/catalog";
import ArchiveCard from "../components/archive/ArchiveCard";
import ArchiveShell from "../components/archive/ArchiveShell";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import archiveStylesUrl from "../styles/archive.css?url";

export const links = () => [{ rel: "stylesheet", href: archiveStylesUrl }];

export default function ListDetailRoute() {
  const { listId = "" } = useParams();
  const list = getArchiveList(listId);
  const { language, setLanguage, languageReady } = useSiteLanguage();

  useEffect(() => {
    if (!languageReady || !list) return;
    document.title = `${list.title[language]} — ${archiveContent.labels.lists[language]}`;
  }, [language, languageReady, list]);

  if (!list) {
    return (
      <ArchiveShell
        language={language}
        setLanguage={setLanguage}
        title="404"
        description="List not found."
      >
        <Link to="/lists" className="archive-back-link">
          ← {archiveContent.labels.backToLists[language]}
        </Link>
      </ArchiveShell>
    );
  }

  const rankedItems = resolveArchiveList(list);

  return (
    <ArchiveShell
      language={language}
      setLanguage={setLanguage}
      title={list.title[language]}
      description={list.description?.[language]}
    >
      <section className="archive-ranked-list">
        {rankedItems.map(({ rank, entry, item }) => (
          <ArchiveCard
            key={item.id}
            item={item}
            language={language}
            rank={rank}
            note={entry.note?.[language]}
          />
        ))}
      </section>

      <Link to="/lists" className="archive-back-link">
        ← {archiveContent.labels.backToLists[language]}
      </Link>
    </ArchiveShell>
  );
}
