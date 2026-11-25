# MY BUCKET LIST — Globe-to-Destination Reel

## Episode 001 · São Miguel, Azores

A reusable 25-second vertical TikTok/Instagram video in the existing OpenMotion Studio. The project requests 1080 × 1920 at 30 fps. Open Shorts & Reels and select MY BUCKET LIST #001 · São Miguel, Azores.

Project file: projects/bucket-list-001-sao-miguel/project.json
Canvas renderer: src/engine/bucketListRenderer.ts
Original music: src/engine/bucketListAudio.ts
Layout identifier: bucket-list-zoom

## Storyboard

| Time | Sequence | Visual |
| --- | --- | --- |
| 0–3 s | Opening | MapLibre globe, Places Worth The Journey |
| 3–9 s | Geographic zoom | Atlantic Ocean → Azores → São Miguel → Sete Cidades |
| 9–13 s | Reason 1 | Crater lakes, Two Lakes. One Volcanic Crater. |
| 13–17 s | Reason 2 | Canário forest path, Follow The Hidden Forest Trails. |
| 17–21 s | Reason 3 | Boca do Inferno lookout, Views You Won't Forget. |
| 21–25 s | Outro | São Miguel / Azores, Save This Place |

## Geographic rendering

The MapLibre GL JS globe and Mercator views are rendered using OpenFreeMap Bright vector tiles backed by OpenStreetMap. A hidden 540 × 960 MapLibre canvas captures nine real geographic snapshots from a broad Atlantic globe view around 43° N 11° W to approximately 37.8533° N 25.7791° W. Canvas recomposes and zooms these snapshots through deterministic keyframe interpolation during playback and MP4 export. The result is a staged globe-to-2D-map camera animation, not a true 3D terrain flight.

A 0.65-second cross-dissolve blends the outgoing and incoming scenes. Photographic shots use restrained movement and an editorial lower-third. A missing map is identified rather than replaced with fabricated geography. Media and map tiles require a supported WebGL browser and online services during preparation.

## Wikimedia Commons image credits

1. Crater lakes and finale: Samuel Monteiro Domingues, CC BY-SA 4.0.
   https://commons.wikimedia.org/wiki/File:Lagoa_das_Sete_Cidades,_São_Miguel.jpg

2. Canário forest path: Jan Helebrant, CC0 1.0.
   https://commons.wikimedia.org/wiki/File:2019-05-25_14-53-45_PT_Sao_Miguel_JHe_N_(54547823905).jpg

3. Boca do Inferno viewpoint: José Luís Ávila Silveira / Pedro Noronha e Costa, public domain.
   https://commons.wikimedia.org/wiki/File:Miradouro_da_Boca_do_Inferno,_Lagoa_das_Sete_Cidades,_ilha_de_São_Miguel,_Açores.JPG

CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

The image creator and license appear on photographic frames. Review source page conditions when reusing photos, including attribution and ShareAlike where applicable.

## Editable scenes

Under the Studio's Bewerken tab, the My Bucket List controls let you change the episode number, destination and region, country, destination WGS84 coordinates and zoom starting camera. These global values are updated in all five scene objects. Select each photograph scene to edit its short reason, explanatory line, photographer, license, source page and photo URL using the existing Scène-afbeelding input.

Editing the destination triggers another geographic camera preparation run. Replace the images and credit metadata when reusing the template for another place.

The original music builds during the initial zoom and accents the three reason transitions. It is generated with Web Audio offline and is included in MP4 when no external audio tracks are supplied. Users can substitute their own licensed audio.

## Export and verification

The video uses the existing browser MP4/H.264 or MediaRecorder pipeline and existing encoded-dimension probe. iPad Safari may encode at a lower real resolution than requested. No GitHub Actions tests have been started. The final exported MP4 still needs a visual review.

References:
- https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/
- https://tiles.openfreemap.org/styles/bright
