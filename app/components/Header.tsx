import { Form, NavLink } from "@remix-run/react";
import classNames from "classnames";
import type { MouseEvent } from "react";
import React from "react";
import type { Language, SectionOptions } from "../routes";
import { motion } from "framer-motion";
import { isMobile } from "react-device-detect";

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
              y: "100%",
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            SydeyZhao
          </motion.span>
        </NavLink>
        <Form method="post" className="lang-switch">
          <motion.button
            type="submit"
            name="lang"
            value="zh"
            onClick={() => setLanguage("zh")}
            className={classNames("lang zh", {
              "lang-selected": lang === "zh",
            })}
            initial={
              isMobile
                ? { opacity: 0, x: "-100%" }
                : {
                    opacity: 0,
                    y: "100%",
                  }
            }
            animate={isMobile ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            {isMobile ? "Zh" : "中文"}
          </motion.button>
          <motion.span
            initial={
              isMobile
                ? { opacity: 0, x: "-120%" }
                : {
                    opacity: 0,
                    y: "100%",
                  }
            }
            animate={isMobile ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            {" "}
            |{" "}
          </motion.span>
          <motion.button
            type="submit"
            name="lang"
            value="en"
            onClick={() => setLanguage("en")}
            className={classNames("lang", { "lang-selected": lang === "en" })}
            initial={
              isMobile
                ? { opacity: 0, x: "-140%" }
                : {
                    opacity: 0,
                    y: "100%",
                  }
            }
            animate={isMobile ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            {isMobile ? "En" : "English"}
          </motion.button>
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
          <span className="nav-entry-text">{isZh ? "作品集" : "Works"}</span>
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
