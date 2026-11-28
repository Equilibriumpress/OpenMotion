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
