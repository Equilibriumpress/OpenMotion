# Presenter Lab 1.0

Open Studio → Presenter Lab or `#presenter-lab`. The lab takes the existing published Simply Explained 01 project, makes an in-memory experiment clone and does not change library records or the series template. The same 56-second timeline, captions, and voice are retained. The preview uses the existing voice track alone as its clock; manual MP4 uses the normal full audio mix and publication checks.

## Three deterministic comparisons

- Alex 2D: the original female 1.1 character; the lab removes only the 2.0 marker.
- Alex 2.5D: the current 2.0 rig, original keyframes and speech data.
- Rocketbox 3D: a real GLB, Microsoft Rocketbox Business female 04, as converted by InterviewFlowAI. Loads lazily from the pinned `@interviewflowai/talking-avatar@0.3.0` CDN package (`dist/avatars/female.glb`). No npm dependency is added. Existing Three.js + GLTFLoader + MeshoptDecoder render a transparent portrait canvas at the same lower-left anchor region and composite into the same OpenMotion frame. Pose, blink, and morph values are reset/evaluated from scene time. Uses the existing approximate viseme and RMS data, NOT the neural SDK. No live clock or extra audio playback during MP4 export. Model loading is awaited by the existing preloader; failure blocks export instead of replacing the character invisibly.

This is a technical experiment. The real model's appearance, framing, morph mapping, WebGL/Safari compatibility, cross-origin loading, and H.264/AAC output still require visual/device validation. The pilot itself remains on 2.0, unchanged. External CDN delivery is experimental; self-host and retain the upstream license before any production adoption. No automatic server render or extra Actions.

## Real neural test

`presenter-lab-neural.html` loads the actual Talking Avatar SDK 0.3.0 on user request. It uses its own audio playback, neural audio analysis, default female avatar, and optional local audio file. The layout is a static reference composition, not the episode's timed graphics. This live mode does not support deterministic MP4 export in the lab.

## Source and license review

- https://github.com/met4citizen/TalkingHead — MIT code; the upstream brunette/Avaturn/AvatarSDK/VRoid examples have noncommercial restrictions. MPFB example is CC0. The experimental avatarOnly API supports caller-controlled update loops but its speech queue is real-time. TalkingHead is not integrated in this version. No restricted avatar is copied.
- https://github.com/InterviewFlowAI/talking-avatar — MIT SDK/model, copyright (c) 2026 InterviewFlowAI. Female avatar: Microsoft Rocketbox Business female 04, copyright (c) 2020 Microsoft, MIT. Upstream license: https://github.com/InterviewFlowAI/talking-avatar/blob/master/avatars/LICENSE . The official SDK uses a head/neck portrait and neural speech animation, not body/hand gestures.
- https://github.com/microsoft/Microsoft-Rocketbox — original source library.
- https://github.com/neka-nat/kugutu — MIT code, JSON/SVG with CSS-based runtime, early v0.x. A separate SVG-to-Canvas evaluation path and a high-quality licensed character would be required. Rive/Kugutu are not integrated in this iteration; the existing two Alex variants are the 2D controls.
- https://github.com/DanielSWolf/rhubarb-lip-sync — potential offline alignment follow-up, not implemented.

## Acceptance checks

Open each of the three variants; verify the same timeline and clean graphics at t=1, 5, 15, 25, 34, 45, 54; switch variants at the same time; compare mouth closures during pauses, crop, hand/diagram overlap, and repeatability when scrubbing backwards. Test the live neural page separately. Render a manual 1080x1920 30 fps publication MP4 for each variant and inspect actual frames and audio. Do not select a replacement presenter until these tests pass.
