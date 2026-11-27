# Inside Your Mind — production template

Five original English Shorts, 1080 × 1920, 30 fps, 28–29 seconds. Episode 01 is the ADHD pilot; the other four are separate editable projects. No extra workflow or automatic master render.

## Reuse
Copy an episode's project.json into a fresh slug directory, change the ID, slug, title, githubPath, audio paths and narration. Use layout doodle-explainer, fullBleed true, transition fade. In doodle.extras use:
```json
["mind-series-v1","inside-your-mind","desk","01","Finish report"]
```
The third value selects the scene preset (desk, desk-open, pair, pair-calm, loop, choices, thoughts, flash, focus, resolve, reframe). The fourth is the episode number and the fifth contains editable pipe-separated short labels. Each scene is sampled deterministically from the timeline. SVG path geometry defines the character's torso, face and hair, with separately animated limbs and expressions. Canvas handles rendering consistently in preview and export. These are not external animated SVG files or full SVG layer editors. Shot staging remains in the reusable renderer. Existing Inside the ADHD Mind episode remains unchanged.

Palette: paper #EFE3D0, pressure #DCE8EB, teal #518D89, mustard #E5B85F, lilac #9D89AE, red #B94D41, ink #49392F. Keep the opening situation visible immediately. Use short labels and natural narration. Studio's existing audio build synthesizes English Piper voice and original music, and the renderer uses scene-local estimated speech timing. Without generated audio, the headlines still tell the story. Voiceover and final MP4 must be checked after deployment. No test Actions are requested by this change.

## Storyboards and scientific sources
Each project contains the five scene lengths, visual preset, mood, labels and spoken text. The scientific sources inform the general claims, not individualized diagnosis or guaranteed interventions. Closing suggestions are practical editorial suggestions, not established cures.

- 01 ADHD and Task Paralysis — NHS, ADHD in adults: https://www.nhs.uk/conditions/adhd-adults/ . Organization and task completion difficulties; avoid interpreting task paralysis as a formal diagnostic criterion.
- 02 Why Your Brain Replays Conversations — systematic review and meta-analysis, post-event rumination and social anxiety (2024): https://pubmed.ncbi.nlm.nih.gov/38518572/ . Association, not proof of causation.
- 03 Why Small Decisions Feel Exhausting — Chernev et al. (2015), Choice overload: a conceptual review and meta-analysis: https://doi.org/10.1016/j.jcps.2014.08.002 . The effect depends on difficulty, complexity and uncertainty; avoid a literal finite mental battery or universal decision fatigue claims.
- 04 Why You Remember Embarrassing Moments — Kensinger, Remembering the Details: Effects of Emotion (2009): https://pubmed.ncbi.nlm.nih.gov/19421427/ . Emotion can strengthen some aspects of memory without uniformly increasing accuracy.
- 05 Why Silence Sometimes Feels Uncomfortable — Koudenburg et al. (2011), Disrupting the flow: https://doi.org/10.1016/j.jesp.2010.12.006 . Experimental evidence for social effects of brief silence; silence is not inherently rejection.

## Review
After the normal Pages publication, open each project in Studio and preview the first frame, character staging, text wrapping, audio timing, and MP4 export. Check on a phone. No original reference image was available in the request, so the existing repository's hand-drawn character palette and design are the reference.
