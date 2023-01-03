import { motion } from "framer-motion";
import React from "react";
import { ClientOnly } from "remix-utils";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import CanvasWrapper from "../3d/CanvasWrapper.client";
import Telephone from "../3d/Telephone";

interface Props {
  isZh: boolean;
}

const Contact = React.forwardRef<HTMLDivElement, Props>(function Contact(
  { isZh },
  ref
) {
  const contactRef = useForwardedRef(ref);

  return (
    <section
      id="contact"
      data-scroll
      data-scroll-section
      data-scroll-id="contact"
      data-scroll-call="contact"
      data-scroll-repeat
      ref={contactRef}
    >
      <div className="contact-inner">
        <div className="canvas-container">
        <ClientOnly fallback={null}>
          {() => (
            <CanvasWrapper>
              <Telephone />
            </CanvasWrapper>
          )}
        </ClientOnly>
      </div>
        <div className="contact-text-box"></div>
        <p>+86 - 1897 - 111 - 3243</p>
        <div>
          <h1>© SYDNEY ZHAO</h1>
          <p>Webdesign + Dev by Bottom Think Studio</p>
        </div>
        <div>
          <a
            href="mailto:sydzhao@outlook.com"
            type="email"
            className="contact-link"
          >
            <div className="runningtext-bufferdiv">
              <div className="runningtext">
                <motion.div
                  className="runningtext-l1"
                  animate={{ translateX: "-100%" }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 80,
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
                  <span className="runningtext-word">Contact me —</span>
                </motion.div>
                <motion.div
                  className="runningtext-l2"
                  animate={{ translateX: "-100%" }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 80,
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
                  <span className="runningtext-word">Contact me —</span>
                </motion.div>
              </div>
            </div>
          </a>
          <p>sydzhao@outlook.com</p>
        </div>
      </div>
    </section>
  );
});

export default Contact;
