import { index, type RouteConfig } from "@react-router/dev/routes";

export type {
  IntroItem,
  Language,
  LoaderData,
  SectionOptions,
} from "./routes/index";

export default [index("routes/index.tsx")] satisfies RouteConfig;
