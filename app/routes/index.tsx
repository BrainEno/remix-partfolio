import type { MouseEvent } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/index";
import homeStylesUrl from "~/styles/index.css?url";
import Contact from "../components/Contact";
import Header from "../components/Header";
import Intro from "../components/Intro";
import Partifolio from "../components/Partfolio";
import { langCookie } from "../cookies";
import { getInfroListItems } from "../models/work.server";
import type { Language, PortfolioSection } from "../portfolio/types";
import {
  scrollToPortfolioSection,
  setupPortfolioScroll,
} from "../scroll/portfolio-scroll";

export const links = () => [{ rel: "stylesheet", href: homeStylesUrl }];

export async function loader({ request }: Route.LoaderArgs) {
  const works = (await getInfroListItems()) ?? [];
  const cookieHeader = request.headers.get("Cookie");

  try {
    const cookie = await langCookie.parse(cookieHeader);
    const lang: Language = cookie?.lang === "en" ? "en" : "zh";
    return { lang, works };
  } catch {
    return { lang: "zh" as Language, works };
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

  return redirect("/", {
    headers: {
      "Set-Cookie": await langCookie.serialize(cookie),
    },
  });
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { lang, works } = loaderData;
  const [section, setSection] = useState<PortfolioSection>("intro");
  const [language, setLanguage] = useState<Language>(lang ?? "zh");
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isZh = language === "zh";

  const handleWorkPreview = useCallback(
    (index: number) => {
      if (index < 0 || index >= works.length) return;
      setActiveWorkIndex((current) => (current === index ? current : index));
    },
    [works.length]
  );

  useLayoutEffect(() => {
    const scope = pageRef.current;
    if (!scope) return;

    return setupPortfolioScroll({
      scope,
      isZh,
      onSectionChange: setSection,
      onWorkPreview: handleWorkPreview,
    });
  }, [handleWorkPreview, isZh]);

  const handleIntro = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSection("intro");
    scrollToPortfolioSection("intro");
  }, []);

  const handlePartifolio = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSection("partfolio");
    scrollToPortfolioSection("partfolio");
  }, []);

  const handleContact = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSection("contact");
    scrollToPortfolioSection("contact");
  }, []);

  return (
    <div className="page-home" ref={pageRef}>
      <Header
        lang={language}
        setLanguage={setLanguage}
        section={section}
        handleIntro={handleIntro}
        handlePartfolio={handlePartifolio}
        handleContact={handleContact}
      />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div id="home">
            <Intro isZh={isZh} />
            <Partifolio
              isZh={isZh}
              works={works}
              activeWorkIndex={activeWorkIndex}
              onWorkPreview={handleWorkPreview}
            />
            <Contact isZh={isZh} />
          </div>
        </div>
      </div>
    </div>
  );
}
