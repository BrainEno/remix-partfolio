import { gsap } from "gsap";
import ScrollSmoother from "gsap/dist/ScrollSmoother";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import type { PortfolioSection } from "~/portfolio/types";

type SetupOptions = {
  scope: HTMLElement;
  isZh: boolean;
  onSectionChange: (section: PortfolioSection) => void;
  onWorkPreview: (index: number) => void;
};

type ResponsiveConditions = {
  isMobile: boolean;
  isDesktop: boolean;
};

const TELEVISION_EXIT_VIEWPORTS = 1.5;
let pluginsRegistered = false;

function registerScrollPlugins() {
  if (typeof window === "undefined" || pluginsRegistered) return;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  pluginsRegistered = true;
}

function getTelevisionExitDistance() {
  return window.innerHeight * TELEVISION_EXIT_VIEWPORTS;
}

export function ensurePortfolioSmoother() {
  if (typeof window === "undefined") return null;

  registerScrollPlugins();

  const existing = ScrollSmoother.get();
  if (existing) return existing;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: reduceMotion ? 0 : 0.8,
    smoothTouch: reduceMotion ? 0 : 0.08,
    normalizeScroll: true,
    speed: 0.9,
    effects: false,
  });
}

export function scrollToPortfolioSection(section: PortfolioSection) {
  if (typeof window === "undefined") return;

  const target = `#${section}`;
  const smoother = ensurePortfolioSmoother();

  if (smoother) {
    smoother.scrollTo(target, true, "top top");
    return;
  }

  document.querySelector(target)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function setupSectionTracking(
  onSectionChange: (section: PortfolioSection) => void
) {
  const sections: PortfolioSection[] = ["intro", "partfolio", "contact"];

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: `#${section}`,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) onSectionChange(section);
      },
      invalidateOnRefresh: true,
    });
  });
}

