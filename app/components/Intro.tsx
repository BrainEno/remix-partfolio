import classNames from "classnames";
import React from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import { localize } from "~/portfolio/content";
import type { Language, PortfolioContent } from "~/portfolio/types";

interface IntroProps {
  lang: Language;
  content: Pick<PortfolioContent, "hero" | "intro">;
}

const Intro = React.forwardRef<HTMLDivElement, IntroProps>(function Intro(
  { lang, content },
  ref
) {
  const introRef = useForwardedRef<HTMLDivElement>(ref);
  const isZh = lang === "zh";
  const { hero, intro } = content;

  return (
    <section id="intro" className="section" ref={introRef}>
      <div className="intro-headline-box">
        {hero.headlines.map((headline, index) => (
          <span
            key={`${index}-${headline.en}`}
            className={classNames(
              "intro-headline-word",
              `word-${index + 1}`,
              { zh: isZh }
            )}
          >
            <h1>{localize(headline, lang)}</h1>
          </span>
        ))}

        {["bar-1", "bar-2"].map((barClass) => (
          <div key={barClass} className={`intro-headline-bar ${barClass}`}>
            <img
              className="intro-headline-bar-image"
              src={hero.image.src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        ))}

        <div className="intro-photo-box">
          <div className="intro-photo-wrapper">
            <img
              className="intro-photo"
              src={hero.image.src}
              alt={localize(hero.image.alt, lang)}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <section>
        <div className="intro-subheadline-stickytainer">
          <div className="intro-subheadline-wrapper">
            <div className="intro-subheadline-photo-box">
              <div className="intro-subheadline-photo-mask">
                <img
                  src={intro.portrait.src}
                  alt={localize(intro.portrait.alt, lang)}
                  loading="lazy"
                  decoding="async"
                  className="intro-subheadline-photo"
                />
              </div>
              <div className="intro-subheadline-pic-info">
                <div className="right">{localize(intro.portraitCredit, lang)}</div>
                <div className="subheadline-ball" />
              </div>
              <div className="intro-subheadline-photo-ghost-mask">
                <img
                  src={intro.portrait.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="intro-subheadline-ghost-photo"
                />
              </div>
            </div>
            <div className="intro-subheadline-slider">
              <div
                className={classNames("intro-subheadline-title", { zh: isZh })}
              >
                <h1>{localize(intro.heading, lang)}</h1>
              </div>
              <div className="intro-subheadline-text-box1">
                <p
                  className={classNames(
                    "intro-subheadline-text intro-subheadline-text1",
                    { zh: isZh }
                  )}
                >
                  {localize(intro.primaryText, lang)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="intro-subheadline-stickytainer2">
          <div className="intro-subheadline-wrapper2">
            <div className="intro-subheadline-photo-box2">
              {intro.gallery.map((image, index) => (
                <div className="intro-subheadline-photo-mask2" key={image.src}>
                  <img
                    src={image.src}
                    alt={localize(image.alt, lang)}
                    loading="lazy"
                    decoding="async"
                    className="intro-subheadline-photo2"
                    fetchPriority={index === 0 ? "auto" : "low"}
                  />
                </div>
              ))}
            </div>
            <div className="intro-subheadline-slider2">
              <div className="intro-subheadline-text-box2">
                {intro.accentImages.map((image, index) => (
                  <img
                    key={image.src}
                    src={image.src}
                    alt={localize(image.alt, lang)}
                    loading="lazy"
                    decoding="async"
                    className={`intro-subheadline-text2-pic${index + 1}`}
                  />
                ))}
                <p
                  className={classNames(
                    "intro-subheadline-text intro-subheadline-text2",
                    { zh: isZh }
                  )}
                >
                  {localize(intro.secondaryText, lang)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
});

export default Intro;
