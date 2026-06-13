import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Check, Plus, Trash2, AlertCircle, KeyRound,
  Eye, EyeOff, Tag, GripVertical, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { ref, set, update, push, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useSettings, useAllCategories } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { updateAdminPin } from '@/lib/cloudflare';
import { objToArray } from '@/utils';

const DEFAULTS = {
  facebook:  'https://www.facebook.com/profile.php?id=61590608312590',
  whatsapp:  '8801799497717',
  youtube:   'https://youtube.com/@ORVA-bd',
  messenger: 'http://m.me/61590608312590',
  email:     'hello.orvabd@gmail.com',
  phone:     '01799-497717',
  site_title_en: 'ORVA — Premium Clothing',
  site_title_bn: 'ORVA — প্রিমিয়াম পোশাক',
  site_desc_en:  'Premium clothing, curated with intent.',
  site_desc_bn:  'সচেতনভাবে কিউরেটেড প্রিমিয়াম পোশাক।',
};

function SaveButton({ loading, saved, onClick, label = 'Save', disabled = false }) {
  return (
    <button className="btn btn-primary btn-sm" onClick={onClick} disabled={loading || disabled}>
      {loading ? <span className="spinner" style={{ width: 13, height: 13, borderWidth: 1.5 }} />
               : saved  ? <Check size={13} /> : <Save size={13} />}
      {saved ? 'Saved!' : label}
    </button>
  );
}

