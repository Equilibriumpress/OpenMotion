# Simply Explained — MOTION

Package simply-explained-v3-3-0, version 3.3.0. Series template 3.3.

## Purpose and provenance

Clean animated editorial explainers with recurring female presenter Alex.. Knowledge-only recipe transcribed from the active native template at 41cfb4b0c4b1b55c52f30c80cf8c5882bbe8eab4. Source-derived, not a new rendered or visually accepted result.

[Native template (separate runtime)](https://github.com/Equilibriumpress/OpenMotion/blob/41cfb4b0c4b1b55c52f30c80cf8c5882bbe8eab4/series/simply-explained/template-v3.3.json)
[Reference project (separate runtime)](https://github.com/Equilibriumpress/OpenMotion/blob/41cfb4b0c4b1b55c52f30c80cf8c5882bbe8eab4/projects/simply-explained-001-how-ai-actually-works/project.json)

## Design

Design source: [DESIGN.md](DESIGN.md). Use its identity as the visual authority. Keep exact native layout and adapt within safe areas.

## Brand and material

Use the series voice and verified facts. Supply episode-specific text, rights-cleared original assets, narration and credits as required. This knowledge-only package distributes no third-party media, runtime, font files, or native project; do not assume permissions from a link. Report missing inputs.

## Story and motion

Native production instructions (preserved verbatim):

Simply Explained 3.2: illustrated Alex, never an external 3D avatar. Use existing original vector character, all established 3.1 markers (mind-series-v1, simply-explained-v1, simply-explained-v11, simply-explained-v2, alex-26, alex-27-layout, alex-performance-v1, alex-performance:<JSON>), and alex-quality-v1. The new shared QUALITY_LAYOUT enlarges Alex 28% at the lower-left edge, with independent caption zone x248–448, y686–824 in the 512×910 coordinate system. Three matching face contour poses are interpolated continuously; hair follows yaw and the existing secondary motion. Hand silhouette uses grouped fingers. Regie uses normalized host-keys and existing performance presets. Match gaze to the upper illustration. Aim for 39–42 seconds for this pilot structure; set each chapter duration from measured narration with approximately 0.3s lead and 0.45s tail, avoid long empty tails. Audio generation and final cue derivation remain the existing pipeline. Diagram actions follow normalized scene time so they finish before the cut. For this pilot, keep all narration and illustrative examples unchanged. Captions are short karaoke phrases, fitted within their own zone. Use original Canvas/SVG only, no generated images, new dependencies or extra test Actions. Publication target 1080×1920, H.264/AAC, 30 fps. Actual exported MP4 and timing require review. Final 3.3: add alex-final-v1 to every scene. Preserve the 0.8 second cover on import; normalize durations from 0.5 s upward. The voice and all seven scene times stay at 41 s for the pilot. Reveal percentages after bars build; final signature occupies the last 0.95 s without extending the timeline. Build/media revisions, strict Full HD 30 fps verification and ZIP with SHA-256 receipt identify the original browser export. Review actual decoded export before approving.

Format 9:16; 30 fps; target 41 seconds. The following reference shot order uses cumulative nominal source durations in seconds, not measured decoded frames. It is not a request to copy the example story. Easing, camera, transitions and overlap follow native scene fields and renderer; unspecified values must not be invented as verified. Match speech to measured audio, preserve reading holds and verify silence is intentional.

| Shot | Nominal time | Layout | Transition | Reference purpose/title |
| --- | --- | --- | --- | --- |
| 1 | 0.00–0.80 s | doodle-explainer | fade | How AI actually works |
| 2 | 0.80–6.10 s | doodle-explainer | fade | A fluent answer |
| 3 | 6.10–12.70 s | doodle-explainer | fade | Learn from examples |
| 4 | 12.70–19.40 s | doodle-explainer | fade | Break text into tokens |
| 5 | 19.40–26.30 s | doodle-explainer | fade | Predict the next token |
| 6 | 26.30–34.10 s | doodle-explainer | fade | Build an answer |
| 7 | 34.10–41.00 s | doodle-explainer | fade | Fluent does not mean true |

## Invariants and inputs

Keep template version, renderer markers, palette, timing intent and export contract. Replace topic, script, original scene content and approved material. If content overflows, shorten copy or adjust timing within constraints. Do not silently change aspect ratio, camera rhythm or audio policy. Use the existing GitHub project JSON workflow.

## Review

Compare decoded MP4 against shot order, actual timing, camera, transitions, safe areas, readability, voice-over/captions, audio track and format. Record project revision, template version, package version, file hash, timestamped findings and gaps. A hash check is not visual acceptance. No render was performed for this package.
