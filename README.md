# Animated Portfolio + Media Archive Template

A reusable, animation-heavy personal site built with React Router Framework Mode. The animated landing page preserves the original GSAP choreography and television project preview, while a separate text-first archive layer is being developed for books, audio, video and ranked personal lists.

The project is intentionally static-first: there is no database, authentication service or runtime Netlify Function required for the public site.

## Stack

- React Router 8 (Framework Mode)
- React 19
- Vite 8
- TypeScript 5.9
- GSAP / ScrollTrigger / ScrollSmoother
- React Three Fiber / Drei / Three.js (lazy-loaded near Contact only)
- Playwright WebKit mobile regression tests
- Netlify static hosting

## Requirements

- Node.js 22.22.0 or newer
- npm 10+

```sh
nvm use
npm install
npm run dev
```

The Vite development server is available at `http://localhost:5173` by default.

## Site structure

The site now has two layers with different jobs:

1. `/` — animated personal landing page and visual introduction.
2. `/archive` — long-term books / audio / video index.
3. `/archive/:itemId` — stable deep link for one archive item.
4. `/lists` — personal rankings and curated lists.
5. `/lists/:listId` — stable deep link for one ranking/list.

The archive direction is intentionally closer to a personal cultural archive than a conventional portfolio: dense, linkable, searchable and designed to keep growing without coupling content to the animation code.

## Edit the animated landing page

The animated portfolio source of truth is:

```text
app/portfolio/content.ts
```

Change that file instead of editing React components or GSAP selectors when replacing:

- display name and browser title
- Intro / Works / Contact labels
- hero headlines
- hero and portrait images
- biography copy
- gallery/accent images
- project titles, years, credits and television preview images
- Works heading and period
- phone, email, Contact headlines, marquee and credits

All bilingual copy uses:

```ts
{
  zh: "中文内容",
  en: "English copy",
}
```

The `PortfolioContent` TypeScript contract makes missing required fields a compile-time error.

## Edit the media archive

The archive source of truth is:

```text
app/archive/content.ts
```

The starter data is deliberately marked as template/demo content. Replace it with your own books, recordings, films and lists.

### Archive item

```ts
{
  id: "unique-slug",
  kind: "book", // or "audio" / "video"
  title: { zh: "标题", en: "Title" },
  creators: ["Author / Artist / Filmmaker"],
  year: "2026",
  summary: {
    zh: "你的短评或说明",
    en: "Your note or description",
  },
  tags: ["essay", "experimental"],
}
```

Optional fields include:

- `image` for a cover/poster/still
- `note` for a longer personal note
- `externalUrl` for an external reference or purchase/read-more link
- `media` for an audio/video source

### Audio source

```ts
media: {
  src: "/media/audio/example.mp3",
  mimeType: "audio/mpeg",
}
```

### Video source

```ts
media: {
  src: "https://media.example.com/video/example.mp4",
  mimeType: "video/mp4",
  poster: "/images/example-poster.jpg",
}
```

The archive uses native `<audio>` and `<video>` controls. Audio uses `preload="none"`; video uses `preload="metadata"` and `playsInline`, so browsing the archive does not eagerly download every media file.

### Media storage guidance

Small personal assets can live in `public/media/`, but do not turn the Git/Netlify deployment into a large video warehouse. For a UbuWeb-like archive with many or large files, keep metadata in this repository and put heavy audio/video in object storage or a media CDN. `media.src` accepts absolute URLs, so the site architecture does not depend on any single storage provider.

This separation keeps:

- Git history small;
- Netlify deploys fast;
- mobile memory/network use predictable;
- future migration to another media host straightforward.

## Personal rankings and lists

Lists live in `archiveContent.lists` and reference archive items by ID instead of duplicating metadata:

