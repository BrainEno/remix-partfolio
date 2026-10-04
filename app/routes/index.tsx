import { useCallback, useEffect, useRef, useState } from "react";
import homeStylesUrl from "~/styles/index.css?url";
import Contact from "../components/Contact";
import Header from "../components/Header";
import Intro from "../components/Intro";
import Partifolio from "../components/Partfolio";
import { localize, portfolioContent } from "../portfolio/content";
import type { Language, PortfolioSection } from "../portfolio/types";
import { setupMobileChoreography } from "../scroll/mobile-choreography.client";
import {
  scrollToPortfolioSection,
  setupPortfolioScroll,
} from "../scroll/portfolio-scroll.client";

export const links = () => [{ rel: "stylesheet", href: homeStylesUrl }];

const LANGUAGE_STORAGE_KEY = "portfolio-language";

export default function Index() {
  const works = portfolioContent.works.items;
  const [section, setSection] = useState<PortfolioSection>("intro");
  const [language, setLanguage] = useState<Language>("zh");
  const [languageReady, setLanguageReady] = useState(false);
  const [activeWorkIndex, setActiveWorkIndex] = useState(-1);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isZh = language === "zh";

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage === "zh" || storedLanguage === "en") {
        setLanguage(storedLanguage);
      }
    } catch {
      // Storage can be unavailable in restrictive/private browser contexts.
    } finally {
      setLanguageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!languageReady) return;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The in-memory language switch still works when storage is unavailable.
    }

    document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
    document.title = localize(portfolioContent.identity.pageTitle, language);
  }, [language, languageReady]);

  const handleWorkPreview = useCallback(
    (index: number) => {
      if (index < -1 || index >= works.length) return;
      setActiveWorkIndex((current) => (current === index ? current : index));
    },
    [works.length]
  );

  useEffect(() => {
    if (!languageReady) return;

    const scope = pageRef.current;
    if (!scope || !setupPortfolioScroll) return;

    scope.dataset.scrollRuntime = "initializing";

    try {
      const cleanupBase = setupPortfolioScroll({
        scope,
        isZh,
        onSectionChange: setSection,
        onWorkPreview: handleWorkPreview,
      });
      const cleanupMobile = setupMobileChoreography({
        scope,
        onWorkPreview: handleWorkPreview,
      });
      scope.dataset.scrollRuntime = "ready";

      return () => {
        cleanupMobile?.();
        cleanupBase?.();
        delete scope.dataset.scrollRuntime;
      };
    } catch (error) {
      scope.dataset.scrollRuntime = "error";
      console.error("Portfolio scroll runtime failed to initialize", error);
    }
  }, [handleWorkPreview, isZh, languageReady]);

  const handleNavigate = useCallback((target: PortfolioSection) => {
    setSection(target);
    scrollToPortfolioSection(target);
  }, []);

  return (
    <div
      className="page-home"
      ref={pageRef}
      data-portfolio-template="ready"
      data-language-ready={languageReady ? "true" : "false"}
    >
      <Header
        lang={language}
        setLanguage={setLanguage}
        section={section}
        content={portfolioContent}
        onNavigate={handleNavigate}
      />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div id="home">
            <Intro lang={language} content={portfolioContent} />
            <Partifolio
              lang={language}
              content={portfolioContent.works}
              activeWorkIndex={activeWorkIndex}
              onWorkPreview={handleWorkPreview}
            />
            <Contact lang={language} content={portfolioContent.contact} />
          </div>
        </div>
      </div>
    </div>
  );
}
