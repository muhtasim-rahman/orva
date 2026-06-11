import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>404 — ORVA</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="page-wrap notfound-page">
        <motion.div
          className="notfound-inner"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/assets/logo-white.webp" alt="ORVA" className="notfound-logo" />
          <p className="notfound-code">404</p>
          <h1 className="notfound-heading">{t('404.heading')}</h1>
          <p className="notfound-sub">{t('404.sub')}</p>
          <Link to="/" className="btn btn-outline notfound-btn">
            <ArrowLeft size={14} strokeWidth={1.5} />
            {t('404.home')}
          </Link>
        </motion.div>

        <style>{`
          .notfound-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            text-align: center;
          }
          .notfound-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 40px 20px;
          }
          .notfound-logo {
            height: 32px;
            width: auto;
            opacity: 0.3;
            margin-bottom: 8px;
          }
          .notfound-code {
            font-family: var(--font-display);
            font-size: 7rem;
            line-height: 1;
            color: var(--border-3);
            letter-spacing: -0.04em;
            margin: 0;
          }
          .notfound-heading {
            font-size: var(--text-xl);
            font-weight: 400;
            letter-spacing: var(--tracking-tight);
            margin: 0;
          }
          .notfound-sub {
            font-size: var(--text-sm);
            color: var(--text-3);
            margin: 0;
          }
          .notfound-btn { margin-top: 8px; gap: 8px; }
        `}</style>
      </main>
    </>
  );
}
