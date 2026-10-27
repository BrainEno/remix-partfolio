import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MEDIA_QUERY, MOBILE_MEDIA_QUERY } from "~/portfolio/media";
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

function getPinDistance(selector: string, minimumViewports = 1) {
  const element = document.querySelector<HTMLElement>(selector);
  return Math.max(
    element?.offsetHeight ?? 0,
    window.innerHeight * minimumViewports,
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
    // Parity with the best-working 2022-2023 Locomotive setup
    // ({ smooth: true, lerp: 0.08, multiplier: 0.9 }): lerp 0.08 settles to
    // ~95% in about 0.6s, which maps to a ScrollSmoother catch-up of ~0.65s.
    // Larger values make the scrubbed pin scenes feel detached and floaty.
    smooth: prefersReducedMotion() ? 0 : 0.65,
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
  onSectionChange: (section: PortfolioSection) => void,
) {
  const syncSection = () => {
    const portfolioTop = document
      .getElementById("partfolio")
      ?.getBoundingClientRect().top;
    // #contact deliberately overlaps the television exit, so its section box
    // is visible long before any contact copy is. Measure the copy itself.
    // Desktop writes the phone number onto the tube, which makes
    // .contact-text-box display:none there (a zero rect would otherwise read
    // as "the copy is at the top of the page"), so measure the contact column.
    const contactCopyTop = [
      "#contact .contact-inner",
      "#contact .contact-text-box",
    ]
      .map(
        (selector) =>
          document.querySelector<HTMLElement>(selector)?.getBoundingClientRect()
            .top,
      )
      .find((top) => typeof top === "number" && top > 0);

    if (portfolioTop === undefined) return;

    const nextSection =
      contactCopyTop !== undefined &&
      contactCopyTop <= window.innerHeight * 0.62
        ? "contact"
        : portfolioTop <= window.innerHeight * 0.55
          ? "partfolio"
          : "intro";
    onSectionChange(nextSection);
  };

  ScrollTrigger.create({
    id: "section-tracking",
    trigger: "#home",
    start: "top top",
    end: "max",
    onUpdate: syncSection,
    onRefresh: syncSection,
    onLeave: syncSection,
    onEnterBack: syncSection,
    invalidateOnRefresh: true,
  });
  syncSection();
}

function setupIntroHeadlineChoreography(isZh: boolean, isMobile: boolean) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-headline",
      trigger: ".intro-headline-box",
      start: isMobile ? "top top" : "top 8%",
      end: isMobile ? "bottom 42%" : "bottom 28%",
      scrub: true,
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
      "<-=0.1",
    )
    .to(
      ".intro-headline-word.word-3",
      {
        y: isMobile ? 96 : 50,
        x: isMobile ? -12 : -16.905,
        ease: "none",
      },
      "<-=0.2",
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
      },
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
    },
  );
}

/**
 * First intro story (portrait + 简介 + biography).
 *
 * The best-working 2022-2023 build drove this scene in three beats inside one
 * scrubbed timeline. Rebuilding it as one timeline again is what makes the
 * paragraph read as *pushing* the artwork: nothing moves until the copy has
 * arrived at the portrait's edge, and from there the visual group and the copy
 * travel left together, so the paragraph can never slide across the portrait's
 * face.
 *
 *   0.00 - 0.36  settle   portrait descends + rotates, title descends,
 *                         ghost frame resolves, credit appears, mask widens
 *   0.45 - 0.70  approach copy crosses the right half of the viewport
 *   0.70 - 1.00  push     group and copy leave to the left together
 *
 * Everything is transform-based (no animated `left`/`top` layout work).
 */
