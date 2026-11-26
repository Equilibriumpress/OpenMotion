import type { OpenMotionProject, OpenMotionScene, DocumentaryShot } from '../types/openmotion';

export function isTravelDocumentary(project: OpenMotionProject): boolean {
  return project.slug.startsWith('places-worth-exploring-') ||
    project.scenes.some(s=>s.bucketList?.documentary?.series==='places-worth-exploring');
}

export function travelFrameGrid(scene: OpenMotionScene): DocumentaryShot['videoGrid'] {
  const grid=scene.bucketList?.documentary?.videoGrid;
  if(!grid)return undefined;
  const {fps,cols,rows,frameWidth,frameHeight,frames}=grid;
  if(!Number.isFinite(fps)||fps<=0||![cols,rows,frameWidth,frameHeight,frames].every(n=>Number.isSafeInteger(n)&&n>0)||frames>cols*rows)return undefined;
  return grid;
}

export function isTravelClip(scene: OpenMotionScene): boolean {
  const source=scene.bucketList?.imageSourceUrl??'';
  return Boolean(scene.bucketList?.documentary?.videoGrid)||/\.(webm|mp4|ogv)(?:[?#]|$)/i.test(source);
}

export function matchingTravelAtlas(scene: OpenMotionScene, image: HTMLImageElement): boolean {
  const g=travelFrameGrid(scene);
  return !!g && image.naturalWidth===g.cols*g.frameWidth && image.naturalHeight===g.rows*g.frameHeight;
}
