# The Human Side — template 1.0

Original hand-drawn stick figures inspired by the supplied visual reference: black curved strokes, white circular expressive faces, lilac paper, lavender glow, oval shadows. No raster reference copied into the project. Original reusable SVG path geometry drawn with Canvas/Path2D, identical sampling for preview and export. The pilot runs 28 seconds at 1080 × 1920, 30 fps. No separate renderer service, image generation, third-party asset requests or new Actions.

## Reuse

Follow docs/SERIES_WORKFLOW.md. Copy the project JSON with a new slug, IDs, title, scene text and new audio paths. Keep kind=video, seriesId=the-human-side, season, episodeNumber, templateVersion=1.0. Use a new episode number; the manifest discovers it without editing the catalog. Set productionStatus=review pending visual review.

Use layout=doodle-explainer, fullBleed=true, and both markers in doodle.extras:
```json
["mind-series-v1","human-side-v1","shot:contrast","episode:01","pose-a:panic","pose-b:calm","face-a:worry","face-b:smile","label-a:Something is wrong.","label-b:Let's find out."]
```
The legacy mind marker is intentional: it selects existing cached Piper narration generation, music generation and missing-audio validation. The new marker is dispatched first by the doodle renderer. No audio build script or workflow was changed. Scene headline and caption are independent of editable narration. Studio's Shorts editor offers dedicated selectors for both characters' poses and faces, thoughts, message, scene preset and episode number. These controls are stored in extras and versioned scene JSON. They are not independent SVG layers in the Studio editor.

Shot presets: message (both receive the same message), worry (A solo), calm (B solo), contrast (side-by-side), reveal (both receive new context). Change message:, label-a:, label-b:, episode:, pose-a:, pose-b:, face-a:, face-b: in extras.

15 pose presets: neutral, phone, worried, panic, kneel, calm, joy, shrug, point, think, walk, wave, crossed, lean, relief. The walk preset is a stride pose, not a full locomotion cycle. 12 facial presets: neutral, smile, joy, worry, panic, sad, anger, surprise, confused, relief, sleepy, determined. Independent limbs, eased pose transitions, blinking, breathing, and stress marks. BrandKit colors control background, text/ink, glow and shadow. Text stays within the central safe area. No live footage.

## Episode 01 storyboard

| Time | Visual | Voice-over |
| --- | --- | --- |
| 0–4 | Both receive the same message | Two people get the same message: we need to talk. |
| 4–10 | A crouches and worries | One starts worrying. Did I do something wrong? Are they upset with me? |
| 10–16 | B stays calm | The other thinks, I'll find out later, and gets on with the day. |
| 16–22 | Contrast with both interpretations | The message is identical. How we interpret a situation influences how we feel. |
| 22–28 | New context: dinner plans | Then the reply arrives. Dinner plans. Sometimes, asking for context changes everything. |

The two reactions are fictional, not diagnoses, not fixed personality types, and neither person's feelings are morally better. The conclusion illustrates how interpretations relate to emotions, not a claim that all distress is voluntary. Sources: APA Dictionary of Psychology, appraisal theory (https://dictionary.apa.org/appraisal-theory); Associations between cognitive appraisals and emotions: a meta-analytic review (https://pubmed.ncbi.nlm.nih.gov/39404856/). The episode is an illustration, not a clinical recommendation.

## Review and publication

Open #studio/the-human-side-01-same-situation after the normal Pages deploy. Inspect first-frame readability, pose transitions, hands, mobile overlays, Piper pacing and export audio. The cover is an original static SVG, not an exported video frame. Use Studio's normal MP4 export. New scene edits require normal audio regeneration for updated voiceover. Browser visual review and real MP4 export are still pending. No new test Actions or automatic MP4 render.


## Social cover — template 1.1

The first 0.85 seconds (or up to 30% of a shorter first scene) are a selectable thumbnail frame with a two-line high-contrast title, two enlarged character poses, a message hook and series label. The original narration starts on its existing timeline and the total duration is unchanged. The cover is rendered through the same deterministic Canvas path as the MP4; the export tab also provides the matching 1080 × 1920 PNG. Set the cover fields in the first scene's dedicated editor. An empty cover-title disables it. Keep core content inside the central area for profile grid crops. Choose a frame around 0.3 seconds in the platform's thumbnail picker; OpenMotion does not set the remote thumbnail automatically. For platforms/accounts supporting separate custom images, the PNG is an alternative.