function setupFirstIntroStory(isMobile: boolean) {
  if (isMobile) {
    // Mobile keeps the single portrait/mask beat: there is no room for the
    // push composition on a 390px stage, and the copy sits below the image.
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "intro-story-1",
        trigger: ".intro-subheadline-stickytainer",
        start: "top 12%",
        end: () =>
          `+=${getPinDistance(".intro-subheadline-stickytainer", 1.3)}`,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    timeline
      .to(".intro-subheadline-photo-box", {
        y: "18svh",
        x: "20vw",
        rotation: -18.75,
        scale: 1.45,
        autoAlpha: 0.82,
        filter: "grayscale(10%)",
        duration: 4,
      })
      .to(
        ".intro-subheadline-photo-mask",
        {
          x: "4vw",
          width: "+=20vw",
          borderTopLeftRadius: "14vw",
          filter: "grayscale(0%)",
          duration: 4,
        },
        ">+=0.3",
      )
      .to(
        ".intro-subheadline-photo",
        {
          // As the portrait mask becomes landscape, centre-cropping would cut
          // through the subject's head. Reframe with the same scrub.
          objectPosition: "50% 0%",
          duration: 4,
        },
        "<",
      )
      .to(
        ".intro-subheadline-text-box1",
        {
          x: "-100vw",
          duration: 4,
        },
        ">+=0.25",
      );
    return;
  }

  const scene = document.querySelector<HTMLElement>(
    ".intro-subheadline-stickytainer",
  );

  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-story-1",
      trigger: ".intro-subheadline-stickytainer",
      start: "top top",
      end: () =>
        `+=${getPinDistance(".intro-subheadline-stickytainer", 6)}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  // Beat 1 - settle. Portrait and title share the same start and duration, so
  // their (different) pixel travel still reads as one movement.
  timeline
    .fromTo(
      ".intro-subheadline-photo-box",
      { x: "22vw", y: "-22vw", rotation: 0, scale: 1, autoAlpha: 1 },
      {
        x: "10vw",
        y: "5.5vw",
        rotation: -18.75,
        scale: 1.16,
        autoAlpha: 0.84,
        filter: "grayscale(10%)",
        duration: 0.36,
      },
      0,
    )
    .to(
      ".intro-subheadline-title",
      { x: "-36vw", y: "37vw", duration: 0.36 },
      0,
    )
    .to(
      ".intro-subheadline-photo-ghost-mask",
      { autoAlpha: 0, rotation: 18.15, duration: 0.18 },
      0.09,
    )
    .to(
      ".intro-subheadline-pic-info",
      { autoAlpha: 1, scale: 1, duration: 0.16 },
      0.2,
    )
    .to(
      ".intro-subheadline-photo-mask",
      {
        width: "+=20vw",
        borderTopLeftRadius: "14vw",
        filter: "grayscale(0%)",
        duration: 0.18,
      },
      0.3,
    )
    .to(
      ".intro-subheadline-photo",
      { objectPosition: "50% 0%", duration: 0.18 },
      0.3,
    );

  // Beat 2 - approach. The copy crosses the right half of the viewport and
  // parks flush inside it, next to the portrait. The artwork is deliberately
  // still, and nothing is clipped at the end of this beat: the paragraph is
  // readable as a complete column before anything leaves.
  timeline.to(
    ".intro-subheadline-text-box1",
    { x: "-48vw", duration: 0.22 },
    0.42,
  );

  // Beat 3 - hold (0.64 -> 0.74). No tweens: the visitor reads the copy
  // beside the artwork for one beat of scroll before the push starts.

  // Beat 4 - push. Group and copy leave in the same scroll interval, the copy
  // travelling 48vw further so it keeps leading the artwork out of frame.
  timeline
    .to(".intro-subheadline-visual-group", { x: "-100vw", duration: 0.28 }, 0.74)
    .to(".intro-subheadline-text-box1", { x: "-148vw", duration: 0.28 }, 0.74);

  // The title keeps a small counter-drift so the push has a parallax layer
  // instead of reading as one flat plate sliding away.
  timeline.to(
    ".intro-subheadline-title",
    { x: "-16vw", duration: 0.28 },
    0.74,
  );

  if (scene) scene.dataset.introPhase = "settle-approach-push";
}

function setupSecondIntroStory(isMobile: boolean) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-story-2",
      trigger: ".intro-subheadline-stickytainer2",
      start: "top top",
      end: () =>
        `+=${getPinDistance(
          ".intro-subheadline-stickytainer2",
          isMobile ? 1.15 : 4,
        )}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  if (isMobile) {
    // The photo rail and paragraph now start moving at the same scroll instant.
    // The paragraph begins exactly one viewport to the right, so its leading
    // edge enters immediately instead of waiting for a whole blank viewport.
    timeline
      .to(
        ".intro-subheadline-photo-box2",
        {
          x: "-52vw",
          autoAlpha: 0.35,
          duration: 1,
        },
        0,
      )
      .to(
        ".intro-subheadline-text-box2",
        {
          x: "-100vw",
          duration: 1,
        },
        0,
      );
    return;
  }

  timeline
    .to(".intro-subheadline-photo-box2", {
      x: "-=130vw",
      duration: 20,
    })
    .to(
      ".intro-subheadline-photo-mask2",
      {
        marginRight: "5.5vw",
        duration: 20,
      },
      "<",
    )
    .to(".intro-subheadline-slider2", {
      x: "-100vw",
      duration: 20,
    })
    .to(
      ".intro-subheadline-photo-box2",
      {
        x: "-=100vw",
        duration: 20,
      },
      "<",
    )
    .to(".intro-subheadline-text2", {
      marginBottom: "8vw",
      duration: 20,
    })
    .to(
      ".intro-subheadline-text2-pic2",
      {
        top: "5vw",
        duration: 15,
      },
      "<+=2",
    )
    .to(
      ".intro-subheadline-text2-pic1",
      {
        top: "-6vw",
        duration: 20,
      },
      "<+=2",
    )
    .to(
      "#intro",
      {
        backgroundColor: "#013171",
        duration: 20,
      },
      ">-=2",
    );
}

