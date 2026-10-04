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

  rows.forEach((row, index) => {
    const activate = () => onWorkPreview(index);

    ScrollTrigger.create({
      id: `mobile-work-${index}`,
      trigger: row,
      // The screen opening in the mobile TV sits roughly between 57% and 73%
      // of viewport height. A row becomes active only while it traverses that
      // visual window, so the TV remains grey before the first title arrives.
      start: "top 72%",
      end: "bottom 56%",
      onEnter: activate,
      onEnterBack: activate,
      onLeaveBack: () => {
        if (index === 0) onWorkPreview(-1);
      },
      onLeave: () => {
        if (index === rows.length - 1) onWorkPreview(-1);
      },
      invalidateOnRefresh: true,
    });
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
      // Start after the last work row has left the TV screen opening.
      start: "top 56%",
      end: "bottom bottom",
      scrub: mobileScrub(0.34),
      invalidateOnRefresh: true,
      onEnter: () => onWorkPreview(-1),
      onEnterBack: () => onWorkPreview(-1),
    },
    defaults: { ease: "none" },
  });

  // The final transition deliberately echoes the original site: the screen is
  // grey again first, then the whole television grows/rotates until the screen
  // becomes the page background. The photographic TV layer fades away while
  // the underlying screen darkens to black.
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
        backgroundColor: "#555754",
        duration: 0.16,
      },
      0
    )
    .to(
      ".tv-box",
      {
        rotation: -31,
        scale: 10,
        duration: 0.82,
      },
      0.18
    )
    .to(
      ".tv-bg",
      {
        autoAlpha: 0,
        duration: 0.52,
      },
      0.38
    )
    .to(
      ".tv-blackscreen",
      {
        backgroundColor: "#000",
        duration: 0.52,
      },
      0.38
    )
    .fromTo(
      ["#contact .contact-text-box", "#contact .contact-headline", ".canvas-container"],
      {
        autoAlpha: 0,
        y: "10svh",
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
      },
      0.62
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
