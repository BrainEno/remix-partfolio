import type { Config } from "@react-router/dev/config";

export default {
  // The portfolio has no runtime server data. Build-time prerendering keeps a
  // complete first HTML response for the root route while production remains
  // static-only with no Netlify Function/runtime server.
  ssr: false,
  prerender: ["/"],
} satisfies Config;
