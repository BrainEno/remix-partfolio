import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";

interface Props {
  isZh: boolean;
}

const Contact = React.forwardRef<HTMLDivElement, Props>(function Contact(
  { isZh },
  ref
) {
  const contactRef = useForwardedRef(ref);
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

  return (
    <section id="contact" ref={contactRef}>
      <div className="contact-text-box">
        <p className="contact-number">+86 - 1897 - 111 - 3243</p>
      </div>
      <div className="contact-inner" ref={contactInnerRef}>
        <h2 className="contact-headline contact-hl1">CALL ME</h2>
        <h2 className="contact-headline">FOR THE</h2>
        <h2 className="contact-headline contact-hl3">MARQUEE MOON</h2>
        <div
          className="canvas-container"
          aria-hidden="true"
          data-scene-active={sceneActive ? "true" : "false"}
        >
          {sceneActive && TelephoneScene ? <TelephoneScene /> : null}
        </div>
        <a
          href="mailto:sydzhao@outlook.com"
          type="email"
          className="contact-link"
        >
          <div className="runningtext-bufferdiv">
            <div className="runningtext">
              <motion.div
                className="runningtext-l1"
                animate={{ x: ["0%", "-100%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 80,
                  ease: "linear",
                }}
              >
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me </span>
              </motion.div>
              <motion.div
                className="runningtext-l2"
                animate={{ x: ["0%", "-100%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 80,
                  ease: "linear",
                }}
              >
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me —</span>
                <span className="runningtext-word">Contact me </span>
              </motion.div>
            </div>
          </div>
        </a>
        <a
          href="mailto:sydzhao@outlook.com"
          type="email"
          className="contact-email-link"
        >
          <p className="contact-email">sydzhao@outlook.com</p>
        </a>
        <h3>© 2023 Sydney Zhao. All rights resrved.</h3>
        <p>
          Webdesign + WebDev by{" "}
          <span>
            <a
              href="https://github.com/BrainEno"
              type="link"
              target="_blank"
              className="github-link"
              rel="noreferrer"
            >
              Bottom Think - BrainEno
            </a>
          </span>
        </p>
      </div>
    </section>
  );
});

export default Contact;
