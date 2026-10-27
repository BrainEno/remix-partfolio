import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MEDIA_QUERY, MOBILE_MEDIA_QUERY } from "~/portfolio/media";
import type { PortfolioSection } from "~/portfolio/types";
import { setupMobileChoreography } from "./mobile-choreography.client";

type SetupOptions = {
  scope: HTMLElement;
  isZh: boolean;
  onSectionChange: (section: PortfolioSection) => void;
  onWorkPreview: (index: number) => void;
};

type ResponsiveConditions = {
  isMobile: boolean;
  isDesktop: boolean;
  reduceMotion: boolean;
  motionOK: boolean;
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

  if (isMobileViewport() || prefersReducedMotion()) {
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
    smooth: 0.65,
    speed: 0.9,
    effects: false,
  });
}

export function scrollToPortfolioSection(section: PortfolioSection) {
  if (typeof window === "undefined") return;

  registerScrollPlugins();

  const target = document.getElementById(section);
  if (!target) return;

  if (isMobileViewport() || prefersReducedMotion()) {
    disablePortfolioSmoother();
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    return;
  }

  const smoother = ensurePortfolioSmoother();
  if (smoother) {
    smoother.scrollTo(target, true, "top top");
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
    // The mobile number may precede the contact column; the desktop number
    // is in the tube. Ignore display:none, but keep negative tops: a section
    // remains active after its top has scrolled past the viewport.
    const contactCopyTop = [
      "#contact .contact-text-box",
      "#contact .contact-inner",
    ]
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .find((element) => {
        if (!element || element.getClientRects().length === 0) return false;
        return getComputedStyle(element).visibility !== "hidden";
      })
      ?.getBoundingClientRect().top;

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

function setupIntroHeadlineChoreography(isZh: boolean) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-headline",
      trigger: ".intro-headline-box",
      start: "top 8%",
      end: "bottom 28%",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  if (isZh) {
    timeline.to(".intro-headline-word.zh", {
      y: 56,
      x: 20,
      stagger: 0.18,
      ease: "none",
    });
    return;
  }

  timeline
    .to(".intro-headline-word.word-1", {
      y: 50,
      x: -16.905,
      ease: "none",
      duration: 1,
    })
    .to(
      ".intro-headline-word.word-2",
      {
        y: 50,
        x: -16.905,
        ease: "none",
      },
      "<-=0.1",
    )
    .to(
      ".intro-headline-word.word-3",
      {
        y: 50,
        x: -16.905,
        ease: "none",
      },
      "<-=0.2",
    );
}

function setupIntroParallax() {
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

  gsap.fromTo(
    ".intro-photo",
    { yPercent: 7, scale: 1, rotation: 0 },
    {
      yPercent: -7,
      scale: 1.06,
      rotation: 2.5,
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
 *   0.00 - 0.48  settle   portrait descends + rotates, ghost resolves,
 *                         credit appears, mask widens within safe bounds
 *   0.42 - 0.64  approach copy crosses the right half of the viewport
 *   0.64 - 0.74  hold     a reading beat with both elements at rest
 *   0.74 - 1.02  push     group and copy leave to the left together
 *
 * The large movements use transforms; only the contained mask width changes.
 */
function setupFirstIntroStory(isMobile: boolean) {
  if (isMobile) {
    // Give the portrait a short, self-contained settle; the biography follows
    // in normal document flow so it never covers the face or gets clipped on
    // a short phone. The pin holds only the visual, not the reading column.
    const visual = document.querySelector<HTMLElement>(
      ".intro-subheadline-visual-group",
    );
    if (!visual) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "intro-story-1",
        trigger: visual,
        start: "top 14%",
        end: () => `+=${window.innerHeight * 0.65}`,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    timeline
      .fromTo(
        ".intro-subheadline-photo-box",
        { xPercent: -50, rotation: -4, scale: 0.94 },
        { xPercent: -50, rotation: 0, scale: 1, duration: 0.7 },
        0,
      )
      .fromTo(
        ".intro-subheadline-title",
        { autoAlpha: 0.35, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.55 },
        0.15,
      );

    gsap.fromTo(
      ".intro-subheadline-text1",
      { autoAlpha: 0.6, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          id: "mobile-intro-copy",
          trigger: ".intro-subheadline-slider",
          start: "top 95%",
          end: "top 58%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
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
      end: () => `+=${getPinDistance(".intro-subheadline-stickytainer", 6)}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  // Beat 1 - settle. The complete portrait has a safe top/bottom margin at
  // every aspect ratio; a modest rounded corner keeps the old graphic motif
  // without cutting into the subject's hair.
  timeline
    .fromTo(
      ".intro-subheadline-photo-box",
      { x: "15vw", y: "12svh", rotation: -7, scale: 0.92, autoAlpha: 1 },
      {
        x: "7vw",
        y: "14svh",
        rotation: 0,
        scale: 1,
        autoAlpha: 1,
        filter: "grayscale(0%)",
        duration: 0.36,
      },
      0,
    )
    .fromTo(
      ".intro-subheadline-title",
      { y: 20, autoAlpha: 0.35 },
      { y: 0, autoAlpha: 1, duration: 0.3 },
      0.06,
    )
    .to(
      ".intro-subheadline-photo-ghost-mask",
      { autoAlpha: 0, rotation: 0, duration: 0.2 },
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
        width: () =>
          Math.min(window.innerWidth * 0.38, window.innerHeight * 0.43),
        borderTopLeftRadius: 24,
        filter: "grayscale(0%)",
        duration: 0.18,
      },
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
    .to(
      ".intro-subheadline-visual-group",
      { x: "-100vw", duration: 0.28 },
      0.74,
    )
    .to(".intro-subheadline-text-box1", { x: "-148vw", duration: 0.28 }, 0.74);

  if (scene) scene.dataset.introPhase = "settle-approach-push";
}

function setupSecondIntroStory() {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-story-2",
      trigger: ".intro-subheadline-stickytainer2",
      start: "top top",
      end: () => `+=${getPinDistance(".intro-subheadline-stickytainer2", 4)}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

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
  const workItems = document.querySelector<HTMLElement>(".work-items-box");
  if (!workItems || rows.length === 0) return () => false;

  // Several short desktop rows can simultaneously cross the old 40–60%
  // thresholds. Separate onEnter callbacks picked different images depending
  // on scroll direction. One reading line makes the selection deterministic.
  const syncPreview = () => {
    const focus = window.innerHeight * 0.55;
    let index = -1;
    let nearest = Infinity;
    rows.forEach((row, candidate) => {
      const rect = row.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const distance = Math.abs((rect.top + rect.bottom) / 2 - focus);
      if (distance < nearest) {
        nearest = distance;
        index = candidate;
      }
    });
    if (index >= 0) onWorkPreview(index);
    return index >= 0;
  };

  ScrollTrigger.create({
    id: "work-preview",
    trigger: workItems,
    start: "top bottom",
    end: "bottom top",
    onEnter: syncPreview,
    onEnterBack: syncPreview,
    onUpdate: syncPreview,
    onRefresh: syncPreview,
    onLeaveBack: () => onWorkPreview(-1),
    invalidateOnRefresh: true,
  });
  return syncPreview;
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

function setupTelevisionSequence(onWorkPreview: (index: number) => void) {
  const rows = gsap.utils.toArray<HTMLElement>(".work-item");
  const lastWorkIndex = rows.length - 1;
  const portfolio = document.querySelector<HTMLElement>("#partfolio");
  portfolio?.classList.remove("is-tv-exiting", "is-tv-phone");

  // One owner of the screen at a time. Without this the row triggers, the
  // telephone-number beat and the exit all wrote to the same slot and could
  // relight a project inside the zooming set (or blank a valid preview).
  let previewOwner: PreviewOwner = "rows";
  let previewFrame = 0;
  const setPreviewOwner = (owner: PreviewOwner) => {
    previewOwner = owner;
    portfolio?.classList.toggle("is-tv-exiting", owner === "exit");
    portfolio?.classList.toggle("is-tv-phone", owner === "phone");
  };
  const showWork = (index: number) => {
    if (previewOwner === "rows") onWorkPreview(index);
  };
  const clearPreview = () => onWorkPreview(-1);
  const syncPreviewOwner = () => {
    const exitProgress = ScrollTrigger.getById("tv-exit")?.progress ?? 0;
    const phoneProgress = ScrollTrigger.getById("tv-phone")?.progress ?? 0;
    const owner: PreviewOwner =
      exitProgress > 0 ? "exit" : phoneProgress > 0 ? "phone" : "rows";
    if (owner === previewOwner) return;
    setPreviewOwner(owner);
    window.cancelAnimationFrame(previewFrame);
    if (owner !== "rows") {
      clearPreview();
      return;
    }
    // Wait for the pin to settle before remeasuring after a reverse jump.
    previewFrame = window.requestAnimationFrame(() => {
      if (previewOwner === "rows" && portfolio?.isConnected) syncWorkPreview();
    });
  };

  const syncWorkPreview = setupWorkPreview(showWork);

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
    onEnter: () => {
      if (!syncWorkPreview()) showWork(0);
    },
    onEnterBack: () => {
      if (!syncWorkPreview() && lastWorkIndex >= 0) showWork(lastWorkIndex);
    },
  });

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
      onUpdate: syncPreviewOwner,
      onRefresh: syncPreviewOwner,
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
     phone spacer, so "top 30%" is the same scroll instant). Order is the
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
      // Progress, rather than enter/leave callbacks, remains correct even
      // when a large scroll jump crosses the whole exit in a single frame.
      onUpdate: syncPreviewOwner,
      onRefresh: syncPreviewOwner,
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

  return () => window.cancelAnimationFrame(previewFrame);
}

function setupContactCanvas(isMobile: boolean) {
  // The TV has already completed its exit when the contact column reaches the
  // viewport. Move the booth from a subtle lower-left lead-in to its reserved
  // stage, then leave it there while the visitor reads and uses the links.
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "contact-canvas",
      trigger: ".contact-inner",
      start: isMobile ? "top 52%" : "top 92%",
      end: isMobile ? "top top" : "top 20%",
      scrub: true,
      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  timeline
    .fromTo(
      ".canvas-container",
      {
        autoAlpha: 0,
        x: isMobile ? "-6vw" : "-10vw",
        y: "14svh",
        scale: 0.84,
        rotation: -6,
      },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: "sine.out",
      },
      0.12,
    )
    .fromTo(
      ".contact-headlines",
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.62, ease: "sine.out" },
      0.15,
    );
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
  let cleanupPreview: () => void;
  if (isMobile) {
    setupFirstIntroStory(true);
    cleanupPreview = setupMobileChoreography({ onWorkPreview });
  } else {
    setupIntroHeadlineChoreography(isZh);
    setupIntroParallax();
    setupFirstIntroStory(false);
    setupSecondIntroStory();
    cleanupPreview = setupTelevisionSequence(onWorkPreview);
  }
  setupContactCanvas(isMobile);
  return cleanupPreview;
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
      reduceMotion: "(prefers-reduced-motion: reduce)",
      motionOK: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { isMobile, reduceMotion } =
        context.conditions as ResponsiveConditions;

      if (isMobile || reduceMotion) {
        disablePortfolioSmoother();
      } else {
        ensurePortfolioSmoother();
      }

      setupSectionTracking(onSectionChange);
      const cleanupPreview = reduceMotion
        ? () => undefined
        : setupResponsiveAnimations(isZh, isMobile, onWorkPreview);

      return () => {
        cleanupPreview();
        scope
          .querySelector("#partfolio")
          ?.classList.remove("is-tv-exiting", "is-tv-phone");
        onWorkPreview(-1);
      };
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
  window.addEventListener("portfolio:layoutchange", refresh);

  const tvFrame = scope.querySelector(".tv-bg");
  const handleTvFrameLoad = () => refresh();
  if (tvFrame) tvFrame.addEventListener("load", handleTvFrameLoad);

  return () => {
    disposed = true;
    window.cancelAnimationFrame(firstFrame);
    if (settleFrame) window.cancelAnimationFrame(settleFrame);
    window.removeEventListener("load", handleWindowLoad);
    window.removeEventListener("portfolio:layoutchange", refresh);
    tvFrame?.removeEventListener("load", handleTvFrameLoad);
    media.revert();
    ScrollSmoother.get()?.kill();
    gsap.set("#smooth-content", { clearProps: "transform" });
    delete scope.dataset.scrollTriggerCount;
  };
}
