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
No extra GitHub workflow is introduced. The existing Pages build prepares
the image files, attribution, thumbnail, Piper narration, score, ambience and
estimated SRT timing. The existing in-browser MP4 export is the master export
path; prebuilt server MP4 is not enabled for this episode. Source file pages
are researched, but image decoding, excerpt framing, pronunciation, final
audio balance and the finished film must be checked in the deployed Studio.
 
Local preparation: TRAVEL_ASSETS=1 DOCUMENTARY_AUDIO=1 npm run build:manifest
Open in the Pages Studio: #studio/places-worth-exploring-001-okinawa
Credits: assets/places-worth-exploring/places-worth-exploring-001-okinawa/credits.html
Thumbnail: assets/places-worth-exploring/places-worth-exploring-001-okinawa/thumbnail.jpg
SRT: assets/audio/places-worth-exploring-001-okinawa-captions.srt
 
For future episodes copy the project and travel-assets manifest into a new slug,
set the new title, destinations, map cameras, episode number, scene and audio
paths. Keep the series key. The thumbnail builder currently uses the fourth
shot and Okinawa title, so adapt that before producing another episode.
 
Rights: source media retain their listed licenses. The rendered compilation
must carry appropriate attribution and satisfy each applicable ShareAlike
obligation; do not assume the episode is exclusively owned or eligible for
YouTube's standard license. Audio environments are synthesized, not recordings.
