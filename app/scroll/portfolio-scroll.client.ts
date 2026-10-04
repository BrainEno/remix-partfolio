import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DESKTOP_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
} from "~/portfolio/media";
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

const MOBILE_TV_EXIT_VIEWPORTS = 1.2;
const DESKTOP_TV_EXIT_VIEWPORTS = 1.5;
let pluginsRegistered = false;

function registerScrollPlugins() {
  if (typeof window === "undefined" || pluginsRegistered) return;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });
  pluginsRegistered = true;
}

function isMobileViewport() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getTelevisionExitDistance(viewports: number) {
  return window.innerHeight * viewports;
}

function getPinDistance(selector: string, minimumViewports = 1) {
  const element = document.querySelector<HTMLElement>(selector);
  return Math.max(
    element?.offsetHeight ?? 0,
    window.innerHeight * minimumViewports
  );
}

function disablePortfolioSmoother() {
  const existing = ScrollSmoother.get();
  if (existing) existing.kill();

  gsap.set("#smooth-content", { clearProps: "transform" });
  gsap.set("#smooth-wrapper", { clearProps: "height,overflow,position" });
}

export function ensurePortfolioSmoother() {
  if (typeof window === "undefined") return null;

  registerScrollPlugins();

  if (isMobileViewport()) {
    disablePortfolioSmoother();
    return null;
  }

  const existing = ScrollSmoother.get();
  if (existing) return existing;

  return ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: prefersReducedMotion() ? 0 : 0.8,
    speed: 0.9,
    effects: false,
  });
}

export function scrollToPortfolioSection(section: PortfolioSection) {
  if (typeof window === "undefined") return;

  registerScrollPlugins();

  const target = document.getElementById(section);
  if (!target) return;

  if (isMobileViewport()) {
    disablePortfolioSmoother();
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    return;
  }

  const smoother = ensurePortfolioSmoother();
  if (smoother) {
    smoother.scrollTo(target, !prefersReducedMotion(), "top top");
    return;
  }

  target.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

function setupSectionTracking(
  onSectionChange: (section: PortfolioSection) => void
) {
  const sections: PortfolioSection[] = ["intro", "partfolio", "contact"];

  sections.forEach((section) => {
    ScrollTrigger.create({
      id: `section-${section}`,
      trigger: `#${section}`,
      start: "top 55%",
      end: "bottom 45%",
      onEnter: () => onSectionChange(section),
      onEnterBack: () => onSectionChange(section),
      onToggle: (self) => {
        if (self.isActive) onSectionChange(section);
      },
      invalidateOnRefresh: true,
    });
  });
}

function setupIntroHeadlineChoreography(isZh: boolean, isMobile: boolean) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-headline",
      trigger: ".intro-headline-box",
      start: isMobile ? "top top" : "top 8%",
      end: isMobile ? "bottom 42%" : "bottom 28%",
      scrub: prefersReducedMotion() ? false : 0.35,
      invalidateOnRefresh: true,
    },
  });

  if (isZh) {
    timeline.to(".intro-headline-word.zh", {
      y: isMobile ? 96 : 56,
      x: isMobile ? 18 : 20,
      stagger: 0.18,
      ease: "none",
    });
    return;
  }

  timeline
    .to(".intro-headline-word.word-1", {
      y: isMobile ? 96 : 50,
      x: isMobile ? -12 : -16.905,
      ease: "none",
      duration: 1,
    })
    .to(
      ".intro-headline-word.word-2",
      {
        y: isMobile ? 96 : 50,
        x: isMobile ? -12 : -16.905,
        ease: "none",
      },
      "<-=0.1"
    )
    .to(
      ".intro-headline-word.word-3",
      {
        y: isMobile ? 96 : 50,
        x: isMobile ? -12 : -16.905,
        ease: "none",
      },
      "<-=0.2"
    );
}

function setupIntroParallax(isMobile: boolean) {
  if (!isMobile) {
    gsap.fromTo(
      ".intro-headline-bar-image",
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          id: "intro-bars",
          trigger: ".intro-headline-box",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  gsap.fromTo(
    ".intro-photo",
    { yPercent: isMobile ? 0 : 7, scale: 1, rotation: 0 },
    {
      yPercent: isMobile ? -10 : -7,
      scale: isMobile ? 1.16 : 1.06,
      rotation: isMobile ? 7 : 2.5,
      transformOrigin: "50% 55%",
      ease: "none",
      scrollTrigger: {
        id: "intro-photo",
        trigger: ".intro-headline-box",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );
}

function setupFirstIntroStory(isMobile: boolean) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-story-1",
      trigger: ".intro-subheadline-stickytainer",
      start: isMobile ? "top 12%" : "top-=100 top",
      end: () => `+=${getPinDistance(
        ".intro-subheadline-stickytainer",
        isMobile ? 1.35 : 4
      )}`,
      scrub: prefersReducedMotion() ? false : true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  timeline.to(".intro-subheadline-photo-box", {
    y: isMobile ? "18vh" : "4vw",
    x: isMobile ? "20vw" : "10vw",
    rotation: -18.75,
    scale: isMobile ? 1.45 : 1.2,
    autoAlpha: 0.82,
    filter: "grayscale(10%)",
    duration: 4,
  });

  if (!isMobile) {
    timeline
      .to(
        ".intro-subheadline-title",
        {
          left: "12vw",
          top: "32vw",
          ease: "sine.out",
        },
        "<1"
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
          scale: 1,
          ease: "power1.out",
        },
        ">+=1"
      );
  }

  timeline
    .to(
      ".intro-subheadline-photo-mask",
      {
        x: isMobile ? "4vw" : 0,
        width: "+=20vw",
        borderTopLeftRadius: "14vw",
        filter: "grayscale(0%)",
        duration: 4,
      },
      ">+=0.5"
    )
    .to(
      ".intro-subheadline-text-box1",
      {
        left: 0,
        duration: 4,
      },
      ">+=0.5"
    );

  if (!isMobile) {
    timeline
      .to(
        ".intro-subheadline-title",
        {
          left: "+=20vw",
          duration: 3,
        },
        "<"
      )
      .to(
        ".intro-subheadline-photo-box",
        {
          left: "-100%",
          duration: 6,
        },
        ">+=1"
      )
      .to(
        ".intro-subheadline-title",
        {
          left: "-66vw",
          duration: 6,
        },
        "<"
      );
  }
}

function setupSecondIntroStory(isMobile: boolean) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-story-2",
      trigger: ".intro-subheadline-stickytainer2",
      start: "top top",
      end: () => `+=${getPinDistance(
        ".intro-subheadline-stickytainer2",
        isMobile ? 1.2 : 4
      )}`,
      scrub: prefersReducedMotion() ? false : true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { duration: 20, ease: "none" },
  });

  if (isMobile) {
    timeline.to(".intro-subheadline-stickytainer2", {
      x: "-100vw",
    });
    return;
  }

  timeline
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
}

