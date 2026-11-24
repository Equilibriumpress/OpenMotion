export type AspectFormat = '16:9' | '9:16' | '1:1';

export type SceneLayout =
  | 'hero-kinetic'
  | 'metric-spotlight'
  | 'feature-cards'
  | 'code-terminal'
  | 'split-showcase'
  | 'outro-cta'
  | 'step-tutorial'
  | 'data-rings'
  | 'ui-mockup'
  | 'before-after'
  | 'waveform-captions'
  | 'timeline-roadmap'
  | 'quote-spotlight'
  | 'ui-morph'
  | 'beat-kinetic'
  | 'visual-lesson'
  | 'bento-montage'
  | 'paper-cutout'
  | 'pricing-tiers'
  | 'mobile-screens'
  | 'poster-editorial'
  | '3d-wireframe-stage'
  | 'live-line-chart'
  | 'node-graph-flow'
  | 'kinetic-marquee'
  | 'code-diff-deploy'
  | 'route-map-journey'
  | 'travel-postcard-reel'
  | 'faceless-explainer'
  | 'paper-map-journey'
  | 'geo-route-reel'
  | 'whiteboard-science'
  | 'editorial-cartography'
  | 'three-campervan-journey';

export type SceneTransition = 'fade' | 'slide-up' | 'wipe-left' | 'zoom';

export type MotionBackdrop =
  | 'grid-architectural'
  | 'radial-studio'
  | 'waveform'
  | 'swiss-lines'
  | 'dot-matrix'
  | 'orbital-rings';

export interface SceneMetric {
  label: string;
  value: string;
  delta?: string;
}

export interface SceneCardItem {
  title: string;
  detail: string;
}

export interface SceneDataRing {
  label: string;
  percent: number;
  sublabel?: string;
}

export interface SceneBarItem {
  label: string;
  value: number;
  maxValue?: number;
  displayValue: string;
}

export interface SceneComparison {
  beforeLabel: string;
  beforeTitle: string;
  beforePoints: string[];
  afterLabel: string;
  afterTitle: string;
  afterPoints: string[];
}

export interface SceneUiMockup {
  windowTitle: string;
  urlBar: string;
  activeTab: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  statusText: string;
  rows: { name: string; meta: string; status: string }[];
}

export interface SceneTimelineItem {
  date: string;
  title: string;
  detail: string;
}

export interface SceneQuote {
  text: string;
  author: string;
  role: string;
}

export interface SceneLessonNode {
  tag: string;
  title: string;
  detail: string;
}

export interface SceneBentoTile {
  label: string;
  title: string;
  metric?: string;
}

export interface ScenePricingTier {
  name: string;
  price: string;
  cadence: string;
  highlighted?: boolean;
  features: string[];
}

export interface SceneMobileScreen {
  step: string;
  title: string;
  body: string;
  cta: string;
}

export interface ScenePosterMeta {
  issue: string;
  location: string;
  tagline: string;
  accentWord: string;
}

export interface SceneWireframeSpec {
  label: string;
  value: string;
}

export interface SceneChartPoint {
  xLabel: string;
  value: number;
}

export interface SceneChartSeries {
  label: string;
  unit?: string;
  points: SceneChartPoint[];
  secondaryPoints?: number[];
}

export interface SceneGraphNode {
  id: string;
  label: string;
  sublabel: string;
}

export interface SceneDiffLine {
  type: 'context' | 'remove' | 'add';
  text: string;
}

export interface SceneDeployStep {
  label: string;
  duration: string;
}

export interface SceneRouteWaypoint {
  name: string;
  x: number;
  y: number;
  day?: string;
  highlight?: string;
  km?: number;
}

export interface SceneRouteMap {
  regionLabel: string;
  transport: 'plane' | 'train' | 'car' | 'bike' | 'hike';
  totalDistanceKm: number;
  durationLabel: string;
  waypoints: SceneRouteWaypoint[];
}

export interface SceneTravelHighlight {
  time: string;
  spot: string;
  note: string;
}

export interface SceneTravelCard {
  destination: string;
  country: string;
  coordinates: string;
  season: string;
  landscapeTheme: 'alpine' | 'coastal' | 'desert' | 'neon-city';
  highlights: SceneTravelHighlight[];
}