```ts
{
  id: "films-2026",
  title: { zh: "2026 电影十佳", en: "Top Films 2026" },
  entries: [
    { itemId: "film-a" },
    {
      itemId: "film-b",
      note: { zh: "榜单说明", en: "Why it is here" },
    },
  ],
}
```

The order of `entries` is the ranking order. Invalid list references and duplicate IDs fail immediately when the catalog module loads.

## Search and browsing

The `/archive` index supports:

- All / Books / Audio / Video filtering;
- text search across both languages, creator names, years and tags;
- stable item URLs;
- responsive text-first rendering that does not depend on the GSAP landing page.

This gives the archive a scalable information architecture: the animated homepage can stay expressive while the archive remains fast, boring in the useful sense, and easy to maintain.

## Local assets

Portfolio images normally live under:

```text
public/images/
```

Archive media may live under:

```text
public/media/audio/
public/media/video/
```

All local `src` and `poster` paths referenced from the editable content files are checked during build with case-sensitive filesystem validation.

The editable TV source stays at:

```text
public/images/tv-bg.png
```

`npm run dev` and `npm run build` automatically generate the optimized alpha WebP used at runtime. The current TV asset drops from roughly 6 MB to roughly 0.6 MB.

## Architecture rules

The animated React components keep stable CSS class names because GSAP uses those classes as animation targets. Editable text and asset paths belong in typed content files; animation geometry stays in component/CSS/scroll layers.

The archive is intentionally independent from GSAP. It uses normal document scrolling, semantic links and native media elements. Adding archive content must not require changing the animated homepage.

Language preference is stored in `localStorage` and reused by both the animated landing page and archive routes. Switching language does not navigate or intentionally reset scroll position.

## Performance strategy

- GSAP is the only general-purpose animation runtime.
- Locomotive Scroll and `scrollerProxy()` are retired.
- Framer Motion is not required.
- Mobile uses native Safari scrolling plus ScrollTrigger; desktop may use ScrollSmoother.
- Decorative media is lazy/async loaded.
- Works imagery is preloaded only as the TV section approaches the viewport.
- The Three.js telephone scene is dynamically imported near Contact and its WebGL canvas is unmounted again when inactive.
- The archive itself does not initialize GSAP or Three.js.
- Archive audio/video never autoplay and are not eagerly downloaded.

## Static deployment

React Router runs with `ssr: false` and build-time prerendering. Production publishes only:

```text
build/client
```

Netlify does not need a React Router Function/runtime server. The animated homepage, archive indexes and configured item/list detail pages are prerendered automatically.

Adding an item or list to `app/archive/content.ts` automatically adds its deep-link path to the prerender set.

## Quality checks

Typecheck:

```sh
npm run typecheck
```

Production build:

```sh
npm run build
```

Full local check:

```sh
npm run check
```

WebKit/mobile runtime tests:

```sh
npm run build
npm run test:scroll
```

CI verifies:

- retired Locomotive/Supabase/server-runtime dependencies do not return;
- portfolio and archive local assets exist with correct case;
- the TV artwork stays inside its performance budget;
- `/`, `/archive`, `/lists` and configured deep links are prerendered;
- the static production server serves both the animated site and archive;
- mobile GSAP choreography still works in WebKit;
- WebGL mounts/unmounts correctly near Contact;
- archive filters, deep links, language persistence and ranking lists work;
- Netlify Deploy Preview serves both the landing page and archive without runtime functions.

## Scroll architecture

The animated landing page uses a GSAP-native scroll pipeline:

- desktop smooth scrolling is handled by ScrollSmoother;
- ScrollTrigger owns pinned scenes and scroll-driven timelines;
- mobile keeps native browser scrolling and uses ScrollTrigger for animation/pinning;
- responsive branches are isolated and cleaned up on unmount;
- TV preview selection is shared React state;
- the pinned wrapper itself is not transformed by the exit animation.

The media archive deliberately does not share this animation pipeline. This separation keeps long-form browsing and playback stable even if the homepage choreography is tuned again later.
