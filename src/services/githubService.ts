import JSZip from 'jszip';
import {
  AspectFormat,
  GitHubRepoConfig,
  OpenMotionProject,
  OpenMotionScene,
  getFormatDimensions,
} from '../types/openmotion';

export const DEFAULT_GITHUB_CONFIG: GitHubRepoConfig = {
  owner: 'jouw-gebruikersnaam',
  repo: 'openmotion-library',
  branch: 'main',
  projectsDir: 'projects',
  token: '',
  pagesBaseUrl: 'https://jouw-gebruikersnaam.github.io/openmotion-library',
};

export function detectGitHubPagesConfig(): GitHubRepoConfig {
  const envOwner =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_GITHUB_OWNER
      ? String(import.meta.env.VITE_GITHUB_OWNER).trim()
      : '';
  const envRepo =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_GITHUB_REPO
      ? String(import.meta.env.VITE_GITHUB_REPO).trim()
      : '';

  let owner = envOwner;
  let repo = envRepo;
  let pagesBaseUrl = '';

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (host.endsWith('.github.io')) {
      const hostOwner = host.replace(/\.github\.io$/, '');
      if (!owner && hostOwner) owner = hostOwner;
      if (!repo) {
        repo = pathParts[0] || `${hostOwner}.github.io`;
      }
      const basePath = pathParts[0] ? `/${pathParts[0]}` : '';
      pagesBaseUrl = `${window.location.origin}${basePath}`;
    }
  }

  const finalOwner = owner || DEFAULT_GITHUB_CONFIG.owner;
  const finalRepo = repo || DEFAULT_GITHUB_CONFIG.repo;
  const finalPagesUrl =
    pagesBaseUrl ||
    (finalRepo === `${finalOwner}.github.io`
      ? `https://${finalOwner}.github.io`
      : `https://${finalOwner}.github.io/${finalRepo}`);

  return {
    ...DEFAULT_GITHUB_CONFIG,
    owner: finalOwner,
    repo: finalRepo,
    pagesBaseUrl: finalPagesUrl,
  };
}

function encodeBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeBase64Utf8(base64: string): string {
  const clean = base64.replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function normalizeOpenMotionProject(
  raw: unknown,
  fallbackSlug = 'chatgpt-project'
): { project?: OpenMotionProject; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { error: 'Ongeldige JSON: verwacht een object volgens het OpenMotion-schema.' };
  }
  const obj = raw as Record<string, unknown>;

  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : null;
  if (!title) {
    return { error: 'Veld "title" ontbreekt of is leeg.' };
  }

  const rawScenes = Array.isArray(obj.scenes) ? obj.scenes : [];
  if (rawScenes.length === 0) {
    return { error: 'Veld "scenes" moet minimaal 1 scene bevatten.' };
  }

  const formatCandidate = obj.format;
  const format: AspectFormat =
    formatCandidate === '9:16' || formatCandidate === '1:1' || formatCandidate === '16:9'
      ? formatCandidate
      : '16:9';

  const dims = getFormatDimensions(format, '1080p');
  const slugBase =
    typeof obj.slug === 'string' && obj.slug.trim()
      ? obj.slug.trim()
      : title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || fallbackSlug;

  const rawBrand = (obj.brandKit && typeof obj.brandKit === 'object'
    ? obj.brandKit
    : {}) as Record<string, unknown>;

  const validLayouts = new Set([
    'parallax-cinema',
    'hero-kinetic',
    'metric-spotlight',
    'feature-cards',
    'code-terminal',
    'split-showcase',
    'outro-cta',
    'step-tutorial',
    'data-rings',
    'ui-mockup',
    'before-after',
    'waveform-captions',
    'timeline-roadmap',
    'quote-spotlight',
    'ui-morph',
    'beat-kinetic',
    'visual-lesson',
    'bento-montage',
    'paper-cutout',
    'pricing-tiers',
    'mobile-screens',
    'poster-editorial',
    '3d-wireframe-stage',
    'live-line-chart',
    'node-graph-flow',
    'kinetic-marquee',
    'code-diff-deploy',
    'route-map-journey',
    'travel-postcard-reel',
    'faceless-explainer',
    'paper-map-journey',
    'editorial-cartography',
    'geo-route-reel',
    'premium-travel-route',
    'bucket-list-zoom',
    'whiteboard-science',
    'doodle-explainer',
    'three-campervan-journey',
    'three-explainer',
  ]);
  const validBackdrops = new Set([
    'grid-architectural',
    'radial-studio',
    'waveform',
    'swiss-lines',
    'dot-matrix',
    'orbital-rings',
  ]);

  const scenes: OpenMotionScene[] = rawScenes.map((s, index) => {
    const sc = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
    const layout = (
      typeof sc.layout === 'string' && validLayouts.has(sc.layout)
        ? sc.layout
        : index === 0
          ? 'hero-kinetic'
          : index === rawScenes.length - 1
            ? 'outro-cta'
            : 'feature-cards'
    ) as OpenMotionScene['layout'];

    const transition =
      sc.transition === 'fade' ||
      sc.transition === 'slide-up' ||
      sc.transition === 'wipe-left' ||
      sc.transition === 'zoom'
        ? sc.transition
        : 'slide-up';

    const backdrop = (
      typeof sc.backdrop === 'string' && validBackdrops.has(sc.backdrop)
        ? sc.backdrop
        : 'grid-architectural'
    ) as OpenMotionScene['backdrop'];

    return {
      id: typeof sc.id === 'string' && sc.id ? sc.id : `scene-${index + 1}`,
      name: typeof sc.name === 'string' && sc.name ? sc.name : `Scène ${index + 1}`,
      durationSec:
        typeof sc.durationSec === 'number' && Number.isFinite(sc.durationSec) && sc.durationSec >= .5 && sc.durationSec <= 30
          ? sc.durationSec
          : 3.2,
      layout,
      transition,
      backdrop,
      eyebrow: typeof sc.eyebrow === 'string' ? sc.eyebrow : undefined,
      headline:
        typeof sc.headline === 'string' && (sc.headline.trim() || sc.catOffice)
          ? sc.headline.trim()
          : title,
      subheadline: typeof sc.subheadline === 'string' ? sc.subheadline : undefined,
      metrics: Array.isArray(sc.metrics)
        ? sc.metrics
            .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === 'object'))
            .map((m) => ({
              label: String(m.label ?? 'Metric'),
              value: String(m.value ?? '0'),
              delta: typeof m.delta === 'string' ? m.delta : undefined,
            }))
        : undefined,
      items: Array.isArray(sc.items)
        ? sc.items
            .filter((it): it is Record<string, unknown> => Boolean(it && typeof it === 'object'))
            .map((it) => ({
              title: String(it.title ?? 'Onderdeel'),
              detail: String(it.detail ?? ''),
            }))
        : undefined,
      codeLines: Array.isArray(sc.codeLines)
        ? sc.codeLines.map((line) => String(line))
        : undefined,
      ctaText: typeof sc.ctaText === 'string' ? sc.ctaText : undefined,
      caption: typeof sc.caption === 'string' ? sc.caption : undefined,
      imageUrl: typeof sc.imageUrl === 'string' ? sc.imageUrl : undefined,
      stepNumber: typeof sc.stepNumber === 'number' ? sc.stepNumber : undefined,
      totalSteps: typeof sc.totalSteps === 'number' ? sc.totalSteps : undefined,
      stepTip: typeof sc.stepTip === 'string' ? sc.stepTip : undefined,
      rings: Array.isArray(sc.rings)
        ? sc.rings
            .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
            .map((r) => ({
              label: String(r.label ?? 'Metric'),
              percent: typeof r.percent === 'number' ? r.percent : 80,
              sublabel: typeof r.sublabel === 'string' ? r.sublabel : undefined,
            }))
        : undefined,
      bars: Array.isArray(sc.bars)
        ? sc.bars
            .filter((b): b is Record<string, unknown> => Boolean(b && typeof b === 'object'))
            .map((b) => ({
              label: String(b.label ?? 'Item'),
              value: typeof b.value === 'number' ? b.value : 50,
              maxValue: typeof b.maxValue === 'number' ? b.maxValue : 100,
              displayValue: String(b.displayValue ?? b.value ?? '50'),
            }))
        : undefined,
      comparison:
        sc.comparison && typeof sc.comparison === 'object'
          ? (sc.comparison as OpenMotionScene['comparison'])
          : undefined,
      mockup:
        sc.mockup && typeof sc.mockup === 'object'
          ? (sc.mockup as OpenMotionScene['mockup'])
          : undefined,
      timeline: Array.isArray(sc.timeline)
        ? sc.timeline
            .filter((t): t is Record<string, unknown> => Boolean(t && typeof t === 'object'))
            .map((t) => ({
              date: String(t.date ?? 'Stap'),
              title: String(t.title ?? ''),
              detail: String(t.detail ?? ''),
            }))
        : undefined,
      quote:
        sc.quote && typeof sc.quote === 'object'
          ? (sc.quote as OpenMotionScene['quote'])
          : undefined,
      spokenWords: Array.isArray(sc.spokenWords)
        ? sc.spokenWords.map((w) => String(w))
        : undefined,
      beatWords: Array.isArray(sc.beatWords)
        ? sc.beatWords.map((w) => String(w))
        : undefined,
      bpm: typeof sc.bpm === 'number' ? sc.bpm : undefined,
      lessonNodes: Array.isArray(sc.lessonNodes)
        ? sc.lessonNodes
            .filter((n): n is Record<string, unknown> => Boolean(n && typeof n === 'object'))
            .map((n) => ({
              tag: String(n.tag ?? 'STAP'),
              title: String(n.title ?? ''),
              detail: String(n.detail ?? ''),
            }))
        : undefined,
      bentoTiles: Array.isArray(sc.bentoTiles)
        ? sc.bentoTiles
            .filter((b): b is Record<string, unknown> => Boolean(b && typeof b === 'object'))
            .map((b) => ({
              label: String(b.label ?? ''),
              title: String(b.title ?? ''),
              metric: typeof b.metric === 'string' ? b.metric : undefined,
            }))
        : undefined,
      morphLabels: Array.isArray(sc.morphLabels)
        ? sc.morphLabels.map((l) => String(l))
        : undefined,
      pricingTiers: Array.isArray(sc.pricingTiers)
        ? (sc.pricingTiers as OpenMotionScene['pricingTiers'])
        : undefined,
      mobileScreens: Array.isArray(sc.mobileScreens)
        ? (sc.mobileScreens as OpenMotionScene['mobileScreens'])
        : undefined,
      posterMeta:
        sc.posterMeta && typeof sc.posterMeta === 'object'
          ? (sc.posterMeta as OpenMotionScene['posterMeta'])
          : undefined,
      paperChapters: Array.isArray(sc.paperChapters)
        ? sc.paperChapters.map((c) => String(c))
        : undefined,
      wireframeShape:
        sc.wireframeShape === 'cube-stack' ||
        sc.wireframeShape === 'octahedron' ||
        sc.wireframeShape === 'iso-layers'
          ? sc.wireframeShape
          : undefined,
      wireframeSpecs: Array.isArray(sc.wireframeSpecs)
        ? sc.wireframeSpecs
            .filter((sp): sp is Record<string, unknown> => Boolean(sp && typeof sp === 'object'))
            .map((sp) => ({
              label: String(sp.label ?? 'Spec'),
              value: String(sp.value ?? ''),
            }))
        : undefined,
      chartSeries:
        sc.chartSeries && typeof sc.chartSeries === 'object'
          ? (sc.chartSeries as OpenMotionScene['chartSeries'])
          : undefined,
      graphNodes: Array.isArray(sc.graphNodes)
        ? sc.graphNodes
            .filter((gn): gn is Record<string, unknown> => Boolean(gn && typeof gn === 'object'))
            .map((gn, gnIdx) => ({
              id: String(gn.id ?? `n-${gnIdx + 1}`),
              label: String(gn.label ?? 'Node'),
              sublabel: String(gn.sublabel ?? ''),
            }))
        : undefined,
      marqueeRows: Array.isArray(sc.marqueeRows)
        ? sc.marqueeRows.map((r) => String(r))
        : undefined,
      diffLines: Array.isArray(sc.diffLines)
        ? sc.diffLines
            .filter((dl): dl is Record<string, unknown> => Boolean(dl && typeof dl === 'object'))
            .map((dl) => ({
              type:
                dl.type === 'add' || dl.type === 'remove' ? dl.type : ('context' as const),
              text: String(dl.text ?? ''),
            }))
        : undefined,
      deploySteps: Array.isArray(sc.deploySteps)
        ? sc.deploySteps
            .filter((ds): ds is Record<string, unknown> => Boolean(ds && typeof ds === 'object'))
            .map((ds) => ({
              label: String(ds.label ?? 'Step'),
              duration: String(ds.duration ?? '0.5s'),
            }))
        : undefined,
      routeMap:
        sc.routeMap && typeof sc.routeMap === 'object'
          ? (sc.routeMap as OpenMotionScene['routeMap'])
          : undefined,
      travelCard:
        sc.travelCard && typeof sc.travelCard === 'object'
          ? (sc.travelCard as OpenMotionScene['travelCard'])
          : undefined,
      explainer:
        sc.explainer && typeof sc.explainer === 'object'
          ? (sc.explainer as OpenMotionScene['explainer'])
          : undefined,
      paperMap:
        sc.paperMap && typeof sc.paperMap === 'object'
          ? (sc.paperMap as OpenMotionScene['paperMap'])
          : undefined,
      premiumTravel:
        sc.premiumTravel && typeof sc.premiumTravel === 'object' ? (sc.premiumTravel as OpenMotionScene['premiumTravel']) : undefined,
      bucketList:
        sc.bucketList && typeof sc.bucketList === 'object' ? (sc.bucketList as OpenMotionScene['bucketList']) : undefined,
      geoRoute:
        sc.geoRoute && typeof sc.geoRoute === 'object' ? (sc.geoRoute as OpenMotionScene['geoRoute']) : undefined,
      doodle: sc.doodle && typeof sc.doodle === 'object'
        ? (sc.doodle as OpenMotionScene['doodle']) : undefined,
      whiteboard:
        sc.whiteboard && typeof sc.whiteboard === 'object' ? (sc.whiteboard as OpenMotionScene['whiteboard']) : undefined,
      editorialMap:
        sc.editorialMap && typeof sc.editorialMap === 'object'
          ? (sc.editorialMap as OpenMotionScene['editorialMap'])
          : undefined,
      threeCampervan:
        sc.threeCampervan && typeof sc.threeCampervan === 'object'
          ? (sc.threeCampervan as OpenMotionScene['threeCampervan'])
          : undefined,
      catOffice: sc.catOffice && typeof sc.catOffice === 'object'
        ? (sc.catOffice as OpenMotionScene['catOffice']) : undefined,
      worldStory: sc.worldStory && typeof sc.worldStory === 'object' ? (sc.worldStory as OpenMotionScene['worldStory']) : undefined,
      parallax: sc.parallax && typeof sc.parallax === 'object' ? (sc.parallax as OpenMotionScene['parallax']) : undefined,
      threeExplainer: sc.threeExplainer && typeof sc.threeExplainer === 'object' ? (sc.threeExplainer as OpenMotionScene['threeExplainer']) : undefined,
      fullBleed: typeof sc.fullBleed === 'boolean' ? sc.fullBleed : undefined,
    };
  });

  // Recover the explicit series identity in saved/imported travel projects.
  if (slugBase.startsWith('places-worth-exploring-')) {
    for (const scene of scenes) if (scene.bucketList?.documentary) scene.bucketList.documentary = {...scene.bucketList.documentary, series:'places-worth-exploring'};
  }

  const today = new Date().toISOString().slice(0, 10);

  const project: OpenMotionProject = {
    schemaVersion: '1.0',
    kind: obj.kind === 'video' || obj.kind === 'template' || obj.kind === 'experiment' ? obj.kind : undefined,
    seriesId: typeof obj.seriesId === 'string' ? obj.seriesId : undefined,
    season: typeof obj.season === 'number' && Number.isInteger(obj.season) && obj.season > 0 ? obj.season : undefined,
    episodeNumber: typeof obj.episodeNumber === 'number' && Number.isInteger(obj.episodeNumber) && obj.episodeNumber > 0 ? obj.episodeNumber : undefined,
    templateVersion: typeof obj.templateVersion === 'string' ? obj.templateVersion : undefined,
    buildRevision: typeof obj.buildRevision === 'string' ? obj.buildRevision : undefined,
    mediaRevision: typeof obj.mediaRevision === 'string' ? obj.mediaRevision : undefined,
    productionStatus: ['concept','script','production','review','approved','exported','published'].includes(String(obj.productionStatus)) ? obj.productionStatus as OpenMotionProject['productionStatus'] : undefined,
    thumbnailUrl: typeof obj.thumbnailUrl === 'string' && /^(?:assets|thumbnails)\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp|svg)$/i.test(obj.thumbnailUrl) ? obj.thumbnailUrl : undefined,
    id: typeof obj.id === 'string' && obj.id ? obj.id : `om-${slugBase}-${Date.now().toString(36)}`,
    slug: slugBase,
    title,
    description:
      typeof obj.description === 'string' && obj.description.trim()
        ? obj.description.trim()
        : 'OpenMotion video-project geïmporteerd vanuit ChatGPT/GitHub.',
    category:
      typeof obj.category === 'string' && obj.category.trim() ? obj.category.trim() : 'ChatGPT Video',
    author: typeof obj.author === 'string' && obj.author.trim() ? obj.author.trim() : 'ChatGPT',
    source:
      obj.source === 'github' || obj.source === 'chatgpt' || obj.source === 'template'
        ? obj.source
        : 'chatgpt',
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : today,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : today,
    githubPath:
      typeof obj.githubPath === 'string' && obj.githubPath.trim()
        ? obj.githubPath.trim()
        : `projects/${slugBase}/project.json`,
    commitSha: typeof obj.commitSha === 'string' ? obj.commitSha : undefined,
    prebuiltMp4Url: typeof obj.prebuiltMp4Url === 'string' ? obj.prebuiltMp4Url : undefined,
    format,
    width: typeof obj.width === 'number' ? obj.width : dims.width,
    height: typeof obj.height === 'number' ? obj.height : dims.height,
    fps: typeof obj.fps === 'number' && (obj.fps === 30 || obj.fps === 60) ? obj.fps : 30,
    captions: Array.isArray(obj.captions) ? (obj.captions as NonNullable<OpenMotionProject['captions']>) : undefined,
    audioTracks: Array.isArray(obj.audioTracks) ? (obj.audioTracks as NonNullable<OpenMotionProject['audioTracks']>) : undefined,
    brandKit: {
      brandName:
        typeof rawBrand.brandName === 'string' && rawBrand.brandName
          ? rawBrand.brandName
          : 'OpenMotion Studio',
      primaryColor:
        typeof rawBrand.primaryColor === 'string' ? rawBrand.primaryColor : '#2563EB',
      accentColor:
        typeof rawBrand.accentColor === 'string' ? rawBrand.accentColor : '#38BDF8',
      backgroundColor:
        typeof rawBrand.backgroundColor === 'string' ? rawBrand.backgroundColor : '#0B1120',
      surfaceColor:
        typeof rawBrand.surfaceColor === 'string' ? rawBrand.surfaceColor : '#131D33',
      textColor: typeof rawBrand.textColor === 'string' ? rawBrand.textColor : '#F8FAFC',
      mutedColor: typeof rawBrand.mutedColor === 'string' ? rawBrand.mutedColor : '#94A3B8',
      fontFamily:
        rawBrand.fontFamily === 'Plus Jakarta Sans' || rawBrand.fontFamily === 'JetBrains Mono' || rawBrand.fontFamily === 'Kalam' || rawBrand.fontFamily === 'Inter' || rawBrand.fontFamily === 'Georgia'
          ? rawBrand.fontFamily
          : 'Bricolage Grotesque',
    },
    scenes,
  };

  return { project };
}

function buildGitHubHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
}

export async function fetchProjectsFromGitHub(
  config: GitHubRepoConfig
): Promise<{ projects: OpenMotionProject[]; foundCount: number; message: string }> {
  const owner = config.owner.trim();
  const repo = config.repo.trim();
  const branch = config.branch.trim() || 'main';
  const dir = config.projectsDir.trim().replace(/^\/|\/$/g, '') || 'projects';

  if (!owner || !repo) {
    throw new Error('Vul zowel een GitHub eigenaar (owner) als repository-naam in.');
  }

  const headers = buildGitHubHeaders(config.token);
  const listUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/contents/${encodeURIComponent(dir)}?ref=${encodeURIComponent(branch)}`;

  const listRes = await fetch(listUrl, { headers });
  if (!listRes.ok) {
    if (listRes.status === 404) {
      throw new Error(
        `Repository ${owner}/${repo} of map "${dir}" niet gevonden op branch "${branch}".`
      );
    }
    if (listRes.status === 403) {
      throw new Error(
        'GitHub API limiet bereikt of toegang geweigerd. Voeg optioneel een GitHub Personal Access Token toe.'
      );
    }
    throw new Error(`GitHub API gaf status ${listRes.status} terug.`);
  }

  const entries = (await listRes.json()) as Array<{
    name: string;
    path: string;
    type: 'dir' | 'file';
    sha: string;
    download_url: string | null;
  }>;

  if (!Array.isArray(entries)) {
    throw new Error(`Pad "${dir}" is geen map met OpenMotion-projecten.`);
  }

  const loaded: OpenMotionProject[] = [];
  const subdirs = entries.filter((e) => e.type === 'dir');
  const rootJsonFiles = entries.filter(
    (e) => e.type === 'file' && e.name.endsWith('.json') && e.name !== 'manifest.json'
  );

  // Check each subdirectory for project.json
  for (const sub of subdirs) {
    const fileUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo
    )}/contents/${sub.path}/project.json?ref=${encodeURIComponent(branch)}`;
    const fileRes = await fetch(fileUrl, { headers });
    if (!fileRes.ok) continue;
    const fileMeta = (await fileRes.json()) as { content?: string; sha?: string; path?: string };
    if (!fileMeta.content) continue;
    try {
      const parsed = JSON.parse(decodeBase64Utf8(fileMeta.content));
      const { project } = normalizeOpenMotionProject(parsed, sub.name);
      if (project) {
        project.source = 'github';
        project.githubPath = fileMeta.path ?? `${dir}/${sub.name}/project.json`;
        project.commitSha = fileMeta.sha?.slice(0, 7);
        // Only use a prebuilt URL explicitly supplied by a project or the
        // deployed manifest. Normal Pages builds no longer publish masters.
        loaded.push(project);
      }
    } catch {
      // Skip invalid JSON files
    }
  }

  // Also support flat JSON project files directly in projectsDir
  for (const file of rootJsonFiles) {
    if (!file.download_url) continue;
    const rawRes = await fetch(file.download_url);
    if (!rawRes.ok) continue;
    try {
      const parsed = await rawRes.json();
      const { project } = normalizeOpenMotionProject(parsed, file.name.replace(/\.json$/, ''));
      if (project) {
        project.source = 'github';
        project.githubPath = file.path;
        project.commitSha = file.sha.slice(0, 7);
        loaded.push(project);
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return {
    projects: loaded,
    foundCount: loaded.length,
    message:
      loaded.length > 0
        ? `${loaded.length} OpenMotion-project(en) gesynchroniseerd vanuit ${owner}/${repo}.`
        : `Verbonden met ${owner}/${repo}, maar nog geen geldige project.json bestanden gevonden in "${dir}".`,
  };
}

export async function commitProjectToGitHub(
  config: GitHubRepoConfig,
  project: OpenMotionProject,
  commitMessage?: string
): Promise<{ commitSha: string; htmlUrl: string }> {
  const owner = config.owner.trim();
  const repo = config.repo.trim();
  const branch = config.branch.trim() || 'main';
  const dir = config.projectsDir.trim().replace(/^\/|\/$/g, '') || 'projects';

  if (!config.token.trim()) {
    throw new Error(
      'Vul eerst een GitHub Personal Access Token (met contents:write rechten) in op de GitHub Pages pagina.'
    );
  }
  if (!owner || !repo) {
    throw new Error('Vul eerst een geldige GitHub owner en repository in.');
  }

  const filePath = `${dir}/${project.slug}/project.json`;
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/contents/${filePath}`;
  const headers = {
    ...buildGitHubHeaders(config.token),
    'Content-Type': 'application/json',
  };

  // Check if file already exists to include its sha for updates
  let existingSha: string | undefined;
  const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
  if (checkRes.ok) {
    const existing = (await checkRes.json()) as { sha?: string };
    existingSha = existing.sha;
  }

  const cleanPayload: OpenMotionProject = {
    ...project,
    githubPath: filePath,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: commitMessage || `feat(openmotion): add/update ${project.slug}`,
      content: encodeBase64Utf8(JSON.stringify(cleanPayload, null, 2)),
      branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    throw new Error(`GitHub commit mislukt (${putRes.status}): ${errBody.slice(0, 180)}`);
  }

  const result = (await putRes.json()) as {
    commit?: { sha?: string; html_url?: string };
    content?: { html_url?: string };
  };

  return {
    commitSha: (result.commit?.sha ?? 'committed').slice(0, 7),
    htmlUrl:
      result.content?.html_url ??
      `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`,
  };
}

export function generateGitHubWorkflowYaml(config: GitHubRepoConfig): string {
  const dir = config.projectsDir.trim().replace(/^\/|\/$/g, '') || 'projects';
  const branch = config.branch.trim() || 'main';
  return `name: OpenMotion Library & MP4 Pages Deploy

on:
  push:
    branches: ["${branch}"]
    paths:
      - "${dir}/**"
      - "src/**"
      - "package.json"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "openmotion-pages"
  cancel-in-progress: false

jobs:
  build_and_render:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout OpenMotion Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci --legacy-peer-deps
          else
            npm install --no-audit --no-fund --legacy-peer-deps
          fi

      - name: Build OpenMotion manifest & static GitHub Pages bundle (incl. 404.html & .nojekyll)
        run: npm run build
        env:
          VITE_GITHUB_OWNER: \${{ github.repository_owner }}
          VITE_GITHUB_REPO: \${{ github.event.repository.name }}

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy_pages:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build_and_render
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
}

export function buildChatGptPrompt(params: {
  topic: string;
  brandName: string;
  format: AspectFormat;
  tone: string;
  durationSec: number;
  repoSlug: string;
}): string {
  const dims = getFormatDimensions(params.format, '1080p');
  return `Je bent een OpenMotion Video-as-Code architect (compatibel met https://github.com/nexu-io/openmotion).
Maak een compleet OpenMotion video-project in geldig JSON-formaat voor mijn GitHub Pages videobibliotheek (${params.repoSlug}).

Specificaties:
- Onderwerp: ${params.topic}
- Merknaam: ${params.brandName}
- Videoformaat: ${params.format} (${dims.width}x${dims.height}, 30 fps)
- Gewenste totale duur: ca. ${params.durationSec} seconden (3 tot 4 scènes)
- Stijl & toon: ${params.tone}
- Taal: Nederlands

GitHub Workflow-instructie:
Commit het bestand naar: projects/<slug>/project.json

Geef UITSLUITEND geldige JSON terug die exact voldoet aan dit schema:
{
  "schemaVersion": "1.0",
  "slug": "korte-url-veilige-slug",
  "title": "Korte, sterke videotitel",
  "description": "1-2 zinnen beschrijving voor de bibliotheek",
  "category": "Product Launch | Social Shorts | Brand Identity | Explainer",
  "author": "ChatGPT",
  "source": "chatgpt",
  "format": "${params.format}",
  "width": ${dims.width},
  "height": ${dims.height},
  "fps": 30,
  "brandKit": {
    "brandName": "${params.brandName}",
    "primaryColor": "#2563EB",
    "accentColor": "#38BDF8",
    "backgroundColor": "#0B1120",
    "surfaceColor": "#131D33",
    "textColor": "#F8FAFC",
    "mutedColor": "#94A3B8",
    "fontFamily": "Bricolage Grotesque"
  },
  "scenes": [
    {
      "id": "sc-1",
      "name": "Opening Hook",
      "durationSec": 3.2,
      "layout": "hero-kinetic",
      "transition": "fade",
      "backdrop": "grid-architectural",
      "eyebrow": "Korte contextregel",
      "headline": "Krachtige hoofdtitel (max 9 woorden)",
      "subheadline": "Ondersteunende zin",
      "caption": "Ondertitel onderaan"
    },
    {
      "id": "sc-2",
      "name": "Kerncijfers of Stappen",
      "durationSec": 3.5,
      "layout": "metric-spotlight",
      "transition": "slide-up",
      "backdrop": "radial-studio",
      "eyebrow": "Resultaat",
      "headline": "Waarom dit werkt",
      "metrics": [
        { "label": "Label 1", "value": "94%", "delta": "+18% sneller" },
        { "label": "Label 2", "value": "4.2s", "delta": "Directe MP4" }
      ]
    },
    {
      "id": "sc-3",
      "name": "Afsluiting",
      "durationSec": 2.8,
      "layout": "outro-cta",
      "transition": "zoom",
      "backdrop": "radial-studio",
      "eyebrow": "${params.brandName}",
      "headline": "Duidelijke slotboodschap",
      "subheadline": "URL of korte toelichting",
      "ctaText": "Direct starten"
    }
  ]
}

Beschikbare layouts (32): "three-campervan-journey", "editorial-cartography", "paper-map-journey", "route-map-journey", "travel-postcard-reel", "faceless-explainer", "3d-wireframe-stage", "live-line-chart", "node-graph-flow", "kinetic-marquee", "code-diff-deploy", "ui-morph", "beat-kinetic", "visual-lesson", "bento-montage", "paper-cutout", "pricing-tiers", "mobile-screens", "poster-editorial", "hero-kinetic", "step-tutorial", "data-rings", "ui-mockup", "before-after", "waveform-captions", "timeline-roadmap", "quote-spotlight", "metric-spotlight", "feature-cards", "code-terminal", "split-showcase", "outro-cta".
Optionele scène-velden per layout:
- three-campervan-journey: fullBleed (true), threeCampervan ({vanColor, vanRoofColor, jacketColor, backpackColor, beanieColor, lightingMood: "golden-hour"|"morning-mist"|"alpine-noon", cameraFov?, titleText?, subtitleText?, showTitleOverlay?})
- editorial-cartography: fullBleed (true), editorialMap ({cityLabel, bounds, routeCoords, routeDrawFrom, routeDrawTo, streets, parks, buildings, reliefs, stops, cameraFrom, cameraTo, photoUrl?, photoMode?, photoCredit?, titleLayout?, titleText, subtitleText})
- paper-map-journey: paperMap ({mapTitle, subtitle, routeColor?: "#D7263D", waterColor?, terrainColor?, paperColor?, stops: [{name, x, y, tag?, fact, landmark: "canal-house"|"tower"|"mountain"|"arch"|"temple"|"lighthouse"|"building"}]})
- route-map-journey: routeMap ({regionLabel, transport: "plane"|"train"|"car"|"bike"|"hike", totalDistanceKm, durationLabel, waypoints: [{name, x, y, day, highlight, km}]})
- travel-postcard-reel: travelCard ({destination, country, coordinates, season, landscapeTheme: "alpine"|"coastal"|"desert"|"neon-city", highlights: [{time, spot, note}]})
- faceless-explainer: explainer ({chapter, visualType: "funnel"|"compounding"|"balance-scale"|"network-ripple"|"iceberg", visualLabels: string[], voiceoverWords: string[], statBadge?})
- 3d-wireframe-stage: wireframeShape ("cube-stack" | "octahedron" | "iso-layers"), wireframeSpecs ([{label, value}])
- live-line-chart: chartSeries ({label, unit, points: [{xLabel, value}], secondaryPoints?: number[]})
- node-graph-flow: graphNodes ([{id, label, sublabel}] — 2 tot 4 verbonden architectuur-nodes)
- kinetic-marquee: marqueeRows (array van 3-5 korte typografische ticker-regels)
- code-diff-deploy: diffLines ([{type: "context"|"remove"|"add", text}]), deploySteps ([{label, duration}])
- ui-morph: morphLabels (5 labels voor continue one-shape UI transformatie)
- beat-kinetic: bpm (bijv. 128), beatWords (array van korte impactwoorden)
- visual-lesson: lessonNodes ([{tag, title, detail}] — 3 verbonden concept-nodes)
- bento-montage: bentoTiles ([{label, title, metric}] — 4 portfolio/showreel tegels)
- paper-cutout: paperChapters (array van hoofdstuktitels voor gelaagde papier-collages)
- pricing-tiers: pricingTiers ([{name, price, cadence, highlighted, features}])
- mobile-screens: mobileScreens ([{step, title, body, cta}] — 3 mobiele onboarding-schermen)
- poster-editorial: posterMeta ({issue, location, tagline, accentWord})
- step-tutorial: stepNumber, totalSteps, stepTip
- data-rings: rings ([{label, percent, sublabel}]), bars ([{label, value, maxValue, displayValue}])
- ui-mockup: mockup ({windowTitle, urlBar, activeTab, primaryMetricLabel, primaryMetricValue, statusText, rows: [{name, meta, status}]})
- before-after: comparison ({beforeLabel, beforeTitle, beforePoints, afterLabel, afterTitle, afterPoints})
- waveform-captions: spokenWords (array van losse woorden voor karaoke-highlight)
- timeline-roadmap: timeline ([{date, title, detail}])
- quote-spotlight: quote ({text, author, role})
Beschikbare transitions: "fade", "slide-up", "wipe-left", "zoom".
Beschikbare backdrops (6): "grid-architectural", "radial-studio", "waveform", "swiss-lines", "dot-matrix", "orbital-rings".`;
}

export function buildTemplateRemixPrompt(
  project: OpenMotionProject,
  config: GitHubRepoConfig
): string {
  const dir = config.projectsDir.trim().replace(/^\/|\/$/g, '') || 'projects';
  return `Reproduceer en remix onderstaande OpenMotion / OpenDesign template ("${project.title}") voor mijn eigen merk/onderwerp.

Behoud exact dezelfde scène-structuur, layouts (${project.scenes
    .map((s) => s.layout)
    .join(', ')}), timing en schemaVersion "1.0" zodat de video 100% deterministisch rendert op mijn GitHub Pages bibliotheek (${config.owner}/${config.repo}).

Commit-pad in GitHub: ${dir}/<nieuwe-slug>/project.json

Pas aan voor mijn onderwerp: [VUL HIER JOUW MERK / ONDERWERP IN]

Exacte reproduceerbare blauwdruk (project.json):
${JSON.stringify(project, null, 2)}`;
}

export async function downloadGitHubRepoKitZip(
  projects: OpenMotionProject[],
  config: GitHubRepoConfig
): Promise<void> {
  const zip = new JSZip();
  const dir = config.projectsDir.trim().replace(/^\/|\/$/g, '') || 'projects';

  // 1. GitHub Actions workflow, .nojekyll, and manifest builder for GitHub Pages
  zip.file('.github/workflows/openmotion-pages.yml', generateGitHubWorkflowYaml(config));
  zip.file('public/.nojekyll', '');
  zip.file(
    'scripts/build-manifest.mjs',
    `import fs from 'fs';
import path from 'path';

const projectsDir = path.join(process.cwd(), '${dir}');
const outDir = path.join(process.cwd(), 'public', '${dir}');
const projects = [];
if (fs.existsSync(projectsDir)) {
  for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(projectsDir, entry.name, 'project.json');
    if (fs.existsSync(file)) {
      projects.push(JSON.parse(fs.readFileSync(file, 'utf8')));
    }
  }
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'manifest.json'),
  JSON.stringify({ schemaVersion: '1.0', updatedAt: new Date().toISOString(), count: projects.length, projects }, null, 2)
);
console.log('[openmotion] Indexed ' + projects.length + ' project(s).');
`
  );

  // 2. Projects & manifest.json
  const manifest = {
    schemaVersion: '1.0',
    repository: `${config.owner}/${config.repo}`,
    openmotionCompatible: 'https://github.com/nexu-io/openmotion',
    updatedAt: new Date().toISOString(),
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      format: p.format,
      fps: p.fps,
      path: `${dir}/${p.slug}/project.json`,
      mp4Url: `${config.pagesBaseUrl.replace(/\/$/, '')}/renders/${p.slug}.mp4`,
    })),
  };

  zip.file(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));

  for (const project of projects) {
    zip.file(`${dir}/${project.slug}/project.json`, JSON.stringify(project, null, 2));
  }

  // 3. ChatGPT Workflow Guide
  const chatGptGuide = `# ChatGPT → GitHub → OpenMotion Pages Workflow

Gebruik onderstaande prompt in ChatGPT (met GitHub Connector of MCP-integratie zoals bij https://github.com/nexu-io/openmotion):

\`\`\`text
${buildChatGptPrompt({
  topic: 'Productlancering van onze nieuwe automatisering',
  brandName: 'Mijn Merk',
  format: '16:9',
  tone: 'Strak, modern en informatief',
  durationSec: 12,
  repoSlug: `${config.owner}/${config.repo}`,
})}
\`\`\`
`;
  zip.file('docs/CHATGPT_WORKFLOW.md', chatGptGuide);

  // 4. Repository README
  const readme = `# OpenMotion Video Bibliotheek (${config.owner}/${config.repo})

Geïnspireerd door [nexu-io/openmotion](https://github.com/nexu-io/openmotion): beheer ChatGPT video-projecten als code in GitHub, toon ze automatisch in de bibliotheek op **GitHub Pages**, en exporteer direct frame-nauwkeurige **H.264 MP4** bestanden in de browser.

## Structuur

- \`${dir}/<slug>/project.json\` — OpenMotion video-definities (aangemaakt door ChatGPT of in de Studio)
- \`${dir}/manifest.json\` — Overzicht van alle video-projecten in de bibliotheek
- \`.github/workflows/openmotion-pages.yml\` — Automatische build & deploy naar GitHub Pages
- \`docs/CHATGPT_WORKFLOW.md\` — Prompt-template en JSON-schema voor ChatGPT

## Snel starten met GitHub Pages

1. Push deze map naar je GitHub repository \`${config.owner}/${config.repo}\`.
2. Ga in GitHub naar **Settings → Pages** en kies bij *Build and deployment* voor **GitHub Actions**.
3. Zodra ChatGPT een nieuw bestand \`${dir}/<slug>/project.json\` commit, bouwt de workflow de bibliotheek automatisch opnieuw.
4. Open de GitHub Pages URL en klik bij elke video op **Exporteer MP4** voor directe H.264 MP4-output (100% client-side via WebCodecs + mp4-muxer, geen render-server nodig).
`;
  zip.file('README.md', readme);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.repo || 'openmotion-library'}-github-kit.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
