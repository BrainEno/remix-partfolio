# Desktop choreography behavior contract

This document is intentionally written as a behavior contract rather than a list
of implementation details. The Playwright scenarios in
`tests/desktop-choreography.spec.ts` enforce the same rules at runtime.

## Chinese Intro

Given the Chinese desktop Intro story is entering the viewport,
when the portrait begins its descent,
then the large `簡介` title must begin descending in the same scroll phase and
must not outrun the portrait.

Given the portrait/title pair has settled,
when the primary Intro copy arrives from the right,
then the portrait/title pair must remain parked until the copy approaches the
portrait's right edge.

Given the copy has reached the hand-off point,
when the user continues scrolling,
then the copy, portrait and `簡介` title must travel left together and leave the
viewport as one composition. The title must not continue moving right before
reversing direction.

## Works / TV

Given the Works section is entered on desktop,
then the whole TV artwork is one pinned visual unit and remains registered to
its CRT overlay. The TV artwork must preserve its intrinsic aspect ratio; the
project preview must fill only the CRT clipping rectangle.

Given any work row is nearest the physical CRT center,
then that work owns the screen preview and the matching work typography becomes
active. This rule is based on DOM geometry, not a hard-coded item index.

Given the configured work list grows from four items to ten or more,
then the browsing section grows with the work count and the phone/exit stages
remain after the final work. No transition timing may depend on there being
exactly four works.

## Phone hold and Contact transition

Given the last work has left the browsing interval,
then the project preview clears and the contact phone number rises into the CRT
screen.

Given the phone number has appeared,
then it must remain readable for a dedicated hold phase while the TV remains
largely stable.

When that hold ends,
then the CRT changes from grey-green to black while the complete TV grows and
rotates.

Given the transition has established a black field,
then the telephone-booth WebGL scene begins entering from the right and travels
left during the black-to-white transition.

Finally, the TV disappears only after the white Contact field is established,
and the Contact typography becomes visible on that white field.
