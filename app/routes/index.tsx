import { useCallback, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/index";
import homeStylesUrl from "~/styles/index.css?url";
import Contact from "../components/Contact";
import Header from "../components/Header";
import Intro from "../components/Intro";
import Partifolio from "../components/Partfolio";
import { langCookie } from "../cookies";
import { portfolioContent } from "../portfolio/content";
import type { Language, PortfolioSection } from "../portfolio/types";
import { setupMobileChoreography } from "../scroll/mobile-choreography.client";
import {
  scrollToPortfolioSection,
  setupPortfolioScroll,
} from "../scroll/portfolio-scroll.client";

export const links = () => [{ rel: "stylesheet", href: homeStylesUrl }];

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");

  try {
    const cookie = await langCookie.parse(cookieHeader);
    const lang: Language = cookie?.lang === "en" ? "en" : "zh";
    return { lang };
  } catch {
    return { lang: "zh" as Language };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await langCookie.parse(cookieHeader)) || { lang: "zh" };
  const formData = await request.formData();
  const requestedLang = formData.get("lang");

  if (requestedLang === "zh" || requestedLang === "en") {
    cookie.lang = requestedLang;
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": await langCookie.serialize(cookie),
    },
  });
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { lang } = loaderData;
  const works = portfolioContent.works.items;
  const [section, setSection] = useState<PortfolioSection>("intro");
  const [language, setLanguage] = useState<Language>(lang ?? "zh");
  const [activeWorkIndex, setActiveWorkIndex] = useState(-1);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isZh = language === "zh";

  const handleWorkPreview = useCallback(
    (index: number) => {
      if (index < -1 || index >= works.length) return;
      setActiveWorkIndex((current) => (current === index ? current : index));
    },
    [works.length]
  );

  useEffect(() => {
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
  }, [handleWorkPreview, isZh]);

  const handleNavigate = useCallback((target: PortfolioSection) => {
    setSection(target);
    scrollToPortfolioSection(target);
  }, []);

  return (
    <div className="page-home" ref={pageRef}>
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