function setupWorkPreview(onWorkPreview: (index: number) => void) {
  const rows = gsap.utils.toArray<HTMLElement>(".work-item");

  rows.forEach((row, index) => {
    const activate = () => onWorkPreview(index);

    ScrollTrigger.create({
      id: `work-${index}`,
      trigger: row,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: activate,
      onEnterBack: activate,
      invalidateOnRefresh: true,
    });
  });
}

type PreviewOwner = "rows" | "phone" | "exit";

const TV_IDLE_PALETTE = {
  "--tv-screen-top": "#777a76",
  "--tv-screen-mid": "#626560",
  "--tv-screen-bottom": "#545651",
  "--tv-screen-glow": "rgba(255, 255, 255, 0.08)",
} as const;

/* The tube powers down as the number writes itself on, but only to a cool
   grey-green: the earlier near-black plate read as a dead rectangle inside a
   lit photograph and swallowed the set's own reflections. Keeping the phosphor
   at mid grey lets the glass (and the road around it) stay part of the scene
   while the number still has contrast. */
const TV_PHONE_PALETTE = {
  "--tv-screen-top": "#5d6159",
  "--tv-screen-mid": "#4d514a",
  "--tv-screen-bottom": "#3c403a",
  "--tv-screen-glow": "rgba(255, 255, 255, 0.06)",
} as const;

const TV_BLANK_PALETTE = {
  "--tv-screen-top": "#000000",
  "--tv-screen-mid": "#000000",
  "--tv-screen-bottom": "#000000",
  "--tv-screen-glow": "rgba(0, 0, 0, 0)",
} as const;

