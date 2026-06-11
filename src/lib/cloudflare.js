// ORVA — Cloudflare Worker API
// Handles: PIN validation + imgbb key fetching

const CF_URL = import.meta.env.VITE_CF_WORKER_URL || 'https://setup.hello-orvabd.workers.dev';

/** Validate the 8-digit admin PIN against Cloudflare */
export async function validatePin(pin) {
  try {
    const res = await fetch(`${CF_URL}/validate-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { valid: false, error: data.error || 'Request failed' };
    }
    const data = await res.json();
    return { valid: !!data.valid, error: data.error };
  } catch (err) {
    return { valid: false, error: 'Network error. Check connection.' };
  }
}

/** Fetch imgbb API key from Cloudflare (requires Firebase ID token) */
export async function getImgbbKey(firebaseIdToken) {
  try {
    const res = await fetch(`${CF_URL}/get-config`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${firebaseIdToken}` },
    });
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    return data.imgbb_api || null;
  } catch {
    return null;
  }
}