function StatusMsg({ ok, err }) {
  if (!ok && !err) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 'var(--text-xs)', padding: '8px 12px',
          borderRadius: 'var(--r-s)', marginTop: 4,
          background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: ok ? '#22c55e' : 'var(--err)',
          border: `1px solid ${ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}
      >
        {ok ? <Check size={12} /> : <AlertCircle size={12} />}
        {ok || err}
      </motion.div>
    </AnimatePresence>
  );
}

export default function SettingsTab() {
  const { settings }     = useSettings();
  const { categories: cats, loading: catsLoading } = useAllCategories();
  const { user }         = useAuth();

  /* ── Social ── */
  const [social, setSocial]     = useState({ ...DEFAULTS });
  const [savingS, setSavingS]   = useState(false);
  const [savedS, setSavedS]     = useState(false);

  /* ── Site meta ── */
  const [site, setSite]         = useState({
    title_en: DEFAULTS.site_title_en, title_bn: DEFAULTS.site_title_bn,
    desc_en:  DEFAULTS.site_desc_en,  desc_bn:  DEFAULTS.site_desc_bn,
    phone:    DEFAULTS.phone,
  });
  const [savingMeta, setSavingMeta] = useState(false);
  const [savedMeta, setSavedMeta]   = useState(false);

  /* ── Banners ── */
  const [banners, setBanners]   = useState([]);
  const [savingB, setSavingB]   = useState(false);
  const [savedB, setSavedB]     = useState(false);
  const [bannerUrl, setBannerUrl]   = useState('');
  const [bannerLink, setBannerLink] = useState('/products');

  /* ── Categories ── */
  const [newCatId, setNewCatId]   = useState('');
  const [newCatEn, setNewCatEn]   = useState('');
  const [newCatBn, setNewCatBn]   = useState('');
  const [catError, setCatError]   = useState('');

  /* ── PIN change ── */
  const [newPin, setNewPin]       = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin]     = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [pinOk, setPinOk]         = useState('');
  const [pinErr, setPinErr]       = useState('');

  /* ── Load from DB ── */
  useEffect(() => {
    if (!settings) return;
    if (settings.social) setSocial(s => ({ ...s, ...settings.social }));
    if (settings.site) {
      setSite({
        title_en: settings.site.title?.en || DEFAULTS.site_title_en,
        title_bn: settings.site.title?.bn || DEFAULTS.site_title_bn,
        desc_en:  settings.site.description?.en || DEFAULTS.site_desc_en,
        desc_bn:  settings.site.description?.bn || DEFAULTS.site_desc_bn,
        phone:    settings.site.phone || DEFAULTS.phone,
      });
      if (settings.site.banners) {
        const raw = settings.site.banners;
        // v1.2 FIX: handle both Array and Firebase object (numeric-keyed)
        setBanners(Array.isArray(raw) ? raw : Object.values(raw));
      }
    }
  }, [settings]);

  /* ── Saves ── */
  const saveSocial = async () => {
    setSavingS(true);
    await set(ref(db, 'settings/social'), {
      facebook: social.facebook, whatsapp: social.whatsapp,
      youtube: social.youtube,   messenger: social.messenger,
      email: social.email,
    });
    await update(ref(db, 'settings/site'), { phone: site.phone });
    setSavingS(false); setSavedS(true);
    setTimeout(() => setSavedS(false), 2500);
  };

  const saveSite = async () => {
    setSavingMeta(true);
    await update(ref(db, 'settings/site'), {
      title:       { en: site.title_en, bn: site.title_bn },
      description: { en: site.desc_en,  bn: site.desc_bn  },
    });
    setSavingMeta(false); setSavedMeta(true);
    setTimeout(() => setSavedMeta(false), 2500);
  };

  const addBanner = () => {
    if (!bannerUrl.trim()) return;
    setBanners(b => [...b, { url: bannerUrl.trim(), link: bannerLink || '/products', alt: 'ORVA Banner' }]);
    setBannerUrl(''); setBannerLink('/products');
  };
  const removeBanner = (i) => setBanners(b => b.filter((_, idx) => idx !== i));
  const saveBanners = async () => {
    setSavingB(true);
    await update(ref(db, 'settings/site'), { banners });
    setSavingB(false); setSavedB(true);
    setTimeout(() => setSavedB(false), 2500);
  };

  /* ── Category helpers ── */
  const addCategory = async () => {
    const id = newCatId.trim().toLowerCase().replace(/\s+/g, '-');
    if (!id || !newCatEn.trim()) { setCatError('ID and English label are required.'); return; }
    if (cats.find(c => c.id === id)) { setCatError('Category ID already exists.'); return; }
    setCatError('');
    const order = cats.length;
    await set(ref(db, `categories/${id}`), {
      id, order, active: true,
      label: { en: newCatEn.trim(), bn: newCatBn.trim() || newCatEn.trim() },
    });
    setNewCatId(''); setNewCatEn(''); setNewCatBn('');
  };

  const toggleCatActive = async (cat) => {
    await update(ref(db, `categories/${cat.id}`), { active: !cat.active });
  };

  const deleteCategory = async (cat) => {
    if (!confirm(`Delete category "${cat.label?.en || cat.id}"?`)) return;
    await remove(ref(db, `categories/${cat.id}`));
  };

  /* ── PIN change ── */
  const handlePinChange = async () => {
    setPinOk(''); setPinErr('');
    if (!/^\d{8}$/.test(newPin))          { setPinErr('PIN must be exactly 8 digits.'); return; }
    if (newPin !== confirmPin)             { setPinErr('PINs do not match.'); return; }
    if (!user)                             { setPinErr('Not authenticated.'); return; }
    setSavingPin(true);
    try {
      const token = await user.getIdToken(true);
      const result = await updateAdminPin(newPin, token);
      if (result.success) {
        setPinOk('PIN updated successfully.');
        setNewPin(''); setConfirmPin('');
      } else {
        setPinErr(result.error || 'Failed to update PIN.');
      }
    } catch (e) {
      setPinErr(e.message || 'Unknown error.');
    } finally {
      setSavingPin(false);
      setTimeout(() => { setPinOk(''); setPinErr(''); }, 4000);
    }
  };

  const SF   = (key) => (e) => setSocial(s => ({ ...s, [key]: e.target.value }));
  const SITE = (key) => (e) => setSite(s => ({ ...s, [key]: e.target.value }));

  return (
    <div className="stab">

      {/* ── Social Links ── */}
      <Section title="Social Links & Contact">
        <Row label="Facebook Page URL">
          <input className="input" value={social.facebook} onChange={SF('facebook')} />
        </Row>
        <Row label="WhatsApp Number (with country code)">
          <input className="input" value={social.whatsapp} onChange={SF('whatsapp')} placeholder="8801799497717" />
        </Row>
        <Row label="Messenger URL">
          <input className="input" value={social.messenger} onChange={SF('messenger')} />
        </Row>
        <Row label="YouTube Channel URL">
          <input className="input" value={social.youtube} onChange={SF('youtube')} />
        </Row>
        <Row label="Contact Email">
          <input className="input" value={social.email} onChange={SF('email')} type="email" />
        </Row>
        <Row label="Phone (display)">
          <input className="input" value={site.phone} onChange={SITE('phone')} />
        </Row>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <SaveButton loading={savingS} saved={savedS} onClick={saveSocial} />
        </div>
      </Section>

      {/* ── Site Meta ── */}
      <Section title="Site Metadata (SEO)">
        <Row label="Site Title (English)">
          <input className="input" value={site.title_en} onChange={SITE('title_en')} />
        </Row>
        <Row label="Site Title (বাংলা)">
          <input className="input lang-bn" value={site.title_bn} onChange={SITE('title_bn')} />
        </Row>
        <Row label="Site Description (English)">
          <textarea className="input" rows={2} value={site.desc_en} onChange={SITE('desc_en')} />
        </Row>
        <Row label="Site Description (বাংলা)">
          <textarea className="input lang-bn" rows={2} value={site.desc_bn} onChange={SITE('desc_bn')} />
        </Row>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <SaveButton loading={savingMeta} saved={savedMeta} onClick={saveSite} />
        </div>
      </Section>

      {/* ── Hero Banners ── */}
      <Section title="Hero Banners">
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginBottom: 12 }}>
          Add banner image URLs (from imgbb or any CDN). Recommended: 1920×600px landscape.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {banners.map((b, i) => (
            <div key={i} className="banner-row">
              <img src={b.url} alt={`Banner ${i+1}`} className="banner-thumb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url}</p>
                <p style={{ fontSize: 10, color: 'var(--text-4)' }}>Link: {b.link}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => removeBanner(i)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {banners.length === 0 && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)', padding: '12px 0' }}>No banners yet.</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input className="input" placeholder="Banner image URL (https://i.ibb.co/...)" value={bannerUrl}
            onChange={e => setBannerUrl(e.target.value)} />
          <input className="input" placeholder="Link on click (e.g. /products)" value={bannerLink}
            onChange={e => setBannerLink(e.target.value)} />
          <button className="btn btn-outline btn-sm" onClick={addBanner} style={{ alignSelf: 'flex-start' }}>
            <Plus size={13} /> Add Banner
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <SaveButton loading={savingB} saved={savedB} onClick={saveBanners} label="Save Banners" />
        </div>
      </Section>

      {/* ── Category Management ── */}
      <Section title="Product Categories">
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginBottom: 4 }}>
          Add, toggle, or remove product categories shown in the filter bar.
        </p>

        {/* Existing categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {catsLoading ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>Loading…</p>
          ) : cats.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>No categories yet.</p>
          ) : cats.map(cat => (
            <div key={cat.id} className="cat-row">
              <Tag size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-1)' }}>
                  {cat.label?.en || cat.id}
                </span>
                {cat.label?.bn && (
                  <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8, fontFamily: 'var(--font-body)' }}>
                    {cat.label.bn}
                  </span>
                )}
                <code style={{ fontSize: 10, color: 'var(--text-4)', marginLeft: 8 }}>{cat.id}</code>
              </div>
              <button className="btn btn-ghost btn-icon" title={cat.active ? 'Deactivate' : 'Activate'}
                onClick={() => toggleCatActive(cat)}>
                {cat.active
                  ? <ToggleRight size={16} style={{ color: '#22c55e' }} />
                  : <ToggleLeft  size={16} style={{ color: 'var(--text-4)' }} />}
              </button>
              <button className="btn btn-ghost btn-icon" onClick={() => deleteCategory(cat)}
                title="Delete category">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input className="input" placeholder="ID (e.g. t-shirts)" value={newCatId}
            onChange={e => setNewCatId(e.target.value.toLowerCase().replace(/\s+/g,'-'))} />
          <input className="input" placeholder="Label (English)" value={newCatEn}
            onChange={e => setNewCatEn(e.target.value)} />
          <input className="input lang-bn" placeholder="লেবেল (বাংলা)" value={newCatBn}
            onChange={e => setNewCatBn(e.target.value)} />
        </div>
        {catError && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--err)', marginBottom: 8 }}>{catError}</p>
        )}
        <button className="btn btn-outline btn-sm" onClick={addCategory} style={{ alignSelf: 'flex-start' }}>
          <Plus size={13} /> Add Category
        </button>
      </Section>

      {/* ── Admin PIN Change ── */}
      <Section title="Change Admin PIN">
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginBottom: 4 }}>
          Change the 8-digit PIN used to access this admin panel.
          The PIN is stored securely on Cloudflare — it is never visible in the browser or inspector.
          The Cloudflare emergency PIN remains unchanged.
        </p>
        <Row label="New PIN (8 digits)">
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={newPin}
              placeholder="••••••••"
              onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              style={{ paddingRight: 40 }}
            />
            <button type="button" onClick={() => setShowPin(v => !v)}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', padding:4 }}>
              {showPin ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </Row>
        <Row label="Confirm New PIN">
          <input
            className="input"
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={confirmPin}
            placeholder="••••••••"
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
          />
        </Row>
        <StatusMsg ok={pinOk} err={pinErr} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <SaveButton
            loading={savingPin}
            saved={!!pinOk}
            onClick={handlePinChange}
            label="Update PIN"
            disabled={newPin.length < 8 || confirmPin.length < 8}
          />
        </div>
      </Section>

      <style>{`
        .stab { overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:24px; }
        .banner-row { display:flex; align-items:center; gap:10px;
          padding:8px; background:var(--bg-3); border:1px solid var(--border-1);
          border-radius:var(--r-s); }
        .banner-thumb { width:60px; height:36px; object-fit:cover; border-radius:3px;
          flex-shrink:0; background:var(--bg-4); }
        .cat-row { display:flex; align-items:center; gap:8px;
          padding:8px 10px; background:var(--bg-2); border:1px solid var(--border-1);
          border-radius:var(--r-s); }
        @media(max-width:640px){
          .stab{ padding:16px; }
          div[style*='grid-template-columns: 1fr 1fr 1fr']{
            grid-template-columns:1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--bg-3)', border:'1px solid var(--border-1)', borderRadius:'var(--r-l)', overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border-1)' }}>
        <p style={{ fontSize:'var(--text-xs)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)' }}>
          {title}
        </p>
      </div>
      <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:12 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <label style={{ fontSize:'var(--text-xs)', color:'var(--text-3)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
