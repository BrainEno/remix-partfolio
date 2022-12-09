import React from "react";
import { ClientOnly } from "remix-utils";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import Banana from "../3d/Banana.client";
import CanvasWrapper from "../3d/CanvasWrapper.client";

interface Props{
  isZh:boolean;
}

const Contact = React.forwardRef<HTMLDivElement,Props>(function Contact({isZh}, ref) {
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
      <div className="canvas-container">
          <ClientOnly fallback={null}>
              {() => (
                <CanvasWrapper>
                  <Banana />
                </CanvasWrapper>
              )}
            </ClientOnly>
      </div>
    </section>
  );
});

export default Contact;
