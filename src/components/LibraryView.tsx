import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Film,
  FolderGit2,
  Play,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { buildTemplateRemixPrompt } from '../services/githubService';
import {
  AspectFormat,
  GitHubRepoConfig,
  LAYOUT_DISPLAY_NAMES,
  OpenMotionProject,
  ProjectSource,
  SceneLayout,
  getProjectDurationSec,
} from '../types/openmotion';
import { CanvasPreview } from './CanvasPreview';

interface LibraryViewProps {
  projects: OpenMotionProject[];
  repoConfig: GitHubRepoConfig;
  isSyncing: boolean;
  syncMessage: string | null;
  onSyncGitHub: () => void;
  onOpenStudio: (project: OpenMotionProject, autoStartExport?: boolean) => void;
  onNavigateTab: (tab: 'chatgpt' | 'github') => void;
}

const SOURCE_LABELS: Record<ProjectSource, string> = {
  chatgpt: 'ChatGPT',
  github: 'GitHub',
  template: 'OpenMotion',
};

const FEATURED_PREVIEW_LAYOUTS: SceneLayout[] = [
  'three-campervan-journey',
  'editorial-cartography',
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
  'paper-cutout',
  'pricing-tiers',
  'mobile-screens',
  'poster-editorial',
  'beat-kinetic',
  'visual-lesson',
  'bento-montage',
  'data-rings',
  'ui-mockup',
  'before-after',
  'waveform-captions',
  'timeline-roadmap',
  'step-tutorial',
  'quote-spotlight',
  'code-terminal',
  'metric-spotlight',
];

function getShowcasePreviewTime(project: OpenMotionProject): number {
  let elapsed = 0;
  for (const sc of project.scenes) {
    if (FEATURED_PREVIEW_LAYOUTS.includes(sc.layout)) {
      // For UI Morph, land on the rich Dynamic Island / Mini Analytics mid-frame
      if (sc.layout === 'ui-morph') {
        return elapsed + sc.durationSec * 0.64;
      }
      if (sc.layout === 'editorial-cartography') {
        // Show the iconic opening panoramic Edinburgh photo with editorial title
        return elapsed + sc.durationSec * 0.38;
      }
      if (sc.layout === 'three-campervan-journey') {
        // Land on the warm hero moment: traveler waving at camera beside open campervan
        return 8.1;
      }
      return elapsed + Math.min(sc.durationSec * 0.62, 1.9);
    }
    elapsed += sc.durationSec;
  }
  return 1.35;
}

