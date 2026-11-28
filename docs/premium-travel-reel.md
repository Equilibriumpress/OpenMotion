# Premium Travel Route Reel — Scotland / The Open Road

## Example

Open `Shorts & Reels → Premium Travel Route Reel — Scotland / The Open Road` in the existing OpenMotion Studio. Format: **1080×1920, 30 seconds, 30 fps**. All map and stop scenes use the existing deterministic Canvas preview and MP4 export pipeline.

Storyboard: Edinburgh opening (0–3s), drive to Glen Coe (3–8s), Glen Coe photo (8–11s), drive to Eilean Donan (11–16s), castle photo (16–19s), drive to Skye (19–23s), Portree photo (23–26s), animated route overview (26–30s). The default road position marker is a moving dot. Each photo is full-screen with its own caption and attribution.

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
| Edinburgh Castle | LibKat17 | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg |
| Glen Coe | Saadtowheed | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg |
| Eilean Donan Castle | Gillfoto | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg |
| Portree harbour | Bewahrerderwerte | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg |

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


## R4 — Cinematic transitions and continuous journey

All eight Scotland scenes remain at exactly 30 seconds. The actual frame renderer
now mixes outgoing and incoming scene artwork for up to 0.7 seconds using a
smoothstep cross-dissolve. This includes map-to-photo, photo-to-map and
Portree-to-final-map cuts. The previous artificial dark overlays have been
removed. The dissolve is rendered frame by frame and works in the browser
preview and deterministic MP4 exporter without a new video engine.

During driving shots, camera focus is stabilized over neighboring points on
the actual routed geometry. The location dot itself stays directly on the
route. The camera briefly looks ahead, settles near each stop, and eases
between zoom levels. At 26 seconds the finale begins close to Portree and
pulls back to the complete route with the closing title appearing later.

Incoming and outgoing scene titles fade separately from the photographs
and basemap, reducing stacked captions during a cross-dissolve.

### Photography revision

The opening replaces a dark Edinburgh frame with a daytime castle photo.
The Portree stop replaces the previous harbour shot with a verified
Wikimedia Commons view that clearly contains the colourful waterfront houses.

- Edinburgh: LibKat17, CC BY 4.0:
  https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg
- Portree: Bewahrerderwerte, CC BY-SA 4.0:
  https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg

The original image authors and license details are also stored on every
stop for on-frame attribution. See the source pages for the license terms.

### Verification

Source consistency checks verify every scene uses the same photo set and
the template catalog matches its standalone project JSON. No GitHub Actions
have been started. Live Safari/iPad MP4 exports still need visual inspection.


## R5 — Editorial director's cut (PTR-01–10)

1080 × 1920, 60 fps requested, 30 seconds. Ten scenes: Highland A82 opening (0–3), route introduction (3–5), Edinburgh (5–8), drive (8–10), Glen Coe (10–14), drive (14–16), Eilean Donan (16–20), drive (20–22), Skye (22–27), save CTA (27–30). 19 seconds photography, 11 seconds map. Per-stop secondary photos, focal coordinates and optional contained foreground image over a blurred background preserve wide subjects. Sequential short fades through forest green prevent map marks showing over photographs. Road-matched geometry and map snapshot engine remain unchanged. Basemap is muted by canvas color filtering, not a terrain relief model. Serif typography and elevated captions leave space for social UI; photo credits are retained. The procedural score follows revised cuts; browser AAC and actual 60 fps / 1080p output still require export validation.

Additional photographs (cropped or contained, attribution on frame; original terms apply):
- Old Town: Kidozh, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg
- A82 · Pass of Glencoe: Steven Brown, CC BY-SA 2.0, https://commons.wikimedia.org/wiki/File:A82_heading_to_the_Pass_of_Glencoe_-_geograph.org.uk_-_7710150.jpg
- Eilean Donan Castle: Thomas Fuhrmann, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Eilean_Donan_Castle_v02.jpg
- The Quiraing · Isle of Skye: Squirrel1113, CC BY 4.0, https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg

The Quiraing is a nearby Skye excursion, not a fifth routed stop. No new server rendering or test workflow is required. Existing Pages deploy remains the publication mechanism.

### Optional verified master (R5)
In the existing manual Render OpenMotion MP4 workflow choose `short-scotland-road-trip`. It prepares the actual OSRM road and five map snapshots once, checks that the eight photographs decode, synthesizes the same score used in Studio, and encodes the selected 1080 × 1920 / 60 fps / AAC master with FFmpeg. FFprobe verifies output properties before the artifact is published. This workflow is manual only; it has not been run as part of this revision. The normal Pages build stays unchanged.


