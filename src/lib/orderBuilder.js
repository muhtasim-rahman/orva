// ORVA — Order Builder v2
// Pipeline: Canvas Receipt → Cloudflare /upload-order-image → imgbb → Compact message → Messenger/WA

import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nid = customAlphabet(alphabet, 6);
const CF_URL = import.meta.env.VITE_CF_WORKER_URL || 'https://setup.hello-orvabd.workers.dev';

/* ── Order ID ── */
export function generateOrderId() {
  return `ORV-${nid()}`;
}

/* ── Price calculator ── */
export function calculatePrice(basePrice, selections, variants) {
  let total = basePrice || 0;
  if (!variants || !selections) return total;
  for (const variant of variants) {
    const selectedLabel = selections[variant.type];
    if (!selectedLabel) continue;
    const option = (variant.options || []).find(o => o.label === selectedLabel);
    if (option?.priceAdd) total += option.priceAdd;
  }
  if (selections.quantity && selections.quantity > 1) total *= selections.quantity;
  return total;
}

/* ── Text wrap helper for canvas ── */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = (text || '').split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

/* ── Canvas receipt generator (dark ORVA theme) ── */
export function generateReceiptCanvas(details) {
  return new Promise((resolve) => {
    const W = 800, H = 800;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Header stripe
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, W, 165);
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 165); ctx.lineTo(W, 165); ctx.stroke();

    // Logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = `${window.location.origin}/assets/logo-white.webp`;

    const draw = () => {
      // Receipt label under logo
      ctx.fillStyle = '#444444';
      ctx.font = '600 11px "DM Sans", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.15em';
      ctx.fillText('ORDER RECEIPT', W / 2, 145);
      ctx.letterSpacing = '0';

      // Receipt card outline
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      const cx = 44, cy = 186, cw = W - 88, ch = H - 220;
      ctx.strokeRect(cx, cy, cw, ch);

      // ── Row: ORDER META ──
      ctx.textAlign = 'left';
      ctx.fillStyle = '#555555';
      ctx.font = '600 10px "DM Sans", sans-serif';
      ctx.letterSpacing = '0.12em';
      ctx.fillText('VERIFIED ORDER', cx + 28, 222);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#c9b89a'; // accent
      ctx.font = '700 13px "DM Sans", sans-serif';
      ctx.letterSpacing = '0.04em';
      ctx.fillText(details.orderId, cx + cw - 28, 222);
      ctx.letterSpacing = '0';

      // Date
      ctx.textAlign = 'left';
      ctx.fillStyle = '#333333';
      ctx.font = '400 11px "DM Sans", sans-serif';
      const dateStr = new Date().toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
      ctx.fillText(dateStr, cx + 28, 240);

      // Divider
      const divider = (y) => {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 28, y); ctx.lineTo(cx + cw - 28, y);
        ctx.stroke();
      };
      divider(258);

      // ── BILL TO ──
      ctx.textAlign = 'left';
      ctx.fillStyle = '#444444';
      ctx.font = '600 10px "DM Sans", sans-serif';
      ctx.letterSpacing = '0.12em';
      ctx.fillText('BILL TO', cx + 28, 284);
      ctx.letterSpacing = '0';

      ctx.fillStyle = '#f0ece6';
      ctx.font = '600 15px "DM Sans", sans-serif';
      ctx.fillText(details.userName || '—', cx + 28, 306);

      ctx.fillStyle = '#888888';
      ctx.font = '400 12px "DM Sans", sans-serif';
      ctx.fillText(`Phone: ${details.phone || '—'}`, cx + 28, 326);

      ctx.fillStyle = '#666666';
      const addrY = wrapText(ctx, `Address: ${details.address || '—'}`, cx + 28, 346, cw - 56, 18);

      divider(Math.max(addrY + 22, 374));

      // ── PRODUCT ──
      const prodY = Math.max(addrY + 22, 374) + 26;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#444444';
      ctx.font = '600 10px "DM Sans", sans-serif';
      ctx.letterSpacing = '0.12em';
      ctx.fillText('PRODUCT', cx + 28, prodY);
      ctx.letterSpacing = '0';

      ctx.fillStyle = '#f0ece6';
      ctx.font = '600 15px "DM Sans", sans-serif';
      const pName = details.product || '—';
      ctx.fillText(pName.length > 38 ? pName.substring(0, 36) + '…' : pName, cx + 28, prodY + 22);

      // Attributes row
      const attrs = [
        details.size    && `Size: ${details.size}`,
        details.color   && `Color: ${details.color}`,
        details.quantity && `Qty: ${details.quantity}`,
      ].filter(Boolean).join('   •   ');

      ctx.fillStyle = '#777777';
      ctx.font = '400 12px "DM Sans", sans-serif';
      ctx.fillText(attrs, cx + 28, prodY + 44);

      // Custom options
      let extraY = prodY + 44;
      if (details.extras && Object.keys(details.extras).length) {
        for (const [k, v] of Object.entries(details.extras)) {
          if (!v) continue;
          extraY += 18;
          ctx.fillStyle = '#555555';
          ctx.font = '400 11px "DM Sans", sans-serif';
          ctx.fillText(`${k}: ${v}`, cx + 28, extraY);
        }
      }

      divider(extraY + 20);

      // ── NOTE (if any) ──
      let noteEndY = extraY + 20;
      if (details.note && details.note.trim()) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#444444';
        ctx.font = '600 10px "DM Sans", sans-serif';
        ctx.letterSpacing = '0.12em';
        ctx.fillText('SPECIAL NOTE', cx + 28, extraY + 44);
        ctx.letterSpacing = '0';

        ctx.fillStyle = '#888888';
        ctx.font = 'italic 12px "DM Sans", sans-serif';
        noteEndY = wrapText(ctx, details.note, cx + 28, extraY + 62, cw - 56, 18);
        divider(noteEndY + 20);
        noteEndY = noteEndY + 20;
      }

      // ── FOOTER ──
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333333';
      ctx.font = '400 11px "DM Sans", sans-serif';
      ctx.fillText('orva-bd.web.app  •  hello.orvabd@gmail.com  •  +8801799-497717', W / 2, H - 44);

      ctx.fillStyle = '#222222';
      ctx.font = '400 9px "DM Sans", sans-serif';
      ctx.fillText('Website & billing system designed by Muhtasim Rahman (mdturzo.web.app)', W / 2, H - 26);

      resolve(canvas.toDataURL('image/png', 1.0));
    };

    logo.onload = () => {
      // Draw logo centered, max 140px wide, proportional
      const maxLogoW = 140, maxLogoH = 52;
      const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height);
      const lw = logo.width * scale, lh = logo.height * scale;
      ctx.drawImage(logo, (W - lw) / 2, (165 - lh) / 2 - 8, lw, lh);
      draw();
    };
    logo.onerror = () => {
      // Fallback text logo
      ctx.fillStyle = '#f0ece6';
      ctx.font = '300 28px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.3em';
      ctx.fillText('ORVA', W / 2, 88);
      ctx.letterSpacing = '0';
      draw();
    };
  });
}

