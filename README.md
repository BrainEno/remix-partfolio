# Animated Portfolio + Media Archive

A static-first personal site with two deliberately separate experiences:

- `/` — the expressive GSAP/Three animated landing page;
- `/archive` and `/lists` — a fast, text-first cultural archive for books, audio, video and personal rankings.

The archive direction is inspired by long-lived cultural indexes such as UbuWeb: stable links, dense browsing and durable metadata matter more than app-like complexity. The visual design remains original to this project.

## Stack

- React Router 8 Framework Mode, React 19, Vite 8, TypeScript 5.9
- GSAP / ScrollTrigger / ScrollSmoother for the animated landing page only
- React Three Fiber / Drei / Three.js, lazy-mounted near Contact only
- Playwright WebKit regression tests
- Netlify static hosting

Production has no database, authentication service or runtime Netlify Function.

## Run locally

Requires Node.js 22.22+.

```sh
nvm use
npm install
npm run dev
```

## Editable landing page

Personal profile/portfolio copy and media live in:

```text
app/portfolio/content.ts
```

Replace identity, bilingual headlines, biography text, portraits, project names/images, contact details and credits there. Keep GSAP-targeted CSS classes in components stable.

## Editable media archive

Archive content is split so it can grow without turning into one huge file:

```text
app/archive/content.ts   # archive title, labels and site-level copy
app/archive/items.ts     # books, audio and video records
app/archive/lists.ts     # ranked / curated lists
app/archive/types.ts     # typed content contract
app/archive/catalog.ts   # validation and derived indexes
```

### Item shape

```ts
{
  id: "unique-stable-slug",
  kind: "book", // "book" | "audio" | "video"
  title: { zh: "标题", en: "Title" },
  creators: ["Author / Artist / Filmmaker"],
  year: "2026",
  summary: { zh: "短评", en: "Short note" },
  tags: ["experimental", "essay"],
  facts: [
    {
      label: { zh: "版本", en: "Edition" },
      value: { zh: "初版", en: "First edition" },
    },
  ],
}
```

Optional fields:

- `image` — cover, poster or still;
- `note` — longer personal note;
- `facts` — structured bilingual metadata such as publisher, label, runtime, edition, language or format;
- `externalUrl` — an external reference/read/purchase page;
- `media` — audio/video source.

### Audio / video

```ts
media: {
  src: "/media/audio/example.mp3",
  mimeType: "audio/mpeg",
}
```

or:

```ts
media: {
  src: "https://media.example.com/video/example.mp4",
  mimeType: "video/mp4",
  poster: "/images/example-poster.jpg",
}
```

Audio uses `preload="none"`; video uses `preload="metadata"` and `playsInline`. Nothing autoplays.

For a large UbuWeb-like collection, keep metadata in Git but place heavy audio/video in object storage or a media CDN. Do not use the repository itself as a large video warehouse.

## Rankings / curated lists

Lists reference archive item IDs instead of duplicating metadata:

```ts
{
  id: "films-2026",
  title: { zh: "2026 电影十佳", en: "Top Films 2026" },
  entries: [
    { itemId: "film-a" },
    { itemId: "film-b", note: { zh: "说明", en: "Why it is here" } },
  ],
}
```

Entry order is ranking order. Duplicate IDs and references to missing items fail immediately through the catalog validation layer.

## Archive URLs

Configured content is statically prerendered into stable URLs:

```text
/archive
/archive/:itemId
/lists
/lists/:listId
/archive/type/:kind
/archive/tag/:tag
/archive/year/:year
```

Type, tag and year indexes are derived from the actual items. Adding/removing data automatically changes the prerender set; there is no second hand-maintained category database.

The archive index also offers instant client-side search across bilingual titles, creators, years, tags, summaries, notes and structured facts.

## Assets

Local images normally live under `public/images/`; small local media can live under `public/media/`.

Every local `src`/`poster` referenced by the editable portfolio/archive modules is checked during build with case-sensitive filesystem validation.

The editable TV source remains:

```text
public/images/tv-bg.png
```

`npm run dev` / `npm run build` automatically generate the optimized alpha WebP used at runtime. The current source is reduced from roughly 6 MB to roughly 0.6 MB.

## Performance architecture

- Archive routes never initialize GSAP or Three.js.
- Mobile landing-page scrolling uses native Safari scrolling plus ScrollTrigger.
- Desktop may use ScrollSmoother.
- Works media preloads only near the TV section.
- The 3D phone scene dynamically imports near Contact and unmounts when inactive.
- Framer Motion, Locomotive Scroll and Supabase are not part of the current runtime.
- Production publishes only `build/client` and has no runtime Netlify Function.

## Static build

React Router uses `ssr: false` plus build-time prerendering. Netlify publishes:

```text
build/client
```

Configured landing/archive/list/facet pages are emitted as static HTML while client routing remains available through the SPA fallback.

## Quality checks

```sh
npm run typecheck
npm run build
npm run test:scroll
```

CI verifies:

- retired scroll/database/server dependencies do not return;
- local configured assets exist with exact case;
- TV artwork stays inside its performance budget;
- home, archive, lists, item pages and representative type/tag/year indexes are prerendered;
- static production serving works;
- mobile GSAP choreography and WebGL lifecycle still work in WebKit;
- archive filtering, searching, language persistence, deep links, facet indexes and ranked lists work;
- Netlify Deploy Preview serves the static site without Functions.

The landing-page choreography can continue to evolve independently without moving archive data into animation code, and the archive can grow independently without loading the animation runtime.
