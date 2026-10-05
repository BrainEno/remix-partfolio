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
      // Begin while the scene is still entering. This gives both portrait and
      // 简介 time to descend rather than starting after the composition has
      // already reached the top of the viewport.
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

  /* Phase A — settle. The portrait rotation, portrait descent and title
     descent share the same start and duration. Their pixel distances differ,
     but their normalized progress is intentionally identical. */
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

  /* Phase B — approach. The copy crosses the right half of the viewport while
     the portrait/title stay parked. There is deliberately no title movement
     to the right in this phase. */
  timeline.to(
    copy,
    {
      x: "-50vw",
      duration: 0.25,
    },
    0.45
  );

  /* Phase C — push. Once the copy reaches the portrait edge, the visual group
     and copy leave to the left during the same scroll interval. */
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
) {
  const screen = scope.querySelector<HTMLElement>(".tv-all-vids");
  const workItems = scope.querySelector<HTMLElement>(".work-items-box");
  if (!screen || !workItems) return null;

  const syncPreviewToScreen = () => {
    const rows = Array.from(
      scope.querySelectorAll<HTMLElement>(".work-item")
    );
    const screenRect = screen.getBoundingClientRect();
    const screenCenter = screenRect.top + screenRect.height / 2;
    const activationRadius = Math.max(
      screenRect.height * 1.15,
      window.innerHeight * 0.16
    );

    let activeIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    rows.forEach((row, index) => {
      const entry = row.querySelector<HTMLElement>(".work-item-entry") ?? row;
      const rowRect = entry.getBoundingClientRect();
      const rowCenter = rowRect.top + rowRect.height / 2;
      const distance = Math.abs(rowCenter - screenCenter);
      const isNearViewport =
        rowRect.bottom > -activationRadius &&
        rowRect.top < window.innerHeight + activationRadius;

      if (
        isNearViewport &&
        distance <= activationRadius &&
        distance < closestDistance
      ) {
        closestDistance = distance;
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
    onRefresh: (self) => {
      recordTriggerRange(workItems, self);
      syncPreviewToScreen();
    },
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

  // Scale and translate the whole TV unit, never the CRT overlay separately.
  // This makes the physical set slightly larger and raises the television in
  // the composition while preserving the screen/bezel registration.
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
      onRefresh: (self) => recordTriggerRange(pinner, self),
    })
  );

  const phoneTimeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-tv-phone",
      trigger: phoneSpacer,
      start: "top 72%",
      end: "bottom 28%",
      scrub: prefersReducedMotion() ? false : 0.42,
      onEnter: () => {
        onWorkPreview(-1);
        setTvPhase(scope, "phone");
      },
      onEnterBack: () => {
        onWorkPreview(-1);
        setTvPhase(scope, "phone");
      },
      onUpdate: (self) => {
        if (self.isActive) {
          onWorkPreview(-1);
          setTvPhase(scope, "phone");
        }
      },
      onLeaveBack: () => setTvPhase(scope, "works"),
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
      // The phone timeline ends when the bottom of its spacer reaches 28%.
      // Because this spacer immediately follows it, matching that 28% point
      // guarantees that the large TV transition cannot begin during the hold.
      start: "top 28%",
      end: "bottom top",
      scrub: prefersReducedMotion() ? false : 0.54,
      onEnter: () => {
        onWorkPreview(-1);
        setTvPhase(scope, "exit");
      },
      onEnterBack: () => setTvPhase(scope, "exit"),
      onUpdate: (self) => {
        if (self.isActive) setTvPhase(scope, "exit");
      },
      onLeave: () => setTvPhase(scope, "contact"),
      onLeaveBack: () => setTvPhase(scope, "phone"),
      onRefresh: (self) => recordTriggerRange(exitSpacer, self),
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
