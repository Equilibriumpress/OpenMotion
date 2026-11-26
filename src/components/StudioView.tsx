import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Download,
  Film,
  GitCommitHorizontal,
  Link2,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DocumentaryAudioEngine } from '../engine/ambientAudio';
import { projectAssetUrl } from '../engine/projectAudio';
import { createPremiumTravelAudio } from '../engine/premiumTravelAudio';
import { createDoodleExplainerAudio } from '../engine/doodleExplainerAudio';
import { createBucketListAudio } from '../engine/bucketListAudio';
import { ShortsMediaEditor } from './ShortsMediaEditor';
import { exportProjectToMp4, formatFileSize } from '../engine/mp4Exporter';
import { isTravelDocumentary } from '../engine/travelProject';
import {
  buildTemplateRemixPrompt,
  commitProjectToGitHub,
  normalizeOpenMotionProject,
} from '../services/githubService';
import {
  ALL_BACKDROPS,
  ALL_SCENE_LAYOUTS,
  AspectFormat,
  GitHubRepoConfig,
  LAYOUT_DISPLAY_NAMES,
  OpenMotionProject,
  RenderExportOptions,
  RenderProgressState,
  getFormatDimensions,
  getProjectDurationSec,
} from '../types/openmotion';
import { CanvasPreview } from './CanvasPreview';

interface StudioViewProps {
  project: OpenMotionProject;
  repoConfig: GitHubRepoConfig;
  autoStartExport?: boolean;
  onConsumeAutoStart?: () => void;
  onUpdateProject: (updated: OpenMotionProject) => void;
  onBackToLibrary: () => void;
}

type InspectorTab = 'export' | 'editor' | 'json';

const INITIAL_RENDER_STATE: RenderProgressState = {
  phase: 'idle',
  currentFrame: 0,
  totalFrames: 0,
  percent: 0,
  container: 'mp4',
  encoderLabel: 'WebCodecs H.264 + mp4-muxer',
};

