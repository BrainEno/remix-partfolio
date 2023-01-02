import React, { useEffect } from "react";
import { ClientOnly } from "remix-utils";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import Banana from "../3d/Banana.client";
import CanvasWrapper from "../3d/CanvasWrapper.client";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

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
      {/* <div className="canvas-container">
        <ClientOnly fallback={null}>
          {() => (
            <CanvasWrapper>
              <Banana />
            </CanvasWrapper>
          )}
        </ClientOnly>
      </div> */}
      <div>
        <h1>© SYDNEY ZHAO</h1>
        <p>Webdesign + Dev by Bottom Think Studio</p>
      </div>
      <div>
        <span>Contact Me - Contact Me - Contact Me - Contact Me -</span>
        <p>sydzhao@outlook.com</p>
        <p>+86 - 1897 - 111 - 3243</p>
      </div></div>
    </section>
  );
});

export default Contact;
