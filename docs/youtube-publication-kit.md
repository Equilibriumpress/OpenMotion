# YouTube Publication Kit

Open any portrait (9:16) project in Studio, choose MP4 Output and scroll to YouTube Publication Kit. The current Human Side episodes have individually authored English title, description and keyword proposals. Other portrait projects use existing project metadata as editable starting text. Sources are extracted only from URLs already present in the project description; review and add sources when relevant. Metadata edits are local to the browser and are included in exported files, not written to GitHub by this feature.

1. Edit and copy the title, description and optional comma-separated tags. Title limit 100 characters; description including sources limit 5000; tag text limit 500.
2. Generate a 1080p MP4 through the existing exporter, or choose an existing MP4 from the manual GitHub master workflow. No render is started merely by opening the kit. A local render is invalidated for packaging if its project content changes. Imported masters must be matched to the project manually.
3. Watch the entire MP4 and listen to the soundtrack. Complete the five review checks. Choose a thumbnail time; the default 0.3 seconds is within the Human Side opening cover.
4. Download the complete ZIP. It contains the actual MP4, thumbnail.png captured from the actual MP4, title.txt, description.txt, tags.txt, sources.txt, youtube-metadata.json and publication-checklist.txt.
5. Extract the ZIP and upload the MP4 manually at https://studio.youtube.com/. Copy the title and description. Tags are optional. Choose the cover frame in the YouTube app, or use the PNG if your account/editor offers custom Shorts thumbnail upload. Confirm the audience, language, disclosure, rights and visibility settings. Check the uploaded preview.

The kit checks actual video dimensions (1080 × 1920), duration against the current project (tolerance 0.5 sec), 30 or 60 fps, and presence of an MP4 audio track using the existing exporter inspection functions. It does not independently verify H.264/AAC codec, soundtrack content, copyright, scientific accuracy, or the identity of imported video. Manual review remains necessary. The source MP4 is never re-encoded by the ZIP feature. If browser inspection fails, use the existing master workflow and troubleshoot playback. Metadata-only ZIP remains available without rendering, with the designed PNG for Human Side/Song covers where supported; it explicitly contains no reviewed MP4. Other portrait projects get a PNG from the actual MP4 when building a complete package.

Uses the existing JSZip dependency. No new service, YouTube account permissions, credentials, automated upload, render workflow or extra test Actions. The regular Pages deployment publishes the interface.

Official help:
- https://support.google.com/youtube/answer/12779649
- https://support.google.com/youtube/answer/10343433
- https://support.google.com/youtube/answer/1722171
- https://support.google.com/youtube/answer/57404

## TikTok post captions

The same panel includes an editable TikTok post caption, separate from timed video subtitles. All ten Human Side episodes have a short English proposal tailored to the story; other portrait projects use their own title as a starting point. Captions default to plain text without hashtags. Use Copy TikTok-caption and paste into TikTok when uploading. Reset the TikTok proposal independently or edit and save locally in the browser. Existing saved YouTube metadata is retained and gains a default TikTok caption on loading if the field is absent. Both ZIP variants include tiktok-caption.txt and the tiktokCaption field in youtube-metadata.json. The video itself, rendering, and verification are unchanged. Upload remains manual. The 2200-character editor cap is a local drafting choice, not a claim about TikTok's current platform limit.
