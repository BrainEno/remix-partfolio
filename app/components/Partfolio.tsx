/* eslint-disable jsx-a11y/iframe-has-title */
import { useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import React, { useEffect, useState } from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import type { LoaderData } from "~/routes";

interface PartfolioProps {
  isZh: boolean;
}

const Partfolio = React.forwardRef<HTMLDivElement, PartfolioProps>(
  function Partfolio({ isZh }, ref) {
    const { works } = useLoaderData<LoaderData>();
    const partfolioRef = useForwardedRef(ref);
    const [workImg, setWorkImg] = useState<string>(works[0].imageUri);

    const handleHover = (src: string) => (e: MouseEvent) => {
      e.preventDefault();
      setWorkImg(src);
    };

    gsap.registerPlugin(ScrollTrigger);

    // useEffect(() => {
    //   setTimeout(() => {
    //     const t3 = gsap.timeline({
    //       scrollTrigger: {
    //         trigger: ".tv-box-pinner",
    //         scroller: "#container",
    //         start: "50 top",
    //         end: "3173",
    //         scrub: true,
    //         pin: true,
    //         pinType: "transform",
    //         pinSpacing: false,
    //       },
    //       defaults: { duration: 20, ease: "none" },
    //     });

    //     t3.to(".tv-box-pinner", {
    //       top: 50,
    //     });

    //     const t4 = gsap.timeline({
    //       scrollTrigger: {
    //         trigger: ".tv-transition-trigger",
    //         scroller: "#container",
    //         start: "top bottom-=100",
    //         end: "1000",
    //         scrub: true,
    //         immediateRender: false,
    //       },
    //       defaults: { duration: 2, ease: "none" },
    //     });

    //     t4.to(".tv-cover", {
    //       display: "none",
    //       opacity: 0,
    //       duration: 0.1,
    //     })
    //       .to(
    //         ".tv-box",
    //         {
    //           scale: 16,
    //           rotation: 45,
    //         },
    //         ">"
    //       )
    //       .to(
    //         ".tv-bg",
    //         {
    //           opacity: 0,
    //         },
    //         "<"
    //       );
    //   }, 1000);

    //   ScrollTrigger.refresh();
    // }, []);

    return (
      <section
        id="partfolio"
        data-scroll
        data-scroll-section
        data-scroll-id="partfolio"
        data-scroll-call="partfolio"
        data-scroll-repeat
        ref={partfolioRef}
      >
        <div className="tv-nav-activer"></div>
        <div className="tv-animation-trigger"></div>
        <div className="tv-box-stickytainer">
          <div className="tv-box-pinner">
            <div className="tv-box-mask">
              <div className="tv-box">
                <div className="tv-all-vids">
                  <div className="tv-blackscreen"></div>
                  <div className="tv-showreel">
                    <img
                      loading="eager"
                      className="tv-cover"
                      src={workImg}
                      alt="cover"
                    />
                  </div>
                  <div className="tv-vids-container">
                    <div className="tv-video-box"></div>
                  </div>
                </div>
                <div className="tv-bg-box">
                  <img
                    className="tv-bg"
                    src="/images/tv-bg21.png"
                    alt="tv-bg"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="work-items-box">
            <h2 className="work-items-headline">Involved Works 2020 - 2022</h2>
            {works.map((work) => (
              <div
                key={work.id}
                className={classNames("work-item", { zh: isZh })}
                onMouseEnter={handleHover(work.imageUri) as any}
              >
                <div className="work-item-entry">
                  <div className="work-item-topline"></div>
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
                  <div className="work-item-botline"></div>
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
          <div className="tv-transition-trigger"></div>
        </div>
      </section>
    );
  }
);

export default Partfolio;
