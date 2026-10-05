# Portfolio animation behavior contract

This document is the durable behavior contract for the animated homepage. It records the intended choreography independently of the current number of works, copy length, or implementation details.

## Desktop Chinese intro

### Scene A — portrait and 简介 descend together

Given the Chinese homepage enters the first intro story, when the scene starts pinning, then the portrait and the large `简介` title begin moving downward early rather than waiting until the scene is already high in the viewport.

The portrait rotation and vertical movement must progress on the same timeline as `简介`. Neither element may visibly race ahead of the other. The descent must be slow enough to read as a deliberate move rather than a quick flick.

The title settles below the portrait. It must not continue travelling to the right after reaching that composition.

### Scene B — copy approaches from the right

Given the portrait/title composition has settled, when the primary biography copy travels from right to left, then the copy first approaches the right edge of the portrait while the portrait/title composition remains stable.

When the copy is about to touch the portrait's right edge, the copy becomes the visual "pusher": the biography copy, portrait, and `简介` title move left together as one group until the portrait/title leave the viewport.

The title must never execute the incorrect sequence "move right, then reverse left". The only large horizontal movement after settling is the shared push to the left.

## Works / television scene

### Stable TV geometry

The complete TV artwork is one visual unit. The photographic background, CRT bezel, screen content, and any phone-number overlay must share the same transform so they cannot drift apart.

The TV artwork may be slightly enlarged and shifted upward so the physical television appears near the visual center of the viewport. The source artwork's intrinsic aspect ratio must be preserved; stretching or `object-fit: cover` geometry must not be used in a way that makes the screen-content rectangle diverge from the physical CRT opening.

Project imagery must be clipped entirely inside the CRT opening. No project pixels may appear outside the visible screen and no portion of the CRT opening should be left uncovered by a project image while a preview is active.

### Work-to-screen coupling

Given any number of configured works (4, 10, or more), while the work list passes the pinned television, the work nearest the CRT activation zone drives both the active project typography and the image shown inside the CRT.

The television exit sequence must be located after the work list in document flow. Adding or removing work items must therefore move the phone/exit stages naturally rather than changing hard-coded pixel or item-count timings.

### Phone hold

After the final work has passed, all project imagery clears from the CRT. The configured contact phone number rises into the empty CRT and remains readable for a deliberate hold interval.

The phone hold happens before any major television rotation, large scale-up, or fade. The phone must be rendered inside the CRT clipping region.

### CRT transition to Contact

After the phone hold:

1. the phone fades away;
2. the CRT moves from its idle grey-green tone toward black;
3. while the screen is becoming black, the complete television scales up and rotates like a transition shot;
4. the black CRT grows until it behaves as the black-field transition between Works and Contact;
5. the black field transitions to the white Contact background;
6. during this transition, the telephone-booth WebGL model enters from right to left;
7. the final Contact composition becomes visible only after the black-field transition has progressed far enough to avoid a premature white flash.

The television bezel/background and screen content must transform as one unit throughout the exit.

## Data-driven invariants

The choreography must not depend on there being exactly four works. The following invariants are required:

- the work-list height is content-driven;
- the phone stage is after the last work DOM node;
- the exit stage is after the phone stage;
- the TV pin lasts through work browsing, phone hold, and the transition;
- adding work items delays the phone/exit stages automatically;
- active work detection is based on geometry/activation zone, not a fixed list length;
- language-specific row height or copy length may change layout but must not reorder the animation phases.

## Test contract

Playwright regression coverage must verify the phase ordering and geometry rather than screenshots alone. At minimum desktop tests should cover:

- Chinese intro: portrait/title descend together, title does not first move right, copy approaches and then pushes the visual group left;
- CRT preview: preview bounds remain within the physical screen bounds;
- work-count independence: the exit trigger remains after the last work when extra rows are inserted for the test;
- phone stage: phone appears after works and before exit transform;
- transition ordering: grey-green -> black -> white, with television transform changing after phone hold;
- telephone model: model begins on the right and moves left during the black-to-white transition;
- no runtime page errors.
