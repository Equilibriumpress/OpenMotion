# MY BUCKET LIST — Globe-to-Destination Reel

## Episode 001 · São Miguel, Azores

A reusable 20-second vertical TikTok/Instagram video in the existing OpenMotion Studio. The project requests 1080 × 1920 at 30 fps. Open Shorts & Reels and select MY BUCKET LIST #001 · São Miguel, Azores.

Project file: projects/bucket-list-001-sao-miguel/project.json
Canvas renderer: src/engine/bucketListRenderer.ts
Original music: src/engine/bucketListAudio.ts
Layout identifier: bucket-list-zoom

## Bucket List 3.0 — current timeline

0–1.5 s: Boca do Inferno photographic cover. 1.5–5 s: native globe flight and projected marker. 5–9 s: crater lakes and expanding map-to-photo reveal. 9–12.5 s: forest. 12.5–16.5 s: viewpoint. 16.5–20 s: coast and return to the exact opening cover.

The WHY label sits above all wrapped title lines, with reserved interface margins. The original score is retimed and adds synthetic wind. Existing native map, credited images, MP4 checks and WAV fallback remain. Actual Full HD and embedded audio require a device export. Photo moves remain 2D crops, not reconstructed depth.

## R4 Director's Cut — historical timeline

| Video time | Camera / edit | On-screen direction |
| --- | --- | --- |
| 0–1 s | Earth emerges with a continuous globe camera | Immediate **BUCKET LIST #001** hook, no generic slogan |
| 1–4.5 s | Geographic zoom over Atlantic to Sete Cidades | Fastest movement mid-flight, then hold the real map for ~0.36 s |
| 4.5–9 s | Crater lakes and caldera | 0.78 s image dissolve, first 0.88 s of the photograph without headline, **TWO LAKES. ONE VOLCANIC CRATER.** |
| 9–12 s | Forest trail to Lagoa do Congro | 0.36 s image dissolve, faster title **FOREST TRAILS TO HIDDEN LAKES.** |
| 12–16 s | Miradouro da Boca do Inferno | Longer photo hold (0.92 s), then **SEE SETE CIDADES FROM ABOVE.** |
| 16–20 s | Mosteiros coastal aerial, then the mapped island | 0.60 s image dissolve, **SÃO MIGUEL / SAVE THIS PLACE**, native map zoom-out in final 1.8 s |

The first reason is the central reveal: the photo appears before typography and its image dissolves from a settled geographic camera position. The forest shot accelerates the edit, and Boca do Inferno becomes the unhurried scenic high point.

Photographic grade: one mild Canvas contrast/saturation/brightness correction across all photographic shots, plus a restrained green-blue tint. Camera moves vary by subject rather than repeating one Ken Burns animation. Authors and licenses remain visible.

The transition engine composites only geographic/photo image layers during each dissolve. The next shot's heading is drawn separately. No superimposed old/new titles.

### R4 original audio direction

Original offline Web Audio score is retimed to the current 20-second cut. A filtered musical lift builds toward the crater reveal at 4.5 seconds. A short synthesized sweep and low-frequency landing accent coincide with that transition. Three restrained cut accents follow at 9, 12 and 16 seconds; a final soft sweep introduces the map outro at about 18.2 seconds. The audio uses seeded procedural noise and oscillators only, with no copyrighted samples.

The procedural soundtrack is already connected to Studio preview and the browser export. Safari may omit its MP4 audio stream; in that case OpenMotion offers an independently downloadable stereo WAV. Embedded audio and high-resolution 60fps are not guaranteed without checking the actual MP4.

## R3 — True continuous geographic camera

The previously reviewed MP4 revealed visible jerks and double coastlines. R2 mixed eight static MapLibre screenshots, which was not a real camera move.

R3 replaces that technique with one **persistent MapLibre GL JS instance** using native `projection:{type:'globe'}` throughout. MapLibre automatically approaches the Mercator view at high zoom. The editor updates the actual WGS84 map center, native logarithmic map zoom and bearing on every preview frame. The Canvas compositor draws the latest native WebGL map canvas instead of resizing or blending geographic screenshots.

During WebCodecs MP4 export, each geographic frame is rendered by MapLibre at its actual timestamp and awaited before encoding. Six representative camera positions prewarm map tiles, without reusing those positions as static animation frames. Export is more computationally demanding than R2 but does not fake a geographic interpolation.

