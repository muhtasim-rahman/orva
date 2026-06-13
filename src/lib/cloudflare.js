// ORVA v1.2 — Cloudflare Worker API
// PIN validation is now Cloudflare-only (RTDB hash removed from public validation).
// The PIN hash is never sent to the client — Cloudflare compares server-side.

const CF_URL = import.meta.env.VITE_CF_WORKER_URL || 'https://setup.hello-orvabd.workers.dev';

/** SHA-256 hash a string using browser SubtleCrypto */
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * v1.2: PIN validation goes exclusively to Cloudflare Worker.
 * The worker checks the custom KV-stored PIN and the emergency PIN server-side.
 * The hash is never exposed to the client/inspector.
 */
export async function validatePin(pin) {
  try {
    const res = await fetch(`${CF_URL}/validate-pin`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ pin }),
    });
    const data = await res.json().catch(() => ({}));
    return { valid: !!data.valid, source: data.source || 'cloudflare' };
  } catch {
    return { valid: false, error: 'Network error. Check connection.' };
  }
}

/**
 * v1.2: Change the admin PIN.
 * Sends the SHA-256 hash to Cloudflare which verifies the Firebase ID token
 * before storing the new hash in its KV store. Hash never stored client-side.
 * @param {string} newPin       - plain 8-digit PIN
 * @param {string} firebaseToken - Firebase ID token (from user.getIdToken())
 */
export async function updateAdminPin(newPin, firebaseToken) {
  try {
    const pinHash = await sha256(newPin);
    const res = await fetch(`${CF_URL}/update-pin`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify({ pinHash }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to update PIN' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error. Check connection.' };
  }
}

/** Fetch imgbb API key (requires Firebase ID token) */
export async function getImgbbKey(firebaseIdToken) {
  try {
    const res = await fetch(`${CF_URL}/get-config`, {
      headers: { Authorization: `Bearer ${firebaseIdToken}` },
    });
    if (!res.ok) throw new Error('Unauthorized');
    return (await res.json()).imgbb_api || null;
  } catch {
    return null;
  }
}
