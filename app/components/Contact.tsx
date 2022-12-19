import React, { useEffect } from "react";
import { ClientOnly } from "remix-utils";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import Banana from "../3d/Banana.client";
import CanvasWrapper from "../3d/CanvasWrapper.client";

interface Props{
  isZh:boolean;
}

const Contact = React.forwardRef<HTMLDivElement,Props>(function Contact({isZh}, ref) {
  const contactRef = useForwardedRef(ref);
    useEffect(() => {
      setTimeout(() => {
        const t4 = gsap.timeline({
          scrollTrigger: {
            trigger: "#contact",
            scroller: "#container",
            start: "top top",
            end: "4000vw",
            toggleActions: "play pause pause reverse",
            markers:true,
            scrub: true,
            pin: true,
            pinType: "transform",
          },
          defaults: { duration: 20, ease: "none" },
        });

        // t3.to(".tv-box-mask-bg", {
        //   scale: 1.25,
        // }).to(
        //   ".tv",
        //   {
        //     scale: 2,
        //   },
        //   "<"
        // );
        ScrollTrigger.refresh();
      }, 1000);
    }, []);
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
      <div className="canvas-container">
          {/* <ClientOnly fallback={null}>
              {() => (
                <CanvasWrapper>
                  <Banana />
                </CanvasWrapper>
              )}
            </ClientOnly> */}
      </div>
    </section>
  );
});

export default Contact;
