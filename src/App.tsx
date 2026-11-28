import { PresenterLab } from './components/PresenterLab';
import { useEffect, useRef, useState } from 'react';
import { ChatGptWorkflowView } from './components/ChatGptWorkflowView';
import { GitHubPagesView } from './components/GitHubPagesView';
import { WorkspaceView, type WorkspaceTab } from './components/WorkspaceView';
import { episodeInfo, seriesById, type SeriesDefinition } from './services/series';
import { Archive, Clapperboard, Film, LayoutDashboard, LayoutTemplate, Layers, Menu, MessageSquare, Plus, Settings } from 'lucide-react';
import { StudioView } from './components/StudioView';
import { SAMPLE_OPENMOTION_PROJECTS } from './data/sampleProjects';
import {
  DEFAULT_GITHUB_CONFIG,
  detectGitHubPagesConfig,
  fetchProjectsFromGitHub,
  normalizeOpenMotionProject,
} from './services/githubService';
import { GitHubRepoConfig, OpenMotionProject } from './types/openmotion';

type AppTab = WorkspaceTab | 'studio' | 'chatgpt' | 'github' | 'presenter-lab';

const STORAGE_PROJECTS_KEY = 'openmotion_library_projects_v1';
const STORAGE_REPO_KEY = 'openmotion_github_config_v1';

function loadSavedProjects(): OpenMotionProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) return SAMPLE_OPENMOTION_PROJECTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const saved = parsed as OpenMotionProject[];
      const savedSlugs = new Set(saved.map((p) => p.slug));
      const newBuiltIns = SAMPLE_OPENMOTION_PROJECTS.filter((p) => !savedSlugs.has(p.slug));
      return [...newBuiltIns, ...saved];
    }
  } catch {
    // Fallback to curated samples
  }
  return SAMPLE_OPENMOTION_PROJECTS;
}

function loadSavedRepoConfig(): GitHubRepoConfig {
  const detected = detectGitHubPagesConfig();
  try {
    const raw = localStorage.getItem(STORAGE_REPO_KEY);
    if (!raw) return detected;
    const saved = JSON.parse(raw) as Partial<GitHubRepoConfig>;
    const isPlaceholder = !saved.owner || saved.owner === DEFAULT_GITHUB_CONFIG.owner;
    if (isPlaceholder && detected.owner !== DEFAULT_GITHUB_CONFIG.owner) {
      return { ...detected, token: saved.token ?? '' };
    }
    return { ...detected, ...saved };
  } catch {
    return detected;
  }
}

function parseHashRoute(projects: OpenMotionProject[]): {
  tab: AppTab;
  projectId?: string;
  requestedSlug?: string;
  seriesId?: string;
} {
  if (typeof window === 'undefined') return { tab: 'library' };
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw || raw === 'dashboard') return { tab: 'dashboard' };
  if (raw === 'library' || raw === 'series' || raw === 'templates' || raw === 'archive') return {tab:raw};
  if (raw.startsWith('series/')) {
    const id = raw.slice('series/'.length);
    return {tab:'series',seriesId:seriesById(id)?.id};
  }
  if (raw === 'chatgpt') return { tab: 'chatgpt' };
  if(raw.startsWith('chatgpt/'))return {tab:'chatgpt',seriesId:seriesById(raw.slice('chatgpt/'.length))?.id};
  if (raw === 'presenter-lab') return { tab: 'presenter-lab' };
  if (raw === 'github') return { tab: 'github' };
  if (raw === 'studio') return { tab: 'studio' };
  if (raw.startsWith('studio/')) {
    const slug = decodeURIComponent(raw.slice('studio/'.length));
    const match = projects.find((p) => p.slug === slug);
    return { tab: 'studio', projectId: match?.id, requestedSlug: slug };
  }
  return { tab: 'library' };
}

