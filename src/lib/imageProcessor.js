// ORVA — Image Processor
// Pipeline: File → Compress → WebP → imgbb upload

import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxSizeMB:        1.5,
  maxWidthOrHeight: 1920,
  useWebWorker:     true,
  fileType:         'image/webp',
  initialQuality:   0.85,
};

/** Compress + convert image to WebP */
export async function processImage(file) {
  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch (err) {
    throw new Error('Could not process image: ' + err.message);
  }
}

/**
 * Upload a processed image to imgbb.
 * In production the key comes from Cloudflare (via getImgbbKey).
 * In local dev VITE_IMGBB_API_KEY is used directly from .env.
 */
export async function uploadToImgbb(file, apiKey, name) {
  const form = new FormData();
  form.append('image', file);
  form.append('name', name);

  const res  = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body:   form,
  });

  if (!res.ok) throw new Error(`imgbb upload failed: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error('imgbb: ' + (data.error?.message || 'unknown error'));

  return {
    url:       data.data.url,
    thumb:     data.data.thumb?.url || data.data.url,
    deleteUrl: data.data.delete_url,
    id:        data.data.id,
  };
}

/**
 * Full pipeline: compress → WebP → upload → return URL.
 * apiKey:  pass the key resolved by the caller
 *          (from Cloudflare in prod, or import.meta.env.VITE_IMGBB_API_KEY in dev)
 */
export async function processAndUpload(file, apiKey, slug, index = 0) {
  const processed = await processImage(file);
  const date      = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const name      = `${slug}_${date}_${index + 1}`;
  const result    = await uploadToImgbb(processed, apiKey, name);
  return result.url;
}

/** Resolve imgbb API key: env var (localhost) or Cloudflare (production) */
export async function resolveImgbbKey(firebaseUser) {
  // Localhost / dev: use env var directly
  if (import.meta.env.VITE_IMGBB_API_KEY) {
    return import.meta.env.VITE_IMGBB_API_KEY;
  }
  // Production: fetch from Cloudflare Worker with Firebase auth token
  if (firebaseUser) {
    const { getImgbbKey } = await import('./cloudflare.js');
    const token = await firebaseUser.getIdToken();
    return await getImgbbKey(token);
  }
  return null;
}
