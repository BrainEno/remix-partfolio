import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MEDIA_QUERY } from "~/portfolio/media";

type SetupOptions = {
  scope: HTMLElement;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Desktop choreography for the first Intro story.
 *
 * The photograph and the large Intro title intentionally behave as one visual
 * group. The copy approaches from the right first; only when its leading edge
 * is close to the photograph does the whole composition leave to the left.
 */
export function setupDesktopIntroChoreography({ scope }: SetupOptions) {
  if (
    typeof window === "undefined" ||
    !window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  ) {
    return () => undefined;
  }

  gsap.registerPlugin(ScrollTrigger);

  const baseTrigger = ScrollTrigger.getById("intro-story-1");
  baseTrigger?.animation?.kill();
  baseTrigger?.kill();

  const visualGroup = scope.querySelector<HTMLElement>(
    ".intro-subheadline-visual-group"
  );
  const photo = scope.querySelector<HTMLElement>(
    ".intro-subheadline-photo-box"
  );
  const title = scope.querySelector<HTMLElement>(
    ".intro-subheadline-title"
  );
  const copy = scope.querySelector<HTMLElement>(
    ".intro-subheadline-text-box1"
  );

  if (!visualGroup || !photo || !title || !copy) return () => undefined;

  gsap.set(visualGroup, { x: 0 });
  gsap.set(copy, { x: 0 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-intro-story-1",
      trigger: ".intro-subheadline-stickytainer",
      // Begin while the composition is still approaching the viewport so the
      // descent does not arrive as a late, sudden movement.
      start: "top 28%",
      end: () => `+=${Math.max(window.innerHeight * 5.2, 3600)}`,
      scrub: prefersReducedMotion() ? false : 0.55,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  // Phase 1: portrait and title descend together. Their vertical duration is
  // exactly shared so the title never outruns the photograph.
  timeline
    .to(
      photo,
      {
        y: "18vh",
        x: "10vw",
        rotation: -18.75,
        scale: 1.2,
        autoAlpha: 0.82,
        filter: "grayscale(10%)",
        duration: 1.7,
      },
      0
    )
    .to(
      title,
      {
        y: "18vh",
        x: "-4vw",
        duration: 1.7,
      },
      0
    )
    .to(
      ".intro-subheadline-photo-ghost-mask",
      {
        autoAlpha: 0,
        rotation: 18.15,
        duration: 0.8,
      },
      0.65
    )
    .to(
      ".intro-subheadline-pic-info",
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.65,
      },
      0.9
    )
    .to(
      ".intro-subheadline-photo-mask",
      {
        width: "+=20vw",
        borderTopLeftRadius: "14vw",
        filter: "grayscale(0%)",
        duration: 1.15,
      },
      1.45
    );

  // Phase 2: copy travels left by itself until its leading edge is near the
  // portrait. This is the hand-off point the composition is built around.
  timeline.to(
    copy,
    {
      x: "-56vw",
      duration: 1.55,
    },
    2.05
  );

  // Phase 3: once copy nearly touches the portrait, it "pushes" the portrait
  // and Intro title out of frame. All three now travel left at the same rate.
  timeline
    .to(
      visualGroup,
      {
        x: "-112vw",
        duration: 1.9,
      },
      3.6
    )
    .to(
      copy,
      {
        x: "-168vw",
        duration: 1.9,
      },
      3.6
    );

  const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    window.cancelAnimationFrame(refreshFrame);
    timeline.scrollTrigger?.kill();
    timeline.kill();
    gsap.set([visualGroup, copy, photo, title], {
      clearProps: "transform,opacity,visibility,filter",
    });
  };
}