function setupWorkPreview(onWorkPreview: (index: number) => void) {
  const rows = gsap.utils.toArray<HTMLElement>(".work-item");

  rows.forEach((row, index) => {
    const activate = () => onWorkPreview(index);

    ScrollTrigger.create({
      id: `work-${index}`,
      trigger: row,
      start: "top 62%",
      end: "bottom 38%",
      onEnter: activate,
      onEnterBack: activate,
      invalidateOnRefresh: true,
    });
  });
}

function setupTelevisionSequence(
  onWorkPreview: (index: number) => void,
  isMobile: boolean
) {
  const exitViewports = isMobile
    ? MOBILE_TV_EXIT_VIEWPORTS
    : DESKTOP_TV_EXIT_VIEWPORTS;

  setupWorkPreview(onWorkPreview);

  ScrollTrigger.create({
    id: "tv-pin",
    trigger: ".tv-box",
    start: "center center",
    endTrigger: ".work-items-box",
    end: () => `bottom+=${getTelevisionExitDistance(exitViewports)} top`,
    pin: ".tv-box-pinner",
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onEnter: () => onWorkPreview(0),
    onEnterBack: () => {
      const rows = gsap.utils.toArray<HTMLElement>(".work-item");
      if (rows.length > 0) onWorkPreview(rows.length - 1);
    },
  });

  gsap
    .timeline({
      scrollTrigger: {
        id: "tv-exit",
        trigger: ".work-items-box",
        start: "bottom top",
        end: () => `+=${getTelevisionExitDistance(exitViewports)}`,
        scrub: prefersReducedMotion() ? false : true,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    })
    .to(".tv-cover", {
      autoAlpha: 0,
      duration: 0.1,
    })
    .to(
      ".tv-box",
      {
        rotation: -11,
        duration: 2,
      },
      ">+=0.75"
    )
    .to(
      ".tv-box",
      {
        autoAlpha: 0,
        scale: isMobile ? 2.4 : 4,
        zIndex: 1,
        duration: 2,
      },
      "<+=0.1"
    )
    .to(
      ".tv-bg",
      {
        autoAlpha: 0,
        duration: 0.2,
      },
      "<"
    );
}

function setupContactCanvas() {
  gsap
    .timeline({
      scrollTrigger: {
        id: "contact-canvas",
        trigger: ".contact-inner",
        start: "top center",
        end: "bottom bottom",
        scrub: prefersReducedMotion() ? false : true,
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

function setupResponsiveAnimations(
  isZh: boolean,
  isMobile: boolean,
  onWorkPreview: (index: number) => void
) {
  setupIntroHeadlineChoreography(isZh, isMobile);
  setupIntroParallax(isMobile);
  setupFirstIntroStory(isMobile);
  setupSecondIntroStory(isMobile);
  setupTelevisionSequence(onWorkPreview, isMobile);
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

  const media = gsap.matchMedia();

  media.add(
    {
      isMobile: MOBILE_MEDIA_QUERY,
      isDesktop: DESKTOP_MEDIA_QUERY,
    },
    (context) => {
      const { isMobile } = context.conditions as ResponsiveConditions;

      if (isMobile) {
        disablePortfolioSmoother();
      } else {
        ensurePortfolioSmoother();
      }

      setupSectionTracking(onSectionChange);
      setupResponsiveAnimations(isZh, isMobile, onWorkPreview);
    },
    scope
  );

  const refresh = () => {
    ScrollTrigger.refresh();
    scope.dataset.scrollTriggerCount = String(ScrollTrigger.getAll().length);
  };

  const frame = window.requestAnimationFrame(() => {
    refresh();
    window.requestAnimationFrame(refresh);
  });
  void document.fonts?.ready.then(refresh);

  return () => {
    window.cancelAnimationFrame(frame);
    media.revert();
    ScrollSmoother.get()?.kill();
    gsap.set("#smooth-content", { clearProps: "transform" });
    delete scope.dataset.scrollTriggerCount;
  };
}
