import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MouseEvent } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import homeStylesUrl from "~/styles/index.css?url";
import Intro from "../components/Intro";
import Header from "../components/Header";
import { getInfroListItems } from "../models/work.server";
import Partifolio from "../components/Partfolio";
import Contact from "../components/Contact";
import { langCookie } from "../cookies";
import {
  scrollToPortfolioSection,
  setupPortfolioScroll,
} from "../scroll/portfolio-scroll";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStylesUrl },
];

export type Language = "zh" | "en";
export type SectionOptions = "intro" | "partfolio" | "contact";
export type IntroItem = {
  id: string;
  name: string;
  title: string;
  date: string;
  imageUri: string;
  groupName: string;
  groupTitle: string;
};

export type LoaderData = {
  lang: Language;
  works: IntroItem[];
};

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const works = (await getInfroListItems()) ?? [];
  const cookieHeader = request.headers.get("Cookie");
  let lang: string = "zh";
  try {
    const cookie = await langCookie.parse(cookieHeader);
    if (cookie.lang) {
      lang = cookie.lang;
    }
  } catch (error) {
    return json({ lang, works });
  }
  return json({ lang, works });
};

export const action = async ({ request }: ActionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await langCookie.parse(cookieHeader)) || { lang: "zh" };
  const formData = await request.formData();

  if (formData.get("lang")) {
    cookie.lang = formData.get("lang");
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await langCookie.serialize(cookie),
    },
  });
};

export default function Index() {
  const [section, setSection] = useState<SectionOptions>("intro");
  const { lang } = useLoaderData<LoaderData>();
  const [language, setLanguage] = useState<Language>(lang ?? "zh");
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isZh = language === "zh";

  useLayoutEffect(() => {
    const scope = pageRef.current;
    if (!scope) return;

    return setupPortfolioScroll({
      scope,
      isZh,
      onSectionChange: setSection,
    });
  }, [isZh]);

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
            <Partifolio isZh={isZh} />
            <Contact isZh={isZh} />
          </div>
        </div>
      </div>
    </div>
  );
}
