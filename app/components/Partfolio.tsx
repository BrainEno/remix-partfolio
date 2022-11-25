import { useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import React from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import type { Language, LoaderData } from "~/routes";

interface PartfolioProps {
  lang: Language;
}

const Partfolio = React.forwardRef<HTMLDivElement, PartfolioProps>(
  function Partfolio({ lang }, ref) {
    const isZh = lang === "zh";
    const { works } = useLoaderData<LoaderData>();
    const partfolioRef = useForwardedRef(ref);
    return (
      <section
        id="partfolio"
        data-scroll
        data-scroll-id="partfolio"
        data-scroll-call="partfolio"
        data-scroll-repeat
        data-scroll-section
        ref={partfolioRef}
        style={{ height: "100vh", width: "100%", background: "black" }}
      >
        <div className="tv-box">
          <img src="/images/tv.webp" alt="tv" />
          <div className="tv-screen"></div>
        </div>
        <>
          {works.map((work) => (
            <div key={work.id} className="intro-list-item">
              <div className="intro-list-item-pic-box">
                <img
                  className="intro-list-item-pic"
                  loading="eager"
                  src={work.imageUri}
                  alt="cover"
                />
              </div>
              <div className="intro-list-item-line">
                <div className="intro-list-item-bg"></div>
                <div
                  className={classNames(
                    "intro-list-item-name intro-list-item-col",
                    { zh: isZh }
                  )}
                >
                  {isZh
                    ? `《${work.title}》${
                        work.title === "⿏疫" ? "英语版" : ""
                      }`
                    : `${work.name}`}
                </div>
                <div className="intro-list-item-date intro-list-item-col">
                  {work.date}
                </div>
                <div
                  className={classNames(
                    "intro-list-item-group intro-list-item-col",
                    { zh: isZh }
                  )}
                >
                  {isZh ? work.groupTitle : work.groupName}
                </div>
                {/* <div className="intro-list-item-hov-box">
                    <div className="running-text-bufferdiv intro-list-item-rt">
                      <div className="running-text">
                        <div className="running-text-11">{work.title}</div>
                        <div className="running-text-12">{work.title}</div>
                      </div>
                    </div>
                  </div> */}
              </div>
            </div>
          ))}
        </>
      </section>
    );
  }
);

export default Partfolio;
