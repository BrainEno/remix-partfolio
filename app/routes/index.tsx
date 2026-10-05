import { useCallback, useEffect, useRef, useState } from "react";
import homeStylesUrl from "~/styles/index.css?url";
import { archiveContent } from "../archive/content";
import Contact from "../components/Contact";
import Header from "../components/Header";
import Intro from "../components/Intro";
import Partifolio from "../components/Partfolio";
import { useSiteLanguage } from "../hooks/useSiteLanguage";
import { localize, portfolioContent } from "../portfolio/content";
import type { PortfolioSection } from "../portfolio/types";
import { setupDesktopWorksChoreography } from "../scroll/desktop-works-choreography.client";
import { setupMobileChoreography } from "../scroll/mobile-choreography.client";
import {
  scrollToPortfolioSection,
  setupPortfolioScroll,
} from "../scroll/portfolio-scroll.client";

export const links = () => [{ rel: "stylesheet", href: homeStylesUrl }];

export default function Index() {
  const works = portfolioContent.works.items;
  const [section, setSection] = useState<PortfolioSection>("intro");
  const { language, setLanguage, languageReady } = useSiteLanguage();
  const [activeWorkIndex, setActiveWorkIndex] = useState(-1);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isZh = language === "zh";

  useEffect(() => {
    if (!languageReady) return;
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
      const cleanupDesktop = setupDesktopWorksChoreography({
        scope,
        onWorkPreview: handleWorkPreview,
      });
      scope.dataset.scrollRuntime = "ready";

      return () => {
        cleanupDesktop?.();
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
        archiveLabel={localize(archiveContent.labels.archive, language)}
        onNavigate={handleNavigate}
      />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div id="home">
            <Intro lang={language} content={portfolioContent} />
            <Partifolio
              lang={language}
              content={portfolioContent.works}
              contactPhone={portfolioContent.contact.phone}
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
