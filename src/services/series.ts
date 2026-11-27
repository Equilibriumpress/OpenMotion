import catalog from '../../series/catalog.json';
import type { AspectFormat, OpenMotionBrandKit, OpenMotionProject, ProjectKind } from '../types/openmotion';

export interface SeriesTemplate {
  version: string;
  format: AspectFormat;
  fps: number;
  durationSec: number;
  referenceProject: string | null;
  templatePath: string;
  instructions: string;
  brandKit: OpenMotionBrandKit;
}
export interface SeriesDefinition {
  id: string;
  title: string;
  description: string;
  activeVersion: string;
  versions: SeriesTemplate[];
  episodes: {slug:string; season:number; episodeNumber:number; templateVersion:string}[];
}
export const SERIES = catalog.series as SeriesDefinition[];
export const seriesById = (id?: string) => SERIES.find(s => s.id === id);
export function activeTemplate(s: SeriesDefinition) {
  return s.versions.find(v => v.version === s.activeVersion) ?? s.versions[0];
}
export function episodeInfo(p: OpenMotionProject) {
  if (p.seriesId) return {seriesId:p.seriesId, season:p.season ?? 1, episodeNumber:p.episodeNumber ?? 0, templateVersion:p.templateVersion};
  for (const s of SERIES) {
    const ep = s.episodes.find(e => e.slug === p.slug);
    if (ep) return {seriesId:s.id, season:ep.season, episodeNumber:ep.episodeNumber, templateVersion:ep.templateVersion};
  }
  return undefined;
}
export function projectKind(p: OpenMotionProject): ProjectKind {
  if (p.kind) return p.kind;
  if (episodeInfo(p) || catalog.standaloneVideos.includes(p.slug)) return 'video';
  if (catalog.exampleTemplates.includes(p.slug) || p.slug.startsWith('opendesign-') || p.slug.startsWith('openmotion-') || p.source === 'template') return 'template';
  return 'video';
}
export function seriesEpisodes(projects: OpenMotionProject[], id: string) {
  return projects.filter(p => episodeInfo(p)?.seriesId === id && projectKind(p) === 'video')
    .sort((a,b) => (episodeInfo(a)?.season ?? 1) - (episodeInfo(b)?.season ?? 1) || (episodeInfo(a)?.episodeNumber || 9999) - (episodeInfo(b)?.episodeNumber || 9999) || a.title.localeCompare(b.title));
}
export function nextEpisode(projects: OpenMotionProject[], id: string) {
  const members = seriesEpisodes(projects,id);
  const season = Math.max(1,...members.map(p => episodeInfo(p)?.season ?? 1));
  return {season, episodeNumber: 1 + Math.max(0,...members.filter(p=>episodeInfo(p)?.season === season).map(p=>episodeInfo(p)?.episodeNumber ?? 0))};
}
export function episodePrompt(s: SeriesDefinition, projects: OpenMotionProject[], repo: string) {
  const t = activeTemplate(s), ep = nextEpisode(projects,s.id);
  return [
    'Maak een nieuwe OpenMotion-aflevering voor '+s.title+'. Onderwerp: [vul onderwerp in].',
    'Lees eerst https://github.com/'+repo+'/blob/main/docs/SERIES_WORKFLOW.md en series/catalog.json.',
    'Lees '+t.templatePath+' (versie '+t.version+'). '+(t.referenceProject ? 'Bestudeer projects/'+t.referenceProject+'/project.json als referentie.' : 'Deze serie heeft nog geen goedgekeurd voorbeeld. Ontwikkel een proefaflevering.'),
    t.instructions,
    'Gebruik deze productie-instellingen: '+JSON.stringify({format:t.format,fps:t.fps,durationSec:t.durationSec,brandKit:t.brandKit}),
    'Controleer de actuele projecten en het vrije afleveringsnummer vóór commit. Voeg aan project.json toe: '+JSON.stringify({kind:'video',seriesId:s.id,season:ep.season,episodeNumber:ep.episodeNumber,templateVersion:t.version,productionStatus:'review'}),
    'Maak een unieke slug en commit naar projects/<slug>/project.json. Behoud bestaande afleveringen, renderer, assets en links. Volg de bestaande media- en audioproductie. Geen extra controle-Actions of automatische MP4-render.'
  ].join('\n\n');
}
export function newSeriesPrompt(repo:string) {
  return 'Maak in '+repo+' een nieuwe OpenMotion-serie. Lees docs/SERIES_WORKFLOW.md en series/catalog.json. Voeg een unieke serie-ID, titel, beschrijving, versie 1.0, templatePath, formaat, fps, richtduur, huisstijl en productie-instructies toe. Maak een versiegebonden template in series/<id>/template-v1.0.json en registreer de eerste aflevering onder projects/<slug>/project.json met seriesId, season, episodeNumber, templateVersion en kind. Bestaande projecten en workflow behouden. Onderwerp: [vul in].';
}
