import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOBILE_MEDIA_QUERY } from "~/portfolio/media";

type SetupMobileChoreographyOptions = {
  scope: HTMLElement;
  onWorkPreview: (index: number) => void;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function mobileScrub(value = 0.28) {
  return prefersReducedMotion() ? false : value;
}

function killTrigger(id: string) {
  const trigger = ScrollTrigger.getById(id);
  trigger?.animation?.kill();
  trigger?.kill(true);
}

function replaceBaseMobileTriggers() {
  ["intro-headline", "intro-photo", "intro-story-2", "tv-pin", "tv-exit"].forEach(
    killTrigger
  );

  ScrollTrigger.getAll()
    .filter((trigger) => trigger.vars.id?.toString().startsWith("work-"))
    .forEach((trigger) => {
      trigger.animation?.kill();
      trigger.kill(true);
    });
}

function setupHero() {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "mobile-intro-headline",
      trigger: ".intro-headline-box",
      start: "top top",
      end: "bottom 42%",
      scrub: mobileScrub(0.24),
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  const words = gsap.utils.toArray<HTMLElement>(".intro-headline-word");
  words.forEach((word, index) => {
    timeline.to(
      word,
      {
        y: 106 + index * 8,
        x: word.classList.contains("zh") ? 16 : -10,
        duration: 1,
      },
      index * 0.08
    );
  });

  // The portrait belongs to the same opening movement as the words. It should
  // drift downward while enlarging/rotating instead of running on a separate
  // parallax trigger that can visually fight the headline choreography.
  timeline
    .to(
      ".intro-photo-box",
      {
        y: "17svh",
        x: "-1.5vw",
        duration: 1,
      },
      0
    )
    .to(
      ".intro-photo",
      {
        yPercent: 8,
        scale: 1.14,
        rotation: 6,
        transformOrigin: "50% 55%",
        duration: 1,
      },
      0
    );
}

function setupSecondIntroStory() {
  const scene = document.querySelector<HTMLElement>(
    ".intro-subheadline-stickytainer2"
  );
  if (!scene) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "mobile-intro-story-2",
      trigger: scene,
      start: "top top",
      end: () => `+=${Math.max(scene.offsetHeight, window.innerHeight * 1.35)}`,
      scrub: mobileScrub(0.3),
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  // Both layers begin off the right edge. The photo rail glides in first but
  // the paragraph is already moving at the same instant, so there is no empty
  // black beat between the two parts of the introduction.
  timeline
    .to(
      ".intro-subheadline-photo-box2",
      {
        x: "-104vw",
        y: "-3svh",
        rotation: -1.25,
        duration: 0.92,
      },
      0
    )
    .to(
      ".intro-subheadline-text-box2",
      {
        x: "-100vw",
        duration: 1,
      },
      0
    );
}

function setupWorkPreview(onWorkPreview: (index: number) => void) {
  const rows = gsap.utils.toArray<HTMLElement>(".work-item");
  const screen = document.querySelector<HTMLElement>(".tv-all-vids");
  const workItems = document.querySelector<HTMLElement>(".work-items-box");
  if (!screen || !workItems || rows.length === 0) return;

  const syncPreviewToScreen = () => {
    const screenRect = screen.getBoundingClientRect();
    let activeIndex = -1;
    let greatestOverlap = 0;

    rows.forEach((row, index) => {
      // The title/entry itself, rather than an arbitrary viewport percentage,
      // is the source of truth. This keeps the TV grey until project text is
      // physically crossing the transparent screen opening on every iPhone
      // viewport height.
      const entry = row.querySelector<HTMLElement>(".work-item-entry") ?? row;
      const rowRect = entry.getBoundingClientRect();
      const overlap = Math.max(
        0,
        Math.min(rowRect.bottom, screenRect.bottom) -
          Math.max(rowRect.top, screenRect.top)
      );

      if (overlap > greatestOverlap) {
        greatestOverlap = overlap;
        activeIndex = index;
      }
    });

    onWorkPreview(activeIndex);
  };

  ScrollTrigger.create({
    id: "mobile-work-preview",
    trigger: workItems,
    start: "top bottom",
    end: "bottom top",
    onEnter: syncPreviewToScreen,
    onEnterBack: syncPreviewToScreen,
    onUpdate: syncPreviewToScreen,
    onLeave: () => onWorkPreview(-1),
    onLeaveBack: () => onWorkPreview(-1),
    invalidateOnRefresh: true,
  });
}

function setupTelevision(onWorkPreview: (index: number) => void) {
  setupWorkPreview(onWorkPreview);

  ScrollTrigger.create({
    id: "mobile-tv-pin",
    trigger: ".tv-bg-box",
    start: "top top",
    endTrigger: ".tv-exit-spacer",
    end: "bottom bottom",
    pin: ".tv-box-pinner",
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onEnter: () => onWorkPreview(-1),
    onEnterBack: () => onWorkPreview(-1),
  });

  const exitTimeline = gsap.timeline({
    scrollTrigger: {
      id: "mobile-tv-exit",
      trigger: ".tv-exit-spacer",
      // Start only after the final project text has cleared the screen opening.
      start: "top 56%",
      end: "bottom bottom",
      scrub: mobileScrub(0.34),
      invalidateOnRefresh: true,
      onEnter: () => onWorkPreview(-1),
      onEnterBack: () => onWorkPreview(-1),
    },
    defaults: { ease: "none" },
  });

  // Exit state machine:
  // 1. project image is already gone and the CRT is back to its grey-green idle;
  // 2. the television rotates/enlarges while that grey-green screen collapses to black;
  // 3. once the black screen has taken over the viewport, it fades to the Contact
  //    section's white background; Contact typography and the phone model emerge
  //    during this black -> white passage.
  exitTimeline
    .to(
      ".tv-box",
      {
        rotation: -4,
        scale: 1.16,
        duration: 0.18,
      },
      0
    )
    .to(
      ".tv-blackscreen",
      {
        "--tv-screen-top": "#6d726b",
        "--tv-screen-mid": "#5d635b",
        "--tv-screen-bottom": "#4f554d",
        "--tv-screen-glow": "rgba(255,255,255,0.04)",
        duration: 0.18,
      },
      0
    )
    .to(
      ".tv-box",
      {
        rotation: -31,
        scale: 10,
        duration: 0.64,
      },
      0.18
    )
    .to(
      ".tv-bg",
      {
        autoAlpha: 0,
        duration: 0.42,
      },
      0.28
    )
    .to(
      ".tv-blackscreen",
      {
        "--tv-screen-top": "#000000",
        "--tv-screen-mid": "#000000",
        "--tv-screen-bottom": "#000000",
        "--tv-screen-glow": "rgba(255,255,255,0)",
        duration: 0.4,
      },
      0.28
    )
    .to(
      ".tv-blackscreen",
      {
        "--tv-screen-top": "#ffffff",
        "--tv-screen-mid": "#ffffff",
        "--tv-screen-bottom": "#ffffff",
        duration: 0.42,
      },
      0.72
    )
    .to(
      ["#partfolio", ".tv-box-stickytainer", ".tv-box-pinner", ".tv-box-mask"],
      {
        backgroundColor: "#ffffff",
        duration: 0.42,
      },
      0.72
    )
    .fromTo(
      ["#contact .contact-text-box", "#contact .contact-headline", ".canvas-container"],
      {
        autoAlpha: 0,
        y: "9svh",
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
      },
      0.78
    )
    .to(
      ".tv-box",
      {
        autoAlpha: 0,
        duration: 0.08,
      },
      1.1
    );
}

export function setupMobileChoreography({
  scope,
  onWorkPreview,
}: SetupMobileChoreographyOptions) {
  if (
    typeof window === "undefined" ||
    !window.matchMedia(MOBILE_MEDIA_QUERY).matches
  ) {
    return () => undefined;
  }

  gsap.registerPlugin(ScrollTrigger);
  replaceBaseMobileTriggers();
  onWorkPreview(-1);

  const context = gsap.context(() => {
    setupHero();
    setupSecondIntroStory();
    setupTelevision(onWorkPreview);
  }, scope);

  const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    window.cancelAnimationFrame(refreshFrame);
    context.revert();
    onWorkPreview(-1);
  };
}