The R4 Director's Cut shortens the globe intro to 4.5 seconds and holds the final camera for roughly 0.36 seconds. The final **1.8 seconds** return from the Mosteiros coast photograph to a real zoomed-out MapLibre map of São Miguel. A deterministic fade provides the photo-to-cartography transition, ending around native zoom 7.3. Both scenes retain OpenStreetMap and photo attribution.

A live map needs WebGL and a network connection for OpenFreeMap tiles. Offline playback after preparation still needs the existing map to stay alive. Preview performance varies by device and the browser's WebGL limits.

## Export integrity — R3

The reviewed R2 iPad video was labelled 60 fps but was actually 30 fps at 512×910, with no audio. For MediaRecorder MP4 exports, R3 now reads the video track's MP4 `mdhd` timescale and `stts` sample timing to report the **actual** encoded framerate. If the MP4 track data is missing or fragmented, the label states that frame rate could not be verified instead of assuming the requested setting. The encoded resolution remains probed.

Safari may still lower output resolution or omit Web Audio when muxing MP4. The app does not claim a fix it cannot verify. When a reliable MP4 audio track is not detected, the exporter additionally creates an original, synchronously timed stereo **16-bit WAV** for download so the soundtrack can be added with an external video editor. This is a separate asset and does not mean that the MP4 contains audio. Full-HD, 60fps and embedded sound remain dependent on browser support.

The WebCodecs path uses per-frame map capture with explicit timestamps. MediaRecorder uses the same live camera but remains subject to real-time encoder and captureStream limitations. Audio and framerate must be checked in an actual exported file.

## Wikimedia Commons image credits

1. Crater lakes: Samuel Monteiro Domingues, CC BY-SA 4.0.
   https://commons.wikimedia.org/wiki/File:Lagoa_das_Sete_Cidades,_São_Miguel.jpg

2. Forest trail to Lagoa do Congro: Órvil Fernando de Aragão Russo, CC BY-SA 4.0.
   https://commons.wikimedia.org/wiki/File:Acesso_à_Lagoa_Do_Congro_São_Miguel.jpg

3. Boca do Inferno viewpoint: José Luís Ávila Silveira / Pedro Noronha e Costa, public domain.
   https://commons.wikimedia.org/wiki/File:Miradouro_da_Boca_do_Inferno,_Lagoa_das_Sete_Cidades,_ilha_de_São_Miguel,_Açores.JPG

4. Mosteiros aerial coast outro: Jules Verne Times Two / julesvernex2.com, CC BY-SA 4.0.
   https://commons.wikimedia.org/wiki/File:Aerial_view_of_Mosteiros,_São_Miguel_Island,_Azores,_Portugal_(PPL1-Corrected).jpg

CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

The image creator and license appear on photographic frames. Review source page conditions when reusing photos, including attribution and ShareAlike where applicable.

## Editable scenes

Under the Studio's Bewerken tab, the My Bucket List controls let you change the episode number, destination and region, country, destination WGS84 coordinates and zoom starting camera. These global values are updated in all five scene objects. Select each photograph scene to edit its short reason, explanatory line, photographer, license, source page, horizontal image crop and photo URL using the existing Scène-afbeelding input.

Editing the destination triggers another geographic camera preparation run. Replace the images and credit metadata when reusing the template for another place.

The R4 original score builds toward the crater-lake reveal at 4.5 seconds and accents cuts at 4.5, 9, 12 and 16 seconds. It is generated with Web Audio offline, and is sent to the browser's MP4 encoder when no external audio tracks are supplied. Users can substitute their own licensed audio.

## Export and verification

The export probes H.264 and AAC WebCodecs support and tries 720×1280 when the original 1080×1920 configuration is unavailable, before falling back to Safari MediaRecorder. MediaRecorder now requests an explicit H.264/AAC MIME where supported and preactivates the Web Audio stream. After an MP4 export, the browser reads the MP4's track handlers to detect an audio track and warns if Safari silently stripped it. Safari can still downscale the video, and not every browser supports AAC recording. The actual output resolution is reported by the existing encoded-size probe.

The previously reviewed iPad MP4 contained only video at 512×910. R4 still requires a new iPad MP4 review to confirm the continuous camera, timing and audio output. This revision is a compatibility improvement, not a confirmed 1080p/audio guarantee. No separate GitHub Actions test workflows have been added. The main-branch deployment will run using the existing publication workflow.

References:
- https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/
- https://tiles.openfreemap.org/styles/bright