export function StudioView({
  project,
  repoConfig,
  autoStartExport = false,
  onConsumeAutoStart,
  onUpdateProject,
  onBackToLibrary,
}: StudioViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('export');
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);

  const audioEngineRef = useRef<DocumentaryAudioEngine | null>(null);
  const premiumAudioRef = useRef<{ context: AudioContext; source: AudioBufferSourceNode } | null>(null);
  const audioPlayersRef = useRef<{ id:string; audio:HTMLAudioElement; start:number; end?:number; volume:number; fadeIn:number; fadeOut:number }[]>([]);

  const [exportOptions, setExportOptions] = useState<RenderExportOptions>({
    resolution: '1080p',
    fps: project.fps === 60 ? 60 : 30,
    bitrateMbps: 8,
  });
  const [renderState, setRenderState] = useState<RenderProgressState>(INITIAL_RENDER_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(project, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedRemix, setCopiedRemix] = useState(false);
  const [copiedDeepLink, setCopiedDeepLink] = useState(false);

  const [commitStatus, setCommitStatus] = useState<{
    state: 'idle' | 'committing' | 'success' | 'error';
    message?: string;
    url?: string;
  }>({ state: 'idle' });

  const totalDuration = Math.max(0.5, getProjectDurationSec(project));
  const totalFrames = Math.max(1, Math.round(totalDuration * project.fps));
  const currentFrame = Math.min(totalFrames, Math.floor(currentTime * project.fps) + 1);
  const isPremiumTravel = project.scenes.some(scene => scene.layout === 'premium-travel-route');
  const isDoodleExplainer = project.scenes.some(scene => scene.layout === 'doodle-explainer');
  const isBucketList = project.scenes.some(scene => scene.layout === 'bucket-list-zoom');

  useEffect(()=>{setExportOptions(o=>({...o,resolution:'1080p',fps:project.fps===60?60:30}));},[project.id,project.fps]);

  // Sync JSON editor when project switches
  useEffect(() => {
    setJsonDraft(JSON.stringify(project, null, 2));
    setJsonError(null);
    setSelectedSceneIdx((idx) => Math.min(idx, Math.max(0, project.scenes.length - 1)));
  }, [project]);

  // Cleanup previous Object URL on unmount or new render
  useEffect(() => {
    const url = renderState.outputUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [renderState.outputUrl]);

  useEffect(() => {
    const url=renderState.audioSidecarUrl;
    return ()=>{if(url)URL.revokeObjectURL(url);};
  },[renderState.audioSidecarUrl]);

  // Independent preview sources use the same timeline as the offline MP4 audio mixer.
  useEffect(() => {
    const players = (project.audioTracks ?? []).filter(t=>t.src?.trim()).map(t=>({
      id:t.id,audio:new Audio(projectAssetUrl(t.src)),start:Math.max(0,t.startSec),end:t.endSec,
      volume:Math.max(0,Math.min(1,t.volume??1)),fadeIn:t.fadeInSec??0,fadeOut:t.fadeOutSec??0
    }));
    audioPlayersRef.current=players;
    return ()=>{players.forEach(p=>{p.audio.pause();p.audio.removeAttribute('src');});audioPlayersRef.current=[];};
  },[project.audioTracks]);

  useEffect(()=>{
    for(const p of audioPlayersRef.current){
      const local=currentTime-p.start;
      const max=p.end===undefined ? Number.POSITIVE_INFINITY : Math.max(0,p.end-p.start);
      if(!audioEnabled||!isPlaying||local<0||local>=max){p.audio.pause();continue;}
      if(Number.isFinite(p.audio.duration)&&local>=p.audio.duration){p.audio.pause();continue;}
      if(Math.abs(p.audio.currentTime-local)>.3) {try{p.audio.currentTime=local;}catch{/* metadata pending */}}
      const fadeIn=p.fadeIn>0 ? Math.min(1,local/p.fadeIn):1;
      const fadeOut=p.fadeOut>0 && Number.isFinite(max) ? Math.min(1,(max-local)/p.fadeOut):1;
      p.audio.volume=Math.max(0,Math.min(1,p.volume*fadeIn*fadeOut));
      if(p.audio.paused)void p.audio.play().catch(()=>{});
    }
  },[currentTime,isPlaying,audioEnabled,project.audioTracks]);


  // Match the procedural film score between the live preview and the MP4.
  // Unlike the previous preview-only ambience, this is the exported soundtrack.
  useEffect(() => {
    const needsMusic = (isPremiumTravel || isDoodleExplainer || isBucketList) && !(project.audioTracks?.length) && audioEnabled && isPlaying;
    if (!needsMusic) return;

    const context = new AudioContext();
    let cancelled = false;
    let source: AudioBufferSourceNode | null = null;
    void context.resume().then(() => isBucketList ? createBucketListAudio(totalDuration) : isDoodleExplainer ? createDoodleExplainerAudio(totalDuration) : createPremiumTravelAudio(totalDuration)).then(buffer => {
      if (cancelled) return;
      source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(context.destination);
      source.start(0, currentTime % buffer.duration);
      premiumAudioRef.current = { context, source };
    }).catch(error => {
      console.warn('Premium preview soundtrack unavailable:', error);
    });
    return () => {
      cancelled = true;
      if (source) { try { source.stop(); } catch { /* Already stopped */ } source.disconnect(); }
      if (premiumAudioRef.current?.context === context) premiumAudioRef.current = null;
      void context.close().catch(() => {});
    };
    // The audio source follows the video clock from the moment playback begins.
    // Seeking while paused restarts it at the new timeline position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremiumTravel, isDoodleExplainer, isBucketList, audioEnabled, isPlaying, project, totalDuration]);

  // Synchronize subtle documentary audio soundtrack & city ambience with playback
  useEffect(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new DocumentaryAudioEngine();
    }
    const engine = audioEngineRef.current;
    if (audioEnabled && isPlaying && !isPremiumTravel && !isDoodleExplainer && !isBucketList && !(project.audioTracks?.length)) {
      engine.start(currentTime);
    } else {
      engine.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled, isPlaying, isPremiumTravel, isDoodleExplainer, isBucketList, project.audioTracks]);

  useEffect(() => {
    if (audioEnabled && isPlaying && !isPremiumTravel && !isDoodleExplainer && !isBucketList && !(project.audioTracks?.length)) {
      audioEngineRef.current?.syncTime(currentTime);
    }
  }, [audioEnabled, isPlaying, isPremiumTravel, isDoodleExplainer, isBucketList, currentTime, project.audioTracks]);

  useEffect(() => {
    return () => {
      audioEngineRef.current?.dispose();
      audioEngineRef.current = null;
    };
  }, []);

  const handleStartMp4Export = async () => {
    if (renderState.phase === 'rendering' || renderState.phase === 'muxing') return;

    setInspectorTab('export');
    setIsPlaying(false);
    const controller = new AbortController();
    abortRef.current = controller;

    setRenderState({
      phase: 'rendering',
      currentFrame: 0,
      totalFrames: Math.ceil(totalDuration * exportOptions.fps),
      percent: 1,
      container: 'mp4',
      encoderLabel: 'Initialiseren van H.264 encoder...',
    });

    try {
      const result = await exportProjectToMp4(
        project,
        exportOptions,
        (progress) => setRenderState(progress),
        controller.signal
      );
      setRenderState(result);
    } catch (err) {
      setRenderState({
        phase: 'error',
        currentFrame: 0,
        totalFrames: Math.ceil(totalDuration * exportOptions.fps),
        percent: 0,
        container: 'mp4',
        encoderLabel: 'WebCodecs H.264',
        errorMessage: err instanceof Error ? err.message : 'Onbekende fout tijdens MP4-export.',
      });
    } finally {
      abortRef.current = null;
    }
  };

  useEffect(() => {
    if (autoStartExport) {
      onConsumeAutoStart?.();
      void handleStartMp4Export();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartExport]);

  const handleCancelExport = () => {
    abortRef.current?.abort();
  };

  const handleDownloadMp4 = () => {
    if (!renderState.outputUrl || !renderState.fileName) return;
    const a = document.createElement('a');
    a.href = renderState.outputUrl;
    a.download = renderState.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSidecar=()=>{
    if(!renderState.audioSidecarUrl||!renderState.audioSidecarName)return;
    const a=document.createElement('a');
    a.href=renderState.audioSidecarUrl;
    a.download=renderState.audioSidecarName;
    document.body.appendChild(a);a.click();a.remove();
  };

  const handleStepFrame = (delta: number) => {
    setIsPlaying(false);
    const stepSec = 1 / project.fps;
    setCurrentTime((t) => {
      const next = t + delta * stepSec;
      if (next < 0) return totalDuration - stepSec;
      if (next >= totalDuration) return 0;
      return next;
    });
  };

  const handleFormatChange = (nextFormat: AspectFormat) => {
    const dims = getFormatDimensions(nextFormat, '1080p');
    onUpdateProject({
      ...project,
      format: nextFormat,
      width: dims.width,
      height: dims.height,
    });
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      const { project: normalized, error } = normalizeOpenMotionProject(parsed, project.slug);
      if (error || !normalized) {
        setJsonError(error ?? 'Validatie mislukt.');
        return;
      }
      setJsonError(null);
      onUpdateProject({ ...normalized, id: project.id });
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Ongeldige JSON-syntaxis.');
    }
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const handleCopyRemixPrompt = async () => {
    await navigator.clipboard.writeText(buildTemplateRemixPrompt(project, repoConfig));
    setCopiedRemix(true);
    setTimeout(() => setCopiedRemix(false), 1800);
  };

  const handleCopyDeepLink = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#studio/${encodeURIComponent(
      project.slug
    )}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedDeepLink(true);
    setTimeout(() => setCopiedDeepLink(false), 1800);
  };

  const handleDownloadProjectJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.slug}-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCommitToGitHub = async () => {
    setCommitStatus({ state: 'committing' });
    try {
      const res = await commitProjectToGitHub(repoConfig, project);
      onUpdateProject({
        ...project,
        source: 'github',
        commitSha: res.commitSha,
      });
      setCommitStatus({
        state: 'success',
        message: `Gecommit naar ${repoConfig.owner}/${repoConfig.repo} (${res.commitSha}).`,
        url: res.htmlUrl,
      });
    } catch (err) {
      setCommitStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'GitHub commit mislukt.',
      });
    }
  };

  const activeScene = project.scenes[selectedSceneIdx] ?? project.scenes[0];

  const updateActiveScene = (patch: Partial<typeof activeScene>) => {
    const nextScenes = project.scenes.map((sc, idx) =>
      idx === selectedSceneIdx ? { ...sc, ...patch } : sc
    );
    onUpdateProject({ ...project, scenes: nextScenes });
  };

  const jumpToScene = (idx: number) => {
    setSelectedSceneIdx(idx);
    let offset = 0;
    for (let i = 0; i < idx; i++) {
      offset += project.scenes[i].durationSec;
    }
    setCurrentTime(offset + 0.05);
  };

  const exportDims = getFormatDimensions(project.format, exportOptions.resolution);
  const isRendering = renderState.phase === 'rendering' || renderState.phase === 'muxing';

  return (
    <div className="space-y-6">
      {/* Studio Breadcrumb & Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToLibrary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Bibliotheek</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{project.title}</h1>
            <p className="text-xs text-slate-500 font-mono truncate">
              {project.githubPath} · {project.format} · {project.width}×{project.height} ·{' '}
              {totalDuration.toFixed(1)}s
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyDeepLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            title="Kopieer directe GitHub Pages link naar deze video"
          >
            {copiedDeepLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link gekopieerd</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Deel Link</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCommitToGitHub}
            disabled={commitStatus.state === 'committing'}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <GitCommitHorizontal className="w-4 h-4" />
            <span>
              {commitStatus.state === 'committing' ? 'Committen...' : 'Commit naar GitHub'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleStartMp4Export}
            disabled={isRendering}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isRendering ? `Renderen ${renderState.percent}%` : 'Render MP4'}</span>
          </button>
        </div>
      </div>

      {commitStatus.state !== 'idle' && commitStatus.message && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 px-4 py-3 text-sm rounded-lg border ${
            commitStatus.state === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <span>{commitStatus.message}</span>
          {commitStatus.url && (
            <a
              href={commitStatus.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium underline whitespace-nowrap shrink-0"
            >
              Bekijk op GitHub
            </a>
          )}
        </div>
      )}

      {/* Main 2-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Focal Anchor: Video Stage + Timeline */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-[#0B0F17] rounded-xl border border-slate-800 overflow-hidden">
            <div className="aspect-video w-full flex items-center justify-center p-3 sm:p-5">
              <CanvasPreview
                project={project}
                timeSec={currentTime}
                isPlaying={isPlaying}
                onTimeUpdate={setCurrentTime}
                renderScale={project.format === '16:9' ? 0.55 : 0.5}
                className={`max-h-full max-w-full rounded shadow-2xl ${
                  project.format === '16:9' ? 'w-full h-full object-contain' : 'h-full w-auto'
                }`}
              />
            </div>

            {/* Playback Transport Bar */}
            <div className="px-4 py-3 bg-[#111827] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-slate-200">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pauzeer preview' : 'Speel preview af'}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleStepFrame(-1)}
                  aria-label="Vorige frame"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepFrame(1)}
                  aria-label="Volgende frame"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  aria-label="Reset naar begin"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAudioEnabled((prev) => !prev)}
                  aria-label={audioEnabled ? 'Demp achtergrondmuziek' : 'Zet omgevingsgeluid en muziek aan'}
                  title={audioEnabled ? 'Achtergrondmuziek & stadsambience actief' : 'Speel rustige documentaire-muziek & stadsambience af'}
                  className={`inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-xs font-medium transition-colors ${
                    audioEnabled
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
                  <span className="hidden sm:inline">{audioEnabled ? 'Audio aan' : 'Audio'}</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-300">
                <span>
                  {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
                </span>
                <span className="text-slate-500">|</span>
                <span>
                  Frame {String(currentFrame).padStart(3, '0')} / {totalFrames}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Timeline & Scene Track */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900">Tijdlijn & Scènes</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {project.scenes.length} scènes · {project.fps} fps
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={totalDuration}
              step={1 / project.fps}
              value={Math.min(currentTime, totalDuration)}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentTime(parseFloat(e.target.value));
              }}
              aria-label="Video tijdlijn positie"
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {project.scenes.map((sc, idx) => {
                const isSelected = idx === selectedSceneIdx;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => jumpToScene(idx)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-slate-500">
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                      <span>{sc.durationSec.toFixed(1)}s</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold truncate">{sc.name}</p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">{sc.layout}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photography Attribution & Licenses (when project uses Wikimedia Commons imagery) */}
          {project.scenes.some((sc) => Boolean(sc.editorialMap?.photoCredit)) && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  Fotografie Bronnen &amp; Licenties (Wikimedia Commons)
                </span>
                <span className="text-xs text-slate-500 font-mono">OpenStreetMap · CC Licenties</span>
              </div>
              <ul className="divide-y divide-slate-100 text-xs">
                {project.scenes
                  .filter((sc) => Boolean(sc.editorialMap?.photoCredit))
                  .map((sc) => {
                    const credit = sc.editorialMap!.photoCredit!;
                    return (
                      <li
                        key={sc.id}
                        className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                      >
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900">{sc.name}</span>
                          <span className="text-slate-400 mx-1.5">·</span>
                          <span className="text-slate-600">{credit.author}</span>
                          <span className="text-slate-400 mx-1.5">·</span>
                          <span className="font-mono text-slate-500">{credit.license}</span>
                        </div>
                        <a
                          href={credit.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline font-mono shrink-0"
                        >
                          Wikimedia Commons
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>

        {/* Right Inspector Panel: MP4 Export | Brand & Scènes | project.json */}
        <aside className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div
            role="tablist"
            aria-label="Studio inspecteur"
            className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-1 gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'export'}
              onClick={() => setInspectorTab('export')}
              className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                inspectorTab === 'export'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>MP4 Output</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'editor'}
              onClick={() => setInspectorTab('editor')}
              className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                inspectorTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Bewerken</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'json'}
              onClick={() => setInspectorTab('json')}
              className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                inspectorTab === 'json'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>project.json</span>
            </button>
          </div>

          <div className="p-5 space-y-5">
            {inspectorTab === 'export' && (
              <>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-slate-900">
                    GitHub Pages MP4 Exporter
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rendert elk frame deterministisch naar een echt H.264 MP4-bestand direct in de
                    browser. Werkt volledig statisch op GitHub Pages.
                  </p>
                </div>

                {isTravelDocumentary(project) && (
                  <div className="space-y-2 rounded-lg border border-slate-200 p-3 text-xs text-slate-700">
                    <p className="font-semibold">Places Worth Exploring · gecontroleerde export R2</p>
                    <p>De browserexport vereist H.264 en AAC op de gekozen resolutie en framerate. Geen stille of verkleinde master. Werkt dit niet op jouw toestel, gebruik dan de handmatige serverrender.</p>
                    <a className="block text-blue-700 underline" href={`https://github.com/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/actions/workflows/render-openmotion-master.yml`} target="_blank" rel="noreferrer">Open GitHub masterworkflow</a>
                    <p>Run workflow · project: <code className="break-all">{project.slug}</code>. Download de MP4 bij Artifacts. Alleen opgeslagen GitHub-versies worden gerenderd.</p>
                  </div>
                )}
                {/* Export Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Videoformaat
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                      {(['16:9', '9:16', '1:1'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => handleFormatChange(fmt)}
                          className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                            project.format === fmt
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Resolutie
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                        {(['720p', '1080p'] as const).map((res) => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setExportOptions((o) => ({ ...o, resolution: res }))}
                            className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                              exportOptions.resolution === res
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Framerate
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                        {([30, 60] as const).map((fpsVal) => (
                          <button
                            key={fpsVal}
                            type="button"
                            onClick={() => setExportOptions((o) => ({ ...o, fps: fpsVal }))}
                            className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                              exportOptions.fps === fpsVal
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {fpsVal} fps
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Output specification readout */}
                  <dl className="grid grid-cols-2 gap-y-2 text-xs pt-3 border-t border-slate-100 font-mono tabular-nums">
                    <dt className="text-slate-500">Output pixels</dt>
                    <dd className="text-right text-slate-900">
                      {exportDims.width}×{exportDims.height}
                    </dd>
                    <dt className="text-slate-500">Totaal frames</dt>
                    <dd className="text-right text-slate-900">
                      {Math.ceil(totalDuration * exportOptions.fps)}
                    </dd>
                    <dt className="text-slate-500">Container / Codec</dt>
                    <dd className="text-right text-slate-900">MP4 · H.264 AVC</dd>
                  </dl>

                  {/* Primary Render / Cancel Button */}
                  {isRendering ? (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                          <span className="text-slate-700">
                            {renderState.phase === 'muxing'
                              ? 'MP4 container afronden...'
                              : `Frame ${renderState.currentFrame} / ${renderState.totalFrames}`}
                          </span>
                          <span className="font-semibold text-blue-700">
                            {renderState.percent}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-150"
                            style={{ width: `${renderState.percent}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {renderState.encoderLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelExport}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Annuleer Render</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartMp4Export}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Genereer H.264 MP4</span>
                    </button>
                  )}

                  {/* Error Output */}
                  {renderState.phase === 'error' && renderState.errorMessage && (
                    <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">
                      {renderState.errorMessage}
                    </div>
                  )}

                  {/* Finished MP4 Result with real <video> preview + Download */}
                  {renderState.phase === 'done' && renderState.outputUrl && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-700">
                          MP4 gereed voor download
                        </span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {formatFileSize(renderState.fileSizeBytes ?? 0)} ·{' '}
                          {((renderState.elapsedMs ?? 0) / 1000).toFixed(1)}s
                        </span>
                      </div>

                      <p className={`text-[11px] leading-5 ${renderState.encoderLabel.includes('browser verlaagde resolutie') ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                        {renderState.encoderLabel}
                      </p>
                      <video
                        src={renderState.outputUrl}
                        controls
                        playsInline
                        className="w-full max-h-56 rounded-lg bg-black border border-slate-200"
                      />

                      <button
                        type="button"
                        onClick={handleDownloadMp4}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download {renderState.fileName}</span>
                      </button>
                      {renderState.audioSidecarUrl && (
                        <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
                          <p className="text-xs text-amber-900">Safari kon de audiotrack niet betrouwbaar in de video opnemen. Download het originele geluid apart als WAV om dit in je video-editor aan de MP4 toe te voegen.</p>
                          <button type="button" onClick={handleDownloadSidecar}
                            className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-amber-900 px-3 py-2 text-xs font-semibold text-white">
                            <Download className="w-4 h-4"/>Download soundtrack (WAV)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Optional Pre-rendered GitHub Pages URL */}
                  {project.prebuiltMp4Url && (
                    <div className="pt-4 border-t border-slate-100 space-y-1.5">
                      <p className="text-xs font-medium text-slate-700">
                        Publicatiemaster · MP4
                      </p>
                      <a
                        href={projectAssetUrl(project.prebuiltMp4Url)}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs font-mono text-blue-700 hover:underline truncate"
                      >
                        {project.prebuiltMp4Url}
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}

            {inspectorTab === 'editor' && activeScene && (
              <div className="space-y-4">
                <ShortsMediaEditor project={project} activeScene={activeScene} onUpdateProject={onUpdateProject} onUpdateScene={updateActiveScene} />
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">Brand Kit</p>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Merknaam</label>
                    <input
                      type="text"
                      value={project.brandKit.brandName}
                      onChange={(e) =>
                        onUpdateProject({
                          ...project,
                          brandKit: { ...project.brandKit, brandName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="text-xs text-slate-600 space-y-1">
                      <span>Primair</span>
                      <input
                        type="color"
                        value={project.brandKit.primaryColor}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            brandKit: { ...project.brandKit, primaryColor: e.target.value },
                          })
                        }
                        className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                      />
                    </label>
                    <label className="text-xs text-slate-600 space-y-1">
                      <span>Accent</span>
                      <input
                        type="color"
                        value={project.brandKit.accentColor}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            brandKit: { ...project.brandKit, accentColor: e.target.value },
                          })
                        }
                        className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                      />
                    </label>
                    <label className="text-xs text-slate-600 space-y-1">
                      <span>Achtergrond</span>
                      <input
                        type="color"
                        value={project.brandKit.backgroundColor}
                        onChange={(e) =>
                          onUpdateProject({
                            ...project,
                            brandKit: { ...project.brandKit, backgroundColor: e.target.value },
                          })
                        }
                        className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">
                      Scène {selectedSceneIdx + 1}: {activeScene.name}
                    </p>
                    <span className="text-xs font-mono text-slate-500">{activeScene.layout}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Scène-layout</label>
                      <select
                        value={activeScene.layout}
                        onChange={(e) =>
                          updateActiveScene({
                            layout: e.target.value as typeof activeScene.layout,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                      >
                        {ALL_SCENE_LAYOUTS.map((l) => (
                          <option key={l} value={l}>
                            {LAYOUT_DISPLAY_NAMES[l]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Achtergrond</label>
                      <select
                        value={activeScene.backdrop}
                        onChange={(e) =>
                          updateActiveScene({
                            backdrop: e.target.value as typeof activeScene.backdrop,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                      >
                        {ALL_BACKDROPS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Hoofdtitel</label>
                    <input
                      type="text"
                      value={activeScene.headline}
                      onChange={(e) => updateActiveScene({ headline: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Subtitel / Intro</label>
                    <textarea
                      rows={2}
                      value={activeScene.subheadline ?? ''}
                      onChange={(e) => updateActiveScene({ subheadline: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Ondertitel (caption)
                    </label>
                    <input
                      type="text"
                      value={activeScene.caption ?? ''}
                      onChange={(e) => updateActiveScene({ caption: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Duur (seconden)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        step={0.2}
                        value={activeScene.durationSec}
                        onChange={(e) =>
                          updateActiveScene({
                            durationSec: Math.max(1, parseFloat(e.target.value) || 2),
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Overgang</label>
                      <select
                        value={activeScene.transition}
                        onChange={(e) =>
                          updateActiveScene({
                            transition: e.target.value as typeof activeScene.transition,
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="fade">Fade</option>
                        <option value="slide-up">Slide Up</option>
                        <option value="wipe-left">Wipe Left</option>
                        <option value="zoom">Zoom</option>
                      </select>
                    </div>
                  </div>

                  {activeScene.editorialMap && (
                    <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                      <p className="text-xs font-semibold text-slate-900">
                        Cartografie, Camera &amp; Fotografie (Scène {selectedSceneIdx + 1})
                      </p>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Beeldtekst Titel (Engels)
                        </label>
                        <input
                          type="text"
                          value={activeScene.editorialMap.titleText}
                          onChange={(e) =>
                            updateActiveScene({
                              headline: e.target.value,
                              editorialMap: {
                                ...activeScene.editorialMap!,
                                titleText: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Beeldtekst Subtitel
                        </label>
                        <input
                          type="text"
                          value={activeScene.editorialMap.subtitleText}
                          onChange={(e) =>
                            updateActiveScene({
                              subheadline: e.target.value,
                              editorialMap: {
                                ...activeScene.editorialMap!,
                                subtitleText: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Camera Zoom Start
                          </label>
                          <input
                            type="number"
                            step={0.1}
                            min={0.7}
                            max={4}
                            value={activeScene.editorialMap.cameraFrom.zoom}
                            onChange={(e) =>
                              updateActiveScene({
                                editorialMap: {
                                  ...activeScene.editorialMap!,
                                  cameraFrom: {
                                    ...activeScene.editorialMap!.cameraFrom,
                                    zoom: parseFloat(e.target.value) || 1.2,
                                  },
                                },
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Camera Zoom Eind
                          </label>
                          <input
                            type="number"
                            step={0.1}
                            min={0.7}
                            max={4}
                            value={activeScene.editorialMap.cameraTo.zoom}
                            onChange={(e) =>
                              updateActiveScene({
                                editorialMap: {
                                  ...activeScene.editorialMap!,
                                  cameraTo: {
                                    ...activeScene.editorialMap!.cameraTo,
                                    zoom: parseFloat(e.target.value) || 2.0,
                                  },
                                },
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Routelijn Kleur</label>
                          <input
                            type="color"
                            value={activeScene.editorialMap.routeColor ?? '#C41E2E'}
                            onChange={(e) =>
                              updateActiveScene({
                                editorialMap: {
                                  ...activeScene.editorialMap!,
                                  routeColor: e.target.value,
                                },
                              })
                            }
                            className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Vogelperspectief (Tilt)
                          </label>
                          <input
                            type="number"
                            step={0.04}
                            min={0}
                            max={0.45}
                            value={activeScene.editorialMap.cameraTo.tilt ?? 0}
                            onChange={(e) =>
                              updateActiveScene({
                                editorialMap: {
                                  ...activeScene.editorialMap!,
                                  cameraTo: {
                                    ...activeScene.editorialMap!.cameraTo,
                                    tilt: parseFloat(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Foto URL / Asset Pad
                        </label>
                        <input
                          type="text"
                          value={activeScene.editorialMap.photoUrl ?? ''}
                          onChange={(e) =>
                            updateActiveScene({
                              editorialMap: {
                                ...activeScene.editorialMap!,
                                photoUrl: e.target.value || undefined,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {activeScene.threeCampervan && (
                    <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                      <p className="text-xs font-semibold text-slate-900">
                        3D Three.js Scène, Karakter &amp; Belichting
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Lichtstemming
                          </label>
                          <select
                            value={activeScene.threeCampervan.lightingMood}
                            onChange={(e) => {
                              const nextMood = e.target.value as
                                | 'golden-hour'
                                | 'morning-mist'
                                | 'alpine-noon';
                              const nextScenes = project.scenes.map((sc) =>
                                sc.threeCampervan
                                  ? {
                                      ...sc,
                                      threeCampervan: {
                                        ...sc.threeCampervan,
                                        lightingMood: nextMood,
                                      },
                                    }
                                  : sc
                              );
                              onUpdateProject({ ...project, scenes: nextScenes });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="golden-hour">Golden Hour</option>
                            <option value="morning-mist">Morning Mist</option>
                            <option value="alpine-noon">Alpine Noon</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Camera FOV (°)
                          </label>
                          <input
                            type="number"
                            min={30}
                            max={58}
                            step={1}
                            value={activeScene.threeCampervan.cameraFov ?? 42}
                            onChange={(e) => {
                              const nextFov = parseInt(e.target.value, 10) || 42;
                              const nextScenes = project.scenes.map((sc) =>
                                sc.threeCampervan
                                  ? {
                                      ...sc,
                                      threeCampervan: {
                                        ...sc.threeCampervan,
                                        cameraFov: nextFov,
                                      },
                                    }
                                  : sc
                              );
                              onUpdateProject({ ...project, scenes: nextScenes });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <label className="text-xs text-slate-600 space-y-1">
                          <span>Campervan</span>
                          <input
                            type="color"
                            value={activeScene.threeCampervan.vanColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nextScenes = project.scenes.map((sc) =>
                                sc.threeCampervan
                                  ? { ...sc, threeCampervan: { ...sc.threeCampervan, vanColor: val } }
                                  : sc
                              );
                              onUpdateProject({ ...project, scenes: nextScenes });
                            }}
                            className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                          />
                        </label>
                        <label className="text-xs text-slate-600 space-y-1">
                          <span>Jas Reiziger</span>
                          <input
                            type="color"
                            value={activeScene.threeCampervan.jacketColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nextScenes = project.scenes.map((sc) =>
                                sc.threeCampervan
                                  ? {
                                      ...sc,
                                      threeCampervan: { ...sc.threeCampervan, jacketColor: val },
                                    }
                                  : sc
                              );
                              onUpdateProject({ ...project, scenes: nextScenes });
                            }}
                            className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                          />
                        </label>
                        <label className="text-xs text-slate-600 space-y-1">
                          <span>Rugzak</span>
                          <input
                            type="color"
                            value={activeScene.threeCampervan.backpackColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nextScenes = project.scenes.map((sc) =>
                                sc.threeCampervan
                                  ? {
                                      ...sc,
                                      threeCampervan: { ...sc.threeCampervan, backpackColor: val },
                                    }
                                  : sc
                              );
                              onUpdateProject({ ...project, scenes: nextScenes });
                            }}
                            className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Titel Overlay (Scène {selectedSceneIdx + 1})
                        </label>
                        <input
                          type="text"
                          value={activeScene.threeCampervan.titleText ?? ''}
                          onChange={(e) =>
                            updateActiveScene({
                              headline: e.target.value || activeScene.headline,
                              threeCampervan: {
                                ...activeScene.threeCampervan!,
                                titleText: e.target.value || undefined,
                                showTitleOverlay: Boolean(e.target.value.trim()),
                              },
                            })
                          }
                          placeholder="Optionele filmtitel..."
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {inspectorTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 font-mono">
                    project.json
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'Gekopieerd' : 'Kopieer'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadProjectJson}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.json</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={jsonDraft}
                  onChange={(e) => setJsonDraft(e.target.value)}
                  rows={16}
                  spellCheck={false}
                  aria-label="OpenMotion project JSON broncode"
                  className="w-full p-3 text-xs font-mono bg-slate-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
                />

                {jsonError && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    {jsonError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleApplyJson}
                  className="w-full py-2 px-4 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Wijzigingen toepassen op preview
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyRemixPrompt()}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {copiedRemix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedRemix
                      ? 'ChatGPT Remix-prompt gekopieerd'
                      : 'Kopieer reproduceerbare ChatGPT Remix-prompt'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
