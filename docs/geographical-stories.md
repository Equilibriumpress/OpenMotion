# Geographical Stories · Episode 01 · R2 Director's Cut

Open the existing Studio: `#studio/geographical-stories-001-sao-miguel`. Category: Documentaries.

## Production and reusable format

45 shots, 300 seconds, 546 narration words, 21 different Commons photographs, nine map shots, eight chapters. Native 16:9 project, 1920 × 1080, requested 30 fps. No extra video application or separate deployment workflow.

| Chapter | Start | Duration |
| --- | --- | --- |
| Hook and title | 0:00 | 17s |
| Atlantic setting and plate tectonics | 0:17 | 33s |
| Volcanic formation | 0:50 | 45s |
| Sete Cidades | 1:35 | 45s |
| Fogo | 2:20 | 40s |
| Furnas | 3:00 | 48s |
| Climate and human geography | 3:48 | 45s |
| Final perspective | 4:33 | 27s |

Each shot is editable in the existing JSON inspector. `bucketList.documentary` describes the visual mode, chapter, narration, composition, photoMotion, optional phase, WGS84 map markers and native MapLibre camera from/to. Photo sources and licenses are editable alongside the scene. The map controller projects geographic points using MapLibre rather than fixed screen positions. Multiple real camera positions are warmed before exporting. Hillshade uses AWS Terrarium elevations. The optional publication step samples actual DEM tiles and derives 100 m contour lines with marching squares for the configured geographic bounds; the result is an ordinary WGS84 GeoJSON layer. No guessed volcanic boundaries are represented as measured polygons. Plate boundaries and geology sections are explicitly labelled schematics. The second phase of caldera, geothermal and formation animations continues the first phase's explanation. Clean photo shots alternate with editorial titles, maps and diagrams. The last five seconds reserve space for a YouTube end screen.

## Audio

Piper synthesizes one continuous passage per chapter and fits the measured speech to the chapter window. The original instrumental bed changes harmony between chapters; a separate synthesized ambient bed approximates wind, surf, steam and rain. These are generated sounds, not recordings made on location. Narration is normalized to -18 LUFS target. Caption cues are estimated from phrase lengths and measured chapter speech duration; they are not forced-aligned, so exact spoken-word and shot alignment requires listening review. The build also produces SRT next to the generated MP3 files for YouTube upload. If audio generation fails, the manifest removes missing tracks and reports missing narration.

The existing Pages build invokes both the DEM and audio scripts. Local opt-in: `DOCUMENTARY_AUDIO=1 npm run build` (Python, ffmpeg, curl and internet required). No separate GitHub Actions test workflows. The existing publication workflow remains enabled. If external DEM requests fail, hillshade and contours may be unavailable. Photo thumbnails are addressed via the Wikimedia filename hash during manifest creation; network access and CORS must be verified on target devices. Editing narration in Studio does not regenerate audio until the source JSON is changed and rebuilt.

## Research

- NASA Earth Observatory: https://science.nasa.gov/earth/earth-observatory/sao-miguel-azores-150034/
- Smithsonian Global Volcanism Program, Sete Cidades: https://volcano.si.edu/volcano.cfm?vn=382080
- Volcanic centres and fissure zones: https://doi.org/10.1029/2025GC012619
- DEM: https://registry.opendata.aws/terrain-tiles/
- OpenStreetMap attribution: https://www.openstreetmap.org/copyright
- Piper model: https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/en/en_US/libritts_r/medium/MODEL_CARD

## Photographic sources

