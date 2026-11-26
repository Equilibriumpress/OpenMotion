# The Cat Office
Reusable vertical meme format. Each episode is a project.json with catOffice shots, relative subtitle cues and relative audio events. The existing Pages build downloads licensed photos and generates original synthetic audio. Studio renders the video in the browser. A verified 1080×1920 60 fps H.264/AAC server master is available on demand via the manual Render OpenMotion MP4 workflow. Browser preview/export uses the same local assets. Credits: public/assets/cat-office/credits.html (also deployed).
 
Episode 001: six scenes, 18 seconds, 1080 frames. Photographic cutout collage rather than fully generative photorealistic video. Cat vocalizations are synthesized, not natural recordings. Mouth shapes are illustrative, not tracked facial rigging. No automatic server render on publication.
 
Local build: CAT_OFFICE_ASSETS=1 npm run build. To generate a master locally, run the full asset build first, then WORLD_RENDER_PROJECT=cat-office-001-quick-meeting npm run render:master; requires Python 3, FFmpeg and Chromium. Photo availability and visual appearance require review before publishing to social channels.

## Studio import compatibility
The project normalizer must retain the `catOffice` scene object and intentionally empty headlines. Without this, Studio preview and browser export fall back to the generic paper-cutout renderer while the direct publication master still uses the original scene JSON. Verify that all six imported scenes retain their shot, cue and event definitions.
