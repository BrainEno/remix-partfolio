import { useEffect, useRef, useState, type ComponentType } from "react";
import { localize } from "~/portfolio/content";
import type { Language, PortfolioContent } from "~/portfolio/types";

interface Props {
  lang: Language;
  content: PortfolioContent["contact"];
}

const MARQUEE_WORDS = Array.from({ length: 10 }, (_, index) => index);

export default function Contact({ lang, content }: Props) {
  const contactInnerRef = useRef<HTMLDivElement | null>(null);
  const [sceneActive, setSceneActive] = useState(false);
  const [TelephoneScene, setTelephoneScene] =
    useState<ComponentType | null>(null);

  useEffect(() => {
    const target = contactInnerRef.current;
    if (!target) return;

    if (!("IntersectionObserver" in window)) {
      setSceneActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setSceneActive(entry.isIntersecting),
      {
        root: null,
        rootMargin: "240px 0px",
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sceneActive || TelephoneScene) return;

    let cancelled = false;
    void import("../3d/TelephoneScene.client").then(({ default: Scene }) => {
      if (!cancelled) setTelephoneScene(() => Scene);
    });

    return () => {
      cancelled = true;
    };
  }, [sceneActive, TelephoneScene]);

  const mailto = `mailto:${content.email}`;
  const marqueeLabel = localize(content.marquee, lang);

  return (
    <section id="contact">
      <div className="contact-text-box">
        <p className="contact-number">{content.phone}</p>
      </div>
      <div className="contact-inner" ref={contactInnerRef}>
        {content.headlines.map((headline, index) => (
          <h2
            key={`${headline}-${index}`}
            className={`contact-headline contact-hl${index + 1}`}
          >
            {headline}
          </h2>
        ))}

        <div
          className="canvas-container"
          aria-hidden="true"
          data-scene-active={sceneActive ? "true" : "false"}
        >
          {sceneActive && TelephoneScene ? <TelephoneScene /> : null}
        </div>

        <a href={mailto} className="contact-link" aria-label={content.email}>
          <div className="runningtext-bufferdiv">
            <div className="runningtext" aria-hidden="true">
              {["runningtext-l1", "runningtext-l2"].map((trackClass) => (
                <div className={trackClass} key={trackClass}>
                  {MARQUEE_WORDS.map((index) => (
                    <span className="runningtext-word" key={index}>
                      {marqueeLabel}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </a>

        <a href={mailto} className="contact-email-link">
          <p className="contact-email">{content.email}</p>
        </a>
        <h3>{content.copyright}</h3>
        <p>
          {localize(content.credit.prefix, lang)}{" "}
          <span>
            <a
              href={content.credit.url}
              target="_blank"
              className="github-link"
              rel="noreferrer"
            >
              {content.credit.name}
            </a>
          </span>
        </p>
      </div>
    </section>
  );
}
