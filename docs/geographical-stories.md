# Geographical Stories · Episode 01

Open the existing OpenMotion Studio project: `#studio/geographical-stories-001-sao-miguel`. Category: Documentaries.

## Production

24 shots, 300 seconds, 1920 × 1080, requested 30 fps. The timeline follows the eight scripted chapters. The shared MapLibre globe camera renders native geographic frames at the correct landscape aspect ratio. 9 map shots use editable geographic camera keyframes (longitude, latitude, native zoom); the volcanic and geothermal drawings are schematic, not topographic measurements. The other shots use licensed Commons photographs with on-frame credit and original editorial typography. The title, shots and narration are in the project JSON. Reuse this structure for new episodes. The JSON inspector exposes `bucketList.documentary` (mode, chapter, narration, from/to).

## Audio and subtitles

The existing Pages build invokes `scripts/build-documentary-audio.py` automatically. The script creates one Piper neural speech clip per shot, fits the measured clip to its scene, builds an original synthesized ambient score and produces approximate subtitle cue timing. The Piper voice is en_US-libritts_r-medium, trained with LibriTTS-R (CC BY 4.0): https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/en/en_US/libritts_r/medium/MODEL_CARD. No external sound samples or paid API keys. Media is generated during publication, not committed. If synthesis fails, publication continues with visual scenes and approximate silent captions, and the manifest explicitly reports missing narration. No additional Actions workflow is introduced. Local opt-in: DOCUMENTARY_AUDIO=1 npm run build (Python, ffmpeg, curl and internet required). Editing narration in Studio does not automatically resynthesize the published track; change source JSON and rebuild or replace the audio track. Review pronunciations, approximate subtitles, audio muxing and actual export resolution before YouTube publication.

## Research

- NASA Earth Observatory, São Miguel, Azores: https://science.nasa.gov/earth/earth-observatory/sao-miguel-azores-150034/
- USGS volcanic geology and eruption frequency: https://pubs.usgs.gov/publication/70016013
- Geodetic study and active central volcanoes: https://academic.oup.com/gji/article/166/2/952/568277

## Photographic sources

- Jules Verne Times Two / julesvernex2.com (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Aerial_view_of_Mosteiros,_S%C3%A3o_Miguel_Island,_Azores,_Portugal_(PPL1-Corrected).jpg
- Simiprof (CC0 1.0): https://commons.wikimedia.org/wiki/File:Fumaroles_of_Furnas_Lake_1.jpg
- José Luís Ávila Silveira / Pedro Noronha e Costa (Public domain): https://commons.wikimedia.org/wiki/File:Miradouro_da_Boca_do_Inferno,_Lagoa_das_Sete_Cidades,_ilha_de_São_Miguel,_Açores.JPG
- Samuel Monteiro Domingues (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Lagoa_das_Sete_Cidades,_São_Miguel.jpg
- José Luís Ávila Silveira / Pedro Noronha e Costa (Public domain): https://commons.wikimedia.org/wiki/File:Lagoa_do_Fogo%2C_Miradouro_da_Serra_da_Barrosa%2C_Vila_Franca_do_Campo%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG
- Órvil Fernando de Aragão Russo (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Acesso_%C3%A0_Lagoa_Do_Congro_S%C3%A3o_Miguel.jpg
- Navin75 (CC BY-SA 2.0): https://commons.wikimedia.org/wiki/File:Gorreana_tea_estate.jpg

CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/ ; CC BY-SA 2.0: https://creativecommons.org/licenses/by-sa/2.0/ ; CC0: https://creativecommons.org/publicdomain/zero/1.0/. Photos are cropped and may be mildly color graded. Respect ShareAlike for adapted photographs. Basemap: OpenFreeMap, OpenMapTiles and OpenStreetMap contributors https://www.openstreetmap.org/copyright.

## Verification

Source timeline: 300 seconds. Chapter durations: 25, 35, 45, 45, 40, 45, 40, 25 seconds. Map data requires network and WebGL. Browser export remains 720p/1080p, not 4K. Long-form MP4 memory, playback, network tiles, audio, pronunciation and image loading require a real device review. No new test Actions.