## R6 — finishing pass (PTR-11–20)

Direct cuts replace dark dips for R6 scenes only; titles and photo credits remain visible across the shot. Driving legs are now 2.5 seconds and the finale 3.5 seconds. Total duration remains 30 seconds. The cold-open photo is independent of the two Glen Coe pictures. The castle has two actual portrait photographs with full-bleed cropping instead of a duplicate blurred background. Screen-space destination labels use collision avoidance. The original score follows the edit. Real hillshading uses the Mapzen Terrain Tiles Terrarium DEM on AWS Open Data in existing map snapshots, not a 3D terrain camera. Relief depends on the external tile service. Source and attribution: https://registry.opendata.aws/terrain-tiles/ and https://github.com/tilezen/joerd/blob/master/docs/attribution.md (Europe terrain produced using Copernicus data and information funded by the European Union – EU-DEM layers; additional source-specific credits as applicable). MapLibre style: https://maplibre.org/maplibre-style-spec/sources/.

New photo sources (cropped and color graded):
- Three Sisters of Glen Coe: rboed, CC BY 2.0, https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg
- Across the causeway: Balon Greyjoy, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg
- Stone walls above the loch: Dakotsmom229, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG

Manual master also checks opening-photo decoding and exact H.264/AAC codecs and frame count (1800). No master run or device playback is asserted by this source revision. Standard Pages build does not render MP4.

## R7 — Cinematic Journey (PTR-21–30)

Series template 2.0 retains version 1.0 (R6). All ten scenes total 30 seconds; 1080 × 1920 / 60 fps remains requested. Geographic reveals use the same projected stop and camera transform as the map. The overlap uses the outgoing shot's tail and carries incoming time across the boundary. Photo pairs use a 0.30 s directional wipe; missing primary/secondary images reuse an available photograph from the same stop. Both missing blocks publication export. The opening push, route tracking, finale pulses, independent title weights and audio cues are deterministic. True photographic parallax requires separately prepared depth layers and is not included; use focal pan/zoom instead. Map snapshots remain 2D and the camera is clamped to their bounds. No new dependencies or workflows. Browser rendering and actual output require visual review.

## R8 — Slow Cinema

Template 2.1 retains R6 (1.0) and R7 (2.0). Each destination uses one photograph for the entire shot, with its secondary photo reserved for unavailable primary media. Camera zoom is 3.5% over the full shot. Captions use the actual scene clock (not the transition lead-in): title begins at 0.4 s, description at 0.9 s. The gradient remains steady behind text. Existing R7 map transitions, original audio, credits and export readiness checks are retained. The final Skye shot prefers the Quiraing photograph, with Portree harbour as backup; the routed stop remains Portree. No additional actions or dependencies. Browser export needs visual review.

## R9 — Open Road Signature Edition (PTR-39–47)

Native template 3.0 and immutable Motion Package 3.0.0. Both Scotland and Dolomites upgraded without duration changes. Same route geometry and MapLibre snapshots; enhanced relief and north compass. Optional Mapzen Terrarium DEM sampled at 97 Web Mercator arclength points, cached for the prepared project, estimated elevations and synchronized route marker. Missing DEM omits chart, latitude used for photo micro-information. Optical atmosphere is gentle masked light, not real animated mist or water; selective feathered foreground crop is an optical depth approximation, not independently segmented 2.5D. Original synthesized wind/water beds are timed to photo scenes. Finale uses the true projected route in a graphic poster. No new dependencies or workflows. Photo assets and existing export checks retained. Browser CORS, DEM availability and actual MP4 remain unverified.

## PTR-48–52 — Iceland Extended Edition and photographic library cards

Episode 003 is an episode-specific 40-second variant of native template 3.0, without changing its immutable 30-second reference. Six stops, 14 scenes; one active photo per stop, one reserve and one archive, plus opening photo (19 references). Archives are not preloaded. The Nordic score spans the extended duration, and the final poster accommodates six stops. The library uses the episode's existing licensed hero photography (Scotland: Quiraing/Skye; Dolomites: Giau; Iceland: Jökulsárlón), then reserve photograph, then existing SVG/title fallback. Responsive 16:9 card composition is distinct from the actual MP4 frame; Publication Kit still exports a frame from the rendered MP4. No route silhouette is fabricated for an unrouted thumbnail. Old untouched Iceland publication defaults migrate; edits are retained. Live CORS, image framing, route and MP4 not verified. No added test Actions or dependencies.
