import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FolderGit2,
  Package,
  RefreshCw,
} from 'lucide-react';
import {
  downloadGitHubRepoKitZip,
  generateGitHubWorkflowYaml,
} from '../services/githubService';
import { GitHubRepoConfig, OpenMotionProject } from '../types/openmotion';

interface GitHubPagesViewProps {
  repoConfig: GitHubRepoConfig;
  projects: OpenMotionProject[];
  isSyncing: boolean;
  syncMessage: string | null;
  onUpdateConfig: (next: GitHubRepoConfig) => void;
  onSyncGitHub: () => void;
}

export function GitHubPagesView({
  repoConfig,
  projects,
  isSyncing,
  syncMessage,
  onUpdateConfig,
  onSyncGitHub,
}: GitHubPagesViewProps) {
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const workflowYaml = useMemo(() => generateGitHubWorkflowYaml(repoConfig), [repoConfig]);
  const hasWebCodecs = typeof window !== 'undefined' && 'VideoEncoder' in window;
  const isHostedOnGitHubPages =
    typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');

  const readinessChecks = [
    {
      label: 'Relatieve asset-paden (base: "./")',
      detail: 'Werkt direct op https://<user>.github.io/<repo>/ subpaden',
      ok: true,
    },
    {
      label: 'Jekyll bypass & SPA fallback',
      detail: 'public/.nojekyll + automatische dist/404.html kopie bij build',
      ok: true,
    },
    {
      label: 'Hash deep-linking voor video’s',
      detail: 'Deelbare URL’s zoals #studio/<slug> zonder server-rewrites',
      ok: true,
    },
    {
      label: 'Statische project-indexering',
      detail: 'scripts/build-manifest.mjs bouwt projects/manifest.json in CI',
      ok: true,
    },
    {
      label: 'Client-side H.264 MP4 Encoder',
      detail: hasWebCodecs
        ? 'WebCodecs VideoEncoder actief in deze browser (1080p MP4)'
        : 'MediaRecorder fallback actief (gebruik Chrome/Edge/Safari voor H.264 MP4)',
      ok: hasWebCodecs,
    },
  ];

  const handleCopyYaml = async () => {
    await navigator.clipboard.writeText(workflowYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 1800);
  };

  const handleDownloadKit = async () => {
    setIsZipping(true);
    try {
      await downloadGitHubRepoKitZip(projects, repoConfig);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-blue-700 font-mono">
            GitHub Repository · GitHub Actions · GitHub Pages MP4 Hosting
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-balance">
            GitHub & GitHub Pages Koppeling
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Koppel jouw eigen GitHub-repository om OpenMotion-projecten live op te halen, of
            download de complete GitHub Pages Repo Kit inclusief GitHub Actions workflow en alle
            projectbestanden.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadKit}
          disabled={isZipping}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>{isZipping ? 'ZIP genereren...' : 'Download GitHub Repo Kit (.zip)'}</span>
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Repository Connection Form */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">01. Repository instellingen</h2>
            <p className="text-xs text-slate-600">
              Publieke repositories werken zonder token. Voeg alleen een Fine-grained Personal
              Access Token toe als je privé-repos wilt lezen of vanuit de Studio wilt committen.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  GitHub Owner / Org
                </label>
                <input
                  type="text"
                  value={repoConfig.owner}
                  onChange={(e) => {
                    const owner = e.target.value;
                    onUpdateConfig({
                      ...repoConfig,
                      owner,
                      pagesBaseUrl: `https://${owner}.github.io/${repoConfig.repo}`,
                    });
                  }}
                  placeholder="bijv. nexu-io"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Repository naam
                </label>
                <input
                  type="text"
                  value={repoConfig.repo}
                  onChange={(e) => {
                    const repo = e.target.value;
                    onUpdateConfig({
                      ...repoConfig,
                      repo,
                      pagesBaseUrl: `https://${repoConfig.owner}.github.io/${repo}`,
                    });
                  }}
                  placeholder="openmotion-library"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Branch</label>
                <input
                  type="text"
                  value={repoConfig.branch}
                  onChange={(e) => onUpdateConfig({ ...repoConfig, branch: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Projecten-map
                </label>
                <input
                  type="text"
                  value={repoConfig.projectsDir}
                  onChange={(e) => onUpdateConfig({ ...repoConfig, projectsDir: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                GitHub Pages URL
              </label>
              <input
                type="url"
                value={repoConfig.pagesBaseUrl}
                onChange={(e) => onUpdateConfig({ ...repoConfig, pagesBaseUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                GitHub Personal Access Token (optioneel, alleen lokaal opgeslagen)
              </label>
              <input
                type="password"
                value={repoConfig.token}
                onChange={(e) => onUpdateConfig({ ...repoConfig, token: e.target.value })}
                placeholder="github_pat_..."
                autoComplete="off"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onSyncGitHub}
              disabled={isSyncing}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? 'Projecten ophalen via GitHub API...'
                  : 'Synchroniseer projecten vanuit GitHub'}
              </span>
            </button>

            {syncMessage && (
              <div
                role="status"
                className="p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {syncMessage}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Verwachte mapstructuur in GitHub</p>
            <pre className="p-3 font-mono bg-slate-50 border border-slate-200 rounded-lg text-[11px] leading-relaxed text-slate-700 overflow-x-auto">{`${repoConfig.repo}/
├── .github/workflows/openmotion-pages.yml
├── ${repoConfig.projectsDir}/
│   ├── manifest.json
│   └── <chatgpt-slug>/
│       └── project.json
└── README.md`}</pre>
          </div>
        </section>

        {/* Right: GitHub Actions YAML + Pages Architecture */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  02. GitHub Actions Deploy Workflow
                </h2>
                <p className="text-xs text-slate-600 font-mono">
                  .github/workflows/openmotion-pages.yml
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyYaml}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {copiedYaml ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Gekopieerd</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopieer YAML</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadKit}
                  disabled={isZipping}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP Kit</span>
                </button>
              </div>
            </div>

            <pre className="p-4 text-xs font-mono bg-slate-950 text-slate-200 rounded-lg overflow-x-auto max-h-96 leading-relaxed">
              {workflowYaml}
            </pre>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                03. GitHub Pages Gereedheid &amp; MP4-Architectuur
              </h2>
              <span className="text-xs font-mono text-slate-500">
                {isHostedOnGitHubPages ? 'Live op github.io' : 'Klaar voor GitHub Pages deploy'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {readinessChecks.map((item) => (
                <div
                  key={item.label}
                  className="px-4 py-3 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-slate-600">{item.detail}</p>
                  </div>
                  <span
                    className={`font-mono font-medium shrink-0 ${
                      item.ok ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {item.ok ? 'Gereed' : 'Fallback'}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600 pt-1">
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900">Direct in de browser (WebCodecs)</p>
                <p className="text-xs leading-relaxed">
                  De bibliotheek op GitHub Pages bevat een ingebouwde H.264 MP4-encoder op basis
                  van WebCodecs en <code className="font-mono">mp4-muxer</code>. Elke bezoeker kan
                  zonder backend-server een 720p of 1080p MP4 renderen en downloaden.
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900">
                  Compatibel met nexu-io/openmotion
                </p>
                <p className="text-xs leading-relaxed">
                  Projecten volgen het video-as-code model: scènes, brand kits en kopie staan in
                  versiebeheerde JSON. Zodra ChatGPT een nieuw project pusht, verschijnt het na
                  deploy direct in je GitHub Pages bibliotheek.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <FolderGit2 className="w-4 h-4 text-slate-400" />
                <span>{projects.length} project(en) inbegrepen in de ZIP export</span>
              </div>
              <a
                href="https://github.com/nexu-io/openmotion"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:underline"
              >
                <span>Bekijk nexu-io/openmotion op GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
