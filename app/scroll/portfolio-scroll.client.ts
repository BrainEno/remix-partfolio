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

  /* Safety net: the trigger above is the source of truth, but a pinned stage
     plus a smoothing wrapper can leave the callback starved for a frame or two
     right after a refresh, and the nav would then keep highlighting a section
     the visitor has already left. A rAF-throttled listener re-runs the same
     pure measurement; setState with an unchanged value is a no-op. */
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      syncSection();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  ScrollTrigger.addEventListener("refresh", syncSection);

  return () => {
    window.removeEventListener("scroll", onScroll);
    ScrollTrigger.removeEventListener("refresh", syncSection);
    if (frame) window.cancelAnimationFrame(frame);
  };
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
 *   0.00 - 0.36  settle   portrait descends from a full stage above the frame,
 *                         rotates, title descends, ghost resolves, credit
 *                         appears, mask widens (and reframes to the head)
 *   0.42 - 0.64  approach copy crosses the right half of the viewport
 *   0.64 - 0.74  hold     the visitor reads the copy beside the artwork
 *   0.74 - 1.00  push     group and copy leave to the left together
 *
 * Everything is transform-based (no animated `left`/`top` layout work).
 *
 * The portrait starts one whole stage above the viewport rather than at -22vw:
 * at -22vw the top of the mask was already above the frame, so the subject's
 * head was sliced off by the viewport edge for the entire settle beat and the
 * photograph never read as the original portrait. Starting off screen makes
 * the same descent read as an entrance instead of an occlusion.
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
      )
      .fromTo(
        "#intro",
        { backgroundColor: "#000000" },
        { backgroundColor: "#013171", duration: 4, ease: "power1.in" },
        "<",
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
      // 4.8 stages: enough for settle + approach + hold + push to each read as
      // their own beat. The previous 6 stages made the introduction alone
      // longer than the rest of the page and every beat feel slow.
      end: () =>
        `+=${getPinDistance(".intro-subheadline-stickytainer", 4.8)}`,
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
      { x: "22vw", y: "-72svh", rotation: 0, scale: 1, autoAlpha: 1 },
      {
        x: "8vw",
        y: "4svh",
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
      { x: "-30vw", y: "33vw", duration: 0.36 },
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
          width: "+=18vw",
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
  // readable as a complete column before anything leaves. -52vw (not -48vw)
  // is what puts the column's right edge inside the frame: the column starts
  // at left:100vw of a stage that already begins 3.125vw in.
  timeline.to(
    ".intro-subheadline-text-box1",
    // Decelerate into the reading position: a linear arrival stops as
    // abruptly as a conveyor belt, which made the copy feel mechanical
    // next to the artwork.
    { x: "-52vw", duration: 0.22, ease: "power1.inOut" },
    0.42,
  );

  // Beat 3 - hold (0.64 -> 0.74). No tweens: the visitor reads the copy
  // beside the artwork for one beat of scroll before the push starts.

  // Beat 4 - push. Group and copy leave in the same scroll interval, the copy
  // travelling a further 100vw so it keeps leading the artwork out of frame.
  timeline
    .to(
      ".intro-subheadline-visual-group",
      { x: "-100vw", duration: 0.28, ease: "power1.inOut" },
      0.74,
    )
    .to(
      ".intro-subheadline-text-box1",
      { x: "-152vw", duration: 0.28, ease: "power1.inOut" },
      0.74,
    )
    // The title keeps a small counter-drift so the push has a parallax layer
    // instead of reading as one flat plate sliding away.
    .to(".intro-subheadline-title", { x: "-16vw", duration: 0.28 }, 0.74)
    // The stage washes to the 2022-2023 navy while the artwork leaves, so the
    // gallery that follows opens on the navy plate it was designed for. The
    // wash used to live in the gallery timeline and only completed after the
    // pin had already released - i.e. the imagery slid in over black.
    .fromTo(
      "#intro",
      { backgroundColor: "#000000" },
      { backgroundColor: "#013171", duration: 0.4, ease: "power1.in" },
      0.6,
    );

  if (scene) scene.dataset.introPhase = "settle-approach-push";
}

function setupSecondIntroStory(isMobile: boolean) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      id: "intro-story-2",
      trigger: ".intro-subheadline-stickytainer2",
      // The stages above are zero-height, so this one's top reaches the
      // viewport top the instant the portrait beat's pin releases: the gallery
      // opens with no dead scroll in between.
      start: "top top",
      end: () =>
        `+=${getPinDistance(
          ".intro-subheadline-stickytainer2",
          isMobile ? 1.15 : 3.6,
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
    );
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
  const clearPreview = () => onWorkPreview(-1);

  // The pinner is a full viewport stage pinned at "top top"; the exit spacer
  // closes the pin. A 1px pinner used to leave the framing dependent on where
  // the pin landed, which is what pushed the photograph's ground out of frame.
  //
  // The pin deliberately does NOT light the screen. The 2022-2023 build only
  // ever changed the picture from the row hover handler
  // (`onMouseEnter={handleHover(work.imageUri)}`), so a television nobody has
  // hovered yet stays a powered-off tube: phosphor glass, no programme. A
  // later regression added both a pin `onEnter -> showWork(0)` and a scroll
  // trigger per row, which is why the first project appeared before the
  // visitor ever pointed at the list. Desktop preview ownership is therefore:
  //   hover/focus (Partfolio rows) -> sticky picture
  //   phone / exit beats (below)    -> screen blanked, hover ignored
  // Mobile has no hover, so its row/screen-overlap preview lives in
  // mobile-choreography.client.ts and replaces this entirely.
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
        // Scrolling back into the works restores only what the visitor
        // actually hovered (recorded by the row handler in Partfolio.tsx).
        // Nothing hovered yet -> the tube stays off, exactly as on arrival.
        const hovered = Number.parseInt(
          portfolio?.dataset.lastHoveredWork ?? "",
          10,
        );
        onWorkPreview(Number.isNaN(hovered) ? -1 : hovered);
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
    // The programme is off before anything else moves, even if the visitor
    // scrubbed straight into the exit without passing the phone beat.
    .to(".tv-showreel", { autoAlpha: 0, duration: 0.06 }, 0)
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

/**
 * Contact booth entrance.
 *
 * The old timeline tweened `top`/`left` on `.canvas-container`, which is
 * positioned by `right` + `top`: writing `left` on top of that made the box
 * over-constrained (and `left` wins in LTR), so the booth was dragged to
 * `left: 75vw` / `top: 78vw` - down and off the right edge of the contact
 * screen, scaled up and clipped away by `overflow: hidden`. It also started
 * the instant the contact column appeared, so the sculpture popped in mid
 * exit-zoom instead of arriving.
 *
 * Now the booth *arrives*: it rises and fades up over the first part of the
 * last screen's travel, then simply holds. Transform-only, so the layout (and
 * the camera framing in CanvasWrapper) never has to re-measure.
 */
function setupContactCanvas(isMobile: boolean) {
  if (isMobile) return;

  gsap
    .timeline({
      scrollTrigger: {
        id: "contact-canvas",
        trigger: ".contact-inner",
        // The booth belongs to the last screen, so it must not start moving
        // while the television exit still owns the viewport. It begins once
        // the contact screen has genuinely taken over (its top edge in the
        // lower fifth of the viewport) and settles shortly after the screen
        // docks - arriving *with* the headline lockup instead of pre-fading
        // off-screen (the old "top 92%" start had spent most of the entrance
        // before a single pixel of the booth was visible) or popping in late
        // because the WebGL scene had not mounted yet (Contact now preloads
        // the scene well ahead of this trigger).
        start: "top 80%",
        end: "top 18%",
        scrub: true,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    })
    // Rise: a long, decelerating lift out of the lower edge of the screen,
    // growing slightly as it comes towards the visitor.
    .fromTo(
      ".canvas-container",
      { autoAlpha: 0, y: "11svh", scale: 0.92 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.82, ease: "power2.out" },
    )
    // Settle: one small overshoot and rest, so the arrival reads as a heavy
    // object finding the floor rather than a fade that simply stops.
    .to(".canvas-container", { y: "-0.7svh", duration: 0.09, ease: "sine.out" })
    .to(".canvas-container", { y: 0, duration: 0.09, ease: "sine.inOut" });
}

// Locomotive's best-working scenes used scrub: true. Keep that direct
// correspondence here: ScrollSmoother already supplies desktop inertia and
// native scrolling supplies mobile inertia, so numeric scrub would smooth the
// same movement twice and let pinned artwork trail behind its trigger.
function setupResponsiveAnimations(
  isZh: boolean,
  isMobile: boolean,
  onSectionChange: (section: PortfolioSection) => void,
  onWorkPreview: (index: number) => void,
): () => void {
  setupIntroHeadlineChoreography(isZh, isMobile);
  setupIntroParallax(isMobile);
  setupFirstIntroStory(isMobile);
  setupSecondIntroStory(isMobile);
  setupTelevisionSequence(onWorkPreview, isMobile);
  setupContactCanvas(isMobile);
  return setupSectionTracking(onSectionChange);
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
  // Section tracking installs a scroll listener, so it has to hand back a
  // teardown that matchMedia can run when a breakpoint switch reverts the
  // scene; otherwise every resize would leave another listener behind.
  let teardownTracking: (() => void) | undefined;

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

      teardownTracking = setupResponsiveAnimations(
        isZh,
        isMobile,
        onSectionChange,
        onWorkPreview,
      );
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
    teardownTracking?.();
    media.revert();
    ScrollSmoother.get()?.kill();
    gsap.set("#smooth-content", { clearProps: "transform" });
    delete scope.dataset.scrollTriggerCount;
  };
}