function setupIntroParallax() {
  gsap.fromTo(
    ".intro-headline-bar-image",
    { yPercent: -15 },
    {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro-headline-box",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );

  gsap.fromTo(
    ".intro-photo",
    { yPercent: 7 },
    {
      yPercent: -7,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro-headline-box",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );
}

function setupMobileWorkPreview(onWorkPreview: (index: number) => void) {
  const rows = gsap.utils.toArray<HTMLElement>(".work-item");

  rows.forEach((row, index) => {
    const activate = () => onWorkPreview(index);

    ScrollTrigger.create({
      trigger: row,
      start: "top 68%",
      end: "bottom 32%",
      onEnter: activate,
      onEnterBack: activate,
      invalidateOnRefresh: true,
    });
  });
}

function setupTelevisionPin() {
  ScrollTrigger.create({
    trigger: ".tv-box",
    start: "center center",
    endTrigger: ".work-items-box",
    end: () => `bottom+=${getTelevisionExitDistance()} top`,
    pin: ".tv-box-pinner",
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });
}

function setupTelevisionExit(scale: number) {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".work-items-box",
        start: "bottom top",
        end: () => `+=${getTelevisionExitDistance()}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
      defaults: { duration: 2, ease: "none" },
    })
    .to(".tv-cover", {
      autoAlpha: 0,
      duration: 0.1,
    })
    .to(
      ".tv-box",
      {
        rotation: -11,
      },
      ">+=2"
    )
    .to(
      ".tv-box",
      {
        opacity: 0,
        scale,
        zIndex: 1,
      },
      "<+=0.1"
    )
    .to(
      ".tv-bg",
      {
        autoAlpha: 0,
      },
      "<"
    );
}

function setupContactCanvas() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".contact-inner",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
      defaults: { duration: 30, ease: "none" },
    })
    .to(".canvas-container", {
      top: "78vw",
      left: "75vw",
      scale: 1.3,
    });
}

function setupMobileAnimations(
  isZh: boolean,
  onWorkPreview: (index: number) => void
) {
  const headline = gsap.timeline({
    scrollTrigger: {
      trigger: ".intro-headline-box",
      start: "top-=100 top",
      end: () => {
        const element = document.querySelector<HTMLElement>(
          ".intro-headline-box"
        );
        return `+=${Math.max((element?.offsetHeight ?? 100) - 100, 1)}`;
      },
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  if (isZh) {
    headline.to(".intro-headline-word.zh", {
      translateX: "+=20px",
      stagger: 0.2,
    });
  } else {
    headline
      .to(".intro-headline-word.word-1", {
        translateY: "+=50px",
        translateX: "-=16.905px",
        ease: "power1",
        duration: 1,
      })
      .to(
        ".intro-headline-word.word-2",
        {
          translateY: "+=50px",
          translateX: "-=16.905px",
        },
        "<-=0.1"
      )
      .to(
        ".intro-headline-word.word-3",
        {
          translateY: "+=50px",
          translateX: "-=16.905px",
        },
        "<-=0.2"
      );
  }

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".intro-subheadline-stickytainer",
        start: "top-=422 top",
        end: () => {
          const element = document.querySelector<HTMLElement>(
            ".intro-subheadline-stickytainer"
          );
          return `+=${Math.max(element?.offsetHeight ?? window.innerHeight, 1)}`;
        },
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    })
    .to(".intro-subheadline-photo-box", {
      translateX: "10vw",
      rotation: -18.75,
      scale: 1.4,
      autoAlpha: 0.8,
      filter: "grayscale(10%)",
    })
    .to(
      ".intro-subheadline-photo-mask",
      {
        translateX: "4vw",
        width: "+=20vw",
        borderTopLeftRadius: "14vw",
        filter: "grayscale(0%)",
      },
      ">1"
    )
    .to(".intro-subheadline-text-box1", {
      left: "0",
    });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".intro-subheadline-stickytainer2",
        start: "top top",
        end: () => {
          const element = document.querySelector<HTMLElement>(
            ".intro-subheadline-stickytainer2"
          );
          return `+=${Math.max(element?.offsetHeight ?? window.innerHeight, 1)}`;
        },
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { duration: 20, ease: "none" },
    })
    .to(".intro-subheadline-photo-mask2", {
      translateX: "-=40vw",
      stagger: 0.5,
    })
    .to(".intro-subheadline-stickytainer2", {
      transform: "translate3d(-100vw,0px,0px)",
    });

  setupMobileWorkPreview(onWorkPreview);
  setupTelevisionPin();
  setupTelevisionExit(2);
  setupContactCanvas();
}

function setupDesktopAnimations() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".intro-subheadline-stickytainer",
        start: "top-=100 top",
        end: "+=4000",
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { duration: 20, ease: "none" },
    })
    .to(".intro-subheadline-photo-box", {
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
        top: "32vw",
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

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".intro-subheadline-stickytainer2",
        start: "top top",
        end: "+=4000",
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { duration: 20, ease: "none" },
    })
    .to(".intro-subheadline-photo-box2", {
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
    .to(".intro-subheadline-text2", {
      marginBottom: "8vw",
    })
    .to(
      ".intro-subheadline-text2-pic2",
      {
        top: "5vw",
        duration: 15,
      },
      "<+=2"
    )
    .to(
      ".intro-subheadline-text2-pic1",
      {
        top: "-6vw",
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

  setupTelevisionPin();
  setupTelevisionExit(4);
  setupContactCanvas();
}

export function setupPortfolioScroll({
  scope,
  isZh,
  onSectionChange,
  onWorkPreview,
}: SetupOptions) {
  if (typeof window === "undefined") return () => undefined;

  registerScrollPlugins();
  ensurePortfolioSmoother();

  const media = gsap.matchMedia();

  media.add(
    {
      isMobile: "(max-width: 480px)",
      isDesktop: "(min-width: 481px)",
    },
    (context) => {
      const { isMobile } = context.conditions as ResponsiveConditions;

      setupSectionTracking(onSectionChange);
      setupIntroParallax();

      if (isMobile) {
        setupMobileAnimations(isZh, onWorkPreview);
      } else {
        setupDesktopAnimations();
      }
    },
    scope
  );

  const refresh = () => ScrollTrigger.refresh();
  const frame = window.requestAnimationFrame(refresh);
  void document.fonts?.ready.then(refresh);

  return () => {
    window.cancelAnimationFrame(frame);
    media.revert();
  };
}