export function LibraryView({
  projects,
  repoConfig,
  isSyncing,
  syncMessage,
  onSyncGitHub,
  onOpenStudio,
  onNavigateTab,
}: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | AspectFormat>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | ProjectSource>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyRemixPrompt = async (project: OpenMotionProject) => {
    await navigator.clipboard.writeText(buildTemplateRemixPrompt(project, repoConfig));
    setCopiedPromptId(project.id);
    setTimeout(() => {
      setCopiedPromptId((prev) => (prev === project.id ? null : prev));
    }, 1800);
  };

  const categories = Array.from(new Set(projects.map((p) => p.category)));

  const filteredProjects = projects.filter((p) => {
    if (formatFilter !== 'all' && p.format !== formatFilter) return false;
    if (sourceFilter !== 'all' && p.source !== sourceFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.scenes.some(
          (s) =>
            s.layout.toLowerCase().includes(q) ||
            LAYOUT_DISPLAY_NAMES[s.layout].toLowerCase().includes(q)
        )
      );
    }
    return true;
  });

  const totalDurationSec = projects.reduce((sum, p) => sum + getProjectDurationSec(p), 0);
  const distinctLayoutsCount = new Set(projects.flatMap((p) => p.scenes.map((s) => s.layout))).size;

  return (
    <div className="space-y-8">
      {/* Hero / Workspace Summary */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium text-blue-700 font-mono">
            nexu-io/openmotion compatibel · GitHub Pages MP4 Bibliotheek
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
            OpenMotion Video Bibliotheek
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Bekijk ChatGPT en OpenMotion video-projecten direct vanuit je GitHub-repository, verken
            alle motion-mogelijkheden van dataringen tot karaoke-captions en exporteer direct H.264
            MP4-bestanden op GitHub Pages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onSyncGitHub}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchroniseren...' : 'Sync GitHub Repo'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('chatgpt')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Importeer ChatGPT Project</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Clean Editorial Metrics Strip (flat, hairline-divided, tabular numerals) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">Projecten in bibliotheek</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {projects.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 font-mono truncate">
            {repoConfig.owner}/{repoConfig.repo}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">OpenMotion Layouts</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {distinctLayoutsCount}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Ringen, UI, Tutorial, Audio &amp; meer</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Totale speelduur</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {totalDurationSec.toFixed(1)}s
          </p>
          <p className="mt-0.5 text-xs text-slate-500">16:9 · 9:16 · 1:1</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">MP4 Export Engine</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            H.264
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Client-side op GitHub Pages</p>
        </div>
      </section>

      {syncMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg"
        >
          <span>{syncMessage}</span>
          <button
            type="button"
            onClick={() => onNavigateTab('github')}
            className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
          >
            Repo-instellingen
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <section className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op titel, layout (bijv. ringen, mockup, tutorial)..."
              aria-label="Zoek video-projecten"
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Format segmented control */}
            <div
              role="group"
              aria-label="Filter op videoformaat"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            >
              {(['all', '16:9', '9:16', '1:1'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormatFilter(fmt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    formatFilter === fmt
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt === 'all' ? 'Alle formaten' : fmt}
                </button>
              ))}
            </div>

            {/* Source segmented control */}
            <div
              role="group"
              aria-label="Filter op bron"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            >
              {(['all', 'template', 'chatgpt', 'github'] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(src)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    sourceFilter === src
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {src === 'all' ? 'Alle bronnen' : SOURCE_LABELS[src]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category segmented selector */}
        <div
          role="group"
          aria-label="Filter op categorie"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Alle categorieën ({projects.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Project Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white border border-slate-200 rounded-xl space-y-4">
          <Film className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Geen OpenMotion-projecten gevonden
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Pas je zoekterm of formaatfilter aan, of importeer direct een nieuw project dat door
              ChatGPT is gegenereerd.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFormatFilter('all');
                setSourceFilter('all');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Filters wissen
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('chatgpt')}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              ChatGPT Project Toevoegen
            </button>
          </div>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const duration = getProjectDurationSec(project);
            const isHovered = hoveredId === project.id;
            const previewTime = getShowcasePreviewTime(project);
            const uniqueLayoutNames = Array.from(
              new Set(project.scenes.map((s) => LAYOUT_DISPLAY_NAMES[s.layout]))
            ).slice(0, 3);

            return (
              <article
                key={project.id}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId((prev) => (prev === project.id ? null : prev))}
                className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-colors hover:border-slate-300"
              >
                {/* Calibrated Matte Studio Preview Stage */}
                <div
                  onClick={() => onOpenStudio(project, false)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenStudio(project, false);
                    }
                  }}
                  aria-label={`Open ${project.title} in Studio`}
                  className="relative aspect-video bg-[#0B0F17] flex items-center justify-center overflow-hidden cursor-pointer group"
                >
                  <CanvasPreview
                    project={project}
                    timeSec={previewTime}
                    isPlaying={isHovered}
                    renderScale={project.format === '16:9' ? 0.36 : 0.4}
                    className={`max-h-full max-w-full object-contain transition-transform duration-200 ${
                      project.format === '16:9' ? 'w-full h-full' : 'h-[92%] w-auto shadow-2xl'
                    }`}
                  />

                  {/* Subtle bottom scrim with hover cue */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-mono tabular-nums pointer-events-none">
                    <span>{isHovered ? 'Live preview actief' : 'Hover voor preview'}</span>
                    <span>
                      {project.width}×{project.height} · {duration.toFixed(1)}s
                    </span>
                  </div>
                </div>

                {/* Card Body (Zero-pill metadata, crisp hierarchy) */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-mono tabular-nums">
                      <span>{project.format}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.fps} fps</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.scenes.length} scènes</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{SOURCE_LABELS[project.source]}</span>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900 leading-snug">
                      {project.title}
                    </h2>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <p className="text-xs text-slate-500">
                      Layouts: <span className="text-slate-700">{uniqueLayoutNames.join(' · ')}</span>
                    </p>

                    <div className="pt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-mono">
                      <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                        <FolderGit2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{project.githubPath}</span>
                      </span>
                      {project.templateReferenceUrl && (
                        <>
                          <span aria-hidden="true">·</span>
                          <a
                            href={project.templateReferenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 hover:underline shrink-0"
                          >
                            open-design.ai/templates
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenStudio(project, false)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Studio</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCopyRemixPrompt(project)}
                        title="Kopieer ChatGPT Remix-prompt + project.json om deze template te reproduceren"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        {copiedPromptId === project.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Gekopieerd</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Remix Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenStudio(project, false)}
                        aria-label={`Speel ${project.title} af`}
                        className="inline-flex items-center justify-center w-9 h-9 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenStudio(project, true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exporteer MP4</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