function setupTelevisionSequence(
  onWorkPreview: (index: number) => void,
  isMobile: boolean,
) {
  const rows = gsap.utils.toArray<HTMLElement>(".work-item");
  const lastWorkIndex = rows.length - 1;
  const portfolio = document.querySelector<HTMLElement>("#partfolio");
  portfolio?.classList.remove("is-tv-exiting", "is-tv-phone");

  // One owner of the screen at a time. Without this the row triggers, the
  // telephone-number beat and the exit all wrote to the same slot and could
  // relight a project inside the zooming set (or blank a valid preview).
  let previewOwner: PreviewOwner = "rows";
  const setPreviewOwner = (owner: PreviewOwner) => {
    previewOwner = owner;
    portfolio?.classList.toggle("is-tv-exiting", owner === "exit");
    portfolio?.classList.toggle("is-tv-phone", owner === "phone");
  };
  const showWork = (index: number) => {
    if (previewOwner === "rows") onWorkPreview(index);
  };
  const clearPreview = () => onWorkPreview(-1);

  setupWorkPreview(showWork);

  // The pinner is a full viewport stage pinned at "top top"; the exit spacer
  // closes the pin. A 1px pinner used to leave the framing dependent on where
  // the pin landed, which is what pushed the photograph's ground out of frame.
  ScrollTrigger.create({
    id: "tv-pin",
    trigger: ".tv-box-pinner",
    start: "top top",
    endTrigger: ".tv-exit-spacer",
    end: "bottom bottom",
    pin: ".tv-box-pinner",
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onEnter: () => showWork(0),
    onEnterBack: () => {
      if (lastWorkIndex >= 0) showWork(lastWorkIndex);
    },
  });

  if (isMobile) {
    // Mobile owns its own grey-green -> black -> white exit in
    // mobile-choreography.client.ts (the tv-exit trigger is replaced there).
    return;
  }

  /* Telephone-number beat -------------------------------------------------
     The number is written onto the dead tube and *held* there: the works list
     scrolls away, the set leans in slightly, the number fades up and stays
     until the visitor scrolls past a whole plateau of scroll. Only then does
     the exit beat start, so the number has a real dwell instead of flashing
     past inside the zoom. */
  const phoneTimeline = gsap.timeline({
    scrollTrigger: {
      id: "tv-phone",
      trigger: ".tv-phone-spacer",
      // Starts while the works list is still leaving and ends exactly where
      // the exit beat begins, so the number gets a full plateau of dwell
      // instead of a flash inside the zoom.
      start: "top 70%",
      end: "bottom 30%",
      scrub: true,
      invalidateOnRefresh: true,
      onEnter: () => {
        setPreviewOwner("phone");
        clearPreview();
      },
      onEnterBack: () => {
        setPreviewOwner("phone");
        clearPreview();
      },
      onUpdate: (self) => {
        if (self.isActive && previewOwner === "phone") clearPreview();
      },
      onLeaveBack: () => {
        setPreviewOwner("rows");
        if (lastWorkIndex >= 0) onWorkPreview(lastWorkIndex);
      },
    },
    defaults: { ease: "none" },
  });

  phoneTimeline
    // Blank the tube first: the project image is gone, the phosphor cools.
    .to(".tv-showreel", { autoAlpha: 0, duration: 0.08 }, 0)
    // Lean in so the glass fills the beat.
    .to(".tv-box", { scale: 1.14, rotation: -1.5, duration: 0.34 }, 0)
    // Phosphor cools so the number has a clean plate to sit on.
    .to(".tv-blackscreen", { ...TV_PHONE_PALETTE, duration: 0.2 }, 0.06)
    // The number writes itself on.
    .fromTo(
      ".tv-contact-number",
      { autoAlpha: 0, yPercent: 18, filter: "blur(6px)" },
      {
        autoAlpha: 1,
        yPercent: 0,
        filter: "blur(0px)",
        duration: 0.16,
        ease: "power2.out",
      },
      0.08,
    )
    // ...and then simply holds for the rest of the plateau. The hold is the
    // whole point of the beat, so it starts as soon as the fade finishes and
    // lasts until the exit spacer takes over (~1.1 viewport of scroll).
    .to(".tv-contact-number", { autoAlpha: 1, duration: 0.8 }, 0.24);

  /* Exit beat -------------------------------------------------------------
     Starts exactly where the number beat lets go (the exit spacer follows the
     phone spacer, so "top 40%" is the same scroll instant). Order is the
     2022-2023 one: number out, screen blanks, small anticipation, then the
     accelerating rotation/zoom into the white page. */
  const exitTimeline = gsap.timeline({
    scrollTrigger: {
      id: "tv-exit",
      trigger: ".tv-exit-spacer",
      // Continues from where the number beat let go (the two spacers are
      // adjacent, so "top 30%" is the same scroll instant as "bottom 30%").
      start: "top 30%",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onEnter: () => {
        setPreviewOwner("exit");
        clearPreview();
      },
      onEnterBack: () => {
        setPreviewOwner("exit");
        clearPreview();
      },
      onUpdate: (self) => {
        if (self.isActive && previewOwner === "exit") clearPreview();
      },
      onLeaveBack: () => {
        setPreviewOwner("phone");
        clearPreview();
      },
    },
    defaults: { ease: "none" },
  });

  exitTimeline
    .to(
      ".tv-contact-number",
      { autoAlpha: 0, yPercent: -26, duration: 0.1, ease: "power1.in" },
      0,
    )
    .to(".tv-blackscreen", { ...TV_BLANK_PALETTE, duration: 0.16 }, 0.04)
    .to(
      ".tv-box",
      { scale: 1.24, rotation: -3, duration: 0.18, ease: "sine.inOut" },
      0.12,
    )
    .to(
      ".tv-box",
      {
        rotation: -11,
        scale: 4,
        autoAlpha: 0,
        duration: 0.62,
        ease: "power1.in",
      },
      0.32,
    )
    // The 2022-2023 partfolio section dissolved into the white page, so the
    // zoom now carries the page with it: the black stage is scrubbed white
    // underneath the set and completes just before the set finishes fading.
    .to(
      ["#partfolio", ".tv-box-stickytainer", ".tv-box-pinner", ".tv-box-mask"],
      { backgroundColor: "#ffffff", duration: 0.52 },
      0.36,
    );
}

