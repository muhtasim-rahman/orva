import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Facebook, Youtube, MessageCircle, Phone, Mail, Send, Check, AlertCircle } from 'lucide-react';
import { useSettings } from '@/hooks/useProducts';
import { getDeviceInfo } from '@/utils';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

const CATEGORIES = ['about.cat_general','about.cat_order','about.cat_feedback','about.cat_partnership'];

const SOCIAL_LINKS = [
  { key: 'facebook',  icon: Facebook,       label: 'Facebook',  href: s => s?.facebook  || 'https://www.facebook.com/profile.php?id=61590608312590' },
  { key: 'youtube',   icon: Youtube,        label: 'YouTube',   href: s => s?.youtube   || 'https://youtube.com/@ORVA-bd' },
  { key: 'messenger', icon: MessageCircle,  label: 'Messenger', href: s => s?.messenger || 'http://m.me/61590608312590' },
];

export default function About() {
  const { t, i18n } = useTranslation();
  const lang         = i18n.language;
  const { settings } = useSettings();
  const social       = settings?.social || {};
  const phone        = settings?.site?.phone || '01799-497717';

  const [form, setForm]     = useState({ name: '', email: '', phone: '', category: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    const deviceInfo = getDeviceInfo();
    const subject    = `[ORVA] ${t(form.category || 'about.cat_general')} — ${form.name}`;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key:   WEB3FORMS_KEY,
          subject,
          from_name:    form.name,
          email:        form.email,
          name:         form.name,
          phone:        form.phone,
          category:     t(form.category || 'about.cat_general'),
          message:      form.message,
          device_info:  deviceInfo,
          lang,
          // Honeypot
          botcheck: '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', category: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
    item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } },
  };

  return (
    <>
      <Helmet>
        <title>{t('about.heading')} — ORVA</title>
        <meta name="description" content="Learn about ORVA and get in touch with us." />
        <meta property="og:title"       content={`${t('about.heading')} — ORVA`} />
        <meta property="og:description" content="Learn about ORVA and get in touch with us." />
      </Helmet>

      <main className="page-wrap about-page">
        <div className="container">

          {/* ── About Section ── */}
          <motion.section
            className="about-section"
            variants={stagger.container}
            initial="hidden"
            animate="show"
          >
            <motion.span className="label" variants={stagger.item}>ORVA</motion.span>
            <motion.h1 className="about-heading" variants={stagger.item}>
              {t('about.heading')}
            </motion.h1>
            <motion.p className={`about-tagline ${lang === 'bn' ? 'lang-bn' : ''}`} variants={stagger.item}>
              {t('about.tagline')}
            </motion.p>
            <motion.p className={`about-story ${lang === 'bn' ? 'lang-bn' : ''}`} variants={stagger.item}>
              {t('about.story')}
            </motion.p>

            {/* Social Links */}
            <motion.div className="about-socials" variants={stagger.item}>
              <p className="about-socials-label">{t('about.social_heading')}</p>
              <div className="about-social-grid">
                {SOCIAL_LINKS.map(({ key, icon: Icon, label, href }) => (
                  <a
                    key={key}
                    href={href(social)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-card"
                    aria-label={label}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{label}</span>
                  </a>
                ))}
                <a href={`tel:${phone.replace(/\D/g,'')}`} className="about-social-card" aria-label="Phone">
                  <Phone size={18} strokeWidth={1.5} />
                  <span>{phone}</span>
                </a>
              </div>
            </motion.div>
          </motion.section>

          <div className="about-divider" />

          {/* ── Contact Form ── */}
          <section className="contact-section">
            <div className="contact-grid">
              <div className="contact-intro">
                <span className="label">{t('about.contact_heading')}</span>
                <h2 className="contact-heading">{t('about.contact_heading')}</h2>
                <div className="contact-info-list">
                  <a href={`mailto:hello.orvabd@gmail.com`} className="contact-info-item">
                    <Mail size={16} strokeWidth={1.5} />
                    <span>hello.orvabd@gmail.com</span>
                  </a>
                  <a href={`tel:${phone.replace(/\D/g,'')}`} className="contact-info-item">
                    <Phone size={16} strokeWidth={1.5} />
                    <span>{phone}</span>
                  </a>
                </div>
              </div>

              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                {/* Honeypot */}
                <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex="-1" />

                <div className="contact-form-row">
                  <div className="form-field">
                    <label className="form-label">{t('about.form_name')} <span className="form-req">*</span></label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      required
                      disabled={status === 'sending'}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">{t('about.form_email')} <span className="form-req">*</span></label>
                    <input
                      className="input"
                      type="email"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      required
                      disabled={status === 'sending'}
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="form-field">
                    <label className="form-label">{t('about.form_phone')}</label>
                    <input
                      className="input"
                      type="tel"
                      value={form.phone}
                      onChange={e => setField('phone', e.target.value)}
                      disabled={status === 'sending'}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">{t('about.form_category')}</label>
                    <select
                      className="input"
                      value={form.category}
                      onChange={e => setField('category', e.target.value)}
                      disabled={status === 'sending'}
                    >
                      <option value="">—</option>
                      {CATEGORIES.map(k => (
                        <option key={k} value={k}>{t(k)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">{t('about.form_message')} <span className="form-req">*</span></label>
                  <textarea
                    className="input"
                    rows={5}
                    value={form.message}
                    onChange={e => setField('message', e.target.value)}
                    required
                    disabled={status === 'sending'}
                  />
                </div>

                {/* Status messages */}
                {status === 'success' && (
                  <motion.div
                    className="form-status form-success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Check size={14} /> {t('about.form_success')}
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    className="form-status form-error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle size={14} /> {t('about.form_error')}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary contact-submit"
                  disabled={status === 'sending' || status === 'success'}
                >
                  {status === 'sending' ? (
                    <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> {t('about.form_sending')}</>
                  ) : (
                    <><Send size={14} strokeWidth={1.5} /> {t('about.form_submit')}</>
                  )}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .about-page { padding-top: calc(var(--nav-h) + 48px); padding-bottom: 80px; }

        .about-section { max-width: 720px; margin-bottom: 64px; }
        .about-section .label { display: block; margin-bottom: 12px; }
        .about-heading {
          font-size: clamp(2.5rem, 6vw, 5rem);
          letter-spacing: var(--tracking-tight);
          margin-bottom: 20px;
        }
        .about-tagline {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-style: italic;
          color: var(--text-2);
          margin-bottom: 20px;
        }
        .about-story { font-size: var(--text-md); max-width: 580px; line-height: 1.7; }

        .about-socials { margin-top: 36px; }
        .about-socials-label {
          font-size: var(--text-xs); letter-spacing: var(--tracking-widest);
          text-transform: uppercase; color: var(--text-3); margin-bottom: 12px;
        }
        .about-social-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .about-social-card {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; background: var(--bg-2);
          border: 1px solid var(--border-1); border-radius: var(--r-s);
          font-size: var(--text-sm); color: var(--text-2);
          transition: all var(--t-fast);
        }
        .about-social-card:hover { border-color: var(--border-3); color: var(--text-1); }

        .about-divider { height: 1px; background: var(--border-1); margin: 0 0 64px; }

        /* Contact */
        .contact-section {}
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr; gap: 36px; }
        }

        .contact-intro {}
        .contact-intro .label { display: block; margin-bottom: 12px; }
        .contact-heading {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 400; letter-spacing: var(--tracking-tight);
          margin-bottom: 24px;
        }
        .contact-info-list { display: flex; flex-direction: column; gap: 10px; }
        .contact-info-item {
          display: flex; align-items: center; gap: 10px;
          font-size: var(--text-sm); color: var(--text-3);
          transition: color var(--t-fast);
        }
        .contact-info-item:hover { color: var(--text-1); }

        .contact-form { display: flex; flex-direction: column; gap: 16px; }
        .contact-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .contact-form-row { grid-template-columns: 1fr; } }

        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: var(--text-xs); color: var(--text-3); letter-spacing: 0.06em; text-transform: uppercase; }
        .form-req { color: var(--err); }

        .form-status {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: var(--r-s);
          font-size: var(--text-sm);
        }
        .form-success { background: var(--ok-dim); color: var(--ok); border: 1px solid rgba(90,154,122,0.2); }
        .form-error   { background: var(--err-dim); color: var(--err); border: 1px solid rgba(196,83,74,0.2); }

        .contact-submit { align-self: flex-start; gap: 8px; }

        @media (max-width: 640px) {
          .about-page { padding-top: calc(var(--nav-h) + 28px); }
          .contact-submit { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