- Ajay Suresh (CC BY 2.0): https://commons.wikimedia.org/wiki/File:Azores-Day4-29_(33766670074).jpg
- Samuel Monteiro Domingues (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Lagoa_das_Sete_Cidades,_São_Miguel.jpg
- José Luís Ávila Silveira / Pedro Noronha e Costa (Public domain): https://commons.wikimedia.org/wiki/File:Caldeira_a_Ferver%2C_Vale_das_Furnas%2C_Povoa%C3%A7%C3%A3o%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG
- Sara Araújo Marques (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Retirada_do_Cozido%2C_Furnas%2C_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG
- José Luís Ávila Silveira / Pedro Noronha e Costa (Public domain): https://commons.wikimedia.org/wiki/File:Miradouro_da_Boca_do_Inferno,_Lagoa_das_Sete_Cidades,_ilha_de_São_Miguel,_Açores.JPG
- Jules Verne Times Two / julesvernex2.com (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Aerial_view_of_Mosteiros,_S%C3%A3o_Miguel_Island,_Azores,_Portugal_(PPL1-Corrected).jpg
- Andree Stephan (CC BY-SA 3.0): https://commons.wikimedia.org/wiki/File:Sao_Miguel_-_Mosteiros.jpg
- Andre Rodrigues83 (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Complexo_Vulc%C3%A2nico_da_Lagoa_das_Sete_Cidades_-_S%C3%A3o_Miguel%2C_A%C3%A7ores.jpg
- Andree Stephan (CC BY-SA 3.0): https://commons.wikimedia.org/wiki/File:Sao_Miguel_-_Lagoa_do_Fogo.jpg
- José Luís Ávila Silveira / Pedro Noronha e Costa (Public domain): https://commons.wikimedia.org/wiki/File:Lagoa_do_Fogo%2C_Miradouro_da_Serra_da_Barrosa%2C_Vila_Franca_do_Campo%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG
- Eduardo Manchon (CC BY-SA 3.0): https://commons.wikimedia.org/wiki/File:Lagoa_do_Fogo%2C_S%C3%A3o_Miguel%2C_Azores_-_panoramio_-_Eduardo_Manchon.jpg
- José Luís Ávila Silveira / Pedro Noronha e Costa (Public domain): https://commons.wikimedia.org/wiki/File:Caldeira_e_riacho%2C_Vale_das_Furnas%2C_Povoa%C3%A7%C3%A3o%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG
- Jan Helebrant (CC0 1.0): https://commons.wikimedia.org/wiki/File:2019-05-19_12-46-50_PT_Sao_Miguel_JHe_K70_(54372517411).jpg
- David Stanley (CC BY 2.0): https://commons.wikimedia.org/wiki/File:Cozido_das_Furnas_(14740226390).jpg
- Jules Verne Times Two / julesvernex2.com (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Ribeira_dos_Caldeir%C3%B5es_Waterfall%2C_S%C3%A3o_Miguel_Island%2C_Azores%2C_Portugal_(PPL3-Altered).jpg
- Órvil Fernando de Aragão Russo (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Acesso_%C3%A0_Lagoa_Do_Congro_S%C3%A3o_Miguel.jpg
- Tim Sackton (CC BY-SA 2.0): https://commons.wikimedia.org/wiki/File:S%C3%A3o_Miguel_Pastures.jpg
- Jules Verne Times Two / julesvernex2.com (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Gorreana_tea_fields%2C_S%C3%A3o_Miguel_Island%2C_Azores%2C_Portugal_(PPL1-Corrected).jpg
- amanderson2 (CC BY 2.0): https://commons.wikimedia.org/wiki/File:Town_and_marina_Ponta_Delgada_Azores_Portuga_(52073468724).jpg
- Simiprof (CC0 1.0): https://commons.wikimedia.org/wiki/File:Fumaroles_of_Furnas_Lake_1.jpg
- Navin75 (CC BY-SA 2.0): https://commons.wikimedia.org/wiki/File:Gorreana_tea_estate.jpg

Licenses: https://creativecommons.org/licenses/by-sa/4.0/ ; https://creativecommons.org/licenses/by-sa/3.0/ ; https://creativecommons.org/licenses/by-sa/2.0/ ; https://creativecommons.org/licenses/by/2.0/ ; https://creativecommons.org/publicdomain/zero/1.0/. Photographs are cropped and mildly graded. Respect ShareAlike where it applies. Retain on-frame credits and source links in the publication description.

## Verification and limits

R2 source audit: 45 shots, 300 seconds, 546 words, 21 unique image URLs, eight chapters, three audio track declarations. Output remains 720p/1080p, not 4K. No claim of verified live rendering or synchronized audio until a device MP4 review. In particular, inspect all Wikimedia images, the contour layer, actual speech, geographic camera continuity, subtitle sync, MP4 codec and actual encoded resolution.