export interface SceneFacelessExplainer {
  chapter: string;
  visualType: 'funnel' | 'compounding' | 'balance-scale' | 'network-ripple' | 'iceberg';
  visualLabels: string[];
  voiceoverWords: string[];
  statBadge?: string;
}

export type PaperLandmarkIcon =
  | 'canal-house'
  | 'tower'
  | 'mountain'
  | 'arch'
  | 'temple'
  | 'lighthouse'
  | 'building';

export interface ScenePaperMapStop {
  name: string;
  x: number;
  y: number;
  fact: string;
  tag?: string;
  landmark: PaperLandmarkIcon;
}

export interface ScenePaperMapJourney {
  mapTitle: string;
  subtitle: string;
  routeColor?: string;
  waterColor?: string;
  terrainColor?: string;
  terrainShadeColor?: string;
  paperColor?: string;
  stops: ScenePaperMapStop[];
}

export type GeoCoord = [number, number]; // [lat, lon] in WGS84

export interface EditorialMapStop {
  number: string;
  name: string;
  lat: number;
  lon: number;
  /** Offset direction for the map label so markers never collide */
  labelAlign?: 'top' | 'bottom' | 'left' | 'right';
  /** Route fraction (0..1) where this stop lies on the Royal Mile */
  routeFrac: number;
}

export interface EditorialMapStreet {
  name?: string;
  kind: 'major' | 'secondary' | 'lane';
  coords: GeoCoord[];
  showLabel?: boolean;
}

export interface EditorialMapPark {
  name: string;
  coords: GeoCoord[];
  labelCoord?: GeoCoord;
}

export interface EditorialMapBuilding {
  coords: GeoCoord[];
  landmark?: boolean;
  label?: string;
}

export interface EditorialMapRelief {
  lat: number;
  lon: number;
  radiusDeg: number;
  elevationLabel?: string;
}

export interface EditorialMapCamera {
  lat: number;
  lon: number;
  /** Zoom multiplier where 1.0 fits the full city bounds horizontally */
  zoom: number;
  /** Optional subtle oblique bird's-eye tilt (0 = top-down, 0.35 = oblique street follow) */
  tilt?: number;
}

export interface EditorialPhotoCredit {
  author: string;
  license: string;
  sourceUrl: string;
  fileName: string;
}

export interface SceneEditorialMap {
  cityLabel: string;
  coordinatesLabel?: string;
  distanceLabel?: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  routeCoords: GeoCoord[];
  routeDrawFrom: number;
  routeDrawTo: number;
  routeColor?: string;
  routeHighlightPulse?: boolean;
  streets: EditorialMapStreet[];
  parks: EditorialMapPark[];
  buildings: EditorialMapBuilding[];
  reliefs?: EditorialMapRelief[];
  stops: EditorialMapStop[];
  /** Index of the active landmark stop (0..3) or -1 for overview */
  activeStopIndex?: number;
  cameraFrom: EditorialMapCamera;
  cameraTo: EditorialMapCamera;
  photoUrl?: string;
  photoMode?: 'opening-to-map' | 'map-to-photo' | 'none';
  /** Normalized scene progress (0..1) where the photo begins fading in */
  photoStartFrac?: number;
  /** Normalized scene progress (0..1) where the photo finishes fading back to map */
  photoEndFrac?: number;
  photoCredit?: EditorialPhotoCredit;
  titleLayout?: 'centered-opening' | 'lower-left-stop' | 'centered-finale';
  titleText: string;
  subtitleText: string;
}

export type ThreeLightingMood = 'golden-hour' | 'morning-mist' | 'alpine-noon';

export interface SceneThreeCampervan {
  /** Primary lower body paint color of the procedural campervan */
  vanColor: string;
  /** Upper cabin & pop-top roof color */
  vanRoofColor: string;
  /** Traveler's parka jacket color */
  jacketColor: string;
  /** Traveler's procedural hiking backpack color */
  backpackColor: string;
  /** Traveler's knit beanie color */
  beanieColor: string;
  /** Atmospheric lighting preset */
  lightingMood: ThreeLightingMood;
  /** Camera vertical field of view in degrees (e.g. 38 - 52) */
  cameraFov?: number;
  /** Optional subtle editorial overlay text for opening/closing moments */
  titleText?: string;
  subtitleText?: string;
  showTitleOverlay?: boolean;
}


