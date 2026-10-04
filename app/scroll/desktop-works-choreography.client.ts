import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MEDIA_QUERY } from "~/portfolio/media";

type SetupOptions = {
  scope: HTMLElement;
  onWorkPreview: (index: number) => void;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function killBaseTrigger(id: string) {
  const trigger = ScrollTrigger.getById(id);
  trigger?.animation?.kill();
  trigger?.kill();
}

/**
 * Desktop-only refinement for the Works/TV scene.
 *
 * The base scroll runtime also serves mobile, so this small layer deliberately
 * replaces only the desktop television/work triggers after the base runtime is
 * installed. This keeps the television pinned as one full-viewport visual,
 * lets work rows drive the screen preview, and postpones the exit transform
 * until every work row has actually left the viewport.
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

  // Replace the generic triggers before their first scheduled refresh. This is
  // intentionally limited to the Works/TV scene; the intro/contact timelines
  // remain owned by the base runtime.
  killBaseTrigger("tv-pin");
  killBaseTrigger("tv-exit");
  ScrollTrigger.getAll().forEach((trigger) => {
    const id = trigger.vars.id;
    if (typeof id === "string" && id.startsWith("work-")) {
      trigger.kill();
    }
  });
  gsap.killTweensOf(".tv-box");
  gsap.set(".tv-box", { clearProps: "transform,opacity,visibility" });
  onWorkPreview(-1);

  const triggers: ScrollTrigger[] = [];
  const rows = Array.from(scope.querySelectorAll<HTMLElement>(".work-item"));

  rows.forEach((row, index) => {
    const activate = () => onWorkPreview(index);

    triggers.push(
      ScrollTrigger.create({
        id: `desktop-work-${index}`,
        trigger: row,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: activate,
        onEnterBack: activate,
        onLeaveBack: () => {
          if (index === 0) onWorkPreview(-1);
        },
        invalidateOnRefresh: true,
      })
    );
  });

  // A full-viewport pin is easier to reason about than pinning a 1px carrier.
  // The work list then scrolls over that stable stage, so Chinese and English
  // layouts share the same television geometry even when row heights differ.
  triggers.push(
    ScrollTrigger.create({
      id: "desktop-tv-pin",
      trigger: ".tv-box-pinner",
      start: "top top",
      endTrigger: ".tv-exit-spacer",
      end: "bottom top",
      pin: ".tv-box-pinner",
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    })
  );

  const exitTimeline = gsap.timeline({
    scrollTrigger: {
      id: "desktop-tv-exit",
      trigger: ".tv-exit-spacer",
      // Do not begin rotating while the last project row is still on screen.
      start: "top top",
      end: "bottom top",
      scrub: prefersReducedMotion() ? false : 0.45,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  // Keep the first half of the transition restrained. The television remains
  // readable for longer, then makes the larger exit only near Contact.
  exitTimeline
    .to(".tv-box", {
      rotation: -2,
      scale: 1.06,
      duration: 0.48,
    })
    .to(".tv-box", {
      rotation: -12,
      scale: 3.6,
      autoAlpha: 0,
      duration: 0.52,
    });

  const refreshFrame = window.requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  return () => {
    window.cancelAnimationFrame(refreshFrame);
    triggers.forEach((trigger) => trigger.kill());
    exitTimeline.scrollTrigger?.kill();
    exitTimeline.kill();
    gsap.set(".tv-box", { clearProps: "transform,opacity,visibility" });
  };
}
