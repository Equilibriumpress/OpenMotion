# Inside the ADHD Mind — episode 01

I Was Going to Do It. Open `#studio/inside-adhd-mind-001`. 45 seconds, 1080 × 1920, 30 fps. Eight editable scenes, original teal/mustard and lilac characters, warm paper and cool pressure palette. Personal account, not a universal ADHD claim.

The `mind-series-v1` marker in doodle.extras selects the new vector rig. The second value is a shot: hook, walk, request, switch, same, pressure, explain, wash. The rig has independent limbs, torso, facial expressions, blinking and gestures. Change the text, mood, palette, shirt, emphasis and narration via Studio. Shot-specific staging remains in the renderer; no original footage, watermark or voice is used.

The existing publication audio build synthesizes each scene with Piper, fits it to the scene and generates a quiet original score and reaction effects. Text emphasis follows estimated speech timings, not phoneme alignment. Audio regeneration is required after narration or duration edits. Without generated audio, Studio uses its existing doodle music fallback. No new workflow or automatic master render.

The renderer is Canvas vector geometry shared by preview and export, rather than external SVG images. Browser playback, voice quality and exported MP4 require verification after deployment.

## Episode 02 — I'm Not Arguing

Open `#studio/inside-adhd-mind-002`. 40 seconds, nine scenes, same characters and 1080 × 1920 at 30 fps. A personal account of conversational enthusiasm and its impact on others, not a universal ADHD trait.

The mind-series-v1, conversation-v1 and shot name in doodle.extras select conversation staging. New reusable talk, listen, interrupt and recoil gestures, thought bubbles, dialogue bubbles, volume arcs and two-perspective framing. Text, palette, facial expression and narration remain editable; shot layout and motion live in the renderer.

The existing Piper model config supplies two speaker IDs. The build fits each spoken turn and writes measured speaker spans to caption metadata. The manifest uses these spans for mouth animation. The other character speaks the quoted question; the main narrator voices the lead-in and remaining narration. The illustrative interruption bubbles do not add overlapping spoken words. Music drops out for the question and start of the reaction. No additional build workflow or master render. If synthesis is unavailable, the manifest removes missing tracks and reports missing voice-over.

The design uses Canvas vector geometry and approximate mouth animation, not phoneme lip sync. Actual voice quality, browser playback and MP4 export still require review.
