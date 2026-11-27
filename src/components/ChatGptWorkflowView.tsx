import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  FileJson2,
  GitCommitHorizontal,
  Play,
  Plus,
} from 'lucide-react';
import {
  buildChatGptPrompt,
  commitProjectToGitHub,
  normalizeOpenMotionProject,
} from '../services/githubService';
import {
  AspectFormat,
  GitHubRepoConfig,
  OpenMotionProject,
} from '../types/openmotion';
import { CanvasPreview } from './CanvasPreview';
import { activeTemplate, episodePrompt, nextEpisode, type SeriesDefinition } from '../services/series';

interface ChatGptWorkflowViewProps {
  repoConfig: GitHubRepoConfig;
  series?: SeriesDefinition;
  projects?: OpenMotionProject[];
  onAddProject: (project: OpenMotionProject, openInStudio?: boolean) => void;
}

const EXAMPLE_CHATGPT_JSON = `{
  "schemaVersion": "1.0",
  "slug": "ai-support-demo-2026",
  "title": "Klantservice Automatisering — Product Demo",
  "description": "Gegenereerd door ChatGPT als OpenMotion project voor directe MP4-publicatie via GitHub Pages.",
  "category": "Product Launch",
  "author": "ChatGPT",
  "source": "chatgpt",
  "format": "16:9",
  "fps": 30,
  "brandKit": {
    "brandName": "HelderDesk",
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
      "name": "Introductie",
      "durationSec": 3.0,
      "layout": "hero-kinetic",
      "transition": "fade",
      "backdrop": "grid-architectural",
      "eyebrow": "HelderDesk 2026",
      "headline": "Antwoord binnen 12 seconden op elke klantvraag",
      "subheadline": "Geautomatiseerde kennisbank gekoppeld aan je eigen documentatie."
    },
    {
      "id": "sc-2",
      "name": "Resultaten",
      "durationSec": 3.4,
      "layout": "metric-spotlight",
      "transition": "slide-up",
      "backdrop": "radial-studio",
      "eyebrow": "Klantresultaten Q4",
      "headline": "Bewezen sneller zonder verlies van kwaliteit",
      "metrics": [
        { "label": "Eerste reactietijd", "value": "12s", "delta": "-81% wachttijd" },
        { "label": "Klanttevredenheid", "value": "96%", "delta": "+14% t.o.v. 2025" },
        { "label": "Opgelost zonder wachtrij", "value": "74%", "delta": "24/7 actief" }
      ]
    },
    {
      "id": "sc-3",
      "name": "Slot",
      "durationSec": 2.8,
      "layout": "outro-cta",
      "transition": "zoom",
      "backdrop": "radial-studio",
      "eyebrow": "HelderDesk",
      "headline": "Start vandaag met jouw eigen proefomgeving",
      "subheadline": "helderdesk.nl · Direct exporteerbaar als MP4",
      "ctaText": "Vraag demo aan"
    }
  ]
}`;

