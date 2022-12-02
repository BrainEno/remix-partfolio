import { useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import React, { useState } from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import type { Language, LoaderData } from "~/routes";

interface PartfolioProps {
  lang: Language;
}

//screen 358*275
//pic 1357 1059
//506 * 363

const Partfolio = React.forwardRef<HTMLDivElement, PartfolioProps>(
  function Partfolio({ lang }, ref) {
    const isZh = lang === "zh";
    const { works } = useLoaderData<LoaderData>();
    const partfolioRef = useForwardedRef(ref);
    const [workImg, setWorkImg] = useState<string>(works[0].imageUri);

    const handleHover = (src: string) => (e: MouseEvent) => {
      e.preventDefault();
      setWorkImg(src);
    };

    return (
      <section
        id="partfolio"
        data-scroll
        data-scroll-id="partfolio"
        data-scroll-call="partfolio"
        data-scroll-repeat
        data-scroll-section
        ref={partfolioRef}
      >
        <div className="tv-box">
          <div className="tv-box-stickytainer">
            <img className="tv" src="/images/tv-box.webp" alt="tv" />
          </div>
          <div className="screen-box">
            <img
              className="screen-pic"
              loading="eager"
              src={workImg}
              alt="cover"
            />
          </div>
          <div className="work-list-items">
            {works.map((work) => (
              <div
                key={work.id}
                className="work-list-item"
                onMouseEnter={handleHover(work.imageUri) as any}
              >
                <div className="work-list-item-line">
                  <div className="work-list-item-bg"></div>
                  <div
                    className={classNames(
                      "work-list-item-name work-list-item-col",
                      { zh: isZh }
                    )}
                  >
                    {isZh
                      ? `《${work.title}》${
                          work.title === "⿏疫" ? "英语版" : ""
                        }`
                      : `${work.name}`}
                  </div>
                  <div className="work-list-item-info work-list-item-col">
                    {work.date}{"  "}/{"  "}{isZh ? work.groupTitle : work.groupName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

export default Partfolio;
