import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { localize } from "~/portfolio/content";
import type { Language, PortfolioContent } from "~/portfolio/types";

interface Props {
  lang: Language;
  content: PortfolioContent["contact"];
}

type SceneStatus = "idle" | "loading" | "ready" | "error";

type SceneProps = { onError?: () => void };

const MARQUEE_WORDS = Array.from({ length: 10 }, (_, index) => index);
let telephoneScenePromise: Promise<{ default: ComponentType<SceneProps> }> | null =
  null;

function loadTelephoneScene() {
  telephoneScenePromise ??= import("../3d/TelephoneScene.client");
  return telephoneScenePromise;
}

export default function Contact({ lang, content }: Props) {
  const contactInnerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  const [sceneActive, setSceneActive] = useState(false);
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>("idle");
  const [TelephoneScene, setTelephoneScene] =
    useState<ComponentType<SceneProps> | null>(null);

  // A failed WebGL scene must never take the contact copy with it. The canvas
  // unmounts, the status is recorded for diagnostics and for the scroll
  // runtime, and everything else on the page keeps working.
  const handleSceneError = useCallback(() => {
    setSceneStatus("error");
    setSceneActive(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
        // Preload well ahead of the booth's entrance trigger: the old 240px
        // margin started the (1.7 MB) model download only a moment before
        // the entrance began, so the booth routinely popped in *after* its
        // own rise had finished. A full viewport of lead time lets the scene
        // be decoded and ready while the television exit still owns the
        // screen, and the booth then arrives exactly on its scroll beat.
        rootMargin: "120% 0px 120% 0px",
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sceneActive || TelephoneScene || sceneStatus === "loading") return;

    setSceneStatus("loading");
    void loadTelephoneScene()
      .then(({ default: Scene }) => {
        if (!mountedRef.current) return;
        setTelephoneScene(() => Scene);
        setSceneStatus("ready");
      })
      .catch((error: unknown) => {
        telephoneScenePromise = null;
        if (!mountedRef.current) return;
        setSceneStatus("error");
        console.error("Failed to load the Contact WebGL scene", error);
      });
  }, [sceneActive, sceneStatus, TelephoneScene]);

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
          data-scene-status={sceneStatus}
        >
          {sceneActive && TelephoneScene && sceneStatus !== "error" ? (
            <TelephoneScene onError={handleSceneError} />
          ) : null}
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
