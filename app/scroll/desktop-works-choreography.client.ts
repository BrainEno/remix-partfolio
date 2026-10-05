import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MEDIA_QUERY } from "~/portfolio/media";

type SetupOptions = {
  scope: HTMLElement;
  onWorkPreview: (index: number) => void;
};

type TvPhase = "idle" | "works" | "phone" | "exit" | "contact";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function killBaseTrigger(id: string) {
  const trigger = ScrollTrigger.getById(id);
  trigger?.animation?.kill();
  trigger?.kill(true);
}

function replaceBaseDesktopTriggers() {
  ["intro-story-1", "tv-pin", "tv-exit", "contact-canvas"].forEach(
    killBaseTrigger
  );

  ScrollTrigger.getAll().forEach((trigger) => {
    const id = trigger.vars.id;
    if (typeof id === "string" && id.startsWith("work-")) {
      trigger.animation?.kill();
      trigger.kill(true);
    }
  });
}

function setTvPhase(scope: HTMLElement, phase: TvPhase) {
  const section = scope.querySelector<HTMLElement>("#partfolio");
  if (section) section.dataset.tvPhase = phase;
}

function setupDesktopIntroStory(scope: HTMLElement) {
  const scene = scope.querySelector<HTMLElement>(
    ".intro-subheadline-stickytainer"
  );
  const visualGroup = scope.querySelector<HTMLElement>(
    ".intro-subheadline-visual-group"
  );
  const photoBox = scope.querySelector<HTMLElement>(
    ".intro-subheadline-photo-box"
  );
  const photoMask = scope.querySelector<HTMLElement>(
    ".intro-subheadline-photo-mask"
  );
  const title = scope.querySelector<HTMLElement>(".intro-subheadline-title");
  const copy = scope.querySelector<HTMLElement>(".intro-subheadline-text-box1");

  if (!scene || !visualGroup || !photoBox || !photoMask || !title || !copy) {
    return null;
  }

  scene.dataset.introChoreography = "desktop-push";

  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-intro-story-1",
      trigger: scene,
      // Start while the scene is still entering, so the portrait/title begin
      // descending earlier instead of snapping into motion after reaching top.
      start: "top 28%",
      end: () => `+=${Math.max(scene.offsetHeight, window.innerHeight * 5.6)}`,
      scrub: prefersReducedMotion() ? false : 0.58,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  /* Phase A: the portrait and title settle together. The portrait rotation,
     portrait vertical travel, and title travel all start at 0 and have the
     same duration, so one cannot visually outrun the other. */
  timeline
    .to(
      photoBox,
      {
        x: "10vw",
        y: "4vw",
        rotation: -18.75,
        scale: 1.16,
        autoAlpha: 0.84,
        filter: "grayscale(10%)",
        duration: 0.34,
      },
      0
    )
    .to(
      title,
      {
        left: "12vw",
        top: "32vw",
        duration: 0.34,
      },
      0
    )
    .to(
      ".intro-subheadline-photo-ghost-mask",
      {
        autoAlpha: 0,
        rotation: 18.15,
        duration: 0.18,
      },
      0.08
    )
    .to(
      ".intro-subheadline-pic-info",
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.16,
      },
      0.18
    )
    .to(
      photoMask,
      {
        width: "+=20vw",
        borderTopLeftRadius: "14vw",
        filter: "grayscale(0%)",
        duration: 0.2,
      },
      0.28
    );

  /* Phase B: copy approaches from the right and stops near the portrait. The
     title no longer has the old +=20vw movement that made it travel right. */
  timeline.to(
    copy,
    {
      x: "-48vw",
      duration: 0.26,
    },
    0.43
  );

  /* Phase C: once the copy reaches the portrait edge, it visually pushes the
     portrait + title left. Both pieces now share exactly the same push window. */
  timeline
    .to(
      visualGroup,
      {
        x: "-82vw",
        duration: 0.31,
      },
      0.69
    )
    .to(
      copy,
      {
        x: "-130vw",
        duration: 0.31,
      },
      0.69
    );

  return timeline;
}

