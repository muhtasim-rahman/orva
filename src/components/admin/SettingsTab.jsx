import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import { ref, set, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useSettings } from '@/hooks/useProducts';
import ImageUploader from './ImageUploader';
import { useAuth } from '@/context/AuthContext';
import { processAndUpload } from '@/lib/imageProcessor';
import { getImgbbKey } from '@/lib/cloudflare';

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

function SaveButton({ loading, saved, onClick, label = 'Save' }) {
  return (
    <button className="btn btn-primary btn-sm" onClick={onClick} disabled={loading}>
      {loading ? <span className="spinner" style={{ width: 13, height: 13, borderWidth: 1.5 }} />
               : saved ? <Check size={13} /> : <Save size={13} />}
      {saved ? 'Saved' : label}
    </button>
  );
}

export default function SettingsTab() {
  const { t }            = useTranslation();
  const { settings }     = useSettings();
  const { user }         = useAuth();

  const [social, setSocial]   = useState({ ...DEFAULTS });
  const [site, setSite]       = useState({
    title_en: DEFAULTS.site_title_en, title_bn: DEFAULTS.site_title_bn,
    desc_en:  DEFAULTS.site_desc_en,  desc_bn:  DEFAULTS.site_desc_bn,
    phone:    DEFAULTS.phone,
  });
  const [banners, setBanners] = useState([]);
  const [savingS, setSavingS] = useState(false);
  const [savingB, setSavingB] = useState(false);
  const [savedS, setSavedS]   = useState(false);
  const [savedB, setSavedB]   = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerLink, setBannerLink] = useState('/products');

  // Load from DB
  useEffect(() => {
    if (!settings) return;
    if (settings.social) setSocial(s => ({ ...s, ...settings.social }));
    if (settings.site) {
      setSite({
        title_en: settings.site.title?.en || DEFAULTS.site_title_en,
        title_bn: settings.site.title?.bn || DEFAULTS.site_title_bn,
        desc_en:  settings.site.description?.en || DEFAULTS.site_desc_en,
        desc_bn:  settings.site.description?.bn || DEFAULTS.site_desc_bn,
        phone:    settings.site.phone    || DEFAULTS.phone,
      });
    }
    if (settings.site?.banners) setBanners(Array.isArray(settings.site.banners) ? settings.site.banners : []);
  }, [settings]);

  const saveSocial = async () => {
    setSavingS(true);
    await set(ref(db, 'settings/social'), {
      facebook: social.facebook, whatsapp: social.whatsapp,
      youtube: social.youtube, messenger: social.messenger, email: social.email,
    });
    await update(ref(db, 'settings/site'), { phone: site.phone });
    setSavingS(false); setSavedS(true);
    setTimeout(() => setSavedS(false), 2500);
  };

  const saveSite = async () => {
    setSavingS(true);
    await update(ref(db, 'settings/site'), {
      title: { en: site.title_en, bn: site.title_bn },
      description: { en: site.desc_en, bn: site.desc_bn },
    });
    setSavingS(false); setSavedS(true);
    setTimeout(() => setSavedS(false), 2500);
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

  const SF = (key) => (e) => setSocial(s => ({ ...s, [key]: e.target.value }));
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
          <SaveButton loading={savingS} saved={savedS} onClick={saveSite} />
        </div>
      </Section>

      {/* ── Hero Banners ── */}
      <Section title="Hero Banners">
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginBottom: 12 }}>
          Add banner image URLs (from imgbb or any CDN). Recommended: 1920×600px landscape.
        </p>

        {/* Existing banners */}
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
        </div>

        {/* Add new banner */}
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

      <style>{`
        .stab { overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .banner-row { display: flex; align-items: center; gap: 10px;
          padding: 8px; background: var(--bg-3); border: 1px solid var(--border-1);
          border-radius: var(--r-s); }
        .banner-thumb { width: 60px; height: 36px; object-fit: cover; border-radius: 3px;
          flex-shrink: 0; background: var(--bg-4); }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-l)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-1)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
