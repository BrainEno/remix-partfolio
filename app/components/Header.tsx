import { Form, NavLink } from "@remix-run/react";
import classNames from "classnames";
import type { MouseEvent } from "react";
import React from "react";
import type { Language, SectionOptions } from "../routes";
import { motion } from "framer-motion";

interface HeaderProps {
  lang: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  section: SectionOptions;
  handleIntro: (e: MouseEvent<HTMLDivElement>) => void;
  handlePartfolio: (e: MouseEvent<HTMLDivElement>) => void;
  handleContact: (e: MouseEvent<HTMLDivElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  lang,
  setLanguage,
  section,
  handleContact,
  handleIntro,
  handlePartfolio,
}) => {
  const isZh = lang === "zh";

  return (
    <header className="header">
      <div className="header-left">
        <NavLink to="/" className="header-link">
          <motion.span
            initial={{
              opacity: 0,
              y:-100
            }}
            animate={{ opacity: 1,y:0 }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          >
            SydeyZhao
          </motion.span>
        </NavLink>
        <Form method="post" className="lang-switch">
          <button
            type="submit"
            name="lang"
            value="zh"
            onClick={() => setLanguage("zh")}
            className={classNames("lang zh", {
              "lang-selected": lang === "zh",
            })}
          >
            中文
          </button>
          <span> | </span>
          <button
            type="submit"
            name="lang"
            value="en"
            onClick={() => setLanguage("en")}
            className={classNames("lang", { "lang-selected": lang === "en" })}
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
