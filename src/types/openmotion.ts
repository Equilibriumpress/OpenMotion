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
  | 'code-diff-deploy';

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
