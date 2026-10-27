import classNames from "classnames";
import { type CSSProperties, useEffect, useRef } from "react";
import { localize } from "~/portfolio/content";
import type { Language, PortfolioContent } from "~/portfolio/types";

interface PartfolioProps {
  lang: Language;
  content: PortfolioContent["works"];
  contactPhone: string;
  activeWorkIndex: number;
  onWorkPreview: (index: number) => void;
}

type PortfolioStyle = CSSProperties & {
  "--portfolio-work-space": string;
};

export default function Partfolio({
  lang,
  content,
  contactPhone,
  activeWorkIndex,
  onWorkPreview,
}: PartfolioProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isZh = lang === "zh";
  const works = content.items;
  const activeWork =
    activeWorkIndex >= 0 ? (works[activeWorkIndex] ?? null) : null;
  const portfolioStyle: PortfolioStyle = {
    "--portfolio-work-space": `${Math.max(works.length, 1) * 14}svh`,
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const urls = [
          content.tvFrame.src,
          ...works.map((work) => work.image.src),
        ];
        urls.forEach((src) => {
          const image = new Image();
          image.decoding = "async";
          image.src = src;
        });
        observer.disconnect();
      },
      { rootMargin: "100% 0px", threshold: 0 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [content.tvFrame.src, works]);

  return (
    <section id="partfolio" ref={sectionRef} style={portfolioStyle}>
      <div className="tv-box-stickytainer">
        <div className="tv-box-pinner">
          <div className="tv-box-mask">
            <div className="tv-box">
              <div
                className={classNames("tv-all-vids", {
                  "has-preview": Boolean(activeWork?.image.src),
                })}
                data-preview-active={activeWork?.image.src ? "true" : "false"}
                aria-live="polite"
              >
                <div className="tv-blackscreen" />
                <div className="tv-showreel">
                  {activeWork?.image.src ? (
                    <img
                      key={activeWork.id}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                      className="tv-cover"
                      src={activeWork.image.src}
                      alt={localize(activeWork.image.alt, lang)}
                    />
                  ) : null}
                </div>
              </div>
              <div className="tv-bg-box">
                <img
                  className="tv-bg"
                  src={content.tvFrame.src}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  fetchPriority="low"
                  width={2560}
                  height={1707}
                />
              </div>
              {/*
                The phone number is part of the tube, not a page paragraph, so
                it sits in the glass rectangle and fades up on the dead screen
                after the works list has left. It is its own layer *above* the
                photograph: while it lived inside .tv-all-vids, the photo layer
                (which keeps the bezel and glass reflections on top of the
                screen) blended over the digits and dimmed half of them.
              */}
              <div className="tv-number-layer">
                <div className="tv-contact-number" aria-hidden="true">
                  <span>{contactPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="work-items-box">
          <h2 className={classNames("work-items-headline", { zh: isZh })}>
            {localize(content.heading, lang)} {content.period}
          </h2>

          {works.map((work, index) => {
            const isActive = index === activeWorkIndex;
            const title = localize(work.title, lang);

            return (
              <div
                key={work.id}
                className={classNames("work-item", {
                  zh: isZh,
                  "is-active": isActive,
                })}
                data-work-index={index}
                // Sticky preview, matching the 2022-2023 behavior: hovering a
                // row lights the TV screen and the image persists. Resetting
                // to -1 on mouse-leave would black out the screen whenever
                // the cursor drifts off a row while scroll-driven rows no
                // longer re-fire; scroll choreography owns the idle/exit
                // states instead.
                onMouseEnter={() => {
                  const section = sectionRef.current;
                  if (
                    section?.classList.contains("is-tv-exiting") ||
                    section?.classList.contains("is-tv-phone")
                  )
                    return;
                  onWorkPreview(index);
                }}
              >
                <div className="work-item-entry">
                  <div className="work-item-topline" />
                  <div className="work-name-mask">
                    <h3 className={classNames("work-name", { zh: isZh })}>
                      {isZh ? `《${title}》` : title}
                    </h3>
                    <h3
                      aria-hidden="true"
                      className={classNames("work-name-hover", { zh: isZh })}
                    >
                      {isZh ? `《${title}》` : title}
                    </h3>
                  </div>
                  <div className="work-item-botline" />
                </div>

                <div className="work-teaser">
                  <div className="work-teaser-mask">
                    <span className="work-teaser-date">{work.year}</span>
                  </div>
                  <div className="work-teaser-mask" aria-hidden="true">
                    <span className="work-teaser-seperator">
                      &nbsp;&nbsp;/&nbsp;&nbsp;
                    </span>
                  </div>
                  <div className="work-teaser-mask">
                    <span className="work-teaser-group">
                      {localize(work.credit, lang)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/*
          A dedicated phone plateau keeps its dwell independent of how many
          works are configured: adding a project moves the whole stage down
          instead of shortening the number's hold.
        */}
        <div className="tv-phone-spacer" aria-hidden="true" />
        <div className="tv-exit-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}