function setupContactCanvas(isMobile: boolean) {
  if (isMobile) return;

  gsap
    .timeline({
      scrollTrigger: {
        id: "contact-canvas",
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

// Locomotive's best-working scenes used scrub: true. Keep that direct
// correspondence here: ScrollSmoother already supplies desktop inertia and
// native scrolling supplies mobile inertia, so numeric scrub would smooth the
// same movement twice and let pinned artwork trail behind its trigger.
function setupResponsiveAnimations(
  isZh: boolean,
  isMobile: boolean,
  onWorkPreview: (index: number) => void,
) {
  setupIntroHeadlineChoreography(isZh, isMobile);
  setupIntroParallax(isMobile);
  setupFirstIntroStory(isMobile);
  setupSecondIntroStory(isMobile);
  setupTelevisionSequence(onWorkPreview, isMobile);
  setupContactCanvas(isMobile);
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
  let disposed = false;
  let settleFrame = 0;

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
    scope,
  );

  const refresh = () => {
    if (disposed) return;
    ScrollTrigger.refresh();
    scope.dataset.scrollTriggerCount = String(ScrollTrigger.getAll().length);
  };

  const firstFrame = window.requestAnimationFrame(() => {
    refresh();
    settleFrame = window.requestAnimationFrame(refresh);
  });

  void document.fonts?.ready.then(() => {
    if (!disposed) refresh();
  });

  // The old runtime hid measurement races behind a fixed 1000ms timeout.
  // Explicit scene dimensions now reserve the TV geometry up front; event-
  // driven refreshes handle the remaining font/image changes without a
  // delayed layout jump.
  const handleWindowLoad = () => refresh();
  window.addEventListener("load", handleWindowLoad);

  const tvFrame = scope.querySelector(".tv-bg");
  const handleTvFrameLoad = () => refresh();
  if (tvFrame) tvFrame.addEventListener("load", handleTvFrameLoad);

  return () => {
    disposed = true;
    window.cancelAnimationFrame(firstFrame);
    if (settleFrame) window.cancelAnimationFrame(settleFrame);
    window.removeEventListener("load", handleWindowLoad);
    tvFrame?.removeEventListener("load", handleTvFrameLoad);
    media.revert();
    ScrollSmoother.get()?.kill();
    gsap.set("#smooth-content", { clearProps: "transform" });
    delete scope.dataset.scrollTriggerCount;
  };
}
