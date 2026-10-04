// React Router excludes *.client modules from the server bundle.
// Keep GSAP/ScrollTrigger/ScrollSmoother behind this boundary so Netlify's
// Node function never evaluates GSAP's browser-oriented package entry.
export {
  ensurePortfolioSmoother,
  scrollToPortfolioSection,
  setupPortfolioScroll,
} from "./portfolio-scroll";
