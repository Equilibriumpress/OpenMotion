# Cartoon Cinema 1.0

Open #cartoon-cinema, or select Cartoon Cinema in Presenter Lab or Character Studio. The lab clones the existing Simply Explained 01 timeline in memory. All seven scenes, 56-second duration, captions, voice-over and original editorial graphics stay intact. The pilot and active template 3.0 remain unchanged in GitHub; the experiment does not replace the current Rocketbox presenter.

## CC-01/02 — source and licensing

The first candidates are three stylized VRM 0.x avatars from Polygonal Mind's 100 Avatars round 3:
- Jenny (#281), 6.75 MB, https://shapeweld.com/free-vrm-models/jenny
- Agnes (#243), 7.17 MB, https://shapeweld.com/free-vrm-models/agnes
- Anna (#270), 7.74 MB, https://shapeweld.com/free-vrm-models/anna

All three are reported CC0 with five vowel expressions, blink and emotion groups. Source registry: https://github.com/ToxSam/open-source-avatars/blob/main/data/avatars/100avatars-r3.json. Creator: Polygonal Mind, https://www.polygonalmind.com/. CC0: https://creativecommons.org/publicdomain/zero/1.0/. Immutable Arweave model IDs are copied from the registry. The browser checks embedded VRM 0.x CC0 metadata and actual expression bind indices before using a model. The registry and published model specifications were inspected; binary download from the local sandbox failed due to DNS. Rain and Stylized Cartoon Girl are not included because a licensed ready-to-render binary with verified face compatibility was not obtained.

## CC-03–06 — integration
Use existing Three.js GLTFLoader + MeshoptDecoder. No VRM package dependency, new renderer engine or generated images. The adapter resolves VRM 0.x blendShapeMaster bindings against the loaded meshes, checks five vowels and blink, uses head bone and moving face vertices for framing, and rotates the model according to VRM 0.x orientation. It retains authored glTF textures and uses matte materials and studio lights where applicable. This is not a full MToon/spring-bone implementation: VRM-specific shading, hair physics and all material expression bindings are not reproduced. One model is loaded at a time; the external model is requested when selected. Head, arm poses, facial expressions and mouth shapes use absolute scene time. Arms are positioned through the existing humanoid bones. The mouth is driven by generated RMS energy and estimated visemes mapped to A/I/U/E/O, not exact phonemes or neural alignment. The portrait composites into the same lower-left safe region as Rocketbox. No separate animation clock for export.

The existing browser MP4 exporter awaits model preparation and checks narration and speech data. A manual 1080×1920 / 30 fps H.264/AAC test uses the full audio mix; preview uses the existing voice as its clock.

## CC-07 — acceptance
Static checks: immutable URLs from registry, 3 entries, model and expression loader, route, seven-scene clone, preload and speech guards, original episode unchanged. Runtime checks outstanding: download and inspect each model; check orientation, textures, hair crop, arm pose, expression binding, backwards scrubbing, voice timing, iPad WebGL, actual MP4 frames and audio. Confirm appearance before adopting one as Alex. Do not mark the cartoon pilot production-ready. No new Actions workflow or automated test Actions.

This experiment provides three existing characters, not free character sculpting or outfit editing for these VRM models.