Version 1.0 remains unchanged; the pilot is now explicitly assigned 1.1, and future episodes inherit the new cover instructions. The horizontal Studio series cover is separate and unchanged. No extra rendering workflow is needed. Browser PNG/MP4 output and platform upload remain to be verified.


## Director's cut — template 2.0

All five existing episodes migrate to 2.0, with their 28-second duration and original series identity preserved. Old frozen templates remain available. No extra GitHub Actions workflow is introduced.

- Opening cover: 1.5 seconds, stable first 0.82 seconds, then subtle pose movement. The PNG export matches the .3-second frame. The revised episode opens paused and the export panel has a direct cover-preview button. The five individual library posters are independent static SVGs, including a new one for episode 01.
- Renderer: explicit Canvas path commands instead of Path2D overloads, ellipse and roundRect in this renderer. Deeper kneeling, curved asymmetrical body geometry, head tilt, squash, breathing and independent arm/leg motions. Smooth deterministic prop entrances and camera pushes with match-cut floor alignment.
- Theme controls: theme:message, waiting, calendar, boundaries, feedback. For message scenes use detail-a/b for secondary thoughts; calendars use prop-title and prop-next; task stacks accept prop-tasks separated by |; documents use prop-title. The original theme's props and messages must fit the particular episode.
- Caption hierarchy: no simultaneous headline/caption/voiceover duplicate. Short fallback captions in JSON are replaced at publication with estimated phrase timings from Piper; the cover is protected from caption overlays. Last scene has one short takeaway.
- Sound: original deterministic Foley WAV generated in the ordinary manifest build, only for opted-in Human Side scenes. Add audio track assets/audio/<slug>-human-sfx.wav, kind effect, volume .48. No external samples or Piper cache script changes.
- Future episodes: use version 2.0, all three markers human-side-v1, mind-series-v1, human-side-v2. Keep the two-line cover and one theme per episode, and create its own poster. Use the existing editor controls; update voiceover and generated captions through the normal publication workflow.
- Review: run npx tsx scripts/check-human-side-canvas.ts manually, then visually inspect the actual deployed Canvas on Safari/Chromium and export MP4. The strict Canvas mock is not proof of Safari compatibility, browser rendering, audio playback or MP4 encoding. The pilot cover was reconstructed from recorded renderer drawing commands with approximate text metrics for layout QA; the margins and kneeling silhouette were revised after that check. The real browser/MP4 output still requires verification. The exact cause of the originally reported missing cover has not been reproduced.


## Narrative expansion — template 2.1

Episodes 06–10 move from two contrasting responses to a single protagonist's story. Episodes 01–05 retain their original 2.0 version and scene design. All new episodes are 29 seconds, five beats, 1080 × 1920, 30 fps. Template 2.1 is the active version. The first 1.5 seconds use module-specific artwork in the existing cover renderer and remain selectable around .3 seconds. Library posters use the same illustration geometry captured as SVG, with separate landscape typography.

| Episode | Theme | Visual action |
| --- | --- | --- |
| 06 Why We Feel Guilty Doing Nothing | rest | Seated figure, orbiting unfinished tasks, clock and release into rest |
| 07 The Smile We Hide Behind | mask | Smiling face overlay moves away from the underlying expression, followed by support |
| 08 Why We Keep Making the Same Mistakes | loop | Repeating scroll and clock, loop breaks when the phone moves to a table |
| 09 Being Strong Gets Exhausting | load | Labelled boxes accumulate, body posture changes, responsibilities are shared |
| 10 Lonely in a Room Full of People | crowd | Subdued moving background group, foreground isolation and one-to-one contact |

For every 2.1 scene include human-side-v1, mind-series-v1, human-side-v2, human-side-v21, episode:NN, theme:<module>, shot:<setup/build/turn/change/resolve>. Edit these in the new story panel. Use a short final headline in resolve only. Use cover-title and cover-hook only in the opening scene. Covers automatically use theme-specific acting instead of the two-figure cover poses. Relevant prop controls: rest uses prop-tasks and prop-next; mask uses label-a; loop uses prop-title and prop-next; load uses prop-tasks; crowd uses label-b. Optional pose-a/b and face-a/b override applicable actor defaults; seated and mask animation have dedicated body geometry. Audio scripts generate narration, score, original synthesized foley and publication-time approximate phrase captions through the existing build. No new dependency or workflow. Fictional scripts do not diagnose or promise psychological outcomes.

