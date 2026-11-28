# OpenMotion Vault — GitHub Pages Video Bibliotheek & H.264 MP4 Studio

Een volledig statische, GitHub Pages-klare **OpenMotion** videobibliotheek (geïnspireerd door [nexu-io/openmotion](https://github.com/nexu-io/openmotion) en [open-design.ai/templates](https://open-design.ai/templates/)).

## Workflow: ChatGPT → GitHub → GitHub Pages → H.264 MP4

1. **ChatGPT genereert een video-project** als JSON volgens het OpenMotion-schema (`projects/<slug>/project.json`) — gebruik de ingebouwde **ChatGPT Workflow** of klik op **Remix Prompt** bij een van de 34 templates.
2. **Commit naar GitHub** onder `projects/<slug>/project.json`.
3. **Automatische GitHub Pages deploy**: de meegeleverde workflow `.github/workflows/openmotion-pages.yml` indexeert alle `projects/*/project.json` in `public/projects/manifest.json`, bouwt de statische app met relatieve paden (`base: './'`) en publiceert direct op GitHub Pages.
4. **Directe H.264 MP4-output op GitHub Pages**: elke bezoeker rendert 720p/1080p (30 of 60 fps) `.mp4`-bestanden 100% client-side via **WebCodecs (`VideoEncoder`) + `mp4-muxer`** (publicatiemaster zonder automatische kwaliteitsverlaging; MediaRecorder uitsluitend in expliciete conceptmodus).

## Publicatie en optionele serverrender

Normale pushes naar main publiceren alleen de Studio, projectconfiguraties,
media, audio en ondertiteling. Geen automatische MP4-serverrendering.
Gebruik **Render MP4** in Studio voor de browserexport.

Voor een servermaster met H.264/AAC (bijvoorbeeld als Safari geen betrouwbare
AAC-export ondersteunt): ga naar GitHub Actions → **Render OpenMotion MP4
(manual)** → Run workflow. Vul één project-slug in. Ondersteund: alle opgeslagen projecten met de bestaande renderer. Download de MP4 uit de artifacts
van die handmatige run (30 dagen bewaard). De handmatige workflow publiceert de
website niet en rendert geen andere video's. Normale Pages-deploys bevatten
geen vooraf gerenderde MP4-bestanden meer; bewaar gewenste masters lokaal.

Lokaal: bereid media en audio voor via de toepasselijke build-opties, voer
`npm run build` uit en daarna
`WORLD_RENDER_PROJECT=<slug> npm run render:master`.
Chromium en FFmpeg zijn nodig voor deze optionele export.

## Direct deployen naar GitHub Pages

1. Push deze repository naar GitHub op branch `main`.
2. Ga in GitHub naar **Settings → Pages**.
3. Kies bij **Build and deployment → Source** voor **GitHub Actions**.
4. Na een geslaagde publicatie staat jouw bibliotheek live op `https://<jouw-naam>.github.io/<repo-naam>/`.
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
- Preview, browser export and manual master use the same offline audio mix. Publication requires supported H.264/AAC, verified dimensions, frame timing, duration and an audio track. Draft export may provide a separate WAV.

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


## OpenMotion Studio · Series

De startpagina is nu een productie-dashboard. Series, alle video's, templates en
archief hebben afzonderlijke weergaven. De bestaande #studio/<slug>-links blijven geldig.
Een serie heeft een vaste ID, genummerde afleveringen, een huisstijl en versiegebonden
productietemplate. Zie [SERIES_WORKFLOW.md](docs/SERIES_WORKFLOW.md).
De manifestgenerator maakt lichte statische SVG-titelkaarten zonder video-rendering.

## Presenter Lab

Vergelijk de bestaande Alex 2D, Alex 2.5D en een echte Rocketbox 3D-avatar via `#presenter-lab`. De pilot blijft ongewijzigd. De afzonderlijke neurale test gebruikt de originele Talking Avatar SDK. Zie [Presenter Lab](docs/presenter-lab.md) voor licenties, exportbeperkingen en controlepunten.

## Character Studio

Open `#character-studio` to customize one of 20 licensed Rocketbox models, modular outfits, fabric tints, expressions and motion clips. Presets are local or exportable as JSON. Simply Explained template 3.0 has a default Alex preset. See [Character Studio](docs/character-studio.md) for asset provenance, limitations and export verification.

## Cartoon Cinema

Open `#cartoon-cinema` to compare three stylized CC0 Polygonal Mind 3D characters with the existing Alex and Rocketbox presenter. Uses the same pilot timeline and manual MP4 exporter. See [Cartoon Cinema](docs/cartoon-cinema.md) for sources, VRM support and outstanding runtime checks.
