# Premium Travel Routes — Cinematic Hybrid R10

Native template 4.0, package 4.0.0, knowledge-only. [Native template](https://github.com/Equilibriumpress/OpenMotion/blob/7eb4413042df5d420bc15603cede6014bf10675c/series/premium-travel-routes/template-v4.0.json).

## Reference timing

Iceland episode 003: 40 seconds, 14 scenes, 1080 × 1920, 60 fps requested. Opening photograph and map overview, six destinations with five connecting drives, closed-loop finale. Four footage shots and two photo shots. Retain the R9 title at 0.4 seconds, description at 0.9 seconds, and existing transition overlap. Keep one medium per destination, not a rapid montage.

## Native media contract

Each stop optionally has videoClip with original source page, actual footage URL, alternate URL, author, license, license URL, source dimensions, startSec and normalized focus. Set a photo scene's mediaMode to video and editorialRevision to 10 or later to activate. Before rendering, browser prepares 15 fps vertical Canvas atlas pages using muted video seeks. Frame selection follows scene time, not live playback. Output canvas remains 1080p with requested 60 fps; source motion sampled at 15 fps and cropped detail limited to the atlas. Prefer full-duration single shots, avoid looping and freeze frames. Missing/blocked footage uses the destination's licensed photo. Show ready/fallback status and actual footage/photo credits. If neither medium is available, block export. Original soundtrack remains the audio authority. No generated imagery, additional renderer, server or render-on-build.

## Review

Verify browser source availability, framing, actual motion, source-license compliance, title reading holds, transitions, route, audio and MP4 properties. Source pages do not establish decode success. Record actual media count and any photo fallback. No runtime acceptance performed.
