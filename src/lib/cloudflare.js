// ORVA — Cloudflare Worker API + Dual PIN validation

const CF_URL = import.meta.env.VITE_CF_WORKER_URL || 'https://setup.hello-orvabd.workers.dev';

/** SHA-256 hash a string using browser crypto */
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Dual-PIN validation:
 *  1. Try RTDB custom PIN (SHA-256 hash stored at settings/admin/pinHash)
 *  2. Fall back to Cloudflare emergency PIN
 */
export async function validatePin(pin) {
  // 1. Check RTDB custom PIN hash first
  try {
    const { db } = await import('./firebase.js');
    if (db) {
      const { ref, get } = await import('firebase/database');
      const snap = await get(ref(db, 'settings/admin/pinHash'));
      if (snap.exists()) {
        const storedHash = snap.val();
        const inputHash  = await sha256(pin);
        if (inputHash === storedHash) return { valid: true, source: 'custom' };
        // Hash present but doesn't match — still try Cloudflare emergency PIN below
      }
    }
  } catch { /* DB unavailable — fall through */ }

  // 2. Cloudflare emergency PIN fallback
  try {
    const res = await fetch(`${CF_URL}/validate-pin`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ pin }),
    });
    const data = await res.json().catch(() => ({}));
    return { valid: !!data.valid, error: data.error, source: 'emergency' };
  } catch {
    return { valid: false, error: 'Network error. Check connection.' };
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
