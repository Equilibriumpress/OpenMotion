# The Cat Office
Reusable vertical meme format. Each episode is a project.json with catOffice shots, relative subtitle cues and relative audio events. The existing Pages build downloads licensed photos and generates original synthetic audio, then renders the 1080×1920 60 fps H.264/AAC master using the same Canvas engine as preview. Browser preview/export uses the same local assets. Credits: public/assets/cat-office/credits.html (also deployed).
 
Episode 001: six scenes, 18 seconds, 1080 frames. Photographic cutout collage rather than fully generative photorealistic video. Cat vocalizations are synthesized, not natural recordings. Mouth shapes are illustrative, not tracked facial rigging. No additional workflow.
 
Local build: CAT_OFFICE_ASSETS=1 npm run build. To generate publication master locally also set WORLD_RENDER=1; requires Python 3, FFmpeg and Chromium. Photo availability and visual appearance require review before publishing to social channels.
