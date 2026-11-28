import { cartoonId, hasCartoon, prepareCartoon } from './cartoonPresenter';
import { characterFromScene, characterModel } from './characterPresets';
import { hasRocketbox, prepareRocketbox } from './rocketboxPresenter';
import {isTravelDocumentary,isTravelClip,matchingTravelAtlas} from './travelProject';
import { OpenMotionProject } from '../types/openmotion';
import { CAT_OFFICE_ASSETS } from './catOfficeAssets';
import { projectAssetUrl } from './projectAudio';
import { preparePremiumTravelProject } from './premiumTravelRoute';
import { prepareBucketListProject } from './bucketListCamera';

interface CacheEntry {
  img: HTMLImageElement;
  loaded: boolean;
  error: boolean;
  promise: Promise<HTMLImageElement | null>;
}


/**
 * The older premium projects used Commons Special:FilePath redirects.
 * Those redirects are not dependable for cross-origin Canvas decoding.
 * Keep published/localStorage projects working after the URL migration.
 */
const legacyCommonsThumbs: Record<string, string> = {
  "Edinburgh_Castle_2000-1.jpg": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Edinburgh_Castle_2000-1.jpg/1280px-Edinburgh_Castle_2000-1.jpg",
  "Glencoe,_Scotland.jpg": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
  "Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg/1280px-Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg",
  "Portree_harbour.jpg": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Portree_harbour.jpg/1280px-Portree_harbour.jpg"
};
function resolvePhotoSource(url: string): string {
  const match = url.match(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^?#]+)/i);
  if (!match) return url;
  try {
    const name = decodeURIComponent(match[1]).replace(/ /g, '_');
    return legacyCommonsThumbs[name] ?? url;
  } catch {
    return url;
  }
}

const cache = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();

export function subscribeImageLoaded(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function notifyImageRefresh() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore subscriber errors
    }
  });
}

function ensureEntry(url: string): CacheEntry {
  const imageUrl = resolvePhotoSource(url);
  const existing = cache.get(imageUrl);
  if (existing) return existing;

  const img = new Image();
  if (/^https?:\/\//i.test(imageUrl)) {
    img.crossOrigin = 'anonymous';
  }

  let resolvePromise: (value: HTMLImageElement | null) => void = () => {};
  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    resolvePromise = resolve;
  });

  const entry: CacheEntry = {
    img,
    loaded: false,
    error: false,
    promise,
  };

  img.onload = () => {
    entry.loaded = true;
    resolvePromise(img);
    notifyImageRefresh();
  };

  img.onerror = () => {
    entry.error = true;
    resolvePromise(null);
    notifyImageRefresh();
  };

  cache.set(imageUrl, entry);
  img.src = imageUrl;
  return entry;
}

/**
 * Returns a decoded HTMLImageElement if already loaded, or initiates loading
 * asynchronously and notifies subscribers once ready.
 */
export function getCachedPhoto(url?: string): HTMLImageElement | null {
  if (!url) return null;
  const entry = ensureEntry(url);
  if (entry.loaded && !entry.error && entry.img.naturalWidth > 0) {
    return entry.img;
  }
  return null;
}

/**
 * Preloads all photography referenced in a project (e.g. before deterministic
 * WebCodecs MP4 frame rendering or when opening Studio).
 */
export async function preloadProjectImages(project: OpenMotionProject): Promise<void> {
  if(hasCartoon(project)){const ids=new Set(project.scenes.map(cartoonId).filter(x=>x!==null));if(ids.size!==1||hasRocketbox(project))throw Error('Gebruik één soort 3D-presentator per video.');await prepareCartoon([...ids][0]!);notifyImageRefresh();}
  if(hasRocketbox(project)){const scenes=project.scenes.filter(s=>s.doodle?.extras?.includes('presenter-lab-rocketbox'));const preset=characterFromScene(scenes[0]);const key=preset?characterModel(preset):'';if(scenes.some(s=>{const p=characterFromScene(s);return (p?characterModel(p):'')!==key;}))throw Error('Gebruik één basispersonage per video.');await prepareRocketbox(preset);notifyImageRefresh();}
  const urls = new Set<string>();
  for (const scene of project.scenes) {
    for (const stop of scene.premiumTravel?.stops ?? []) { urls.add(stop.photoUrl); if(stop.secondaryPhoto?.photoUrl) urls.add(stop.secondaryPhoto.photoUrl); }
    if(scene.premiumTravel?.openingPhoto?.photoUrl) urls.add(scene.premiumTravel.openingPhoto.photoUrl);
    if (scene.imageUrl) urls.add(projectAssetUrl(scene.imageUrl));
    if (scene.editorialMap?.photoUrl) {
      urls.add(scene.editorialMap.photoUrl);
    }
  }
  if (project.scenes.some(scene => scene.catOffice)) for (const src of CAT_OFFICE_ASSETS) urls.add(projectAssetUrl(src));
  const hasPremium = project.scenes.some(scene => scene.premiumTravel);
  const hasBucketList = project.scenes.some(scene => scene.layout === 'bucket-list-zoom');
  if (hasPremium) await preparePremiumTravelProject(project);
  if (hasBucketList) await prepareBucketListProject(project);
  if (urls.size === 0) { if (hasPremium || hasBucketList) notifyImageRefresh(); return; }

  await Promise.all(
    Array.from(urls).map(async (url) => {
      const entry = ensureEntry(url);
      const loadedImg = await entry.promise;
      if (!loadedImg && (hasPremium || hasBucketList)) {
        // A photo is optional. Keep map, vehicle and MP4 frames available.
        console.warn('Premium photo unavailable. Using scenic fallback:', url);
        return;
      }
      if (loadedImg && typeof loadedImg.decode === 'function') {
        try {
          await loadedImg.decode();
        } catch {
          // Image is already loaded even if decode rejects
        }
      }
    })
  );
  if (hasPremium || hasBucketList) notifyImageRefresh();
}

/** Fail before exporting a travel master with missing images or broken atlases. */
export function assertTravelMediaReady(project: OpenMotionProject): void {
  for(const scene of project.scenes){
    const p=scene.premiumTravel;if(!p||(p.editorialRevision??0)<7||(p.chapter!=='photo'&&p.chapter!=='opening'))continue;
    const stop=p.stops[p.focusStopIndex];const alt=p.chapter==='opening'&&p.openingPhoto?p.openingPhoto:stop?.secondaryPhoto;
    if(!getCachedPhoto(stop?.photoUrl)&&!getCachedPhoto(alt?.photoUrl))throw new Error('Bestemmingsfoto ontbreekt: '+scene.name+'. Controleer de Wikimedia-bronnen voor export.');
  }
  if(!isTravelDocumentary(project))return;
  for(const scene of project.scenes){
    if(scene.bucketList?.documentary?.mode==='map')continue;
    const img=scene.imageUrl?getCachedPhoto(projectAssetUrl(scene.imageUrl)):null;
    if(!img)throw new Error('Beeld ontbreekt: '+scene.id+'. Open de gepubliceerde Studio opnieuw.');
    if(isTravelClip(scene)&&!matchingTravelAtlas(scene,img))throw new Error('Video-atlas ontbreekt of heeft onjuiste afmetingen: '+scene.id+'. Open de gepubliceerde Studio opnieuw.');
  }
}
