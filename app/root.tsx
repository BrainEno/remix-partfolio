import interFont from "@fontsource/inter/index.css?url";
import inria from "@fontsource/inria-serif/index.css?url";
import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import globalStylesUrl from "~/styles/global.css?url";
import type { Route } from "./+types/root";
import { portfolioContent } from "./portfolio/content";

export const links = () => [
  { rel: "stylesheet", href: interFont },
  { rel: "stylesheet", href: inria },
  { rel: "stylesheet", href: globalStylesUrl },
];

export const meta = () => [
  { title: portfolioContent.identity.displayName },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Uh-oh!";
  let message = "Something went wrong. Please try again soon.";
  let details: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message ?? error.statusText;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="error-container">
      <h1>{title}</h1>
      <h2>{message}</h2>
      {details ? <pre>{details}</pre> : null}
    </div>
  );
}
