import React from "react";
import { ClientOnly } from "remix-utils";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import Banana from "../3d/Banana.client";
import CanvasWrapper from "../3d/CanvasWrapper.client";

const Contact = React.forwardRef<HTMLDivElement>(function Contact({}, ref) {
  const contactRef = useForwardedRef(ref);
  return (
    <section
      id="contact"
      data-scroll
      data-scroll-id="contact"
      data-scroll-call="contact"
      data-scroll-repeat
      data-scroll-section
      ref={contactRef}
      style={{ height: "100vh", width: "100%", background: "white" }}
    >
      contact
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
