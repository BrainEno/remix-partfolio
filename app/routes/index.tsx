import type { LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { useOptionalUser } from "~/utils";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import homeStylesUrl from "~/styles/index.css";
import Intro from "../components/Intro";
import Header from "../components/Header";
import { getInfroListItems } from "../models/work.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStylesUrl },
];

export type Language = "zh" | "en";
export type SectionOptions = "intro" | "partfolio" | "contact";
type IntroItem = {
  id: string;
  name: string;
  title: string;
  date: string;
  groupName: string;
  groupTitle: string;
};

type LoaderData = {
  lng: Language;
  works: IntroItem[];
};

export const loader: LoaderFunction = async () => {
  const works = await getInfroListItems();
  console.log("works in loader", works);
  return json({ lng: "zh", works });
};

export default function Index() {
  const user = useOptionalUser();
  const [section, setSection] = useState<SectionOptions>("intro");
  const { lng } = useLoaderData<LoaderData>();

  const handleIntro = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    setSection("intro");
  };
  const handlePartfolio = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("first");
    setSection("partfolio");
  };
  const handleContact = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSection("contact");
  };

  return (
    <div className="page-home">
      <div>
        <Header
          lng={lng}
          section={section}
          handleIntro={handleIntro}
          handlePartfolio={handlePartfolio}
          handleContact={handleContact}
        />
        <Intro lng={lng} />
      </div>
    </div>
  );
}
