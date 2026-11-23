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
