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

Photos are loaded from Wikimedia Commons at render time. Do not remove these credits when republishing. Creative Commons ShareAlike terms may apply to adapted media.

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
3. Photos rely on the remote Commons redirect and CORS headers.
4. Stop durations and scene cameras are authored rather than automatically generated from the route.
5. MapLibre creates static basemap snapshots, so this is 2D/2.5D, not a free-moving 3D terrain camera.
6. No soundtrack is shipped in the demo. Optional audio tracks remain supported by the studio's existing exporter.

No new GitHub Actions test workflow has been added.
