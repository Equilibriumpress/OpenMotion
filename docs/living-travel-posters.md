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
