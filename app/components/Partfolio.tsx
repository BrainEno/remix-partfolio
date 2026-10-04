import classNames from "classnames";
import React from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import type { PortfolioWork } from "~/portfolio/types";

interface PartfolioProps {
  isZh: boolean;
  works: PortfolioWork[];
  activeWorkIndex: number;
  onWorkPreview: (index: number) => void;
}

const Partfolio = React.forwardRef<HTMLDivElement, PartfolioProps>(
  function Partfolio(
    { isZh, works, activeWorkIndex, onWorkPreview },
    ref
  ) {
    const partfolioRef = useForwardedRef(ref);
    const activeWork = works[activeWorkIndex] ?? works[0] ?? null;

    return (
      <section id="partfolio" ref={partfolioRef}>
        <div className="tv-box-stickytainer">
          <div className="tv-box-pinner">
            <div className="tv-box-mask">
              <div className="tv-box">
                <div className="tv-all-vids">
                  <div className="tv-blackscreen" />
                  <div className="tv-showreel">
                    {activeWork?.imageUri ? (
                      <img
                        key={activeWork.id}
                        loading="eager"
                        className="tv-cover"
                        src={activeWork.imageUri}
                        alt={isZh ? activeWork.title : activeWork.name}
                      />
                    ) : null}
                  </div>
                </div>
                <div className="tv-bg-box">
                  <img
                    className="tv-bg"
                    src="/images/tv-bg.png"
                    alt=""
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="work-items-box">
            <h2 className={classNames("work-items-headline", { zh: isZh })}>
              {isZh ? "參與作品  " : "Involved Works"} 2020 - 2022
            </h2>

            {works.map((work, index) => {
              const isActive = index === activeWorkIndex;

              return (
                <div
                  key={work.id}
                  className={classNames("work-item", {
                    zh: isZh,
                    "is-active": isActive,
                  })}
                  data-work-index={index}
                  onMouseEnter={() => onWorkPreview(index)}
                >
                  <div className="work-item-entry">
                    <div className="work-item-topline" />
                    <div className="work-name-mask">
                      <h3 className={classNames("work-name", { zh: isZh })}>
                        {isZh
                          ? `《${work.title}》${
                              work.title === "⿏疫" ? "英语版" : ""
                            }`
                          : work.name}
                      </h3>
                      <h3
                        aria-hidden="true"
                        className={classNames("work-name-hover", { zh: isZh })}
                      >
                        {isZh
                          ? `《${work.title}》${
                              work.title === "⿏疫" ? "英语版" : ""
                            }`
                          : work.name}
                      </h3>
                    </div>
                    <div className="work-item-botline" />
                  </div>

                  <div className="work-teaser">
                    <div className="work-teaser-mask">
                      <span className="work-teaser-date">{work.date}</span>
                    </div>
                    <div className="work-teaser-mask" aria-hidden="true">
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
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);

export default Partfolio;
