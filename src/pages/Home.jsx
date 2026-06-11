import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Facebook } from 'lucide-react';
import BannerCarousel from '@/components/ui/BannerCarousel';
import ProductCard from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { usePinnedProducts, useSettings } from '@/hooks/useProducts';

// Pinned product counts per viewport
const GRID_COUNTS = { desktop: 9, tablet: 6, mobile: 5 };

function useGridCount() {
  if (typeof window === 'undefined') return GRID_COUNTS.desktop;
  const w = window.innerWidth;
  if (w < 640)  return GRID_COUNTS.mobile;
  if (w < 1024) return GRID_COUNTS.tablet;
  return GRID_COUNTS.desktop;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { products: pinned, loading } = usePinnedProducts();
  const { settings } = useSettings();

  const banners  = settings?.site?.banners  || [];
  const social   = settings?.social         || {};
  const siteName = settings?.site?.title?.[lang] || 'ORVA';
  const siteDesc = settings?.site?.description?.[lang] || 'Premium clothing, curated with intent.';
  const ogImage  = settings?.site?.ogImage  || '/assets/logo-blackBG.webp';
  const fbUrl    = social.facebook || 'https://www.facebook.com/profile.php?id=61590608312590';
  const gridCount = useGridCount();
  const shown = pinned.slice(0, gridCount);

  return (
    <>
      <Helmet>
        <title>{siteName}</title>
        <meta name="description" content={siteDesc} />
        <meta property="og:title"       content={siteName} />
        <meta property="og:description" content={siteDesc} />
        <meta property="og:image"       content={ogImage} />
        <meta property="og:url"         content={import.meta.env.VITE_SITE_URL} />
      </Helmet>

      <main className="page-wrap">
        {/* Hero Carousel */}
        <BannerCarousel banners={banners} />

        {/* Featured Products */}
        {(loading || shown.length > 0) && (
          <section className="home-featured">
            <div className="container">
              <motion.div
                className="home-section-header"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="label">{t('home.featured_heading')}</span>
              </motion.div>

              <div className="home-products-grid">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : shown.map(p => <ProductCard key={p.id} product={p} />)
                }
              </div>

              {/* View All CTA */}
              <motion.div
                className="home-cta-row"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link to="/products" className="home-view-all">
                  <span>{t('home.view_all')}</span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Facebook Page Card */}
        <section className="home-fb-section">
          <div className="container">
            <motion.a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="home-fb-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="home-fb-icon">
                <Facebook size={22} strokeWidth={1.5} />
              </div>
              <div className="home-fb-info">
                <span className="home-fb-label">{t('home.fb_card_label')}</span>
                <span className="home-fb-desc">{t('home.fb_card_desc')}</span>
              </div>
              <span className="home-fb-btn">{t('home.fb_visit')} <ArrowRight size={14} /></span>
            </motion.a>
          </div>
        </section>
      </main>

      <style>{`
        .home-featured {
          padding: 64px 0 48px;
        }
        .home-section-header {
          margin-bottom: 32px;
        }
        .home-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .home-products-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .home-products-grid { grid-template-columns: 1fr; gap: 12px; }
          .home-featured { padding: 48px 0 32px; }
        }

        .home-cta-row {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }
        .home-view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: var(--tracking-widest);
          text-transform: uppercase;
          color: var(--text-2);
          padding: 12px 28px;
          border: 1px solid var(--border-2);
          border-radius: var(--r-f);
          transition: all var(--t-base);
        }
        .home-view-all:hover { color: var(--text-1); border-color: var(--border-3); background: var(--bg-2); }

        .home-fb-section {
          padding: 0 0 80px;
        }
        .home-fb-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: var(--bg-2);
          border: 1px solid var(--border-1);
          border-radius: var(--r-l);
          transition: border-color var(--t-base);
          text-decoration: none;
          cursor: pointer;
        }
        .home-fb-card:hover { border-color: var(--border-3); }

        .home-fb-icon {
          width: 44px; height: 44px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--bg-3);
          border: 1px solid var(--border-2);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-2);
        }
        .home-fb-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .home-fb-label {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-1);
        }
        .home-fb-desc {
          font-size: var(--text-xs);
          color: var(--text-3);
        }
        .home-fb-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-3);
          white-space: nowrap;
          transition: color var(--t-fast);
          flex-shrink: 0;
        }
        .home-fb-card:hover .home-fb-btn { color: var(--text-1); }

        @media (max-width: 480px) {
          .home-fb-card { flex-wrap: wrap; }
          .home-fb-btn { width: 100%; justify-content: flex-end; }
        }
      `}</style>
    </>
  );
}
