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
import {
  LocomotiveScrollProvider,
  useLocomotiveScroll,
} from "react-locomotive-scroll";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

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

const ScrollTriggerProxy = () => {
  const { scroll } = useLocomotiveScroll();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (scroll && scroll.el) {
      console.log(scroll);
      const element = scroll.el;

      scroll.on("scroll", ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(element, {
        scrollTop(value) {
          return arguments.length
            ? scroll.scrollTo(value, 0, 0)
            : scroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: element.style.transform ? "transform" : "fixed",
      });

      return () => {
        ScrollTrigger.addEventListener("refresh", () => scroll?.update());
        ScrollTrigger.refresh();
      };
    }
  }, [scroll]);

  return null;
};

function Document({
  children,
  title = `Sydney Zhao`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { lang } = useLoaderData();
  const containerRef = useRef<HTMLDivElement>(null);

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
        <ScrollTriggerProxy />
        <body>
          <div id="container" data-scroll-container ref={containerRef}>
            {children}
          </div>
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
