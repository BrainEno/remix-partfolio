# Animated Portfolio Template

A reusable, animation-heavy portfolio template built with React Router Framework Mode. It preserves the original GSAP choreography, interactive television project preview, mobile-specific scroll behavior, lazy 3D contact scene, and Netlify deployment target while moving all editable portfolio content into one typed configuration file.

## Stack

- React Router 8 (Framework Mode)
- React 19
- Vite 8
- TypeScript 5.9
- GSAP / ScrollTrigger / ScrollSmoother
- React Three Fiber / Drei / Three.js (lazy-loaded near Contact only)
- Playwright WebKit mobile regression tests
- Netlify

The public site has no database or authentication dependency. Portfolio content is stored locally in Git, so Deploy Previews and production builds render the same data without an external service.

## Requirements

- Node.js 22.22.0 or newer
- npm 10+

The repository includes an `.nvmrc`:

```sh
nvm use
npm install
npm run dev
```

The Vite development server is available at `http://localhost:5173` by default.

## Edit the template

The main content source of truth is:

```text
app/portfolio/content.ts
```

For normal portfolio editing, change that file instead of editing the React components or GSAP selectors.

It contains:

- display name and browser page title
- Intro / Works / Contact navigation labels
- hero headlines
- hero/person portrait images
- biography heading and both biography paragraphs
- the vertical gallery images and two accent images
- project titles, years, credits and television preview images
- Works heading and year range
- television frame image path
- phone number, email address and Contact headlines
- marquee text, copyright text and site credit

All bilingual copy uses this shape:

```ts
{
  zh: "中文内容",
  en: "English copy",
}
```

All editable image references use this shape:

```ts
{
  src: "/images/example.jpg",
  alt: {
    zh: "中文替代文字",
    en: "English alt text",
  },
}
```

Put local assets under `public/images/` and use paths beginning with `/images/`.

### Add or remove projects

Projects are defined in `portfolioContent.works.items`. The portfolio scroll space is calculated from the real project count, so adding projects does not require changing a hard-coded `320vh` section height.

Each project has:

```ts
{
  id: "unique-slug",
  title: { zh: "项目名", en: "Project title" },
  year: "2026",
  image: {
    src: "/images/project.jpg",
    alt: { zh: "项目图片", en: "Project still" },
  },
  credit: { zh: "机构 / 团队", en: "Organisation / group" },
}
```

The `PortfolioContent` TypeScript contract makes missing required fields a compile-time error.

## Architecture rules

The React components keep stable CSS class names because GSAP uses those class names as animation targets. Editable copy and asset paths live in the content config; animation geometry and selectors live in the component/CSS/scroll layers.

The home route owns only UI state:

- current language
- current section
- active project preview index

`Header`, `Intro`, `Partfolio`, and `Contact` receive typed content slices and render them. Desktop hover and mobile scroll activation update the same active-project state.

Language changes are submitted with a React Router fetcher and stored in the language cookie without a page navigation, so changing language does not intentionally reset scroll position or rebuild the entire route.

## Performance strategy

The template intentionally avoids multiple general-purpose animation runtimes:

- GSAP owns scroll-driven choreography.
- Lightweight entrance and marquee effects use CSS animations.
- Framer Motion is not required.
- Locomotive Scroll and `scrollerProxy()` are not used.

Media loading is staged:

- the hero portrait is high-priority because it is visible immediately;
- decorative strip images use lazy/async loading;
- the large television frame is not eager-loaded on first paint;
- the television frame and project preview images are preloaded when the Works section gets near the viewport;
- the Three.js telephone scene is dynamically imported only when Contact is near the viewport and its WebGL canvas is unmounted again when the section leaves the active area.

Mobile uses Safari/native scrolling plus ScrollTrigger. Desktop may use ScrollSmoother. This keeps one scroll coordinate system on iOS and avoids the historical virtual-scroll/pin conflicts that caused jumps.

## Quality checks

Run generated-route TypeScript checking:

```sh
npm run typecheck
```

Build production output:

```sh
npm run build
```

Run both:

```sh
npm run check
```

Run the real mobile WebKit scroll tests:

```sh
npm run build
npm run test:scroll
```

CI also verifies that:

- Locomotive Scroll / `scrollerProxy()` / `data-scroll-*` do not return;
- GSAP, Three.js and React Three Fiber do not leak into the server bundle;
- the production SSR server returns real portfolio content;
- the mobile animation runtime actually creates and runs ScrollTriggers in WebKit;
- the Netlify Deploy Preview serves the portfolio rather than a function error page.

## Environment variables

No Supabase, authentication, or session secret is required for the current portfolio template.

`.env.example` only keeps an optional local `URL` placeholder for future integrations. Never commit real secrets if you add external services later.

## Netlify

Netlify is configured through `netlify.toml` and `@netlify/vite-plugin-react-router`.

```sh
npm run build
```

The client output directory is `build/client`.

## Scroll architecture

The portfolio uses a GSAP-native scroll pipeline:

- desktop smooth scrolling is handled by ScrollSmoother;
- ScrollTrigger owns pinned scenes and scroll-driven timelines;
- mobile keeps native browser scrolling and uses ScrollTrigger only for animation/pinning;
- responsive branches are isolated with GSAP media handling and cleaned up on unmount;
- TV preview selection is shared React state rather than separate desktop/mobile image systems;
- the pinned wrapper itself is not transformed by the exit animation; inner TV artwork is transformed so pin measurements remain stable.

The animation choreography can be tuned independently later without moving personal content back into the animation code.
