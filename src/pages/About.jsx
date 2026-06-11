import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Facebook, Youtube, MessageCircle, Phone, Mail, Send, Check, AlertCircle, MapPin, GraduationCap } from 'lucide-react';
import { useSettings } from '@/hooks/useProducts';
import { getDeviceInfo } from '@/utils';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://orva-bd.web.app';
const CATEGORIES = ['about.cat_general','about.cat_order','about.cat_feedback','about.cat_partnership'];
const SOCIAL_LINKS = [
  { key:'facebook',  icon:Facebook,      label:'Facebook',  href:s=>s?.facebook  ||'https://www.facebook.com/profile.php?id=61590608312590' },
  { key:'youtube',   icon:Youtube,       label:'YouTube',   href:s=>s?.youtube   ||'https://youtube.com/@ORVA-bd' },
  { key:'messenger', icon:MessageCircle, label:'Messenger', href:s=>s?.messenger ||'http://m.me/61590608312590' },
];

export default function About() {
  const { t, i18n } = useTranslation();
  const lang         = i18n.language;
  const { settings } = useSettings();
  const social = settings?.social || {};
  const phone  = settings?.site?.phone || '01799-497717';

  const [form, setForm]   = useState({ name:'', email:'', phone:'', category:'', message:'' });
  const [status, setStatus] = useState('idle');
  const setField = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[ORVA] ${t(form.category||'about.cat_general')} — ${form.name}`,
          from_name: form.name, email: form.email, name: form.name,
          phone: form.phone, category: t(form.category||'about.cat_general'),
          message: form.message, device_info: getDeviceInfo(), lang, botcheck:'',
        }),
      });
      const data = await res.json();
      if (data.success) { setStatus('success'); setForm({name:'',email:'',phone:'',category:'',message:''}); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  const stagger = {
    container:{ hidden:{}, show:{ transition:{ staggerChildren:0.08 } } },
    item:{ hidden:{opacity:0,y:16}, show:{opacity:1,y:0} },
  };

  return (
    <>
      <Helmet>
        <title>{t('about.heading')} — ORVA</title>
        <meta name="description" content="Learn about ORVA and get in touch with us." />
        <meta property="og:title"       content={`${t('about.heading')} — ORVA`} />
        <meta property="og:description" content="Learn about ORVA and get in touch with us." />
        <meta property="og:image"       content={`${SITE_URL}/assets/thumbnail.webp`} />
      </Helmet>

      <main className="page-wrap about-page">
        <div className="container">

          {/* ── Brand Story ── */}
          <motion.section className="about-section" variants={stagger.container} initial="hidden" animate="show">
            <motion.span className="label" variants={stagger.item}>ORVA</motion.span>
            <motion.h1 className="about-heading" variants={stagger.item}>{t('about.heading')}</motion.h1>
            <motion.p className={`about-tagline ${lang==='bn'?'lang-bn':''}`} variants={stagger.item}>
              {t('about.tagline')}
            </motion.p>
            <motion.p className={`about-story ${lang==='bn'?'lang-bn':''}`} variants={stagger.item}>
              {t('about.story')}
            </motion.p>

            {/* Social Links */}
            <motion.div className="about-socials" variants={stagger.item}>
              <p className="about-socials-label">{t('about.social_heading')}</p>
              <div className="about-social-grid">
                {SOCIAL_LINKS.map(({key, icon:Icon, label, href}) => (
                  <a key={key} href={href(social)} target="_blank" rel="noopener noreferrer" className="about-social-card">
                    <Icon size={16} strokeWidth={1.5} /><span>{label}</span>
                  </a>
                ))}
                <a href={`tel:${phone.replace(/\D/g,'')}`} className="about-social-card">
                  <Phone size={16} strokeWidth={1.5} /><span>{phone}</span>
                </a>
              </div>
            </motion.div>
          </motion.section>

          <div className="about-divider" />

          {/* ── Founder Section ── */}
          <section className="founder-section">
            <div className="founder-grid">
              {/* Photo */}
              <div className="founder-photo-wrap">
                <div className="founder-photo">
                  <img src="/assets/badhon.webp" alt="Badhon Kumar Roy"
                    className="founder-img"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                  />
                  <div className="founder-photo-fallback" style={{display:'none'}}>
                    <span>B</span>
                  </div>
                </div>
                <div className="founder-photo-label">
                  <p className="founder-name">Badhon Kumar Roy</p>
                  <p className="founder-role">Founder · ORVA</p>
                </div>
              </div>

              {/* Info */}
              <div className="founder-info">
                <span className="label" style={{display:'block',marginBottom:12}}>The Founder</span>
                <h2 className="founder-heading">Meet BADHON</h2>
                <p className={`founder-desc ${lang==='bn'?'lang-bn':''}`}>
                  {lang === 'bn'
                    ? 'ORVA হলো বাধনের একটি স্বপ্ন — মানসম্পন্ন পোশাক সবার কাছে পৌঁছে দেওয়ার। Saidpur, Nilphamari থেকে উঠে আসা এই তরুণ উদ্যোক্তা তার ব্র্যান্ডকে ভালোবাসা আর পরিশ্রম দিয়ে গড়ে তুলছেন।'
                    : 'ORVA is Badhon\'s dream — bringing quality clothing to everyone who values how they look and feel. A young entrepreneur from Saidpur, Nilphamari, building his brand one piece at a time with care and craftsmanship.'
                  }
                </p>

                <div className="founder-details">
                  <div className="founder-detail-row">
                    <MapPin size={14} strokeWidth={1.5} className="fd-icon" />
                    <div>
                      <p className="fd-label">Location</p>
                      <p className="fd-value">Saidpur, Nilphamari, Bangladesh</p>
                    </div>
                  </div>
                  <div className="founder-detail-row">
                    <GraduationCap size={14} strokeWidth={1.5} className="fd-icon" />
                    <div>
                      <p className="fd-label">Education</p>
                      <p className="fd-value">SSC '26 — Saidpur Govt. Science College</p>
                      <p className="fd-value" style={{marginTop:2}}>HSC '28 Batch</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="about-divider" />

          {/* ── Contact Form ── */}
          <section className="contact-section">
            <div className="contact-grid">
              <div className="contact-intro">
                <span className="label" style={{display:'block',marginBottom:12}}>{t('about.contact_heading')}</span>
                <h2 className="contact-heading">{t('about.contact_heading')}</h2>
                <div className="contact-info-list">
                  <a href="mailto:hello.orvabd@gmail.com" className="contact-info-item">
                    <Mail size={15} strokeWidth={1.5}/><span>hello.orvabd@gmail.com</span>
                  </a>
                  <a href={`tel:${phone.replace(/\D/g,'')}`} className="contact-info-item">
                    <Phone size={15} strokeWidth={1.5}/><span>{phone}</span>
                  </a>
                </div>
              </div>

              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <input type="checkbox" name="botcheck" style={{display:'none'}} tabIndex="-1" />
                <div className="contact-form-row">
                  <FField label={`${t('about.form_name')} *`}>
                    <input className="input" value={form.name} onChange={e=>setField('name',e.target.value)} required disabled={status==='sending'} />
                  </FField>
                  <FField label={`${t('about.form_email')} *`}>
                    <input className="input" type="email" value={form.email} onChange={e=>setField('email',e.target.value)} required disabled={status==='sending'} />
                  </FField>
                </div>
                <div className="contact-form-row">
                  <FField label={t('about.form_phone')}>
                    <input className="input" type="tel" value={form.phone} onChange={e=>setField('phone',e.target.value)} disabled={status==='sending'} />
                  </FField>
                  <FField label={t('about.form_category')}>
                    <select className="input" value={form.category} onChange={e=>setField('category',e.target.value)} disabled={status==='sending'}>
                      <option value="">—</option>
                      {CATEGORIES.map(k=><option key={k} value={k}>{t(k)}</option>)}
                    </select>
                  </FField>
                </div>
                <FField label={`${t('about.form_message')} *`}>
                  <textarea className="input" rows={5} value={form.message} onChange={e=>setField('message',e.target.value)} required disabled={status==='sending'} />
                </FField>

                {status==='success' && (
                  <motion.div className="form-status form-success" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                    <Check size={13}/> {t('about.form_success')}
                  </motion.div>
                )}
                {status==='error' && (
                  <motion.div className="form-status form-error" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                    <AlertCircle size={13}/> {t('about.form_error')}
                  </motion.div>
                )}

                <button type="submit" className="btn btn-primary contact-submit"
                  disabled={status==='sending'||status==='success'}>
                  {status==='sending'
                    ? <><span className="spinner" style={{width:14,height:14,borderWidth:1.5}}/> {t('about.form_sending')}</>
                    : <><Send size={14} strokeWidth={1.5}/> {t('about.form_submit')}</>
                  }
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .about-page { padding-top:calc(var(--nav-h) + 48px); padding-bottom:80px; }
        @media(max-width:640px){ .about-page{ padding-top:calc(var(--nav-h) + 28px); } }
        .about-section { max-width:720px; margin-bottom:64px; }
        .about-section .label { display:block; margin-bottom:12px; }
        .about-heading { font-size:clamp(2.5rem,6vw,5rem); letter-spacing:var(--tracking-tight); margin-bottom:20px; }
        .about-tagline { font-family:var(--font-display); font-size:var(--text-xl); font-style:italic; color:var(--text-2); margin-bottom:20px; }
        .about-story { font-size:var(--text-md); max-width:580px; line-height:1.7; }
        .about-socials { margin-top:36px; }
        .about-socials-label { font-size:var(--text-xs); letter-spacing:var(--tracking-widest);
          text-transform:uppercase; color:var(--text-3); margin-bottom:12px; }
        .about-social-grid { display:flex; flex-wrap:wrap; gap:8px; }
        .about-social-card { display:flex; align-items:center; gap:8px; padding:8px 16px;
          background:var(--bg-2); border:1px solid var(--border-1); border-radius:var(--r-s);
          font-size:var(--text-sm); color:var(--text-2); transition:all var(--t-fast); }
        .about-social-card:hover { border-color:var(--border-3); color:var(--text-1); }
        .about-divider { height:1px; background:var(--border-1); margin:0 0 64px; }

        /* Founder */
        .founder-section { margin-bottom:64px; }
        .founder-grid { display:grid; grid-template-columns:200px 1fr; gap:48px; align-items:start; }
        @media(max-width:640px){ .founder-grid{ grid-template-columns:1fr; gap:28px; } }
        .founder-photo-wrap { display:flex; flex-direction:column; align-items:center; gap:12px; }
        .founder-photo { width:160px; height:160px; border-radius:var(--r-xl);
          overflow:hidden; background:var(--bg-3); border:1px solid var(--border-2);
          position:relative; flex-shrink:0; }
        .founder-img { width:100%; height:100%; object-fit:cover; object-position:top; }
        .founder-photo-fallback { width:100%; height:100%; display:flex; align-items:center;
          justify-content:center; font-family:var(--font-display); font-size:4rem; color:var(--text-3); }
        .founder-photo-label { text-align:center; }
        .founder-name { font-size:var(--text-sm); font-weight:500; color:var(--text-1); margin:0; }
        .founder-role { font-size:var(--text-xs); color:var(--text-3); margin:2px 0 0; letter-spacing:.05em; }
        .founder-heading { font-family:var(--font-display); font-size:clamp(1.8rem,3.5vw,2.8rem);
          font-weight:400; letter-spacing:var(--tracking-tight); margin-bottom:16px; }
        .founder-desc { font-size:var(--text-md); color:var(--text-2); line-height:1.7;
          max-width:520px; margin-bottom:28px; font-weight:300; }
        .founder-details { display:flex; flex-direction:column; gap:14px; }
        .founder-detail-row { display:flex; align-items:flex-start; gap:10px; }
        .fd-icon { color:var(--text-3); margin-top:2px; flex-shrink:0; }
        .fd-label { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
          color:var(--text-3); margin-bottom:3px; }
        .fd-value { font-size:var(--text-sm); color:var(--text-2); margin:0; }

        /* Contact */
        .contact-grid { display:grid; grid-template-columns:1fr 1.6fr; gap:64px; align-items:start; }
        @media(max-width:768px){ .contact-grid{ grid-template-columns:1fr; gap:36px; } }
        .contact-heading { font-family:var(--font-display); font-size:clamp(1.8rem,3.5vw,2.8rem);
          font-weight:400; letter-spacing:var(--tracking-tight); margin-bottom:24px; }
        .contact-info-list { display:flex; flex-direction:column; gap:10px; }
        .contact-info-item { display:flex; align-items:center; gap:10px; font-size:var(--text-sm);
          color:var(--text-3); transition:color var(--t-fast); }
        .contact-info-item:hover { color:var(--text-1); }
        .contact-form { display:flex; flex-direction:column; gap:16px; }
        .contact-form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(max-width:480px){ .contact-form-row{ grid-template-columns:1fr; } }
        .form-status { display:flex; align-items:center; gap:8px; padding:10px 14px;
          border-radius:var(--r-s); font-size:var(--text-sm); }
        .form-success { background:var(--ok-dim); color:var(--ok); border:1px solid rgba(90,154,122,.2); }
        .form-error   { background:var(--err-dim); color:var(--err); border:1px solid rgba(196,83,74,.2); }
        .contact-submit { align-self:flex-start; gap:8px; }
        @media(max-width:640px){ .contact-submit{ width:100%; justify-content:center; } }
      `}</style>
    </>
  );
}

function FField({ label, children }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      <label style={{fontSize:'var(--text-xs)',color:'var(--text-3)',letterSpacing:'0.06em',textTransform:'uppercase'}}>
        {label}
      </label>
      {children}
    </div>
  );
}
