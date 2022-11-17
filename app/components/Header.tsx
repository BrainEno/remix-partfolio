import { Form, NavLink} from "@remix-run/react";
import classNames from "classnames";
import type { MouseEvent } from "react";
import React from "react";
import type { Language, SectionOptions } from "../routes";
import { motion } from "framer-motion";

interface HeaderProps {
  lng: Language;
  section: SectionOptions;
  handleIntro: (e: MouseEvent<HTMLDivElement>) => void;
  handlePartfolio: (e: MouseEvent<HTMLDivElement>) => void;
  handleContact: (e: MouseEvent<HTMLDivElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  lng,
  section,
  handleContact,
  handleIntro,
  handlePartfolio,
}) => {
  const isZh = lng === "zh";

  return (
    <header className="header">
      <div className="header-left">
        <NavLink to="/" className="header-link">
          <motion.span
            initial={{
              opacity: 0,
            }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          >
            SydeyZhao
          </motion.span>
        </NavLink>
        <Form method="post" className="lng-switch">
          <button
            type="submit"
            name="lng"
            value="zh"
            className={classNames("lng zh", { "lng-selected": lng === "zh" })}
          >
            中文
          </button>
          <span> | </span>
          <button
            type="submit"
            name="lng"
            value="en"
            className={classNames("lng", { "lng-selected": lng === "en" })}
          >
            English
          </button>
        </Form>
      </div>
      <nav className="nav">
        <div
          className={classNames("nav-entry", {
            "nav-active": section === "intro",
          })}
          onClick={handleIntro}
        >
          <div className="nav-entry-bg"></div>
          <span className="nav-entry-text">{isZh ? "簡介" : "Intro"}</span>
        </div>
        <div
          className={classNames("nav-entry", {
            "nav-active": section === "partfolio",
          })}
          onClick={handlePartfolio}
        >
          <div className="nav-entry-bg"></div>
          <span className="nav-entry-text">
            {isZh ? "作品集" : "Partfolio"}
          </span>
        </div>
        <div
          className={classNames("nav-entry", {
            "nav-active": section === "contact",
          })}
          onClick={handleContact}
        >
          <div className="nav-entry-bg"></div>
          <span className="nav-entry-text">
            {isZh ? "聯絡方式" : "Contact"}
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Header;
