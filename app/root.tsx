import interFont from "@fontsource/inter/index.css?url";
import inria from "@fontsource/inria-serif/index.css?url";
import notoSansTC from "@fontsource/noto-sans-tc/index.css?url";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import {
  LocomotiveScrollProvider,
  useLocomotiveScroll,
} from "~/compat/react-locomotive-scroll";
import globalStylesUrl from "~/styles/global.css?url";
import type { Route } from "./+types/root";
import { langCookie } from "./cookies";
import { getUser } from "./session.server";

export const links = () => [
  { rel: "stylesheet", href: interFont },
  { rel: "stylesheet", href: inria },
  { rel: "stylesheet", href: notoSansTC },
  { rel: "stylesheet", href: globalStylesUrl },
];

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const { lang } = (await langCookie.parse(cookieHeader)) || { lang: "zh" };

  return {
    lang,
    user: await getUser(request),
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const lang = loaderData?.lang ?? "en";
  const title = lang === "zh" ? "趙 悉 尼" : "Sydney Zhao";

  return [
    { title },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
  ];
}

function ScrollTriggerProxy() {
  const { scroll } = useLocomotiveScroll();

  useEffect(() => {
    if (!scroll) return;

    gsap.registerPlugin(ScrollTrigger);
    const element = scroll.el as HTMLElement;
    const handleScroll = () => ScrollTrigger.update();
    const handleRefresh = () => scroll.update?.();

    scroll.on?.("scroll", handleScroll);
    ScrollTrigger.scrollerProxy(element, {
      scrollTop(value) {
        if (arguments.length) {
          scroll.scrollTo(value, 0, 0);
          return value ?? 0;
        }
        return scroll.scroll?.instance?.scroll?.y ?? 0;
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

    ScrollTrigger.addEventListener("refresh", handleRefresh);
    ScrollTrigger.refresh();

    return () => {
      scroll.off?.("scroll", handleScroll);
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
    };
  }, [scroll]);

  return null;
}

export function Layout({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        <LocomotiveScrollProvider
          options={{ smooth: true, lerp: 0.08, multiplier: 0.9 }}
          watch={[]}
          containerRef={containerRef}
        >
          <ScrollTriggerProxy />
          <div id="container" data-scroll-container ref={containerRef}>
            {children}
          </div>
        </LocomotiveScrollProvider>
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