export default function App() {
  const [projects, setProjects] = useState<OpenMotionProject[]>(loadSavedProjects);
  const [initialRoute] = useState(()=>parseHashRoute(projects));
  const [activeTab, setActiveTab] = useState<AppTab>(initialRoute.tab);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string|null>(initialRoute.seriesId??null);
  const [workflowSeries, setWorkflowSeries] = useState<SeriesDefinition|undefined>(()=>initialRoute.tab==='chatgpt'?seriesById(initialRoute.seriesId):undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const returnTabRef = useRef<WorkspaceTab>(initialRoute.tab === 'studio' ? 'library' : 'dashboard');
  const returnSeriesRef = useRef<string|null>(null);
  const navigate = (tab:AppTab) => {
    pendingDeepLinkSlugRef.current = null;
    setMenuOpen(false);
    if (tab==='series') setSelectedSeriesId(null);
    if (tab==='chatgpt') setWorkflowSeries(undefined);
    setActiveTab(tab);
  };
  const openSeries = (id:string|null) => {pendingDeepLinkSlugRef.current=null;setSelectedSeriesId(id);setActiveTab('series');setMenuOpen(false);};
  const newEpisode = (s:SeriesDefinition) => {pendingDeepLinkSlugRef.current=null;setWorkflowSeries(s);setActiveTab('chatgpt');setMenuOpen(false);};
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => initialRoute.projectId ?? projects[0]?.id ?? SAMPLE_OPENMOTION_PROJECTS[0].id
  );
  const pendingDeepLinkSlugRef = useRef<string | null>(
    initialRoute.requestedSlug && !initialRoute.projectId ? initialRoute.requestedSlug : null
  );
  const [autoStartExport, setAutoStartExport] = useState(false);

  const [repoConfig, setRepoConfig] = useState<GitHubRepoConfig>(loadSavedRepoConfig);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Sync URL hash for GitHub Pages deep-linking (#library, #studio/<slug>, #chatgpt, #github)
  useEffect(() => {
    if (pendingDeepLinkSlugRef.current) return;
    const current = projects.find((p) => p.id === selectedProjectId);
    const desiredHash =
      activeTab === 'studio' && current
        ? `#studio/${encodeURIComponent(current.slug)}`
        : activeTab === 'series' && selectedSeriesId ? `#series/${selectedSeriesId}` : activeTab==='chatgpt'&&workflowSeries ? `#chatgpt/${workflowSeries.id}` : `#${activeTab}`;
    if (window.location.hash !== desiredHash) {
      window.history.replaceState(null, '', desiredHash);
    }
  }, [activeTab, selectedProjectId, selectedSeriesId, workflowSeries, projects]);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashRoute(projects);
      setActiveTab(parsed.tab);
      setSelectedSeriesId(parsed.seriesId??null);
      setWorkflowSeries(parsed.tab==='chatgpt'?seriesById(parsed.seriesId):undefined);
      pendingDeepLinkSlugRef.current=parsed.requestedSlug&&!parsed.projectId?parsed.requestedSlug:null;
      if (parsed.projectId) {
        setSelectedProjectId(parsed.projectId);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [projects]);

  // Persist user library & GitHub config locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // Ignore quota issues
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REPO_KEY, JSON.stringify(repoConfig));
    } catch {
      // Ignore quota issues
    }
  }, [repoConfig]);

  // If hosted statically on GitHub Pages with a generated projects/manifest.json, load those projects automatically
  useEffect(() => {
    let cancelled = false;
    async function loadStaticPagesManifest() {
      try {
        const res = await fetch('./projects/manifest.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { projects?: unknown[] };
        if (!Array.isArray(data.projects) || data.projects.length === 0) return;
        const normalized: OpenMotionProject[] = [];
        for (const item of data.projects) {
          const parsed = normalizeOpenMotionProject(item);
          if (parsed.project) normalized.push(parsed.project);
        }
        if (!cancelled && normalized.length > 0) {
          setProjects((prev) => {
            const bySlug = new Map(prev.map((p) => [p.slug, p]));
            for (const p of normalized) {
              bySlug.set(p.slug, p);
            }
            return Array.from(bySlug.values());
          });
          if (pendingDeepLinkSlugRef.current) {
            const match = normalized.find((p) => p.slug === pendingDeepLinkSlugRef.current);
            if (match) {
              setSelectedProjectId(match.id);
              setActiveTab('studio');
            }
          }
        }
      } catch {
        // Not deployed with a static manifest yet — use local library
      } finally {
        pendingDeepLinkSlugRef.current = null;
      }
    }
    void loadStaticPagesManifest();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) ?? projects[0] ?? SAMPLE_OPENMOTION_PROJECTS[0];

  const handleOpenStudio = (project: OpenMotionProject, startExport = false) => {
    pendingDeepLinkSlugRef.current=null;
    const ep=episodeInfo(project);
    returnTabRef.current=activeTab==='templates'||activeTab==='archive'||activeTab==='dashboard'||activeTab==='library'?activeTab:ep?'series':'library';
    returnSeriesRef.current=ep?.seriesId??null;
    setSelectedProjectId(project.id);
    setAutoStartExport(startExport);
    setActiveTab('studio');
  };

  const handleUpdateProject = (updated: OpenMotionProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddProject = (project: OpenMotionProject, openInStudio = false) => {
    const ep=episodeInfo(project);
    const existingId=projects.find(p=>p.slug===project.slug)?.id;
    const finalProject=existingId?{...project,id:existingId}:project;
    returnTabRef.current=ep?'series':'library';
    returnSeriesRef.current=ep?.seriesId??null;
    setProjects((prev) => {
      const exists = prev.some((p) => p.slug === project.slug);
      if (exists) {
        return prev.map((p) => (p.slug === project.slug ? { ...project, id: p.id } : p));
      }
      return [project, ...prev];
    });
    setSelectedProjectId(finalProject.id);
    setSelectedSeriesId(ep?.seriesId??null);
    setActiveTab(openInStudio ? 'studio' : ep?'series':'library');
  };

  const handleSyncGitHub = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await fetchProjectsFromGitHub(repoConfig);
      if (result.projects.length > 0) {
        setProjects((prev) => {
          const map = new Map(prev.map((p) => [p.slug, p]));
          for (const remote of result.projects) {
            map.set(remote.slug, remote);
          }
          return Array.from(map.values());
        });
      }
      setSyncMessage(result.message);
    } catch (err) {
      setSyncMessage(
        err instanceof Error ? err.message : 'Synchronisatie met GitHub mislukt.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const navItems = [
    {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
    {id:'series',label:'Series',icon:Layers},
    {id:'library',label:"Alle video's",icon:Film},
    {id:'templates',label:'Templates',icon:LayoutTemplate},
    {id:'archive',label:'Archief',icon:Archive},
    {id:'chatgpt',label:'ChatGPT Workflow',icon:MessageSquare},
    {id:'presenter-lab',label:'Presenter Lab',icon:Film},
    {id:'github',label:'Instellingen & GitHub',icon:Settings},
  ] as const;
  const isWorkspace = activeTab !== 'studio' && activeTab !== 'chatgpt' && activeTab !== 'github' && activeTab !== 'presenter-lab';
  const backFromStudio=()=>{
    if(returnTabRef.current==='series'||(initialRoute.tab==='studio'&&episodeInfo(activeProject))){
      openSeries(returnSeriesRef.current??episodeInfo(activeProject)?.seriesId??null);
    }else navigate(returnTabRef.current);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 h-16 flex items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" className="lg:hidden p-2 rounded-lg hover:bg-slate-100" aria-label="Menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><Menu className="w-5 h-5"/></button>
          <button onClick={()=>navigate('dashboard')} className="flex items-center gap-2 font-semibold tracking-tight text-base sm:text-lg truncate"><Clapperboard className="w-5 h-5 shrink-0"/><span>OpenMotion Studio</span></button>
        </div>
        <button onClick={()=>navigate('chatgpt')} className="shrink-0 flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm"><Plus className="w-4 h-4"/><span>Nieuwe video</span></button>
      </header>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {menuOpen&&<button aria-label="Sluit menu" className="lg:hidden fixed inset-0 top-16 z-30 bg-black/25" onClick={()=>setMenuOpen(false)}/>}
        <aside className={`${menuOpen?'flex':'hidden'} lg:flex fixed lg:sticky top-16 z-40 lg:z-10 bg-white w-56 shrink-0 h-[calc(100dvh-4rem)] border-r border-slate-200 flex-col overflow-y-auto p-3`}>
          <nav aria-label="Hoofdnavigatie" className="space-y-1">
            {navItems.map(({id,label,icon:Icon},i)=><div key={id}>{i===5&&<div className="border-t border-slate-200 my-3"/>}<button onClick={()=>navigate(id)} aria-current={activeTab===id?'page':undefined} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm ${activeTab===id?'bg-slate-100 font-semibold text-slate-900':'text-slate-600 hover:bg-slate-50'}`}><Icon className="w-4 h-4 shrink-0"/>{label}</button></div>)}
          </nav>
          <div className="mt-auto px-3 py-3 text-xs text-slate-400">GitHub Pages · OpenMotion</div>
        </aside>
        <main className="flex-1 min-w-0 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {isWorkspace&&<WorkspaceView key={activeTab} tab={activeTab as WorkspaceTab} projects={projects} repoConfig={repoConfig} selectedSeriesId={selectedSeriesId} onSeries={openSeries} onNavigate={navigate} onOpenStudio={handleOpenStudio} onNewEpisode={newEpisode} onNewProject={()=>navigate('chatgpt')} onSync={handleSyncGitHub} isSyncing={isSyncing} syncMessage={syncMessage}/>}
          {activeTab==='studio'&&activeProject&&<StudioView key={activeProject.id} project={activeProject} repoConfig={repoConfig} autoStartExport={autoStartExport} onConsumeAutoStart={()=>setAutoStartExport(false)} onUpdateProject={handleUpdateProject} onBackToLibrary={backFromStudio}/>}
          {activeTab==='chatgpt'&&<ChatGptWorkflowView key={workflowSeries?.id??'standalone'} repoConfig={repoConfig} onAddProject={handleAddProject} series={workflowSeries} projects={projects}/>}
          {activeTab==='presenter-lab'&&<PresenterLab projects={projects}/>}
          {activeTab==='github'&&<GitHubPagesView repoConfig={repoConfig} projects={projects} isSyncing={isSyncing} syncMessage={syncMessage} onUpdateConfig={setRepoConfig} onSyncGitHub={handleSyncGitHub}/>}
        </main>
      </div>
    </div>
  );
}