export function ChatGptWorkflowView({
  repoConfig,
  onAddProject,
  series,
  projects=[],
}: ChatGptWorkflowViewProps) {
  const template=series?activeTemplate(series):undefined;
  const next=series?nextEpisode(projects,series.id):undefined;
  const [topic, setTopic] = useState(
    series ? '' : 'Lancering van onze nieuwe automatische facturatie-koppeling voor MKB-teams'
  );
  const [brandName, setBrandName] = useState(template?.brandKit.brandName??'Studio Noord');
  const [format, setFormat] = useState<AspectFormat>(template?.format??'16:9');
  const [tone, setTone] = useState(template?.instructions??'Strak, modern, zakelijk en direct to-the-point');
  const [durationSec, setDurationSec] = useState(template?.durationSec??10);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [pastedJson, setPastedJson] = useState('');
  const [commitFeedback, setCommitFeedback] = useState<{
    type: 'idle' | 'working' | 'success' | 'error';
    text?: string;
    url?: string;
  }>({ type: 'idle' });

  const generatedPrompt = useMemo(
    () =>
      (series?episodePrompt(series,projects,repoConfig.owner+'/'+repoConfig.repo).replace('[vul onderwerp in]',topic||'[vul onderwerp in]')+'\n\nOnderstaande generieke schema-instructies zijn aanvullend. De serie-instellingen en versie hierboven hebben voorrang.\n\n':'')+buildChatGptPrompt({
        topic,
        brandName,
        format,
        tone,
        durationSec,
        repoSlug: `${repoConfig.owner}/${repoConfig.repo}`,
      }),
    [topic, brandName, format, tone, durationSec, repoConfig.owner, repoConfig.repo, series, projects]
  );

  const validation = useMemo(() => {
    if (!pastedJson.trim()) {
      return { project: null as OpenMotionProject | null, error: null as string | null };
    }
    try {
      const cleaned = pastedJson
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');
      const raw = JSON.parse(cleaned);
      if(series&&template&&next){
        if(!raw||typeof raw!=='object'||Array.isArray(raw)) throw Error('Verwacht een projectobject.');
        if(raw.seriesId&&raw.seriesId!==series.id) throw Error('Deze JSON hoort bij een andere serie.');
        if(raw.templateVersion&&raw.templateVersion!==template.version) throw Error('Deze JSON verwijst naar een andere templateversie.');
        if(raw.season!==undefined&&raw.season!==next.season||raw.episodeNumber!==undefined&&raw.episodeNumber!==next.episodeNumber) throw Error('Controleer het vrije afleveringsnummer: seizoen '+next.season+', aflevering '+next.episodeNumber+'.');
      }
      const parsed=series&&template&&next?{...raw,kind:'video',seriesId:series.id,season:next.season,episodeNumber:next.episodeNumber,templateVersion:template.version,productionStatus:raw.productionStatus??'review',format:raw.format??template.format,fps:raw.fps??template.fps,brandKit:{...template.brandKit,...raw.brandKit}}:raw;
      const res = normalizeOpenMotionProject(parsed, 'chatgpt-video');
      if(series&&res.project&&projects.some(p=>p.slug===res.project?.slug)) throw Error('Deze slug bestaat al. Kies een unieke slug voor de nieuwe aflevering.');
      return {
        project: res.project ?? null,
        error: res.error ?? null,
      };
    } catch (err) {
      return {
        project: null,
        error: err instanceof Error ? `JSON fout: ${err.message}` : 'Ongeldige JSON-syntaxis.',
      };
    }
  }, [pastedJson, series, template, next?.season, next?.episodeNumber, projects]);

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  };

  const handleSaveAndCommit = async () => {
    if (!validation.project) return;
    setCommitFeedback({ type: 'working', text: 'Bezig met committen naar GitHub...' });
    try {
      const res = await commitProjectToGitHub(repoConfig, validation.project);
      const committed: OpenMotionProject = {
        ...validation.project,
        source: 'github',
        commitSha: res.commitSha,
      };
      onAddProject(committed, false);
      setCommitFeedback({
        type: 'success',
        text: `Toegevoegd aan bibliotheek en gecommit (${res.commitSha}).`,
        url: res.htmlUrl,
      });
    } catch (err) {
      setCommitFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'GitHub commit mislukt.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-2 pb-6 border-b border-slate-200">
        <p className="text-xs font-medium text-blue-700 font-mono">
          ChatGPT → GitHub Project → OpenMotion Bibliotheek
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-balance">
          {series ? 'Nieuwe aflevering · '+series.title : 'ChatGPT OpenMotion Workflow'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Laat ChatGPT een video-project in het OpenMotion-schema genereren, commit het bestand als{' '}
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
            projects/&lt;slug&gt;/project.json
          </code>{' '}
          naar GitHub of plak de JSON direct hieronder om hem meteen te bekijken en als MP4 te
          exporteren.
        </p>
      </section>

      {series&&template&&next&&<section className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-2"><p className="font-semibold">Seizoen {next.season} · Aflevering {next.episodeNumber} · Template v{template.version}</p><p className="text-slate-600">{template.instructions}</p><p className="text-slate-500">{template.format} · {template.fps} fps · {template.durationSec} sec</p></section>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Step 01: Prompt Builder for ChatGPT */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              01. ChatGPT Prompt samenstellen
            </h2>
            <p className="text-xs text-slate-600">
              Kopieer deze prompt naar ChatGPT (of je Custom GPT met GitHub-koppeling) zodat de
              output direct voldoet aan je bibliotheek-schema.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Video-onderwerp
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Merknaam</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Richtduur (seconden)
                </label>
                <input
                  type="number"
                  min={6}
                  max={600}
                  value={durationSec}
                  onChange={(e) => setDurationSec(Math.max(6, Number(e.target.value) || 10))}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Videoformaat
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['16:9', '9:16', '1:1'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                        format === fmt
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Stijl & toon
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Kopieerbare ChatGPT-prompt
              </span>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Gekopieerd</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopieer Prompt</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono bg-slate-950 text-slate-200 rounded-lg overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">
              {generatedPrompt}
            </pre>
          </div>
        </section>

        {/* Step 02: Paste ChatGPT JSON + Live Preview + Import/Commit */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                02. ChatGPT JSON importeren
              </h2>
              <p className="text-xs text-slate-600">
                Plak de JSON uit ChatGPT om direct te valideren, live te bekijken en aan je
                bibliotheek of GitHub-repo toe te voegen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPastedJson(EXAMPLE_CHATGPT_JSON)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <FileJson2 className="w-3.5 h-3.5" />
              <span>Laad voorbeeld</span>
            </button>
          </div>

          <textarea
            rows={11}
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
            placeholder='Plak hier de JSON output van ChatGPT (bijv. { "title": "...", "scenes": [...] })...'
            spellCheck={false}
            aria-label="ChatGPT OpenMotion JSON invoer"
            className="w-full p-3.5 text-xs font-mono bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:border-blue-600 focus:bg-white focus:outline-none"
          />

          {validation.error && (
            <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">
              {validation.error}
            </div>
          )}

          {validation.project && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700">
                  Geldig OpenMotion-project gedetecteerd
                </span>
                <span className="font-mono text-slate-500">
                  {validation.project.format} · {validation.project.scenes.length} scènes
                </span>
              </div>

              <div className="aspect-video bg-[#0B0F17] rounded-lg overflow-hidden flex items-center justify-center p-2">
                <CanvasPreview
                  project={validation.project}
                  timeSec={0.8}
                  isPlaying={true}
                  renderScale={0.42}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onAddProject(validation.project!, true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Open in Studio & Render MP4</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddProject(validation.project!, false)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Opslaan in Bibliotheek</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndCommit}
                  disabled={commitFeedback.type === 'working'}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  <GitCommitHorizontal className="w-3.5 h-3.5" />
                  <span>Commit naar GitHub</span>
                </button>
              </div>
            </div>
          )}

          {commitFeedback.type !== 'idle' && commitFeedback.text && (
            <div
              role="status"
              className={`p-3 text-xs rounded-lg border flex items-center justify-between gap-3 ${
                commitFeedback.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <span>{commitFeedback.text}</span>
              {commitFeedback.url && (
                <a
                  href={commitFeedback.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline shrink-0"
                >
                  Open commit
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
