import React from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";

const Contact = React.forwardRef<HTMLDivElement>(({}, ref) => {
  // const contactRef = useForwardedRef(ref);
  return (
    <section
      data-scroll
      data-scroll-id="contact"
      data-scroll-section
      id="contact"
      ref={ref}
      style={{ height: 800, width: "100%", background: "white" }}
    >
      contact
    </section>
  );
});

export default Contact;
