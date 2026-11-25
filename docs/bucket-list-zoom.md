# MY BUCKET LIST — Globe-to-Destination Reel

## Episode 001 · São Miguel, Azores

A reusable 20-second vertical TikTok/Instagram video in the existing OpenMotion Studio. The project requests 1080 × 1920 at 30 fps. Open Shorts & Reels and select MY BUCKET LIST #001 · São Miguel, Azores.

Project file: projects/bucket-list-001-sao-miguel/project.json
Canvas renderer: src/engine/bucketListRenderer.ts
Original music: src/engine/bucketListAudio.ts
Layout identifier: bucket-list-zoom

## Storyboard

| Time | Sequence | Visual |
| --- | --- | --- |
| 0–2 s | Opening | Unlabeled MapLibre globe, Places Worth The Journey |
| 2–6 s | Geographic zoom | Faster Atlantic → Azores → São Miguel → Sete Cidades |
| 6–9 s | Reason 1 | Crater lakes, Two Lakes. One Volcanic Crater. |
| 9–12 s | Reason 2 | Lagoa do Congro forest trail, Walk Into The Wild. |
| 12–16 s | Reason 3 | Boca do Inferno viewpoint, Views You Won't Forget. |
| 16–20 s | Outro | Different aerial photo of Mosteiros coast, Save This Place |

## Geographic rendering

The MapLibre GL JS globe and Mercator views are rendered using OpenFreeMap Bright vector tiles backed by OpenStreetMap. A hidden 720 × 1280 MapLibre canvas captures eight geographic snapshots from a broad Atlantic globe view around 43° N 11° W to approximately 37.8533° N 25.7791° W. Canvas recomposes and zooms these snapshots through deterministic keyframe interpolation during playback and MP4 export. The result is a staged globe-to-2D-map camera animation, not a true 3D terrain flight.

A 0.65-second cross-dissolve blends the outgoing and incoming map/photo images, with only the incoming text layer visible. The early globe hides map symbol labels while retaining real OpenStreetMap geography. Photographic shots use restrained movement and an editorial lower-third. A missing map is identified rather than replaced with fabricated geography. Media and map tiles require a supported WebGL browser and online services during preparation.

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

The original music builds during the shortened 6-second zoom and accents cut points at 6, 9, 12 and 16 seconds. It is generated with Web Audio offline, and is sent to the browser's MP4 encoder when no external audio tracks are supplied. Users can substitute their own licensed audio.

## Export and verification

The export probes H.264 and AAC WebCodecs support and tries 720×1280 when the original 1080×1920 configuration is unavailable, before falling back to Safari MediaRecorder. MediaRecorder now requests an explicit H.264/AAC MIME where supported and preactivates the Web Audio stream. After an MP4 export, the browser reads the MP4's track handlers to detect an audio track and warns if Safari silently stripped it. Safari can still downscale the video, and not every browser supports AAC recording. The actual output resolution is reported by the existing encoded-size probe.

The previously reviewed iPad MP4 contained only video at 512×910. The updated pipeline has not yet been verified by an actual iPad recording. This revision is a compatibility improvement, not a confirmed 1080p/audio guarantee. No separate GitHub Actions test workflows have been added. The main-branch deployment will run using the existing publication workflow.

References:
- https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/
- https://tiles.openfreemap.org/styles/bright
