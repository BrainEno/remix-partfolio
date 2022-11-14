import { NavLink } from "@remix-run/react";
import classNames from "classnames";
import type { MouseEvent } from "react";
import React from "react";
import type { Language, SectionOptions } from "../routes";


interface HeaderProps {
  lng: Language;
  section:SectionOptions;
  handleIntro: (e:MouseEvent<HTMLDivElement>) => void;
  handlePartfolio: (e:MouseEvent<HTMLDivElement>) => void;
  handleContact: (e:MouseEvent<HTMLDivElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  lng,
  section,
  handleContact,
  handleIntro,
  handlePartfolio,
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <NavLink to="/" className="header-link">
          SydeyZhao
        </NavLink>
        <span className="lng-switch">
          <span className={classNames("lng zh", { "lng-selected": lng === "zh" })}>
            中文
          </span>
          <span> | </span>
          <span className={classNames("lng", { "lng-selected": lng === "en" })}>
            English
          </span>
        </span>
      </div>
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
  );
};

export default Header;
