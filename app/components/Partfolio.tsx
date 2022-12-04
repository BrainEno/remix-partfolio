import { useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import React, { useState } from "react";
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
            <img className="tv-bg" src="/images/bg.jpg" alt="tv-bg" />
            <img className="tv" src="/images/tv-box.png" alt="tv" />
          </div>
          <div className="screen-box">
            <img
              className="screen-pic"
              loading="eager"
              src={workImg}
              alt="cover"
            />
          </div>
          <div className="work-list">
            {works.map((work) => (
              <div
                key={work.id}
                className="work-item"
                onMouseEnter={handleHover(work.imageUri) as any}
              >
                <div className="work-name-mask">
                  <h1 className={classNames("work-name", { zh: isZh })}>
                    {isZh
                      ? `《${work.title}》${
                          work.title === "⿏疫" ? "英语版" : ""
                        }`
                      : `${work.name}`}
                  </h1>

                  <h1 className={classNames("work-name-hover", { zh: isZh })}>
                    {isZh
                      ? `《${work.title}》${
                          work.title === "⿏疫" ? "英语版" : ""
                        }`
                      : `${work.name}`}
                  </h1>
                </div>
                <div className="work-teaser">
                  <div className="work-teaser-mask">
                    <span className="work-teaser-date">{work.date}</span>
                  </div>
                  <div className="work-teaser-mask">
                    <span className="work-teaser-seperator">
                      &nbsp;&nbsp;/&nbsp;&nbsp;
                    </span>
                  </div>
                  <div className="work-teaser-mask">
                    <span className="work-teaser-group">
                      {isZh ? work.groupTitle : work.groupName}
                    </span>
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
