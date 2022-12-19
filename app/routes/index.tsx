import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import homeStylesUrl from "~/styles/index.css";
import locomotiveStylesUrl from "locomotive-scroll/dist/locomotive-scroll.css";
import Intro from "../components/Intro";
import Header from "../components/Header";
import { getInfroListItems } from "../models/work.server";
import Partifolio from "../components/Partfolio";
import Contact from "../components/Contact";
import { langCookie } from "../cookies";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useInView } from "framer-motion";
import { useLocomotiveScroll } from "react-locomotive-scroll";
import ScrollToPlugin from "gsap/dist/ScrollToPlugin";
import { ClientOnly } from "remix-utils";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStylesUrl },
  { rel: "stylesheet", href: locomotiveStylesUrl },
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
  gsap.registerPlugin([ScrollToPlugin]);
  const { scroll } = useLocomotiveScroll();
  const [section, setSection] = useState<SectionOptions>("intro");
  const { lang } = useLoaderData<LoaderData>();
  const [language, setLanguage] = useState<Language>(lang ?? "zh");
  const introRef = useRef<HTMLDivElement | null>(null);
  const partfolioRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  
  const introInView = useInView(introRef, {
    margin: "20px",
  });
  const partfolioInView = useInView(partfolioRef, {
    margin: "0px",
  });
  const contactInView = useInView(contactRef, {
    margin: "0px",
  });

  const isZh = language === "zh";

  const handleIntro = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setSection("intro");
      scroll && scroll.scrollTo("#intro");
    },
    [scroll]
  );

  const handlePartfolio = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setSection("partfolio");
      scroll && scroll.scrollTo("#partfolio");
    },
    [scroll]
  );

  const handleContact = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setSection("contact");
      scroll && scroll.scrollTo("#contact");
    },
    [scroll]
  );

  useEffect(() => {
    if (scroll) {
      scroll.on("scroll", () => {
        if (introInView && !partfolioInView) {
          setSection("intro");
        } else if (partfolioInView && !contactInView) {
          setSection("partfolio");
        } else if (contactInView) {
          setSection("contact");
        }
      });
    }
  }, [contactInView, introInView, partfolioInView, scroll]);

  useEffect(() => {});

  return (
    <div className="page-home">
      <Header
        lang={language}
        setLanguage={setLanguage}
        section={section}
        handleIntro={handleIntro}
        handlePartfolio={handlePartfolio}
        handleContact={handleContact}
      />
      <div id="home">
        <Intro isZh={isZh} ref={introRef} />
        <Partifolio isZh={isZh} ref={partfolioRef} />
        <Contact isZh={isZh} ref={contactRef} />
      </div>
    </div>
  );
}
