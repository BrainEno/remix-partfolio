import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import type { MouseEvent } from "react";
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
import { useContext } from "react";
import {
  LocomotiveScrollProvider,
  useLocomotiveScroll,
} from "react-locomotive-scroll";
import Partifolio from "../components/Partfolio";
import Contact from "../components/Contact";
import { lngCookie } from "../cookies";

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
  imageUri:string;
  groupName: string;
  groupTitle: string;
};

export type LoaderData = {
  lng: Language;
  works: IntroItem[];
};

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const works = (await getInfroListItems()) ?? [];
  console.log(works[0].imageUri);
  const cookieHeader = request.headers.get("Cookie");
  const { lng } = (await lngCookie.parse(cookieHeader)) || { lng: "zh" };
  return json({ lng, works });
};

export const action = async ({ request }: ActionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await lngCookie.parse(cookieHeader)) || { lng: "zh" };
  const formData = await request.formData();

  console.log("formData:", Object.fromEntries(formData));

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
  const { pathname } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scroll } = useLocomotiveScroll();
  const [section, setSection] = useState<SectionOptions>("intro");
  const { lng } = useLoaderData<LoaderData>();
  const [language,setLanguage]=useState<Language>(lng??"zh")

  const handleIntro = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    scroll && scroll.scrollTo("#intro");
    setSection("intro");
  };
  const handlePartfolio = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    scroll && scroll.scrollTo("#partfolio");
    setSection("partfolio");
  };
  const handleContact = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    scroll && scroll.scrollTo("#contact");
    setSection("contact");
  };

  return (
    <LocomotiveScrollProvider
      options={{ smooth: true }}
      watch={[pathname]}
      containerRef={containerRef}
      onUpdate={() => console.log("Updated,but not on location change!")}
    >
      <div className="page-home">
        <Header
          lng={language}
          setLanguage={setLanguage}
          section={section}
          handleIntro={handleIntro}
          handlePartfolio={handlePartfolio}
          handleContact={handleContact}
        />
        <div data-scroll-container ref={containerRef}>
          <Intro lng={language} />
          <Partifolio />
          <Contact />
        </div>
      </div>
    </LocomotiveScrollProvider>
  );
}
