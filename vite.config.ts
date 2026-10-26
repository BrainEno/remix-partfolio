import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [reactRouter()],
});
