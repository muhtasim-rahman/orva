// ORVA — Shared Utilities

/** Convert a string to a URL-safe slug */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // remove non-word chars
    .replace(/[\s_-]+/g, '-')      // spaces/underscores → hyphens
    .replace(/^-+|-+$/g, '');      // trim leading/trailing hyphens
}

/** Format a number as BDT price */
export function formatPrice(amount, opts = {}) {
  const { currency = '৳', locale = 'en-BD' } = opts;
  if (amount == null || isNaN(amount)) return `${currency}—`;
  return `${currency}${Number(amount).toLocaleString(locale)}`;
}

/** Get device and browser info for contact form */
export function getDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform || '';
  const screen   = `${window.screen.width}×${window.screen.height}`;

  let device = 'Desktop';
  if (/iPhone|iPad|iPod/.test(ua)) device = /iPad/.test(ua) ? 'iPad' : 'iPhone';
  else if (/Android/.test(ua)) device = /Tablet|SM-T/.test(ua) ? 'Android Tablet' : 'Android Phone';

  let browser = 'Unknown';
  if (/Edg\//.test(ua))          browser = 'Edge';
  else if (/OPR\//.test(ua))     browser = 'Opera';
  else if (/Chrome\//.test(ua))  browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua))  browser = 'Safari';

  return `${device} | ${browser} | ${screen} | ${platform}`;
}

/** Truncate text to a max length with ellipsis */
export function truncate(str, maxLen = 80) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}

/** Debounce a function */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Check if a value is empty (null, undefined, empty string/array/object) */
export function isEmpty(val) {
  if (val == null) return true;
  if (typeof val === 'string')  return val.trim() === '';
  if (Array.isArray(val))       return val.length === 0;
  if (typeof val === 'object')  return Object.keys(val).length === 0;
  return false;
}

/** Convert Firebase object (with keys as IDs) to sorted array */
export function objToArray(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([id, val]) => ({ id, ...val }));
}

/** Deep clone a plain object */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Clamp a number between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Format a timestamp as a readable date */
export function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}
