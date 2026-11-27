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
