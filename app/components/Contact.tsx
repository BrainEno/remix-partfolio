import React from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";

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
    </section>
  );
});

export default Contact;
