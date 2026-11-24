# Doodle character redesign R2

## Reference and editorial choice

The starting point is the user's original 62-second Dutch ADHD/sleep video (uploaded to this conversation). The reference has one small recurring figure with short black block-shaped hair, an irregular light face, olive-green tunic, slim stick limbs, expressive but compact eyes, and restrained arm motions. A small pink brain with black-line limbs appears in the explanation.

R1's character code relied on several independent ellipses and a continuous vertical bob. The result differed visibly from the reference, especially in the six anchor shots.

R2 redraws both characters as original, reusable Canvas vector rigs and applies them to all 26 scenes. No screenshots, pixels or watermarks are embedded in the video project.

## The six reference shots

| Scene group | R1 weakness | R2 implementation |
| --- | --- | --- |
| Night in bed | Oversized oval shirt and generic head pasted onto pillow | Wide pillow, half-visible squared head, phone over blanket, compact face and eyes |
| In the shower | Full standing person hidden behind a rectangle | Separate head-and-shoulders pose, curtain masking the torso, hands resting on curtain rim |
| Daytime pressure | Heavy capsule body and mirror-image waving arms | Compact tunic, two-piece elbow arcs, thin legs, worried eyebrows and small hands |
| Night relief | Big constant bounce and awkward arm lift | Raised-arm pose only when relief is called for; subtle breathing and occasional blink |
| The brain | Generic anatomical brain with excessive folds | Small pink irregular character, sparse folds, consistent face and thin arms/legs |
| Morning overload | Expressions too large and mechanically symmetrical | Slower, restrained face changes and dedicated alerts, alarm props and bed layers |

## Vector character design

Source: `src/engine/doodleCharacters.ts`

- Person character: adjustable scale, scene-time, expression, clothing color and five poses.
- Brain character: adjustable scale, scene-time and happy/worried expression.
- Shared palette and dark outlined paths.
- No recurrent positional bounce, so the character remains anchored to the floor.
- Blink and other brief gestures are deterministic, giving identical time-sampled frames in Studio and MP4.
- Expressions: sleepy, relaxed, happy, worried, surprised, overwhelmed.
- Poses: neutral, relieved, alert, exhausted, point.

Scene composition source: `src/engine/doodleExplainerRenderer.ts`.

## Editing

Open **Shorts & Reels → ADHD & Slaap — Handgetekende Doodle Explainer**. Select a scene and choose **Bewerken → Doodle explainer**.

Use the **Houding van het personage** control to select a pose independently from the facial expression. Existing palette, props, clock, accent words and narration controls remain available.

All 26 scenes use the new character functions, while the six anchor shots have revised choreography or position. The template catalog and the standalone JSON project match.

## Verification

Static GitHub source checks confirmed the two imported vector rigs, the replaced head/person/brain functions, the six rebuilt scene paths, the new editing control, all 26 scene pose properties, matching project/catalog data and the unchanged 62-second running time.

Browser rendering and MP4 export have **not** been visually inspected as part of this commit. No GitHub Actions tests were started.
