import type { LinksFunction } from "@remix-run/node";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import type { MouseEvent} from "react";
import { useState } from "react";
import { useOptionalUser } from "~/utils";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import homeStylesUrl from "~/styles/index.css";
import classNames from "classnames";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStylesUrl },
];

type Lng = { nativeName: string };
type SectionOptions = "intro" | "partfolio" | "contact";

type LoaderData = {
  lngs: Record<string, Lng>;
};

export const loader: LoaderFunction = async () => {
  return json({
    lngs: {
      en: { nativeName: "English" },
      zh: { nativeName: "中文" },
    },
  });
};

export default function Index() {
  const user = useOptionalUser();
  const { lngs } = useLoaderData<LoaderData>();
  const [section, setSection] = useState<SectionOptions>("intro");

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
      <header className="header">
        {Object.keys(lngs).map((lng) => (
          <Link key={lng} to={`/${lng}`}>
            {lngs[lng].nativeName}
          </Link>
        ))}
        <NavLink to="/" className="header-link">
          SydeyZhao
        </NavLink>
        <nav className="nav">
          <div
            className={classNames("nav-entry", {
              "nav-active": section === "intro",
            })}
            onClick={handleIntro}
          >
            <div className="nav-entry-bg"></div>
            <span className="nav-entry-text">Intro</span>
          </div>
          <div
            className={classNames("nav-entry", {
              "nav-active": section === "partfolio",
            })}
            onClick={handlePartfolio}
          >
            <div className="nav-entry-bg"></div>
            <span className="nav-entry-text">Partfolio</span>
          </div>
          <div
            className={classNames("nav-entry", {
              "nav-active": section === "contact",
            })}
            onClick={handleContact}
          >
            <div className="nav-entry-bg"></div>
            <span className="nav-entry-text">Contact</span>
          </div>
        </nav>
      </header>
      <div>
        <div id="intro" className="section">
          <div className="container">
            <div className="intro headline">
              <h1>Drama</h1>
              <h1>Movie</h1>
              <h1>Performance Art</h1>
            </div>
            <p>
              Sydney Zhao is an actor and a performance artist based in Wuhan.
              She holds a BA in economics from Dickinson College in
              Pennsylvania, USA and studied at the American Conservatory
              Theater. She has appeared in several theatre productions and art
              festivals. Her stage appearances include Plague (Hong Kong Art
              Festival), The Hairy Ape (Johoo Theatre), Wuhan Puzzle (So What
              Original) and Seeing You Through The River (The ONE International
              Women's Film Festival). Her performances were featured at Guyu
              Action [X-CFCA] and the Cement Park Art Festival (Sowerart), where
              at the latter she also worked as a curator.
            </p>
            <p>
              She would continue her journey exploring art, human body movement
              and mind, through process-oriented action in the form of drama,
              dance and performance art. She is currently working on a
              performance art project which involves certain concepts of the
              Feldenkrais Method and of the healing arts of Esalen Massage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
