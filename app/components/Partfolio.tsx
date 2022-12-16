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

    useEffect(() => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        const t3 = gsap.timeline({
          scrollTrigger: {
            trigger: ".tv-box",
            scroller: "#container",
            start: "top top",
            end: "4000vw",
            toggleActions: "play pause pause reverse",
            scrub: true,
            pin: true,
            pinType: "transform",
          },
          defaults: { duration: 20, ease: "none" },
        });

        t3.to(".tv-bg", {
          scale: 2,
        }).to(
          ".tv",
          {
            scale: 2,
          },
          "<"
        );
      }, 1000);
    }, []);

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
        <div className="tv-box-stickytainer">
          <div className="tv-box-pinner"></div>
          <div className="tv-box-mask">
            <div className="tv-box">
              <div className="tv-all-vids">
                <div
                  className="tv-blackscreen"
                  style={{ display: "block" }}
                ></div>
                <div className="tv-showreel"></div>
                {/* <iframe
                  src="https://player.vimeo.com/video/673878812?background=1"
                  frameBorder="0"
                  
                  muted=''
                  allowfullscreen=""
                  disablepictureinpicture=""
                  class="po-showreel"
                  style={{display: 'block'}}
                ></iframe> */}
              </div>
            </div>
            <img className="tv-bg" src="/images/bg.jpg" alt="tv-bg" />
            <img className="tv" src="/images/tv1.png" alt="tv" />
          </div>
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
      </section>
    );
  }
);

export default Partfolio;
