import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Facebook, Phone, Youtube } from 'lucide-react';
import BannerCarousel from '@/components/ui/BannerCarousel';
import ProductCard from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { usePinnedProducts, useSettings } from '@/hooks/useProducts';

const GRID_COUNTS = { desktop: 9, tablet: 6, mobile: 5 };
function getCount() {
  if (typeof window === 'undefined') return 9;
  const w = window.innerWidth;
  if (w < 640)  return GRID_COUNTS.mobile;
  if (w < 1024) return GRID_COUNTS.tablet;
  return GRID_COUNTS.desktop;
}

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://orva-bd.web.app';

export default function Home() {
  const { t, i18n }   = useTranslation();
  const lang           = i18n.language;
  const { products: pinned, loading } = usePinnedProducts();
  const { settings }   = useSettings();

  const banners  = (() => {
    const raw = settings?.site?.banners;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : Object.values(raw);
  })();

  const social   = settings?.social || {};
  const siteName = settings?.site?.title?.[lang] || 'ORVA';
  const siteDesc = settings?.site?.description?.[lang] || 'Premium clothing, curated with intent.';
  const ogImage  = `${SITE_URL}/assets/thumbnail.webp`;

  const fb_url   = social.facebook  || 'https://www.facebook.com/profile.php?id=61590608312590';
  const wa_num   = social.whatsapp  || '8801799497717';
  const yt_url   = social.youtube   || 'https://youtube.com/@ORVA-bd';

  const gridCount = getCount();
  const shown = pinned.slice(0, gridCount);

  const fadeUp = { initial:{ opacity:0, y:20 }, whileInView:{ opacity:1, y:0 }, viewport:{ once:true }, transition:{ duration:0.5 } };

  return (
    <>
      <Helmet>
        <title>{siteName}</title>
        <meta name="description"        content={siteDesc} />
        <meta property="og:title"       content={siteName} />
        <meta property="og:description" content={siteDesc} />
        <meta property="og:image"       content={ogImage} />
        <meta property="og:url"         content={SITE_URL} />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:image"      content={ogImage} />
      </Helmet>

      <main className="page-wrap">
        <BannerCarousel banners={banners} />

        {/* ── Featured Products ── */}
        <section className="home-featured">
          <div className="container">
            <motion.div className="home-section-header" {...fadeUp}>
              <span className="label">{t('home.featured_heading')}</span>
            </motion.div>

            {loading ? (
              <div className="home-products-grid">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : shown.length === 0 ? (
              <motion.div className="home-empty" {...fadeUp}>
                <p className="home-empty-title">{t('products.no_results')}</p>
                <p className="home-empty-sub">{t('products.no_results_sub')}</p>
              </motion.div>
            ) : (
              <div className="home-products-grid">
                {shown.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            <motion.div className="home-cta-row" {...fadeUp} transition={{ delay:0.2, duration:0.5 }}>
              <Link to="/products" className="home-view-all">
                <span>{t('home.view_all')}</span>
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Social Cards ── */}
        <section className="home-social-section">
          <div className="container">
            <div className="home-social-grid">
              {/* Facebook */}
              <motion.a href={fb_url} target="_blank" rel="noopener noreferrer"
                className="home-social-card" {...fadeUp}>
                <div className="hsc-icon hsc-fb"><Facebook size={20} strokeWidth={1.5} /></div>
                <div className="hsc-info">
                  <span className="hsc-label">{t('home.fb_card_label')}</span>
                  <span className="hsc-desc">{t('home.fb_card_desc')}</span>
                </div>
                <span className="hsc-arrow"><ArrowRight size={14} /></span>
              </motion.a>

              {/* WhatsApp */}
              <motion.a href={`https://wa.me/${wa_num}`} target="_blank" rel="noopener noreferrer"
                className="home-social-card" {...fadeUp} transition={{ delay:0.07, duration:0.5 }}>
                <div className="hsc-icon hsc-wa"><Phone size={20} strokeWidth={1.5} /></div>
                <div className="hsc-info">
                  <span className="hsc-label">{t('home.wa_card_label')}</span>
                  <span className="hsc-desc">{t('home.wa_card_desc')}</span>
                </div>
                <span className="hsc-arrow"><ArrowRight size={14} /></span>
              </motion.a>

              {/* YouTube */}
              <motion.a href={yt_url} target="_blank" rel="noopener noreferrer"
                className="home-social-card" {...fadeUp} transition={{ delay:0.14, duration:0.5 }}>
                <div className="hsc-icon hsc-yt"><Youtube size={20} strokeWidth={1.5} /></div>
                <div className="hsc-info">
                  <span className="hsc-label">{t('home.yt_card_label')}</span>
                  <span className="hsc-desc">{t('home.yt_card_desc')}</span>
                </div>
                <span className="hsc-arrow"><ArrowRight size={14} /></span>
              </motion.a>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .home-featured { padding:64px 0 48px; }
        @media(max-width:640px){ .home-featured{ padding:48px 0 32px; } }
        .home-section-header { margin-bottom:32px; }
        .home-products-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media(max-width:1024px){ .home-products-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:640px) { .home-products-grid{ grid-template-columns:1fr; gap:12px; } }
        .home-empty { text-align:center; padding:48px 0; }
        .home-empty-title { font-family:var(--font-display); font-size:var(--text-xl); color:var(--text-1); margin:0 0 6px; }
        .home-empty-sub { font-size:var(--text-sm); color:var(--text-3); margin:0; }
        .home-cta-row { display:flex; justify-content:center; margin-top:40px; }
        .home-view-all { display:inline-flex; align-items:center; gap:8px;
          font-size:var(--text-xs); font-weight:500; letter-spacing:var(--tracking-widest);
          text-transform:uppercase; color:var(--text-2); padding:12px 28px;
          border:1px solid var(--border-2); border-radius:var(--r-f);
          transition:all var(--t-base); }
        .home-view-all:hover { color:var(--text-1); border-color:var(--border-3); background:var(--bg-2); }

        .home-social-section { padding:0 0 80px; }
        .home-social-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(max-width:768px){ .home-social-grid{ grid-template-columns:1fr; } }

        .home-social-card { display:flex; align-items:center; gap:14px;
          padding:18px 20px; background:var(--bg-2); border:1px solid var(--border-1);
          border-radius:var(--r-l); transition:border-color var(--t-base); text-decoration:none; }
        .home-social-card:hover { border-color:var(--border-3); }
        .hsc-icon { width:42px; height:42px; flex-shrink:0; border-radius:var(--r-m);
          background:var(--bg-3); border:1px solid var(--border-2);
          display:flex; align-items:center; justify-content:center; }
        .hsc-fb { color:#4267B2; }
        .hsc-wa { color:#25D366; }
        .hsc-yt { color:#FF0000; }
        .hsc-info { flex:1; display:flex; flex-direction:column; gap:2px; overflow:hidden; }
        .hsc-label { font-size:var(--text-sm); font-weight:500; color:var(--text-1);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .hsc-desc  { font-size:var(--text-xs); color:var(--text-3); white-space:nowrap;
          overflow:hidden; text-overflow:ellipsis; }
        .hsc-arrow { color:var(--text-3); flex-shrink:0; transition:color var(--t-fast); }
        .home-social-card:hover .hsc-arrow { color:var(--text-1); }
      `}</style>
    </>
  );
}