/* ── Upload receipt image to imgbb via Cloudflare Worker ── */
export async function uploadReceiptImage(base64DataUrl, details) {
  try {
    const base64 = base64DataUrl.split(',')[1];
    const name   = `ORD_${details.orderId}_${(details.userName || 'customer').replace(/\s+/g, '_')}`;

    const res = await fetch(`${CF_URL}/upload-order-image`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: base64, name }),
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url || null;
  } catch (err) {
    console.error('Order image upload error:', err);
    return null;
  }
}

/* ── Build compact WhatsApp/Messenger message ── */
export function buildCompactMessage(details, imageUrl) {
  const lines = [
    `*Order Confirmed!*`,
    ``,
    `*Order ID:* ${details.orderId}`,
    `*Product:* ${details.product}`,
  ];

  if (imageUrl) lines.push(`*Receipt:* ${imageUrl}`);
  if (details.size)     lines.push(`*Size:* ${details.size}`);
  if (details.color)    lines.push(`*Color:* ${details.color}`);
  if (details.quantity) lines.push(`*Quantity:* ${details.quantity}`);

  if (details.extras) {
    for (const [k, v] of Object.entries(details.extras)) {
      if (v) lines.push(`*${k}:* ${v}`);
    }
  }

  if (details.note?.trim()) lines.push(`*Note:* ${details.note.trim()}`);

  lines.push(``);
  lines.push(`*Name:* ${details.userName}`);
  lines.push(`*Phone:* ${details.phone}`);
  lines.push(`*Address:* ${details.address}`);

  return lines.join('\n');
}

/* ── Open Messenger ── */
export function openMessenger(text, messengerUrl = 'http://m.me/61590608312590') {
  window.open(messengerUrl, '_blank', 'noopener');
  copyToClipboard(text);
}

/* ── Open WhatsApp ── */
export function openWhatsApp(text, phone = '8801799497717') {
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

/* ── Copy to clipboard ── */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}
