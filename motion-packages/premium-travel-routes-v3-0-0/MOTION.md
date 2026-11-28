# Premium Travel Routes — MOTION

Package premium-travel-routes-v3-0-0, version 3.0.0. Native series template 3.0. Knowledge-only; implementation and visual review are distinct.

[Native template (separate runtime)](https://github.com/Equilibriumpress/OpenMotion/blob/d201996c74b6d286853fb632b2d24e7f30b88fbc/series/premium-travel-routes/template-v3.0.json)

## Shot sequence

9:16, 60 fps requested, 30 seconds. Preserve R8 timings: opening 0–3, map 3–5, photo 5–7.5, drive 7.5–10, photo 10–13.5, drive 13.5–16, photo 16–19.5, drive 19.5–22, photo 22–26.5, finale 26.5–30. Existing R7 geographic reveal / return masks use overlapping frame time. Photo title starts at 0.4 seconds, fixed short description at 0.9 seconds. One photograph per destination; secondary only if primary fails.

## Signature direction

Actual road-matched geometry and Mapzen Terrarium DEM data, sampled along projected road distance; omit profile when unavailable. North-up compass, shaded relief, one estimated altitude or latitude in stop label. Gentle optical lighting and feathered foreground crop only when suitable; no true segmented parallax or animated weather claims. Environmental beds are synthesized, not field recordings. Finale transitions to a route poster using the actual projected route, with numbered stops and save CTA. Retain all map and photo attribution. Never invent heights or route geometry.

## Review

Compare actual MP4 against timing, safe areas, route and DEM accuracy, legibility, sound and output properties. Record project revision and output hash. No browser render or acceptance performed here.
