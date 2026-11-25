# OpenMotion Vault — GitHub Pages Video Bibliotheek & H.264 MP4 Studio

Een volledig statische, GitHub Pages-klare **OpenMotion** videobibliotheek (geïnspireerd door [nexu-io/openmotion](https://github.com/nexu-io/openmotion) en [open-design.ai/templates](https://open-design.ai/templates/)).

## Workflow: ChatGPT → GitHub → GitHub Pages → H.264 MP4

1. **ChatGPT genereert een video-project** als JSON volgens het OpenMotion-schema (`projects/<slug>/project.json`) — gebruik de ingebouwde **ChatGPT Workflow** of klik op **Remix Prompt** bij een van de 34 templates.
2. **Commit naar GitHub** onder `projects/<slug>/project.json`.
3. **Automatische GitHub Pages deploy**: de meegeleverde workflow `.github/workflows/openmotion-pages.yml` indexeert alle `projects/*/project.json` in `public/projects/manifest.json`, bouwt de statische app met relatieve paden (`base: './'`) en publiceert direct op GitHub Pages.
4. **Directe H.264 MP4-output op GitHub Pages**: elke bezoeker rendert 720p/1080p (30 of 60 fps) `.mp4`-bestanden 100% client-side via **WebCodecs (`VideoEncoder`) + `mp4-muxer`** (met automatische `MediaRecorder`-fallback).

## Direct deployen naar GitHub Pages

1. Push deze repository naar GitHub op branch `main`.
2. Ga in GitHub naar **Settings → Pages**.
3. Kies bij **Build and deployment → Source** voor **GitHub Actions**.
4. Na ~45 seconden staat jouw bibliotheek live op `https://<jouw-naam>.github.io/<repo-naam>/`.
5. De app herkent op `*.github.io` automatisch je repository-eigenaar, repo-naam en Pages-URL.

## Lokaal ontwikkelen

```bash
npm install
npm run build:manifest
npm run dev
```

## Handige Deep-Links (werken foutloos op GitHub Pages)

- Bibliotheek: `#library`
- Directe video-studio: `#studio/<project-slug>`
- ChatGPT workflow: `#chatgpt`
- GitHub Pages instellingen: `#github`

## Shorts & Reels (9:16)

Eight 1080×1920 examples live in **Shorts & Reels**. Open a card in Studio to edit text, color, scene duration, image URL, audio tracks, timed captions, and data-driven diagrams. The examples are stored as `projects/short-*/project.json` and share the existing Canvas renderer.

- Import GPX or GeoJSON LineString for geographic routes. The Scotland sample is waypoint geometry, not a verified drivable route. Import a real route for geographic accuracy.
- Import SRT caption files. Karaoke uses even word timing unless each word has explicit `startSec/endSec` metadata in JSON.
- Add audio tracks pointing to files in `public/assets/` (e.g. `assets/audio/voice.mp3`) or permitted CORS sources. Adjust volume, clip timing and fades in Studio.
- The H.264 exporter adds AAC where WebCodecs audio encoding is supported. On other browsers, MediaRecorder chooses MP4 or WebM according to actual availability. Audio encoding and Safari compatibility require device testing.
- The optional procedural documentary soundtrack is a preview aid and is **not** embedded unless supplied as an audio track.

Full usage notes: [Shorts & Reels guide](docs/shorts-reels.md).


## Premium Travel Route Reel

The Scottish campervan demo now uses MapLibre + OpenFreeMap for real vector basemap snapshots, OSRM for road geometry, a moving camper graphic and licensed photo cards at each stop. Open the **Shorts & Reels** category and choose **Premium Travel Route Reel — Scotland by Campervan**.

Details, credits, GPX import and usage limitations: [Premium travel guide](docs/premium-travel-reel.md).


## Handgetekende Doodle Explainer (ADHD & slaap)

Nieuwe bewerkbare videoproef op basis van een aangeleverde Nederlandstalige referentie. In **Shorts & Reels** staat **ADHD & Slaap — Handgetekende Doodle Explainer** met 26 oorspronkelijke Canvas-illustraties, pastelkleuren, handgeschreven tekst, animaties en een eigen zachte soundtrack. Beschikbare instellingen en bronvermelding: [Doodle explainer handleiding](docs/adhd-doodle-explainer.md).


### Doodle character redesign R2

The editable ADHD & Slaap hand-drawn video now uses two reusable vector rigs with redesigned expressions and poses, a correctly layered bed and shower character, and a new character-pose selector. [Character redesign notes](docs/doodle-character-redesign.md).


### MY BUCKET LIST — Globe Zoom Reels

The Shorts & Reels R4 Director's Cut offers a 20-second continuous MapLibre globe-to-São-Miguel fly-in, a stronger 4.5-second arrival and custom per-scene photo timing, with three photographic reasons to visit, a save-this-place outro, editable destination coordinates and an original score. See [the bucket-list guide](docs/bucket-list-zoom.md).
