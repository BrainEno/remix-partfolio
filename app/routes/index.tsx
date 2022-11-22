import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { MouseEvent, ReactNode, RefObject, useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useOptionalUser } from "~/utils";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import homeStylesUrl from "~/styles/index.css";
import locomotiveStyles from "locomotive-scroll/dist/locomotive-scroll.css";
import Intro from "../components/Intro";
import Header from "../components/Header";
import { getInfroListItems } from "../models/work.server";
import {
  LocomotiveScrollProvider,
  useLocomotiveScroll,
  Scroll,
} from "react-locomotive-scroll";
import Partifolio from "../components/Partfolio";
import Contact from "../components/Contact";
import { lngCookie } from "../cookies";
import { useForwardedRef } from "~/hooks/useForwardedRef";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStylesUrl },
  { rel: "stylesheet", href: locomotiveStyles },
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
  lng: Language;
  works: IntroItem[];
};

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const works = (await getInfroListItems()) ?? [];
  const cookieHeader = request.headers.get("Cookie");
  const { lng } = (await lngCookie.parse(cookieHeader)) || { lng: "zh" };
  return json({ lng, works });
};

export const action = async ({ request }: ActionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await lngCookie.parse(cookieHeader)) || { lng: "zh" };
  const formData = await request.formData();

  if (formData.get("lng")) {
    cookie.lng = formData.get("lng");
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await lngCookie.serialize(cookie),
    },
  });
};

export default function Index() {
  const user = useOptionalUser();
  const { scroll, isReady } = useLocomotiveScroll();
  const [section, setSection] = useState<SectionOptions>("intro");
  const { lng } = useLoaderData<LoaderData>();
  const [language, setLanguage] = useState<Language>(lng ?? "zh");
  const introRef = useRef<HTMLDivElement | null>(null);
  const partfolioRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  const handleIntro = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const introSec = introRef.current;
    isReady && scroll.scrollTo(introSec);
    setSection("intro");
  };

  const handlePartfolio = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const partfolioSec = partfolioRef.current;
    isReady && scroll.scrollTo(partfolioSec);
    setSection("partfolio");
  };

  const handleContact = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const contactSec = contactRef.current;
    isReady && scroll.scrollTo(contactSec);
    setSection("contact");
  };

  useEffect(() => {
    if (isReady) {
      scroll.on("call", (args: any) => {
        console.log("scroll args", args);
      });
    }
  });

  return (
    <div className="page-home">
      <Header
        lng={language}
        setLanguage={setLanguage}
        section={section}
        handleIntro={handleIntro}
        handlePartfolio={handlePartfolio}
        handleContact={handleContact}
      />
      <div>
        <Intro lng={language} ref={introRef} setSection={setSection} />
        <Partifolio lng={lng} ref={partfolioRef} />
        <Contact ref={contactRef} />
      </div>
    </div>
  );
}
