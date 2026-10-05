import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MEDIA_QUERY } from "~/portfolio/media";

type SetupOptions = {
  scope: HTMLElement;
  onWorkPreview: (index: number) => void;
};

type TvPhase = "idle" | "works" | "phone" | "exit" | "contact";

type WorkPreviewController = {
  trigger: ScrollTrigger;
  sync: () => void;
};

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

function recordTriggerRange(element: HTMLElement, trigger: ScrollTrigger) {
  element.dataset.triggerStart = String(Math.round(trigger.start));
  element.dataset.triggerEnd = String(Math.round(trigger.end));
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
      start: "top 30%",
      end: () => `+=${Math.max(scene.offsetHeight, window.innerHeight * 6.2)}`,
      scrub: prefersReducedMotion() ? false : 0.68,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: (self) => recordTriggerRange(scene, self),
    },
    defaults: { ease: "none" },
  });

  /* Phase A — settle. Portrait rotation, portrait descent, and 简介 descent
     begin at exactly the same point and share the same normalized duration. */
  timeline
    .to(
      photoBox,
      {
        x: "10vw",
        y: "5.5vw",
        rotation: -18.75,
        scale: 1.16,
        autoAlpha: 0.84,
        filter: "grayscale(10%)",
        duration: 0.36,
      },
      0
    )
    .to(
      title,
      {
        left: "12vw",
        top: "33vw",
        duration: 0.36,
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
      0.09
    )
    .to(
      ".intro-subheadline-pic-info",
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.16,
      },
      0.2
    )
    .to(
      photoMask,
      {
        width: "+=20vw",
        borderTopLeftRadius: "14vw",
        filter: "grayscale(0%)",
        duration: 0.18,
      },
      0.3
    );

  /* Phase B — approach. Copy comes from the right while portrait/title stay
     parked. The old title +=20vw movement is intentionally absent. */
  timeline.to(
    copy,
    {
      x: "-50vw",
      duration: 0.25,
    },
    0.45
  );

  /* Phase C — push. Once copy reaches the photo edge, copy + portrait + 简介
     travel left during exactly the same scroll interval. */
  timeline
    .to(
      visualGroup,
      {
        x: "-100vw",
        duration: 0.3,
      },
      0.7
    )
    .to(
      copy,
      {
        x: "-148vw",
        duration: 0.3,
      },
      0.7
    );

  return timeline;
}

