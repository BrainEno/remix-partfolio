# Remix Portfolio

A portfolio site originally built with Remix, now migrated to the current React Router Framework Mode stack while preserving the original visual design, GSAP animations, Locomotive Scroll behavior, and Netlify deployment target.

## Stack

- React Router 8 (Framework Mode)
- React 19
- Vite 8
- TypeScript 5.9
- GSAP / ScrollTrigger
- Locomotive Scroll
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

## Migration notes

The project no longer uses the Classic Remix compiler, the legacy custom Netlify Remix server entry, or the old Remix browser/server entry files. Routing, type generation, and builds now use React Router Framework Mode and Vite.

The old `react-locomotive-scroll` wrapper was replaced with a small local adapter around `locomotive-scroll` so the original scrolling behavior can be preserved on React 19 without keeping an abandoned React 18-only wrapper dependency.
