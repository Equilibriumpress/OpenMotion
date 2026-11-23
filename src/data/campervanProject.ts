import { OpenMotionProject, SceneThreeCampervan } from '../types/openmotion';

const SHARED_THREE_STYLE: SceneThreeCampervan = {
  vanColor: '#3B7A6C',
  vanRoofColor: '#F4ECE0',
  jacketColor: '#C8523B',
  backpackColor: '#4F6448',
  beanieColor: '#D97736',
  lightingMood: 'golden-hour',
  cameraFov: 42,
  showTitleOverlay: true,
};

/**
 * 15-Second Cinematic 3D Character Animation in OpenMotion (Three.js + Procedural Geometry)
 * Exact 15.0s (4.6 + 2.2 + 2.8 + 5.4 = 15.0s), 1920x1080, 30 fps (450 frames), 100% procedural & editable.
 */
export const CAMPERVAN_TRAVELER_3D_PROJECT: OpenMotionProject = {
  schemaVersion: '1.0',
  id: 'threejs-campervan-traveler-15s',
  slug: 'campervan-traveler-3d',
  title: 'Campground Departure — 3D Stylized Traveler & Campervan (Three.js)',
  description:
    'Cinematische 3D-karakteranimatie van exact 15 seconden volledig opgebouwd uit procedurele Three.js-geometrie: een gestileerde reiziger met rugzak loopt naar een campervan, opent de deur, zwaait naar de camera, stapt in en rijdt weg door een zonnig berglandschap. Volledig bewerkbaar en exporteerbaar naar 1920×1080 30 fps MP4.',
  category: '3D & Procedural Motion',
  author: 'OpenMotion + Three.js',
  source: 'template',
  createdAt: '2026-11-23',
  updatedAt: '2026-11-23',
  githubPath: 'projects/campervan-traveler-3d/project.json',
  commitSha: 'th15c3d',
  format: '16:9',
  width: 1920,
  height: 1080,
  fps: 30,
  brandKit: {
    brandName: 'Campground Departure · 3D',
    primaryColor: '#3B7A6C',
    accentColor: '#D97736',
    backgroundColor: '#1E293B',
    surfaceColor: '#F4ECE0',
    textColor: '#FAF7F2',
    mutedColor: '#CBD5E1',
    fontFamily: 'Bricolage Grotesque',
  },
  scenes: [
    {
      id: 'camper-01-walk',
      name: '00:00–00:04.6 · Walk to Campervan',
      durationSec: 4.6,
      layout: 'three-campervan-journey',
      transition: 'fade',
      backdrop: 'radial-studio',
      fullBleed: true,
      headline: 'THE OPEN ROAD',
      subheadline: 'Golden hour in the high valley',
      threeCampervan: {
        ...SHARED_THREE_STYLE,
        titleText: 'THE OPEN ROAD',
        subtitleText: 'Golden hour in the high valley',
        showTitleOverlay: true,
      },
    },
    {
      id: 'camper-02-open-door',
      name: '00:04.6–00:06.8 · Open Door',
      durationSec: 2.2,
      layout: 'three-campervan-journey',
      transition: 'fade',
      backdrop: 'radial-studio',
      fullBleed: true,
      headline: 'Open the Campervan Door',
      threeCampervan: {
        ...SHARED_THREE_STYLE,
        showTitleOverlay: false,
      },
    },
    {
      id: 'camper-03-wave',
      name: '00:06.8–00:09.6 · Wave to Camera',
      durationSec: 2.8,
      layout: 'three-campervan-journey',
      transition: 'fade',
      backdrop: 'radial-studio',
      fullBleed: true,
      headline: 'Wave Goodbye',
      threeCampervan: {
        ...SHARED_THREE_STYLE,
        showTitleOverlay: false,
      },
    },
    {
      id: 'camper-04-drive-away',
      name: '00:09.6–00:15.0 · Board & Drive Away',
      durationSec: 5.4,
      layout: 'three-campervan-journey',
      transition: 'fade',
      backdrop: 'radial-studio',
      fullBleed: true,
      headline: 'SEE YOU OUT THERE',
      subheadline: 'Procedural Three.js · OpenMotion',
      threeCampervan: {
        ...SHARED_THREE_STYLE,
        titleText: 'SEE YOU OUT THERE',
        subtitleText: 'Next stop: beyond the ridge',
        showTitleOverlay: true,
      },
    },
  ],
};