function setupWorkPreview(
  scope: HTMLElement,
  onWorkPreview: (index: number) => void
): WorkPreviewController | null {
  const screen = scope.querySelector<HTMLElement>(".tv-all-vids");
  const workItems = scope.querySelector<HTMLElement>(".work-items-box");
  if (!screen || !workItems) return null;

  const sync = () => {
    const rows = Array.from(
      scope.querySelectorAll<HTMLElement>(".work-item")
    );
    if (rows.length === 0) {
      onWorkPreview(-1);
      return;
    }

    const screenRect = screen.getBoundingClientRect();
    const screenCenter = screenRect.top + screenRect.height / 2;
    let activeIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    /* While the list is in its browsing interval, always let the row nearest
       the physical CRT center own the preview. This remains independent of the
       number of configured works. */
    rows.forEach((row, index) => {
      const entry = row.querySelector<HTMLElement>(".work-item-entry") ?? row;
      const rowRect = entry.getBoundingClientRect();
      const rowCenter = rowRect.top + rowRect.height / 2;
      const distance = Math.abs(rowCenter - screenCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    onWorkPreview(activeIndex);
  };

  /* This trigger is deliberately geometry-only. It records the work browsing
     interval but never mutates preview/phase by itself. The master TV phase
     controller below is the single owner of both, preventing a late work
     onUpdate from overwriting the phone hold with `works`. */
  const trigger = ScrollTrigger.create({
    id: "desktop-work-preview",
    trigger: workItems,
    start: "top bottom",
    end: "bottom top",
    onRefresh: (self) => recordTriggerRange(workItems, self),
    invalidateOnRefresh: true,
  });

  return { trigger, sync };
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

  /* Scale/translate the complete TV unit, never the CRT overlay separately.
     The bezel, background, preview image, and phone stay registered together. */
  gsap.set(".tv-box", {
    scale: 1.12,
    y: "-8svh",
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
  if (workPreview) triggers.push(workPreview.trigger);

  const pinTrigger = ScrollTrigger.create({
    id: "desktop-tv-pin",
    trigger: pinner,
    start: "top top",
    endTrigger: exitSpacer,
    end: "bottom top",
    pin: pinner,
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: (self) => recordTriggerRange(pinner, self),
  });
  triggers.push(pinTrigger);

  const phoneTimeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-tv-phone",
      trigger: phoneSpacer,
      start: "top 72%",
      end: "bottom 28%",
      scrub: prefersReducedMotion() ? false : 0.42,
      onEnter: () => onWorkPreview(-1),
      onEnterBack: () => onWorkPreview(-1),
      onUpdate: (self) => {
        if (self.isActive) onWorkPreview(-1);
      },
      onRefresh: (self) => recordTriggerRange(phoneSpacer, self),
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });
  phoneTimeline
    .to(phone, { autoAlpha: 1, y: 0, duration: 0.2 }, 0)
    .to(phone, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.2);
  timelines.push(phoneTimeline);

  const exitTimeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-tv-exit",
      trigger: exitSpacer,
      /* The phone hold ends at bottom 28%; the immediately following exit
         spacer starts at top 28%, so the phases cannot overlap. */
      start: "top 28%",
      end: "bottom top",
      scrub: prefersReducedMotion() ? false : 0.54,
      onEnter: () => onWorkPreview(-1),
      onEnterBack: () => onWorkPreview(-1),
      onUpdate: (self) => {
        if (self.isActive) onWorkPreview(-1);
      },
      onRefresh: (self) => recordTriggerRange(exitSpacer, self),
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  /* Phone first, then grey-green -> black as the TV grows/rotates. White and
     the telephone booth enter only after the black field is established. */
  exitTimeline
    .to(phone, { autoAlpha: 0, y: "-24%", duration: 0.1 }, 0)
    .to(
      ".tv-box",
      {
        scale: 1.48,
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
      [
        "#partfolio",
        ".tv-box-stickytainer",
        ".tv-box-pinner",
        ".tv-box-mask",
        "#contact",
      ],
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

  /* One master controller owns phase + work preview. Using native scrollY is
     intentional: ScrollSmoother still advances the native document scroll,
     and this avoids reading a pin-specific scroll function while that pin is
     being transformed. */
  const syncPhase = () => {
    const scroll = window.scrollY;
    const phoneTrigger = phoneTimeline.scrollTrigger;
    const exitTrigger = exitTimeline.scrollTrigger;

    if (exitTrigger && scroll >= exitTrigger.end) {
      onWorkPreview(-1);
      setTvPhase(scope, "contact");
      return;
    }

    if (exitTrigger && scroll >= exitTrigger.start) {
      onWorkPreview(-1);
      setTvPhase(scope, "exit");
      return;
    }

    if (
      phoneTrigger &&
      scroll >= phoneTrigger.start &&
      scroll <= phoneTrigger.end
    ) {
      onWorkPreview(-1);
      setTvPhase(scope, "phone");
      return;
    }

    if (
      workPreview &&
      scroll >= workPreview.trigger.start &&
      scroll <= workPreview.trigger.end
    ) {
      workPreview.sync();
      setTvPhase(scope, "works");
      return;
    }

    onWorkPreview(-1);
    setTvPhase(scope, "idle");
  };

  const phaseTrigger = ScrollTrigger.create({
    id: "desktop-tv-phase",
    trigger: pinner,
    start: "top top",
    endTrigger: exitSpacer,
    end: "bottom top",
    onEnter: syncPhase,
    onEnterBack: syncPhase,
    onUpdate: syncPhase,
    onRefresh: syncPhase,
    invalidateOnRefresh: true,
  });
  triggers.push(phaseTrigger);

  return [...triggers, ...timelines];
}

/**
 * Desktop behavior contract lives in docs/animation-behavior.md. This module
 * owns the first intro story and the complete Works -> phone -> Contact flow so
 * those phases cannot drift apart across competing desktop ScrollTriggers.
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