/** Coordinate order follows GeoJSON: [longitude, latitude]. */
export interface SceneGeoRoute {
  route: {
    type: 'Feature';
    geometry: { type: 'LineString'; coordinates: [number, number][] };
    properties?: Record<string, unknown>;
  };
  waypoints: { name: string; lat: number; lon: number }[];
  routeProgressFrom?: number;
  routeProgressTo?: number;
}
export interface SceneWhiteboard {
  /** Normalized SVG-style polylines: [x, y] from 0 to 1. */
  strokes: number[][][];
  labels: string[];
}
export interface TimedCaptionWord {
  text: string;
  startSec: number;
  endSec: number;
}
export interface TimedCaption {
  text: string;
  startSec: number;
  endSec: number;
  style?: 'karaoke' | 'block' | 'minimal';
  words?: TimedCaptionWord[];
  position?: number; // vertical fraction 0.15 ... 0.85
  color?: string;
}
export interface OpenMotionAudioTrack {
  id: string;
  kind: 'voiceover' | 'music' | 'effect';
  src: string;
  startSec: number;
  endSec?: number;
  volume?: number; // linear gain 0..2
  fadeInSec?: number;
  fadeOutSec?: number;
}
export interface OpenMotionScene {
  id: string;
  name: string;
  durationSec: number;
  layout: SceneLayout;
  transition: SceneTransition;
  backdrop: MotionBackdrop;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  metrics?: SceneMetric[];
  items?: SceneCardItem[];
  codeLines?: string[];
  ctaText?: string;
  caption?: string;
  imageUrl?: string;
  // Extended OpenMotion & OpenDesign.ai capability fields
  stepNumber?: number;
  totalSteps?: number;
  stepTip?: string;
  rings?: SceneDataRing[];
  bars?: SceneBarItem[];
  comparison?: SceneComparison;
  mockup?: SceneUiMockup;
  timeline?: SceneTimelineItem[];
  quote?: SceneQuote;
  spokenWords?: string[];
  beatWords?: string[];
  bpm?: number;
  lessonNodes?: SceneLessonNode[];
  bentoTiles?: SceneBentoTile[];
  morphLabels?: string[];
  pricingTiers?: ScenePricingTier[];
  mobileScreens?: SceneMobileScreen[];
  posterMeta?: ScenePosterMeta;
  paperChapters?: string[];
  // Advanced OpenMotion 2.0 capability fields
  wireframeShape?: 'cube-stack' | 'octahedron' | 'iso-layers';
  wireframeSpecs?: SceneWireframeSpec[];
  chartSeries?: SceneChartSeries;
  graphNodes?: SceneGraphNode[];
  marqueeRows?: string[];
  diffLines?: SceneDiffLine[];
  deploySteps?: SceneDeployStep[];
  // Route Maps, Travel Videos & Faceless Explainers
  routeMap?: SceneRouteMap;
  travelCard?: SceneTravelCard;
  explainer?: SceneFacelessExplainer;
  paperMap?: ScenePaperMapJourney;
  editorialMap?: SceneEditorialMap;
  geoRoute?: SceneGeoRoute;
  whiteboard?: SceneWhiteboard;
  threeCampervan?: SceneThreeCampervan;
  fullBleed?: boolean;
}

export interface OpenMotionBrandKit {
  brandName: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: 'Bricolage Grotesque' | 'Plus Jakarta Sans' | 'JetBrains Mono';
}

export type ProjectSource = 'github' | 'chatgpt' | 'template';

export interface OpenMotionProject {
  schemaVersion: '1.0';
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  source: ProjectSource;
  templateReferenceUrl?: string;
  createdAt: string;
  updatedAt: string;
  githubPath: string;
  commitSha?: string;
  prebuiltMp4Url?: string;
  format: AspectFormat;
  width: number;
  height: number;
  fps: number;
  brandKit: OpenMotionBrandKit;
  scenes: OpenMotionScene[];
  captions?: TimedCaption[];
  audioTracks?: OpenMotionAudioTrack[];
}

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  projectsDir: string;
  token: string;
  pagesBaseUrl: string;
}

export interface RenderExportOptions {
  resolution: '720p' | '1080p';
  fps: 30 | 60;
  bitrateMbps: number;
}

