import { useEffect, useRef, useState } from 'react';
import { ChatGptWorkflowView } from './components/ChatGptWorkflowView';
import { GitHubPagesView } from './components/GitHubPagesView';
import { LibraryView } from './components/LibraryView';
import { StudioView } from './components/StudioView';
import { SAMPLE_OPENMOTION_PROJECTS } from './data/sampleProjects';
import {
  DEFAULT_GITHUB_CONFIG,
  detectGitHubPagesConfig,
  fetchProjectsFromGitHub,
  normalizeOpenMotionProject,
} from './services/githubService';
import { GitHubRepoConfig, OpenMotionProject } from './types/openmotion';

type AppTab = 'library' | 'studio' | 'chatgpt' | 'github';

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
} {
  if (typeof window === 'undefined') return { tab: 'library' };
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw || raw === 'library') return { tab: 'library' };
  if (raw === 'chatgpt') return { tab: 'chatgpt' };
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
  const initialRoute = parseHashRoute(projects);
  const [activeTab, setActiveTab] = useState<AppTab>(initialRoute.tab);
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
        : `#${activeTab}`;
    if (window.location.hash !== desiredHash) {
      window.history.replaceState(null, '', desiredHash);
    }
  }, [activeTab, selectedProjectId, projects]);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashRoute(projects);
      setActiveTab(parsed.tab);
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
    setSelectedProjectId(project.id);
    setAutoStartExport(startExport);
    setActiveTab('studio');
  };

  const handleUpdateProject = (updated: OpenMotionProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddProject = (project: OpenMotionProject, openInStudio = false) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.slug === project.slug);
      if (exists) {
        return prev.map((p) => (p.slug === project.slug ? { ...project, id: p.id } : p));
      }
      return [project, ...prev];
    });
    setSelectedProjectId(project.id);
    setActiveTab(openInStudio ? 'studio' : 'library');
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

  const navItems: Array<{ id: AppTab; label: string }> = [
    { id: 'library', label: 'Bibliotheek' },
    { id: 'studio', label: 'Studio & MP4' },
    { id: 'chatgpt', label: 'ChatGPT Workflow' },
    { id: 'github', label: 'GitHub Pages' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left"
          >
            OpenMotion Vault
          </button>

          {/* Zone 2: 4 concise single-line text nav links */}
          <nav
            aria-label="Hoofdnavigatie"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-blue-600 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chatgpt')}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Nieuw Project
            </button>
          </div>
        </div>

        {/* Mobile navigation strip (keeps total header height compact) */}
        <nav
          aria-label="Mobiele navigatie"
          className="md:hidden flex items-center gap-4 px-4 overflow-x-auto border-t border-slate-100 bg-white"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-2.5 text-xs font-medium border-b-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'library' && (
          <LibraryView
            projects={projects}
            repoConfig={repoConfig}
            isSyncing={isSyncing}
            syncMessage={syncMessage}
            onSyncGitHub={handleSyncGitHub}
            onOpenStudio={handleOpenStudio}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'studio' && activeProject && (
          <StudioView
            project={activeProject}
            repoConfig={repoConfig}
            autoStartExport={autoStartExport}
            onConsumeAutoStart={() => setAutoStartExport(false)}
            onUpdateProject={handleUpdateProject}
            onBackToLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'chatgpt' && (
          <ChatGptWorkflowView repoConfig={repoConfig} onAddProject={handleAddProject} />
        )}

        {activeTab === 'github' && (
          <GitHubPagesView
            repoConfig={repoConfig}
            projects={projects}
            isSyncing={isSyncing}
            syncMessage={syncMessage}
            onUpdateConfig={setRepoConfig}
            onSyncGitHub={handleSyncGitHub}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            OpenMotion Vault · Video-as-Code Bibliotheek voor GitHub Pages &amp; Client-Side H.264
            MP4
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/nexu-io/openmotion"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              nexu-io/openmotion
            </a>
            <button
              type="button"
              onClick={() => setActiveTab('github')}
              className="hover:text-slate-900 transition-colors"
            >
              GitHub Actions Setup
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
