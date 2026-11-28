# Motion workflow — OpenMotion Studio

GitHub and native project JSON remain the execution authority. Motion Package 0.2 is a draft distribution contract, not an importer. Upstream pinned: nexu-io/openmotion@05a28737dc8e12da3909219b81eda812c99a112e. [Official spec](https://github.com/nexu-io/openmotion/blob/05a28737dc8e12da3909219b81eda812c99a112e/docs/motion-package-spec.md).

## Production

1. Read series/catalog.json, the selected version's native template, and its matching package in motion-packages/index.json. Never substitute the active version for a historical episode.
2. Read MOTION.md, DESIGN.md and optional SKILL.md. Resolve differences against the native source and report conflicts. Reference-only profiles guide original Canvas/SVG/Three.js work; never run third-party HTML as a native project.
3. Write episode-specific shot plan (seconds, fps, purpose, camera, transition, audio anchor, reading hold), verify sources and permissions, implement through existing scene functions and project JSON. No generated imagery, new engine or automatic render.
4. Review actual exported MP4 and record source revision, project slug, template/package version, output hash and timestamped checks: framing, overlap, motion smoothness, readability, cut continuity, sound/captions, target duration and verified codec/fps/dimensions. Record failed/not-run checks and avoid acceptance claims without playback.
5. New versions get new immutable package directories; preserve old package and template. For an older template without a package, read original JSON and create a matching recipe if requested. Do not label an earlier video with the active version.

## Local toolkit (Node built-ins only)

```sh
node scripts/check-motion-packages.mjs
node packages/motion-package/cli.mjs check motion-packages/inside-your-mind-v1-0-0
node packages/motion-package/cli.mjs lock motion-packages/inside-your-mind-v1-0-0
node packages/motion-package/cli.mjs pack motion-packages/inside-your-mind-v1-0-0 /tmp/inside-your-mind-v1-0-0
node packages/motion-package/cli.mjs check /tmp/inside-your-mind-v1-0-0
```

Lock only after intentional edits; pack a new directory. No scripts run from package contents. Browser ZIP verifies SHA-256 for the explicit inventory before packing. Neither check proves creative quality or grants rights. The packages are knowledge-only, not self-contained editable video projects. No external media copied. No commercial redistribution license assumed.

## Upstream review

See [UPSTREAM_MOTION.md](UPSTREAM_MOTION.md). Review upstream commit history, licenses, runtime boundaries and relevance. Pin selected changes and document provenance. Do not merge unrelated cloud, login, billing or renderer changes. No extra Actions; normal Pages deployment remains unchanged.
