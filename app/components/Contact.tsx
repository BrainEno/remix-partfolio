import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { localize } from "~/portfolio/content";
import type { Language, PortfolioContent } from "~/portfolio/types";

interface Props {
  lang: Language;
  content: PortfolioContent["contact"];
}

type SceneStatus = "idle" | "loading" | "ready" | "error";

type SceneProps = { onError?: () => void; onReady?: () => void };

const MARQUEE_WORDS = Array.from({ length: 10 }, (_, index) => index);
let telephoneScenePromise: Promise<{
  default: ComponentType<SceneProps>;
}> | null = null;

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
  const handleSceneReady = useCallback(() => {
    setSceneStatus("ready");
  }, []);

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

    // IntersectionObserver's rootMargin is clipped by ScrollSmoother's
    // overflow-hidden wrapper on desktop. Use the same scroll coordinate
    // system as the choreography so the model genuinely starts decoding more
    // than a viewport before it is needed on both desktop and mobile.
    gsap.registerPlugin(ScrollTrigger);
    const sync = (trigger: ScrollTrigger) => setSceneActive(trigger.isActive);
    const trigger = ScrollTrigger.create({
      id: "contact-model-proximity",
      trigger: target,
      start: "top 225%",
      end: "bottom -125%",
      refreshPriority: -1,
      onToggle: sync,
      onRefresh: sync,
      invalidateOnRefresh: true,
    });
    sync(trigger);
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (sceneStatus === "error") return;
    if (!sceneActive) {
      // The canvas is unmounted away from contact. Mark it unready so a
      // cached remount fades in only after its new scene has rendered.
      if (
        sceneStatus === "ready" ||
        (TelephoneScene && sceneStatus === "loading")
      ) {
        setSceneStatus("idle");
      }
      return;
    }
    if (TelephoneScene) {
      if (sceneStatus === "idle") setSceneStatus("loading");
      return;
    }
    if (sceneStatus === "loading") return;

    setSceneStatus("loading");
    void loadTelephoneScene()
      .then(({ default: Scene }) => {
        if (!mountedRef.current) return;
        setTelephoneScene(() => Scene);
      })
      .catch((error: unknown) => {
        telephoneScenePromise = null;
        if (!mountedRef.current) return;
        setSceneStatus("error");
        console.error("Failed to load the Contact WebGL scene", error);
      });
  }, [sceneActive, sceneStatus, TelephoneScene]);

  useEffect(() => {
    if (sceneStatus !== "error") return;
    // On mobile the failed model's reserved slot collapses. Let the scroll
    // controller remeasure the shorter document after React applies the style.
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("portfolio:layoutchange"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [sceneStatus]);

  const mailto = `mailto:${content.email}`;
  const marqueeLabel = localize(content.marquee, lang);

  return (
    <section id="contact">
      <div className="contact-text-box" aria-hidden="true">
        <p className="contact-number">{content.phone}</p>
      </div>
      <div className="contact-inner" ref={contactInnerRef}>
        <div className="contact-hero">
          <div className="contact-headlines">
            {content.headlines.map((headline, index) => (
              <h2
                key={`${headline}-${index}`}
                className={`contact-headline contact-hl${index + 1}`}
              >
                {headline}
              </h2>
            ))}
          </div>

          <div
            className="canvas-container"
            aria-hidden="true"
            data-scene-active={sceneActive ? "true" : "false"}
            data-scene-status={sceneStatus}
          >
            {sceneActive &&
            TelephoneScene &&
            (sceneStatus === "loading" || sceneStatus === "ready") ? (
              <TelephoneScene
                onError={handleSceneError}
                onReady={handleSceneReady}
              />
            ) : null}
          </div>
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

        <div className="contact-details">
          <a href={mailto} className="contact-email-link">
            {content.email}
          </a>
          <a
            href={`tel:${content.phone.replace(/[^+\d]/g, "")}`}
            className="contact-phone-link"
          >
            {content.phone}
          </a>
          <h3>{content.copyright}</h3>
          <p>
            {localize(content.credit.prefix, lang)}{" "}
            <a
              href={content.credit.url}
              target="_blank"
              className="github-link"
              rel="noreferrer"
            >
              {content.credit.name}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
