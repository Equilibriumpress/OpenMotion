# The Song Explained — template 1.0

Original 9:16 illustrated music explainers. First episode: Fast Car (1988), 40 seconds, 1080 × 1920, 60 fps. The series uses its own cream/ink/ochre/red/blue vector aesthetic and original Canvas Path2D artwork. It does not imitate album art or use commercial song recordings or lyrics.

## Production

Follow docs/SERIES_WORKFLOW.md. Create one project.json per episode with unique slug, seriesId=the-song-explained, season, episodeNumber, templateVersion=1.0 and productionStatus=review. The manifest discovers it without a catalog edit. The static series cover is separate from individual episode art.

Use layout=doodle-explainer, fullBleed=true, doodle.extras containing song-explainer-v1 and mind-series-v1. The latter is only the existing audio generator selector; the song renderer takes precedence. Set shot:road, room, shop, night, return or symbol; camera:push or pull; symbol:car, record or heart; artist:NAME · YEAR; episode:NN. Headline line breaks use |. Add original story-specific scene presets for new songs rather than blindly reusing Fast Car imagery. Scene fields, camera, narration and covers are editable in Studio. The person rig has stand, look, work, sit, walk and tired poses internally; new scene presets may use these. No external image service or new build dependency.

First scene only: cover-title:FAST CAR and cover-hook:More than a car. The first 0.85s of the video shows the matching Canvas cover. Export it separately through the existing Shorts/TikTok PNG button. Create a static original episode SVG for thumbnailUrl. The studio series SVG is 16:9 and the episode SVG 9:16.

## Audio and export

Existing cached Piper generation produces English voiceover, independent synthetic instrumental score and timing estimates per scene. No changes to the generator or workflow are required. The manifest replaces fallback captions with measured-duration cues (approximate phrase timing, not word alignment). The cover stays unobstructed until 0.85s. The project includes fallback timed captions for local builds without generated audio. Use existing audio track controls to remove the score for voice-only export or remove both tracks for a caption-only version; these are not three separate pre-rendered files. Audio edits require normal GitHub publication to regenerate narration. The score is independent of the song and must not reproduce its melody. Render from Studio with the standard browser MP4 export, not the manual server-master workflow.

## Episode 01

| Time | Picture | Story |
| --- | --- | --- |
| 0–3 | Road and cover | More than a car |
| 3–8 | Young woman by apartment window | A different life |
| 8–16 | Shop and shelves | Work, family, poverty |
| 16–24 | Night road and moving car | Hope and freedom |
| 24–32 | Quiet room at night | Familiar struggles |
| 32–40 | Road, slow pull-back | Hope and escape |

The story refers to the fictional narrator, not a biography of Tracy Chapman. Source context: [1988 New York Times interview transcript](https://www.about-tracy-chapman.net/1988-the-pop-life/), [NPR 2021](https://www.kgou.org/2021-10-15/meeting-tracy-chapman-in-the-spaces-between), [1995 Los Angeles Times interview](https://www.latimes.com/archives/la-xpm-1995-12-09-ca-12251-story.html). The final question is editorial interpretation, not a claim of exclusive authorial intent.

Review after Pages deployment: check all six scenes, title sizing, captions, cover crop, Piper pacing, voice/music mix and actual exported MP4 on target device. Template is a first production version, not visual approval. No additional test Actions or automatic MP4 rendering.

Next planned episodes (not produced yet): Every Breath You Take, Hey Ya!, Hotel California, The Sound of Silence.
