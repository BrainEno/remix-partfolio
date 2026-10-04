import type { Dispatch, ReactNode, SetStateAction } from "react";
import { NavLink } from "react-router";
import { archiveContent } from "../../archive/content";
import { portfolioContent } from "../../portfolio/content";
import type { Language, LocalizedText } from "../../portfolio/types";

interface ArchiveShellProps {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  title: string;
  description?: string;
  children: ReactNode;
}

function text(value: LocalizedText, language: Language) {
  return value[language];
}

export default function ArchiveShell({
  language,
  setLanguage,
  title,
  description,
  children,
}: ArchiveShellProps) {
  return (
    <div className="archive-page" data-archive-template="ready">
      <header className="archive-header">
        <NavLink to="/" className="archive-brand">
          {portfolioContent.identity.displayName}
        </NavLink>

        <nav className="archive-nav" aria-label="Archive navigation">
          <NavLink
            to="/archive"
            className={({ isActive }) =>
              isActive ? "archive-nav-link is-active" : "archive-nav-link"
            }
          >
            {text(archiveContent.labels.archive, language)}
          </NavLink>
          <NavLink
            to="/lists"
            className={({ isActive }) =>
              isActive ? "archive-nav-link is-active" : "archive-nav-link"
            }
          >
            {text(archiveContent.labels.lists, language)}
          </NavLink>
          <NavLink to="/" className="archive-nav-link">
            {text(archiveContent.labels.home, language)}
          </NavLink>
        </nav>

        <div className="archive-language" aria-label="Language">
          <button
            type="button"
            data-language="zh"
            className={language === "zh" ? "is-active" : undefined}
            aria-pressed={language === "zh"}
            onClick={() => setLanguage("zh")}
          >
            中文
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            data-language="en"
            className={language === "en" ? "is-active" : undefined}
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
        </div>
      </header>

      <main className="archive-main">
        <section className="archive-title-block">
          <p className="archive-kicker">Archive / Lists / Media</p>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </section>
        {children}
      </main>
    </div>
  );
}
