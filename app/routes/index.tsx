import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import homeStylesUrl from "~/styles/index.css";
import locomotiveStylesUrl from "locomotive-scroll/dist/locomotive-scroll.css";
import Intro from "../components/Intro";
import Header from "../components/Header";
import { getInfroListItems } from "../models/work.server";
import Partifolio from "../components/Partfolio";
import Contact from "../components/Contact";
import { langCookie } from "../cookies";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useInView } from "framer-motion";
import { useLocomotiveScroll } from "react-locomotive-scroll";
import ScrollToPlugin from "gsap/dist/ScrollToPlugin";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStylesUrl },
  { rel: "stylesheet", href: locomotiveStylesUrl },
];

export type Language = "zh" | "en";
export type SectionOptions = "intro" | "partfolio" | "contact";
export type IntroItem = {
  id: string;
  name: string;
  title: string;
  date: string;
  imageUri: string;
  groupName: string;
  groupTitle: string;
};

export type LoaderData = {
  lang: Language;
  works: IntroItem[];
};

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const works = (await getInfroListItems()) ?? [];
  const cookieHeader = request.headers.get("Cookie");
  let lang: string = "zh";
  try {
    const cookie = await langCookie.parse(cookieHeader);
    if (cookie.lang) {
      lang = cookie.lang;
    }
  } catch (error) {
    return json({ lang, works });
  }
  return json({ lang, works });
};

export const action = async ({ request }: ActionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await langCookie.parse(cookieHeader)) || { lang: "zh" };
  const formData = await request.formData();

  if (formData.get("lang")) {
    cookie.lang = formData.get("lang");
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await langCookie.serialize(cookie),
    },
  });
};

export default function Index() {
  gsap.registerPlugin([ScrollToPlugin]);
  const { scroll } = useLocomotiveScroll();
  const [section, setSection] = useState<SectionOptions>("intro");
  const { lang } = useLoaderData<LoaderData>();
  const [language, setLanguage] = useState<Language>(lang ?? "zh");
  const introRef = useRef<HTMLDivElement | null>(null);
  const partfolioRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  const introInView = useInView(introRef, {
    margin: "20px",
  });
  const partfolioInView = useInView(partfolioRef, {
    margin: "0px",
  });
  const contactInView = useInView(contactRef, {
    margin: "0px",
  });

  const isZh = language === "zh";

  const handleIntro = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setSection("intro");
      scroll && scroll.scrollTo("#intro");
    },
    [scroll]
  );

  const handlePartfolio = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setSection("partfolio");
      scroll && scroll.scrollTo("#partfolio");
    },
    [scroll]
  );

  const handleContact = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setSection("contact");
      scroll && scroll.scrollTo("#contact");
    },
    [scroll]
  );

  useEffect(() => {
    if (scroll) {
      scroll.on("scroll", () => {
        if (introInView && !partfolioInView && !contactInView) {
          setSection("intro");
        } else if (partfolioInView && !contactInView) {
          setSection("partfolio");
        } else if (contactInView) {
          setSection("contact");
        }
      });
    }
  }, [contactInView, introInView, partfolioInView, scroll]);

  useEffect(() => {
    setTimeout(() => {
      const t1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".intro-subheadline-stickytainer",
          scroller: "#container",
          start: "top-=100 top",
          end: "4000",
          scrub: true,
          pin: true,
          pinType: "transform",
          immediateRender: false,
        },
        defaults: { duration: 20, ease: "none" },
      });

      const t2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".intro-subheadline-stickytainer2",
          scroller: "#container",
          start: "top top",
          end: "4000",
          scrub: true,
          pin: true,
          pinType: "transform",
        },
        defaults: { duration: 20, ease: "none" },
      });

      t1.to(".intro-subheadline-photo-box", {
        translateY: "4vw",
        translateX: "10vw",
        rotation: -18.75,
        scale: 1.2,
        autoAlpha: 0.8,
        ease: "slow(0.7,0.7,false)",
        filter: "grayscale(10%)",
      })
        .to(
          ".intro-subheadline-title",
          {
            left: "12vw",
            top: "31vw",
            ease: "sine.out",
          },
          "<3"
        )
        .to(
          ".intro-subheadline-photo-ghost-mask",
          {
            autoAlpha: 0,
            rotation: 18.15,
          },
          "<"
        )
        .to(
          ".intro-subheadline-pic-info",
          {
            autoAlpha: 1,
            ease: "power1.out",
            scale: 1,
          },
          "+=5"
        )
        .to(
          ".intro-subheadline-photo-mask",
          {
            width: "+=20vw",
            borderTopLeftRadius: "14vw",
            filter: "grayscale(0%)",
          },
          ">5"
        )
        .to(
          ".intro-subheadline-title",
          {
            left: "+=20vw",
          },
          "<"
        )
        .to(
          ".intro-subheadline-text-box1",
          {
            left: "0",
          },
          ">5"
        )
        .to(
          ".intro-subheadline-photo-box",
          {
            left: "-100%",
          },
          "<9"
        )
        .to(
          ".intro-subheadline-title",
          {
            left: "-66vw",
          },
          "<"
        );

      t2.to(".intro-subheadline-photo-box2", {
        x: "-=130vw",
      })
        .to(
          ".intro-subheadline-photo-mask2",
          {
            marginRight: "5.5vw",
          },
          "<"
        )
        .to(".intro-subheadline-slider2", {
          x: "-100vw",
        })
        .to(
          ".intro-subheadline-photo-box2",
          {
            x: "-=100vw",
          },
          "<"
        )
        .to('.intro-subheadline-text2',{
          marginBottom:'8vw'
        })
        .to(".intro-subheadline-text2-pic2", {
          top: '5vw',
          duration: 15,
        },'<+=2')
        .to(
          ".intro-subheadline-text2-pic1",
          {
            top: '-8vw',
            duration: 20,
          },
          "<+=2"
        )
        .to(
          "#intro",
          {
            backgroundColor: "#013171",
          },
          ">-=2"
        );

      const t3 = gsap.timeline({
        scrollTrigger: {
          trigger: ".tv-box-pinner",
          scroller: "#container",
          start: "50 top",
          end: "3173",
          scrub: true,
          pin: true,
          pinType: "transform",
          pinSpacing: false,
        },
        defaults: { duration: 20, ease: "none" },
      });

      t3.to(".tv-box-pinner", {
        top: '50vh',
      });

      const t4 = gsap.timeline({
        scrollTrigger: {
          trigger: ".tv-transition-trigger",
          scroller: "#container",
          start: "top center",
          end: '200vh',
          scrub: true,
          immediateRender:false
        },
        defaults: { duration: 2, ease: "none" },
      });

      t4.to(".tv-cover", {
        display: "none",
        opacity: 0,
        duration: 0.1,
      })
        .to(
          ".tv-box",
          {
            scale: 16,
            rotation: 45,
          },
          ">"
        )
        .to(
          ".tv-bg",
          {
            opacity: 0,
          },
          "<"
        );
    }, 1000);
    return () => ScrollTrigger.refresh();
  }, []);

  return (
    <div className="page-home">
      <Header
        lang={language}
        setLanguage={setLanguage}
        section={section}
        handleIntro={handleIntro}
        handlePartfolio={handlePartfolio}
        handleContact={handleContact}
      />
      <div id="home">
        <Intro isZh={isZh} ref={introRef} />
        <Partifolio isZh={isZh} ref={partfolioRef} />
        <Contact isZh={isZh} ref={contactRef} />
      </div>
    </div>
  );
}
