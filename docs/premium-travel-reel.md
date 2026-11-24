# Premium Travel Route Reel — Scotland by Campervan

## Example

Open `Shorts & Reels → Premium Travel Route Reel — Scotland by Campervan` in the existing OpenMotion Studio. Format: **1080×1920, 30 seconds, 30 fps**. All map and stop scenes use the existing deterministic Canvas preview and MP4 export pipeline.

Storyboard: **Edinburgh** (0–4s), **Glen Coe** (4–12s), **Eilean Donan Castle** (12–19s), **Portree** (19–26s), **full route finale** (26–30s). The camper graphic rotates to the bearing of the road path. Stop cards display a photograph, editorial caption and image attribution.

## Genuine basemap and route

- MapLibre GL JS renders actual OpenFreeMap vector-map layers using the official Bright style: https://tiles.openfreemap.org/styles/bright.
- A hidden MapLibre map produces one snapshot per video scene at its specified geographic camera. Canvas uses the exact screenshot and pixel positions for route, vehicle and markers, maintaining visual alignment across video frames.
- The sample uses one driving route query through the OSRM demonstration service with four stops, based on OpenStreetMap roads. During preview preparation, the response replaces the placeholder points with a full road-matched GeoJSON LineString. The renderer does **not** display a fabricated straight-line substitute when routing fails.
- For saved/reproducible travel projects, import a recorded **GPX** or road-matched **GeoJSON LineString** in Studio. This replaces the routing service dependency for that project. The imported route is not checked for road restrictions or camper suitability.
- The OSRM demo endpoint is suitable for limited non-commercial demonstration only. For production or high-volume use, configure your own OSRM endpoint or connect a commercial routing provider. Routing requires network access during preparation unless valid road geometry has been committed.

### Browser rendering

The MapLibre snapshot operation is asynchronous and completes **before** MP4 frame encoding starts. This preserves frame alignment with the route and camera overlay. The map remains on a fixed geographic camera per scene, with a small Canvas-based animated pan/zoom. There is no live 3D terrain yet.

The MapLibre map requires WebGL and reachable OpenFreeMap vector tiles. The MP4 exporter requires browser support for the selected H.264 encoder, with the existing MediaRecorder fallback. Device testing, especially on Safari/iPad, is needed before publishing videos. Neither a live build nor a device export was performed as part of this branch.

### Geography and cartographic credits

- Route data © OpenStreetMap contributors, generated with OSRM.
- OpenFreeMap © OpenMapTiles, data from OpenStreetMap.
- Required map attribution remains present at the bottom of every video frame.
- The stops are a scenic sample, not a route recommendation for large vehicles. Check campsite access, road restrictions, road closures and vehicle dimensions before driving.

## Photographs

Photos use direct 1280-pixel Wikimedia thumbnail URLs rather than Commons Special:FilePath redirect links. The loader also recognizes older redirect URLs saved in localStorage. Do not remove these credits when republishing. Creative Commons ShareAlike terms may apply to adapted media.

| Stop | Author | License | Original |
| --- | --- | --- | --- |
| Edinburgh Castle | Libasstref | CC0 1.0 | https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_2000-1.jpg |
| Glen Coe | Saadtowheed | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg |
| Eilean Donan Castle | Gillfoto | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg |
| Portree harbour | Clem_nat | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Portree_harbour.jpg |

License: https://creativecommons.org/licenses/by-sa/4.0/

## Editing

The Shorts media editor now includes inputs for premium stop names, explanatory text, Wikimedia photo URLs and map zoom. GPX/GeoJSON can be imported in the same panel. Advanced fields (map center, route progress, stop credits) remain editable via project JSON.

### Limitations of this first version

1. Actual network and browser render quality remain unverified.
2. The OSRM demo endpoint requires internet access and reasonable request volume.
3. Remote Wikimedia thumbnails still depend on network access and CORS. A failed optional photo is replaced by a scenic illustration without stopping MP4 export.
4. Stop durations and scene cameras are authored rather than automatically generated from the route.
5. MapLibre creates static basemap snapshots, so this is 2D/2.5D, not a free-moving 3D terrain camera.
6. R2 synthesizes an original soundtrack without external samples. Optional audio tracks remain supported and override the built-in score.

No new GitHub Actions test workflow has been added.


## Director's cut R2 (30 seconds)

The cinematic edit was rebuilt after visual review of a 30-second browser MP4.
The earlier video contained ghosted captions, undersized stops and barely perceptible map movement.
R2 is edited as eight separate moments:

| Seconds | Shot | Presentation |
| --- | --- | --- |
| 0–3 | Edinburgh | Full-bleed photograph with strong typographic opening |
| 3–8 | Driving to Glen Coe | Camera follows a larger camper on a stronger red route |
| 8–11 | Glen Coe | Full-screen location photograph and one concise explanation |
| 11–16 | Driving to Eilean Donan | Route line, numbered stops and tracking camera |
| 16–19 | Eilean Donan | Full-screen castle photograph with a readable image credit |
| 19–23 | Crossing to Skye | Animated road line and moving camper |
| 23–26 | Portree | Full-screen harbour photograph and an editorial caption |
| 26–30 | Route finale | Complete cartographic overview and closing title |

R2 removes the duplicate subtitle track from this particular travel demo. The
general timed-caption renderer is also fixed to wrap words correctly and draw
stroke and fill at identical baselines for all other video templates.

### Audio

A short original instrumental soundtrack (soft chords, gentle pulses and subtle
transition sounds) is synthesized in Web Audio without external music files.
It is included in the offline audio mix for MP4 and can be heard in the Studio
when audio preview is enabled. No voice-over is supplied.

### Actual output resolution

The previously inspected video had **512 × 910** encoded pixels although the
file was named 1080 × 1920. The nominal dimensions requested by the editor
do not necessarily equal those produced by mobile hardware encoders.

The exporter now probes the encoded video metadata before naming the download
and displays a warning whenever the browser silently reduces resolution.
This makes output dimensions truthful but does not guarantee 1080 × 1920 on
Safari. Test on desktop or choose a supported hardware mode if full HD is required.

### Verification

The R2 changes were committed without invoking GitHub Actions. A new actual
browser export must still be visually reviewed before describing the revised
film as production-ready.


## R3 — Smooth route marker

The primary travel animation now uses a small red location dot with a white rim and a subtle, time-based halo instead of the oversized illustrated camper. The dot follows the exact projected road geometry, without angle changes at sharp road bends. Preview and MP4 use the same frame time for the pulse.

An optional small top-down camper remains in the Studio's **Route-markering** selector for experiments. Its on-screen heading is computed from a short path look-ahead, avoiding immediate rotation on every tiny polyline segment. This is still a 2D icon, not a photorealistic 3D camper. A realistic vehicle would need consistent top-down assets, scale, stabilized heading and correct occlusion. The dot is the recommended default for readable vertical map reels.
