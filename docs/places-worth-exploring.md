# Places Worth Exploring — production template
Episode 001: Okinawa · Japan Beyond the Mainland
16:9, 1920 × 1080, 60 fps, 207 seconds, 40 shots, 9 chapters. 334 words.
 
The existing bucket-list documentary renderer and MapLibre camera are reused.
New travel-specific styling is selected through documentary.series. All shot
durations, framing, narration, map keyframes and titles remain in project.json.
Travel assets are explicitly listed in travel-assets.json; duplicate source
files are downloaded once. Commons license metadata is retrieved at build time.
The four motion excerpts are sampled into 20fps frame atlases (640×360 cells)
for deterministic canvas playback; the other non-map shots use animated photos.
The normal Pages build prepares
the image files, attribution, thumbnail, Piper narration, score, ambience and
estimated SRT timing. Studio browser export is the default. For an on-demand H.264/AAC server master, run the manual Render OpenMotion MP4 GitHub workflow with this episode's slug. It uses the same Canvas renderer and awaited MapLibre camera and verifies duration, dimensions, audio and frame rate. Download the resulting artifact (30 days). The manual render does not publish Pages. Normal deployments do not include the old prebuilt MP4 URLs. Source file pages
are researched, but image decoding, excerpt framing, pronunciation, final
audio balance and the finished film must be checked in the deployed Studio.
 
Local preparation: TRAVEL_ASSETS=1 DOCUMENTARY_AUDIO=1 npm run build
Optional local master: WORLD_RENDER_PROJECT=places-worth-exploring-001-okinawa npm run render:master
Open in the Pages Studio: #studio/places-worth-exploring-001-okinawa
Credits: assets/places-worth-exploring/places-worth-exploring-001-okinawa/credits.html
Thumbnail: assets/places-worth-exploring/places-worth-exploring-001-okinawa/thumbnail.jpg
SRT: assets/audio/places-worth-exploring-001-okinawa-captions.srt
 
For future episodes copy the project and travel-assets manifest into a new slug,
set the new title, destinations, map cameras, episode number, scene and audio
paths. Keep the series key. The thumbnail builder uses the first title scene and its text.
 
Rights: source media retain their listed licenses. The rendered compilation
must carry appropriate attribution and satisfy each applicable ShareAlike
obligation; do not assume the episode is exclusively owned or eligible for
YouTube's standard license. Audio environments are synthesized, not recordings.
