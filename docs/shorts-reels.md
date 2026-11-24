# Shorts & Reels production guide

The library contains eight vertical templates: memory explainer (30s), Edinburgh facts (20s), multitasking myth (15s), population index data story (30s), Edinburgh history (30s), Scotland camper route (30s), Human Mind book (30s), whiteboard habits (30s). All are stored as editable JSON and use existing OpenMotion render components.

## Editing
Select category **Shorts & Reels** in the library. Choose a video, open the Studio and select **Bewerken**. Text, timing, backgrounds, brand colors, audio and captions are editable in the inspector. For advanced effects, use the existing JSON inspector.

Each media track has a src, kind, timeline start/end, volume and fades. A typical project file uses:

```json
{
  "audioTracks": [
    {"id":"voice","kind":"voiceover","src":"assets/audio/narration.mp3","startSec":0,"volume":1,"fadeInSec":0.1,"fadeOutSec":0.25}
  ],
  "captions":[
    {"text":"An opening question","startSec":0,"endSec":2.5,"style":"karaoke"}
  ]
}
```

Put media files under `public/assets/` and commit them to GitHub before using the studio in GitHub Pages. External media requires appropriate CORS permission. Imported SRT cue timings are preserved. Equal per-word timings are an approximation unless the caption includes word-level timing.

## Travel routes
The Scotland demo uses illustrative geographic waypoints and a grid, not a road basemap. GPX track points or GeoJSON LineString coordinates replace sample route geometry. Countrywide points are WGS84. It does not calculate driving roads, travel time or elevation. Use road-matched data when accuracy matters.

## MP4 and audio
OpenMotion renders Canvas frames with H.264 WebCodecs. When audio tracks exist, Web Audio offline-mixes them at 48kHz stereo. The exporter adds AAC in an MP4 when an AAC AudioEncoder is available. Otherwise it attempts a MediaRecorder video/audio fallback. Some browsers produce WebM rather than MP4. Browser audio support, long clips, audio clipping and Safari rendering need hands-on validation.

The existing procedural preview soundscape is separate from audio tracks and is not part of MP4 output. Audio tracks from licensed files are the reliable publication path.

## Source and review
Layouts remain in the existing renderer; additional route, whiteboard and caption routines are in `src/engine/`. A single project schema is shared between ChatGPT, GitHub and Studio. The changes do not introduce server video rendering or additional GitHub Actions checks.
