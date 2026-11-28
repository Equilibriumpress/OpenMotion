# Living Travel Posters / Poster Cinema 1.0

Original vector art in the existing parallax-cinema Canvas pipeline. No image generation, network assets, new engine or server video render. Pilot: Switzerland / The Alpine Express, a fictional alpine travel illustration.

## Timeline
0–2s opening print; 2–5s atmosphere wakes; 5–10s camera enters; 10–17s railway journey; 17–21s returns; 21–22s identical static print. One scene prevents transition discontinuity. Seven layers, cyclic train traversal, animated clouds, waterfall, water highlights, birds and steam. Camera and effects return to their starting state. Sound is generated locally by the shared preview/export audio function.

## Reuse
Use parallax.variant = living-travel-poster. The pilot artwork is specific to Switzerland; author destination-specific art and audio presets for subsequent episodes before registering them. Edit title and timing via project JSON. Keep the matching thumbnail and first frame in sync.

## Quality review
Status: review, not approved. Structural review only. Open the pilot in Studio, inspect 0, 3, 7, 12, 17 and 21.5 seconds, verify no visible seams, check text and sound on phone, export 1080x1920 at 60 fps, confirm H.264/AAC support and matching start/end. No extra GitHub Actions required. Normal Pages build publishes project metadata only.

## Episode 002 / Amalfi Coast
Set parallax.destination to amalfi, retaining variant living-travel-poster and episode 2. Original coastal artwork has seven layers, terraced village and church, two sailing boats, wave highlights, a rider on a scooter, lemon branches and parasols. The shared procedural audio route selects a separate plucked-string, surf and scooter soundtrack. The Switzerland preset and frozen v1.0 template remain unchanged. Review in Studio at 0, 3, 7, 12, 17 and 21.5 seconds before approving.

## Episode 003 / Japan
Set parallax.destination to japan with the existing living-travel-poster variant and episode 3. Seven landscape/foreground depth groups plus the separate railway layer, original stylised Mount Fuji, mist, lake reflection, spring village, passing cream-and-red train, cherry branches and drifting petals. Dedicated pentatonic-inspired plucked-string soundtrack, wind and railway ambience selected by the shared preview/export mixer. Frozen template and earlier episodes remain unchanged. Review in Studio at 0, 3, 7, 12, 17 and 21.5 seconds before approving.

## Poster Cinema 2.0 — premium art direction

Episodes 001–003 have been migrated to template 2.0. The v1.0 template and vector renderer remain available; the v2.0 scenes select posterVersion 2.0. The data-driven art library and static SVG thumbnails use the same shapes and print design. Directional tonal planes, perspective architecture, destination-specific type and a repeatable ink/hatch tile replace the uniform v1.0 treatment. Complex static layers are cached at 3x in a destination-local cache; switching destinations releases the backing canvases. Motion, particles and hero objects remain live vectors. No dependencies or workflows changed.

References for visual identity (not copied artwork): Japan House London https://www.japanhouselondon.uk/read-and-watch/shinkansen/ (1964 ivory-blue Series 0 bullet nose); Italia.it https://www.italia.it/en/campania/salerno/positano (terraced village, stairs and majolica dome); RhB-inspired electric locomotive and Alpine bridge are stylised, not engineering drawings. Japan landscape is a fictional composition, not a railway route map. Switzerland v2 uses electric rail sound instead of a steam whistle.

Quality gate: compare static poster and first/last frames, inspect signature object silhouettes at mobile size, check camera cropping and occlusion at 3, 7, 12, 17 seconds, check actual export resolution, frame rate and AAC. Structural checks are not a substitute for playback/MP4 review. Keep productionStatus review until verified.

Swiss remaster: curved rail profile, masonry arch stones and individually oriented coach/locomotive groups follow the same curve as the static thumbnail. The stylised bridge is Landwasser-inspired rather than an exact engineering reconstruction.

## Poster Cinema 3.0 / Master Edition

Distinct art direction: Alpine Art Deco (Swiss), Mediterranean lithograph (Amalfi), Shin-hanga-inspired woodblock (Japan). All three projects select posterVersion 3.0; earlier templates and runtime paths remain available. Original vector title glyphs, directional color gradients, independent texture patterns for stone, water, sky, vegetation and plaster, explicitly clipped material marks, perspective signature objects and animated reflected light bands. The vehicle projection uses individually drawn roof, side and front planes plus subtle affine foreshortening; it is 2.5D, not a 3D model. Static scene layers are cached at preview/export-specific density under a 40 MiB allocation limit; remaining layers use vector fallback. No new dependencies, renderer backend or workflow changes.

Quality gate: compare opening SVG and 0/21.5s, inspect 3/7/12/17s for silhouette, cropping and continuity, export actual 1080x1920 60fps MP4 and inspect H.264/AAC. Source checks alone do not satisfy the visual gate. Keep review status until playback and actual output are verified. Fictional geographically inspired illustrations, not engineering or geographic reconstructions.

Material refinements: selectively clipped plaster and vegetation textures, directional building cast shadows, and a monotone Hermite motion profile keep the hero train in view longer before it exits. At 0–2 and 21–22 seconds the same position, projection and print layout are held.

### Explicit local quality gate (no Actions)

With the repository dependencies and an installed Chromium/Chrome: `node scripts/review-poster-cinema.mjs --output /tmp/poster-review`. Optional `--project <slug>` limits the test to one episode. This samples the actual shared frame pipeline, saves seven full-resolution PNGs and a rendered SVG cover per episode, compares the opening/end frame pixels, reports cover difference and frame timings, and checks the shared stereo soundtrack. Review all frames manually before approval. After exporting MP4s using Studio or the existing explicit master command, use `--mp4-dir <directory>` to verify H.264, AAC, 1080x1920, 60fps and 22s with ffprobe. The script is never called automatically. Execution still pending in the production browser; remote Chromium test environment was inaccessible after cloning.

## Amalfi Collector Edition — isolated art pilot (LTP-A01–A10)

The existing episode 002 selects `parallax.posterEdition: amalfi-collector` on the frozen 3.0 template. This is a destination-only art override, not a new series-wide template. Remove the flag and restore `thumbnails/living-travel-posters-002-amalfi.svg` for the previous 3.0 treatment. Other episodes, previous templates, the shared audio mixer and the existing export path remain unchanged.

Artwork: seven scene layers; individually placed villa footprints with varied roof types, shutters, arcades, perspective sidewalls, facade gradients and local stippling; a Santa Maria Assunta-inspired majolica dome and bell tower; textured hillside, Mediterranean sky, sunlight on the sea, lemon branches and bougainvillea, terracotta planter and railing, original vector sailboats and scooter with visible side/front tonal planes. The static cover is generated by `svgPoster()` from `src/engine/amalfiCollectorArt.mjs`; the Canvas renderer imports the identical artwork. The 22-second camera moves toward the hillside and then descends toward the waterfront. The scooter follows the analytic road curve, wrapping out of view, while water and vegetation move independently. No images, new backend or external dependencies. Static caches are bounded to 40 MiB within this pilot.

Local QA: rendered SVG with CairoSVG; visually inspected a nine-frame contact sheet and actual Canvas frames at 0, 3, 7, 10, 12, 15, 17, 21.5 and 22−1/60s using Chromium at 1080×1920. Opening and both closing sample PNGs were pixel-identical and no page errors occurred in the isolated module harness. Geometry and render modules transferred losslessly (verified byte checksum). This is not a full Studio build, audio playback or MP4 export test. The status remains review until the user evaluates the actual animation and full export. No new Actions. Do not extend the pilot to Japan or Switzerland before approval.
