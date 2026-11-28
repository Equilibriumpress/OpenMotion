# Simply Explained / Editorial Explainer 1.0

Alex is an original recurring adult vector presenter, with swept dark hair, round glasses, warm skin, cream shirt and teal overshirt. Keep these features constant. Animate eyes, brows, jaw and hand gestures from scene time. Mouth movement is speech-window approximation, not phoneme alignment. Use 512×910 logical coordinates with safe graphics above y=660 and captions below. Covers are selectable at 0.3s; the separate SVG is a matching library illustration, not a rendered frame.

Pilot: 56 seconds, 1080×1920, 30 fps. 1.2s cover, 7.8s hook, 9s training, 9s tokens, 12s next-token prediction, 9s response, 8s verification. The example token probabilities are fictional and labelled. The subject is text-generating language models, not every form of AI. Training adjusts parameters before inference; no claim that inference searches training examples or always selects the highest-probability token.

Background reading: https://arxiv.org/abs/1706.03762 (Transformer architecture); https://arxiv.org/abs/2005.14165 (autoregressive language modeling). Keep topic-specific source research and diagrams distinct for future episodes.

Audio uses existing cached Piper pipeline and original generated score; no new install or render workflow. The manifest substitutes measured-duration phrase estimates for authored cues, not forced word alignment. Review the real voice, host motion, text safe area and browser H.264/AAC export before marking approved. No server MP4 render or additional Actions.

## Editorial 1.1 (2026-11-28)

The pilot is upgraded to 1.1. Alex is now a woman with a brown bob, warm skin, small earrings and the original teal/cream palette. The same lower-left anchor (82,699 in 512×910 coordinates) applies to all seven scenes. The caption pill occupies the area to her right; diagrams stay above the presenter. Use no running page chrome or unnecessary scene labels. Preserve only meaningful example values and labels. Three-word karaoke cues are estimated from measured speech duration, not aligned phonemes. The voice script, soundtrack and 56-second timing remain unchanged. Version 1.0 remains as historical reference. Review actual export dimensions separately: the supplied previous export reported 512×910 rather than the configured 1080×1920.

## Character Cinema 2.0

The shared `src/engine/alexPresenter.ts` separates torso, neck, head, facial features, shoulder/elbow/wrist chains and hands. The face is a stylized 2.5D yaw simulation, not a 3D model or a fully independent profile drawing. It supports left, front and right three-quarter directions. Hair and jacket include hand-drawn highlights and shading. Eyes, gaze, blink, brows, smile and arm gestures are independent. The fixed anchor is (82,699), scale .88, in the existing 512×910 logical coordinate space.

Each scene contains `host-keys:` with JSON arrays `[u,yaw,tilt,gazeX,gazeY,brow,smile,arm,gesture]`. The normalized time u must start at 0 and end at 1, strictly increasing. Signed values are -1..1; arm and gesture are 0..1. Gesture presets: 0 rest, .5 open palm, .9 pointing. `host-blinks:` lists local seconds. Author these against the visual action; use the same host anchor and keep captions to the right.

The existing manifest imports `scripts/presenter-speech.mjs`. It decodes the final voice MP3 with ffmpeg at 12 kHz mono, samples RMS at 30 Hz and gates silence. Approximate spelling-based viseme classes are mapped within estimated caption intervals; this is not accurate phoneme alignment. If ffmpeg is unavailable, the manifest logs a fallback and uses estimated phrase energy. No voice track means closed-mouth preview. The audio generator and cache are unchanged. Generated `host-energy`, `host-mouth`, `host-speech-mode` values belong to the manifest, not authored projects. No new dependency or Actions workflow.

Pilot direction: cover/front, hook viewer-to-graphic, training open palm, tokenization and prediction point toward diagram, response follows text, limits serious-to-reassuring. Existing narration, diagrams and 56s duration stay intact. Review live playback and MP4 at actual device size, verify hand/caption separation and mouth timing. Keep status review until export is checked.
