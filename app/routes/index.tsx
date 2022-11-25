import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MouseEvent, useLayoutEffect } from "react";
import { useEffect, useRef, useState } from "react";
import { useOptionalUser } from "~/utils";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import homeStylesUrl from "~/styles/index.css";
import Intro from "../components/Intro";
import Header from "../components/Header";
import { getInfroListItems } from "../models/work.server";
import Partifolio from "../components/Partfolio";
import Contact from "../components/Contact";
import { lngCookie } from "../cookies";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import ScrollToPlugin from "gsap/dist/ScrollToPlugin";
import { useInView } from "framer-motion";
import { useLocomotiveScroll } from "react-locomotive-scroll";

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
  const { lang } = (await lngCookie.parse(cookieHeader)) || { lang: "zh" };
  return json({ lang, works });
};

export const action = async ({ request }: ActionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await lngCookie.parse(cookieHeader)) || { lang: "zh" };
  const formData = await request.formData();

  if (formData.get("lang")) {
    cookie.lang = formData.get("lang");
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await lngCookie.serialize(cookie),
    },
  });
};

export default function Index() {
  const { scroll, isReady } = useLocomotiveScroll();
  const [section, setSection] = useState<SectionOptions>("intro");
  const { lang } = useLoaderData<LoaderData>();
  const [language, setLanguage] = useState<Language>(lang ?? "zh");
  const introRef = useRef<HTMLDivElement | null>(null);
  const partfolioRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  const handleIntro = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isReady && scroll.scrollTo("#intro");
    setSection("intro");
  };

  const handlePartfolio = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isReady && scroll.scrollTo("#partfolio");
    setSection("partfolio");
  };

  const handleContact = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isReady && scroll.scrollTo("#contact");
    setSection("contact");
  };

  useEffect(() => {
    if (gsap) {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      scroll.on("call", (sec: any) => {
        console.log(sec);
        switch (sec) {
          case "intro":
            setSection("intro");
            break;
          case "partfolio":
            setSection("partfolio");
            break;
          case "contact":
            setSection("contact");
            break;
        }
      });
    }
  }, [isReady, scroll]);

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
      <div>
        <Intro lang={language} ref={introRef}/>
        <Partifolio lang={language} ref={partfolioRef} />
        <Contact ref={contactRef} />
      </div>
    </div>
  );
}
