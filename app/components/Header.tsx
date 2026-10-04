import classNames from "classnames";
import React from "react";
import { NavLink } from "react-router";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { localize } from "~/portfolio/content";
import { MOBILE_MEDIA_QUERY } from "~/portfolio/media";
import type {
  Language,
  PortfolioContent,
  PortfolioSection,
} from "~/portfolio/types";

interface HeaderProps {
  lang: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  section: PortfolioSection;
  content: Pick<PortfolioContent, "identity" | "navigation">;
  onNavigate: (section: PortfolioSection) => void;
}

const sections: readonly PortfolioSection[] = ["intro", "partfolio", "contact"];

const Header: React.FC<HeaderProps> = ({
  lang,
  setLanguage,
  section,
  content,
  onNavigate,
}) => {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  return (
    <header className="header">
      <div className="header-left">
        <NavLink
          to="/"
          className="header-link"
          aria-label={content.identity.displayName}
        >
          <span className="header-reveal">{content.identity.displayName}</span>
        </NavLink>

        <div className="lang-switch" aria-label="Language">
          <button
            type="button"
            data-language="zh"
            onClick={() => setLanguage("zh")}
            className={classNames("lang zh header-reveal", {
              "lang-selected": lang === "zh",
            })}
            aria-pressed={lang === "zh"}
          >
            {isMobile ? "Zh" : "中文"}
          </button>
          <span className="header-reveal" aria-hidden="true">
            {" "}|{" "}
          </span>
          <button
            type="button"
            data-language="en"
            onClick={() => setLanguage("en")}
            className={classNames("lang header-reveal", {
              "lang-selected": lang === "en",
            })}
            aria-pressed={lang === "en"}
          >
            {isMobile ? "En" : "English"}
          </button>
        </div>
      </div>

      <nav className="nav" aria-label="Portfolio sections">
        {sections.map((target) => (
          <button
            key={target}
            type="button"
            className={classNames("nav-entry", {
              "nav-active": section === target,
            })}
            onClick={() => onNavigate(target)}
            aria-current={section === target ? "page" : undefined}
          >
            <span className="nav-entry-bg" aria-hidden="true" />
            <span className="nav-entry-text">
              {localize(content.navigation[target], lang)}
            </span>
          </button>
        ))}
      </nav>
    </header>
  );
};

export default React.memo(Header);