Run the manual Canvas regression in scripts/check-human-side-canvas.ts if desired. The strict command mock checks finite coordinates, draw method signatures, cover labels and state balance. Real Safari/Chromium playback, synthesized narration, sound mix and MP4 export require visual/auditory review. All new projects remain in review status.


## Cinematic action pilot — template 2.2

Episode 08 only is migrated from 29 to 25 seconds. The other nine episodes keep their current templates until the new acting style is reviewed. Template 2.2 adds a reusable six-shot action rig for phone-habit stories, not a fully generic character animation system.

| Time | Action |
| --- | --- |
| 0–1.5 | Large facial close-up, phone and recognizable series cover |
| 1.5–5 | Hand and screen close-up, repeated scrolling |
| 5–9 | Digital clock advances from 22:00 to 23:30 |
| 9–13 | Accelerating close-up cuts and repeated swipes |
| 13–17 | Expression of recognition, face close-up |
| 17–21 | Alternating walking steps, phone attached to hand, rotation and table contact |
| 21–25 | Sitting motion and short final takeaway |

Keep human-side-v1, mind-series-v1, human-side-v2, human-side-v21 and human-side-v22 on all cinematic scenes; use theme:loop, the existing shot markers and action:scroll/time/repeat/realize/place/sit. The new action selector is editable in Studio. The larger caption chunks (64 px at 1080 width, up to four words) survive manifest caption generation. Sound effects are synthesized from the new action timing. No new dependency or animation engine.

Export investigation: the supplied file was 512 x 910, 30 fps, 29 seconds, H.264 with no audio stream. The existing browser fallback explicitly allows downscaled or silent output; this is a plausible cause, not proof of the particular export path. Human Side now requires a voiceover source, disallows automatic resolution downgrade, and rejects browser MP4 outputs that fail dimension, frame-rate or audio-track validation. A browser without working encoders may therefore fail instead of producing a defective MP4. The existing manual GitHub master workflow supports Human Side, uses the project dimensions and fps, mixes project audio and validates H.264, AAC, duration and frame count with ffprobe. No additional automatic master rendering or test Actions.

QA: the fetched renderer code was executed with TypeScript annotations removed against a strict Canvas command mock at all 750 frame times; cover labels, clock range, template consistency, and a 25-second non-silent unclipped synthesized PCM effects track were checked. This does not constitute a native browser render, a full TypeScript build, audible Piper review, or actual MP4 verification. The supplied old MP4 was inspected with ffprobe. Keep productionStatus review until the new deployed export is reviewed.


## Full-series cinematic revision — template 2.3

Episode 08 stays unchanged on its 2.2 phone-habit pilot. Episodes 01–07 and 09–10 use 2.3, six shots, 25 seconds each, 1080 × 1920 at 30 fps, with a 1.5-second opening cover and 64 px four-word captions. Existing export safeguards and manual master workflow apply unchanged.

| Episode | Thematic action |
| --- | --- |
| 01 | Message close-up, contrasting facial reactions, dinner reply |
| 02 | Sent message, waiting clock, phone moved toward table, reply |
| 03 | Cancelled appointment, calendar card moved to tomorrow |
| 04 | Request, accumulating tasks, boundary response |
| 05 | Marked draft, facial reaction, shortening the opening |
| 06 | Sitting down, appearing tasks, rest |
| 07 | Mask close-up, mask removal, honest conversation |
| 09 | Growing labelled stack, sharing the load |
| 10 | Moving group, isolated close-up, one-to-one contact |

For the new themed compositions use the markers mind-series-v1, human-side-v1, human-side-v2, human-side-v21, human-side-v22, human-side-v23, plus theme and film:event/reaction/action/turn/change/ending. The theme and shot are editable in the dedicated editor. Use the existing shot markers for the narrative beats. The new landscape posters use the same subject artwork as the opening cover, with separate typography. Captions are approximate phrase timings until generated speech is available. These are curated thematic motion presets, not a fully generic skeletal animation editor.

QA: all ten projects were sampled at 30 fps, 7,500 scene-local frame times, against a strict Canvas command mock. Cover text and separate PNG-render entry point checked. All ten synthesized effects tracks were generated in memory, with 25-second length, nonzero samples and no clipping. No additional test Actions or master renders were launched. Native browser pixels, full build, Piper voice and final MP4 sound/quality still need actual playback verification. Production status remains review.