function setupWorkPreview(
  scope: HTMLElement,
  onWorkPreview: (index: number) => void
) {
  const screen = scope.querySelector<HTMLElement>(".tv-all-vids");
  const workItems = scope.querySelector<HTMLElement>(".work-items-box");
  if (!screen || !workItems) return null;

  const syncPreviewToScreen = () => {
    const rows = Array.from(
      scope.querySelectorAll<HTMLElement>(".work-item")
    );
    const screenRect = screen.getBoundingClientRect();
    let activeIndex = -1;
    let greatestOverlap = 0;

    rows.forEach((row, index) => {
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
    if (activeIndex >= 0) setTvPhase(scope, "works");
  };

  return ScrollTrigger.create({
    id: "desktop-work-preview",
    trigger: workItems,
    start: "top bottom",
    end: "bottom top",
    onEnter: syncPreviewToScreen,
    onEnterBack: syncPreviewToScreen,
    onUpdate: syncPreviewToScreen,
    onLeave: () => onWorkPreview(-1),
    onLeaveBack: () => {
      onWorkPreview(-1);
      setTvPhase(scope, "idle");
    },
    invalidateOnRefresh: true,
  });
}

function setupTelevisionTransition(
  scope: HTMLElement,
  onWorkPreview: (index: number) => void
) {
  const pinner = scope.querySelector<HTMLElement>(".tv-box-pinner");
  const phoneSpacer = scope.querySelector<HTMLElement>(".tv-phone-spacer");
  const exitSpacer = scope.querySelector<HTMLElement>(".tv-exit-spacer");
  const phone = scope.querySelector<HTMLElement>(".tv-contact-number");
  const canvas = scope.querySelector<HTMLElement>(".canvas-container");
  if (!pinner || !phoneSpacer || !exitSpacer || !phone) return [];

  const triggers: ScrollTrigger[] = [];
  const timelines: gsap.core.Timeline[] = [];

  gsap.set(".tv-box", {
    scale: 1.08,
    y: "-4svh",
    rotation: 0,
    autoAlpha: 1,
  });
  gsap.set(phone, { autoAlpha: 0, y: "38%" });
  gsap.set(".tv-bg", { autoAlpha: 1 });
  gsap.set(".tv-blackscreen", {
    "--tv-screen-top": "#777a76",
    "--tv-screen-mid": "#626560",
    "--tv-screen-bottom": "#545651",
    "--tv-screen-glow": "rgba(255,255,255,0.08)",
  });
  gsap.set(
    ["#partfolio", ".tv-box-stickytainer", ".tv-box-pinner", ".tv-box-mask"],
    { backgroundColor: "#000000" }
  );
  gsap.set("#contact", { backgroundColor: "#ffffff" });

  const contactReveal = Array.from(
    scope.querySelectorAll<HTMLElement>(
      "#contact .contact-headline, #contact .contact-link, #contact .contact-email-link, #contact .contact-inner > h3, #contact .contact-inner > p"
    )
  );
  gsap.set(contactReveal, { autoAlpha: 0, y: "7svh" });
  if (canvas) gsap.set(canvas, { autoAlpha: 0, x: 0, y: 0, scale: 1 });

  setTvPhase(scope, "idle");
  onWorkPreview(-1);

  const workPreview = setupWorkPreview(scope, onWorkPreview);
  if (workPreview) triggers.push(workPreview);

  triggers.push(
    ScrollTrigger.create({
      id: "desktop-tv-pin",
      trigger: pinner,
      start: "top top",
      endTrigger: exitSpacer,
      end: "bottom top",
      pin: pinner,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    })
  );

  const phoneTimeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-tv-phone",
      trigger: phoneSpacer,
      start: "top 72%",
      end: "bottom 28%",
      scrub: prefersReducedMotion() ? false : 0.38,
      onEnter: () => {
        onWorkPreview(-1);
        setTvPhase(scope, "phone");
      },
      onEnterBack: () => {
        onWorkPreview(-1);
        setTvPhase(scope, "phone");
      },
      onLeaveBack: () => setTvPhase(scope, "works"),
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });
  phoneTimeline
    .to(phone, { autoAlpha: 1, y: 0, duration: 0.22 }, 0)
    .to(phone, { autoAlpha: 1, y: 0, duration: 0.78 }, 0.22);
  timelines.push(phoneTimeline);

  const exitTimeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-tv-exit",
      trigger: exitSpacer,
      start: "top 72%",
      end: "bottom top",
      scrub: prefersReducedMotion() ? false : 0.5,
      onEnter: () => {
        onWorkPreview(-1);
        setTvPhase(scope, "exit");
      },
      onEnterBack: () => setTvPhase(scope, "exit"),
      onLeave: () => setTvPhase(scope, "contact"),
      onLeaveBack: () => setTvPhase(scope, "phone"),
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  /* Phone first, then grey-green -> black while the TV grows/rotates. The
     white Contact field and telephone booth do not enter until the black-field
     portion is already established. */
  exitTimeline
    .to(phone, { autoAlpha: 0, y: "-24%", duration: 0.1 }, 0)
    .to(
      ".tv-box",
      {
        scale: 1.42,
        rotation: -5,
        duration: 0.2,
      },
      0.08
    )
    .to(
      ".tv-blackscreen",
      {
        "--tv-screen-top": "#000000",
        "--tv-screen-mid": "#000000",
        "--tv-screen-bottom": "#000000",
        "--tv-screen-glow": "rgba(255,255,255,0)",
        duration: 0.3,
      },
      0.1
    )
    .to(
      ".tv-box",
      {
        scale: 9.5,
        rotation: -30,
        duration: 0.56,
      },
      0.25
    )
    .to(
      ".tv-bg",
      {
        autoAlpha: 0,
        duration: 0.34,
      },
      0.3
    );

  if (canvas) {
    exitTimeline.to(
      canvas,
      {
        autoAlpha: 1,
        x: "-82vw",
        y: "2svh",
        scale: 1.08,
        duration: 0.42,
      },
      0.48
    );
  }

  exitTimeline
    .to(
      ".tv-blackscreen",
      {
        "--tv-screen-top": "#ffffff",
        "--tv-screen-mid": "#ffffff",
        "--tv-screen-bottom": "#ffffff",
        duration: 0.25,
      },
      0.68
    )
    .to(
      ["#partfolio", ".tv-box-stickytainer", ".tv-box-pinner", ".tv-box-mask", "#contact"],
      {
        backgroundColor: "#ffffff",
        duration: 0.25,
      },
      0.68
    )
    .to(
      contactReveal,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.22,
        stagger: 0.015,
      },
      0.76
    )
    .to(
      ".tv-box",
      {
        autoAlpha: 0,
        duration: 0.08,
      },
      0.94
    );
  timelines.push(exitTimeline);

  return [...triggers, ...timelines];
}

/**
 * Desktop behavior contract lives in docs/animation-behavior.md. This module
 * intentionally owns the first intro story and the complete Works -> phone ->
 * Contact transition so those phases cannot be split across competing desktop
 * ScrollTriggers again.
 */
export function setupDesktopWorksChoreography({
  scope,
  onWorkPreview,
}: SetupOptions) {
  if (
    typeof window === "undefined" ||
    !window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  ) {
    return () => undefined;
  }

  gsap.registerPlugin(ScrollTrigger);
  replaceBaseDesktopTriggers();

  const context = gsap.context(() => {
    setupDesktopIntroStory(scope);
    setupTelevisionTransition(scope, onWorkPreview);
  }, scope);

  const refreshFrame = window.requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  return () => {
    window.cancelAnimationFrame(refreshFrame);
    context.revert();
    onWorkPreview(-1);
    const section = scope.querySelector<HTMLElement>("#partfolio");
    if (section) delete section.dataset.tvPhase;
  };
}
