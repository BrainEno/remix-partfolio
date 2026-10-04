import type { Config } from "@react-router/dev/config";

export default {
  // This portfolio has no runtime server data. SPA mode pre-renders the app
  // shell to build/client/index.html and removes the Netlify Function/runtime
  // server from the production path.
  ssr: false,
} satisfies Config;
