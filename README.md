# Remix Portfolio

A portfolio site originally built with Remix, now migrated to React Router Framework Mode while preserving the original visual design, animation-heavy presentation, interactive television project preview, and Netlify deployment target.

## Stack

- React Router 8 (Framework Mode)
- React 19
- Vite 8
- TypeScript 5.9
- GSAP / ScrollTrigger / ScrollSmoother
- React Three Fiber / Drei
- Supabase
- Netlify

## Requirements

- Node.js 22.22.0 or newer
- npm 10+

The repository includes an `.nvmrc`, so with nvm you can run:

```sh
nvm use
```

## Local setup

Install dependencies:

```sh
npm install
```

Create your local environment file:

```sh
cp .env.example .env
```

Then replace the placeholder values in `.env` with your own configuration.

Start the development server:

```sh
npm run dev
```

The Vite development server is available at `http://localhost:5173` by default.

## Quality checks

Run the strict TypeScript and generated-route type check:

```sh
npm run typecheck
```

Create a production build:

```sh
npm run build
```

Run both checks together:

```sh
npm run check
```

The modernization CI also rejects reintroduction of Locomotive Scroll or a third-party `scrollerProxy`, so the page has a single scroll authority.

## Production preview

Build first, then start the generated server bundle:

```sh
npm run build
npm run start
```

The production server uses port `3000` by default.

## Environment variables

See `.env.example` for the required keys:

- `SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `URL`

Never commit a real `.env` file.

## Netlify

Netlify is configured through `netlify.toml` and `@netlify/vite-plugin-react-router`. The production build command is:

```sh
npm run build
```

and the client output directory is `build/client`.

## Scroll architecture

The portfolio now uses one GSAP-native scroll pipeline:

- `ScrollSmoother` owns smooth scrolling on top of the browser's native scroll position.
- `ScrollTrigger` owns pinned sections and scroll-driven timelines.
- Section navigation calls `ScrollSmoother.scrollTo()` rather than a second scrolling library.
- The television starts pinning only when its visual center reaches the viewport center.
- The television remains pinned while the real project list scrolls through; the pin duration follows the actual list height rather than a hard-coded pixel endpoint.
- On desktop, hovering a project row changes the image shown in the television.
- On mobile, project rows activate as they pass through a ScrollTrigger focus band, so the television cycles through project images without relying on hover.
- Mobile project rows intentionally occupy a meaningful vertical interval so each preview image has visible dwell time before the next work becomes active.
- The television stays pinned through its final exit animation and is only released after it has visually left the scene, preventing a visible unpin jump.
- The pinned element itself is never animated; rotation, scale and opacity are applied to its inner television artwork so ScrollTrigger measurements stay stable.
- Responsive animation branches use `gsap.matchMedia()` and are reverted automatically when the breakpoint changes.
- The first-screen strip-image parallax formerly powered by Locomotive `data-scroll-speed` is reproduced with ScrollTrigger timelines.

The older Locomotive Scroll provider, `react-locomotive-scroll` compatibility layer, Locomotive CSS, `data-scroll-*` attributes, and `ScrollTrigger.scrollerProxy()` integration have been removed.

## Portfolio data flow

The home route owns the active project index. The portfolio component is presentation-only and receives the project list, the active index, and a selection callback. Desktop hover and mobile scroll activation therefore update the same React state rather than maintaining separate image-selection systems.

Supabase work-list data and the bundled `public/data.json` fallback are normalized to the same portfolio-work shape before rendering. Numeric fallback IDs are converted to strings and local image paths are normalized, so the television preview behaves consistently with either data source.

## Migration notes

The project no longer uses the Classic Remix compiler, the legacy custom Netlify Remix server entry, old Remix browser/server entry files, or the temporary `@remix-run/*` compatibility aliases. Routing, generated route types, loaders/actions, builds, and rendering now use React Router Framework Mode directly.
