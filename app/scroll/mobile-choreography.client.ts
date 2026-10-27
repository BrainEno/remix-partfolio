import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SetupMobileChoreographyOptions = {
  onWorkPreview: (index: number) => void;
};

function setupHero() {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "mobile-intro-headline",
      trigger: ".intro-headline-box",
      start: "top top",
      end: "bottom 42%",
      scrub: true,
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
      index * 0.08,
    );
  });

  timeline
    .to(
      ".intro-photo-box",
      {
        y: "17svh",
        x: "-1.5vw",
        duration: 1,
      },
      0,
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
      0,
    );
}

function setupSecondIntroStory() {
  const scene = document.querySelector<HTMLElement>(
    ".intro-subheadline-stickytainer2",
  );
  const rail = document.querySelector<HTMLElement>(
    ".intro-subheadline-photo-box2",
  );
  if (!scene || !rail) return;

  // A horizontal rail moves independently above the paragraph. Keeping the
  // paragraph in normal flow allows any language or viewport height to wrap
  // without drawing text over the photographs.
  gsap.fromTo(
    rail,
    { x: 0 },
    {
      x: () =>
        -Math.max(
          0,
          rail.scrollWidth - window.innerWidth + window.innerWidth * 0.06,
        ),
      ease: "none",
      scrollTrigger: {
        id: "mobile-intro-story-2",
        trigger: scene,
        start: "top 85%",
        end: "bottom 15%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
}

function setupWorkPreview(
  onWorkPreview: (index: number) => void,
  canPreview: () => boolean,
) {
  const rows = gsap.utils.toArray<HTMLElement>(".work-item");
  const screen = document.querySelector<HTMLElement>(".tv-all-vids");
  const workItems = document.querySelector<HTMLElement>(".work-items-box");
  if (!screen || !workItems || rows.length === 0) return () => undefined;

  const syncPreviewToScreen = () => {
    if (!canPreview()) return;
    const screenRect = screen.getBoundingClientRect();
    let activeIndex = -1;
    let greatestOverlap = 0;

    rows.forEach((row, index) => {
      const entry = row.querySelector<HTMLElement>(".work-item-entry") ?? row;
      const rowRect = entry.getBoundingClientRect();
      const overlap = Math.max(
        0,
        Math.min(rowRect.bottom, screenRect.bottom) -
          Math.max(rowRect.top, screenRect.top),
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
    onRefresh: syncPreviewToScreen,
    onLeave: () => onWorkPreview(-1),
    onLeaveBack: () => onWorkPreview(-1),
    invalidateOnRefresh: true,
  });
  return syncPreviewToScreen;
}

function setupTelevision(onWorkPreview: (index: number) => void) {
  const portfolio = document.querySelector<HTMLElement>("#partfolio");
  let isExiting = false;
  let previewFrame = 0;
  const syncPreview = setupWorkPreview(onWorkPreview, () => !isExiting);
  const syncExit = (trigger: ScrollTrigger) => {
    const next = trigger.progress > 0;
    if (next === isExiting) return;
    isExiting = next;
    portfolio?.classList.toggle("is-tv-exiting", next);
    window.cancelAnimationFrame(previewFrame);
    if (next) {
      onWorkPreview(-1);
    } else {
      // The TV pin and the exit can update in either order on a large jump.
      // Measure the restored screen after both have settled for this frame.
      previewFrame = window.requestAnimationFrame(() => {
        if (!isExiting && portfolio?.isConnected) syncPreview();
      });
    }
  };

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
    // Preview ownership stays with the row/screen overlap trigger above.
    // Resetting here used to run after that trigger and could blank a valid
    // image until the visitor produced another scroll event.
  });

  const exitTimeline = gsap.timeline({
    scrollTrigger: {
      id: "mobile-tv-exit",
      trigger: ".tv-exit-spacer",
      start: "top 10%",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      // onUpdate also runs when a fast jump skips the entire trigger; with
      // limitCallbacks enabled, enter/leave callbacks alone would leave the
      // TV stuck in its exit state after jumping back to the work list.
      onUpdate: syncExit,
      onRefresh: syncExit,
    },
    defaults: { ease: "none" },
  });

  exitTimeline
    .to(
      ".tv-box",
      {
        rotation: -4,
        scale: 1.16,
        duration: 0.18,
      },
      0,
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
      0,
    )
    .to(
      ".tv-box",
      {
        rotation: -31,
        scale: 10,
        duration: 0.64,
      },
      0.18,
    )
    .to(
      ".tv-bg",
      {
        autoAlpha: 0,
        duration: 0.42,
      },
      0.28,
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
      0.28,
    )
    .to(
      ".tv-blackscreen",
      {
        "--tv-screen-top": "#ffffff",
        "--tv-screen-mid": "#ffffff",
        "--tv-screen-bottom": "#ffffff",
        duration: 0.08,
      },
      1.1,
    )
    .to(
      ["#partfolio", ".tv-box-stickytainer", ".tv-box-pinner", ".tv-box-mask"],
      {
        backgroundColor: "#ffffff",
        duration: 0.08,
      },
      1.1,
    )
    .fromTo(
      "#contact .contact-text-box",
      {
        autoAlpha: 0,
        y: "9svh",
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
      },
      0.6,
    )
    .to(
      ".tv-box",
      {
        autoAlpha: 0,
        duration: 0.08,
      },
      1.1,
    );

  return () => window.cancelAnimationFrame(previewFrame);
}

/** Called inside the same gsap.matchMedia context as desktop choreography. */
export function setupMobileChoreography({
  onWorkPreview,
}: SetupMobileChoreographyOptions) {
  onWorkPreview(-1);
  setupHero();
  setupSecondIntroStory();
  return setupTelevision(onWorkPreview);
}