export interface RenderProgressState {
  phase: 'idle' | 'rendering' | 'muxing' | 'done' | 'error';
  currentFrame: number;
  totalFrames: number;
  percent: number;
  container: 'mp4' | 'webm';
  encoderLabel: string;
  outputUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  elapsedMs?: number;
  errorMessage?: string;
}

export const ALL_SCENE_LAYOUTS: SceneLayout[] = [
  'three-campervan-journey',
  'editorial-cartography',
  'geo-route-reel',
  'whiteboard-science',
  'paper-map-journey',
  'route-map-journey',
  'travel-postcard-reel',
  'faceless-explainer',
  '3d-wireframe-stage',
  'live-line-chart',
  'node-graph-flow',
  'kinetic-marquee',
  'code-diff-deploy',
  'ui-morph',
  'beat-kinetic',
  'visual-lesson',
  'bento-montage',
  'paper-cutout',
  'pricing-tiers',
  'mobile-screens',
  'poster-editorial',
  'hero-kinetic',
  'step-tutorial',
  'data-rings',
  'ui-mockup',
  'before-after',
  'waveform-captions',
  'timeline-roadmap',
  'quote-spotlight',
  'metric-spotlight',
  'feature-cards',
  'code-terminal',
  'split-showcase',
  'outro-cta',
];

export const ALL_BACKDROPS: MotionBackdrop[] = [
  'grid-architectural',
  'radial-studio',
  'waveform',
  'swiss-lines',
  'dot-matrix',
  'orbital-rings',
];

export const LAYOUT_DISPLAY_NAMES: Record<SceneLayout, string> = {
  'three-campervan-journey': '3D Three.js Character Journey',
  'editorial-cartography': 'Editorial Cartography (OSM)',
  'geo-route-reel': 'GeoJSON / GPX Travel Route',
  'whiteboard-science': 'Animated Whiteboard Science',
  'paper-map-journey': 'Paper Map Journey (Cut-Paper)',
  'route-map-journey': 'Animated Route Map',
  'travel-postcard-reel': 'Reisvideo Postcard',
  'faceless-explainer': 'Faceless Explainer',
  '3d-wireframe-stage': '3D Wireframe Stage',
  'live-line-chart': 'Live Groeicurve & Chart',
  'node-graph-flow': 'Node-Graph Architectuur',
  'kinetic-marquee': 'Kinetic Marquee Wall',
  'code-diff-deploy': 'Git Diff & CI/CD Deploy',
  'ui-morph': 'UI Morph (One-Shape)',
  'beat-kinetic': 'Motion Future (Beat)',
  'visual-lesson': 'Visual Lesson Diagram',
  'bento-montage': 'Showreel Bento Grid',
  'paper-cutout': 'Narrative Paper-Cutout',
  'pricing-tiers': 'SaaS Pricing Matrix',
  'mobile-screens': 'Mobile Onboarding Flow',
  'poster-editorial': 'Editorial Poster Cover',
  'hero-kinetic': 'Kinetic Hero',
  'step-tutorial': 'Step Tutorial',
  'data-rings': 'Data Ringen & Grafiek',
  'ui-mockup': 'UI App Mockup',
  'before-after': 'Voor / Na Remix',
  'waveform-captions': 'Audio & Karaoke Captions',
  'timeline-roadmap': 'Roadmap Tijdlijn',
  'quote-spotlight': 'Editorial Quote',
  'metric-spotlight': 'Metric Counter',
  'feature-cards': 'Feature Cards',
  'code-terminal': 'Code Terminal',
  'split-showcase': 'Split Showcase',
  'outro-cta': 'Outro CTA',
};

export function getProjectDurationSec(project: OpenMotionProject): number {
  return project.scenes.reduce((total, scene) => total + Math.max(0.5, scene.durationSec), 0);
}

export function getFormatDimensions(
  format: AspectFormat,
  resolution: '720p' | '1080p' = '1080p'
): { width: number; height: number } {
  if (resolution === '720p') {
    if (format === '9:16') return { width: 720, height: 1280 };
    if (format === '1:1') return { width: 720, height: 720 };
    return { width: 1280, height: 720 };
  }
  if (format === '9:16') return { width: 1080, height: 1920 };
  if (format === '1:1') return { width: 1080, height: 1080 };
  return { width: 1920, height: 1080 };
}
