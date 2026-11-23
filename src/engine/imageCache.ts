import { OpenMotionProject } from '../types/openmotion';

interface CacheEntry {
  img: HTMLImageElement;
  loaded: boolean;
  error: boolean;
  promise: Promise<HTMLImageElement | null>;
}

const cache = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();

export function subscribeImageLoaded(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore subscriber errors
    }
  });
}

function ensureEntry(url: string): CacheEntry {
  const existing = cache.get(url);
  if (existing) return existing;

  const img = new Image();
  if (/^https?:\/\//i.test(url)) {
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
    notifyListeners();
  };

  img.onerror = () => {
    entry.error = true;
    resolvePromise(null);
  };

  cache.set(url, entry);
  img.src = url;
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
  const urls = new Set<string>();
  for (const scene of project.scenes) {
    if (scene.editorialMap?.photoUrl) {
      urls.add(scene.editorialMap.photoUrl);
    }
  }
  if (urls.size === 0) return;

  await Promise.all(
    Array.from(urls).map(async (url) => {
      const entry = ensureEntry(url);
      const loadedImg = await entry.promise;
      if (loadedImg && typeof loadedImg.decode === 'function') {
        try {
          await loadedImg.decode();
        } catch {
          // Image is already loaded even if decode rejects
        }
      }
    })
  );
}
