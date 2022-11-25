import type {
  LinksFunction,
  LoaderArgs,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "@remix-run/react";

import globalStylesUrl from "~/styles/global.css";
import interFont from "@fontsource/inter/index.css";
import notoSansTC from "@fontsource/noto-sans-tc/index.css";
import { getUser } from "./session.server";
import { lngCookie } from "./cookies";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import { useRef } from "react";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: interFont },
  { rel: "stylesheet", href: notoSansTC },
  { rel: "stylesheet", href: globalStylesUrl },
];

export const meta: MetaFunction = ({ data }) => {
  const { lang } = data;
  const title = lang === "zh" ? "趙 悉 尼" : "Sydney Zhao";
  return {
    charset: "utf-8",
    title,
    viewport: "width=device-width,initial-scale=1",
  };
};

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const { lang } = (await lngCookie.parse(cookieHeader)) || { lang: "zh" };

  return json({
    lang,
    user: await getUser(request),
  });
};

function Document({
  children,
  title = `Sydney Zhao`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { lang } = useLoaderData();
  const containerRef = useRef<HTMLBodyElement>(null);

  return (
    <html lang={lang}>
      <head>
        <Meta />
        <Links />
      </head>
      <LocomotiveScrollProvider
        options={{ smooth: true }}
        watch={[]}
        containerRef={containerRef}
        onUpdate={() => console.log("Updated,but not on location change!")}
      >
        <body data-scroll-container ref={containerRef}>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </LocomotiveScrollProvider>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>\(o_o)/</h1>
        <h2>Something went wrong. Please try again soon.</h2>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
