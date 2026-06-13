import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Grid2X2, Info } from 'lucide-react';
import { toggleLanguage } from '@/i18n';
import { motion } from 'framer-motion';

const TABS = [
  { to: '/',         icon: Home,     key: 'nav.home'     },
  { to: '/products', icon: Grid2X2,  key: 'nav.products' },
  { to: '/about',    icon: Info,     key: 'nav.about'    },
];

export default function MobileTabBar() {
  const { t, i18n } = useTranslation();
  const location    = useLocation();

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  if (location.pathname.startsWith('/admin')) return null;

  // v1.2: clicking the active tab scrolls to top
  const handleTabClick = (e, to) => {
    if (isActive(to)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="tab-bar" aria-label="Mobile navigation">
      {TABS.map(({ to, icon: Icon, key }) => {
        const active = isActive(to);
        return (
          <Link key={to} to={to} className={`tab-bar-item ${active ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, to)}>
            <span className="tab-bar-icon">
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="tab-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </span>
            <span className="tab-bar-label">{t(key)}</span>
          </Link>
        );
      })}

      {/* Language toggle tab */}
      <button className="tab-bar-item" onClick={toggleLanguage} aria-label="Toggle language">
        <span className="tab-bar-icon tab-lang-icon">
          <span className={i18n.language === 'en' ? 'lang-active' : ''}>EN</span>
          <span className="tab-lang-sep">/</span>
          <span className={i18n.language === 'bn' ? 'lang-active' : ''}>বাং</span>
        </span>
        <span className="tab-bar-label">{t('common.language')}</span>
      </button>

      <style>{`
        .tab-bar {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: var(--tab-bar-h);
          background: var(--bg-overlay);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-1);
          z-index: var(--z-sticky);
          padding: 0 4px;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        @media (max-width: 640px) {
          .tab-bar { display: flex; align-items: stretch; justify-content: space-around; }
        }
        .tab-bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 4px;
          color: var(--text-3);
          transition: color var(--t-fast);
          border-radius: var(--r-m);
          position: relative;
          cursor: pointer;
          border: none;
          background: none;
          font-family: var(--font-body);
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .tab-bar-item.active { color: var(--text-1); }
        .tab-bar-item:active { background: var(--bg-3); }
        .tab-bar-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px; height: 28px;
        }
        .tab-indicator {
          position: absolute;
          inset: -4px;
          border-radius: var(--r-m);
          background: var(--bg-4);
          z-index: -1;
        }
        .tab-bar-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tab-lang-icon {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.04em;
          gap: 1px;
          width: auto;
          padding: 0 4px;
        }
        .lang-active { color: var(--text-1); }
        .tab-lang-sep { color: var(--border-3); margin: 0 1px; }
      `}</style>
    </nav>
  );
}
