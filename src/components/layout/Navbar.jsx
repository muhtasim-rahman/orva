import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toggleLanguage } from '@/i18n';
import { motion } from 'framer-motion';

const LINKS = [
  { to: '/',         key: 'nav.home'     },
  { to: '/products', key: 'nav.products' },
  { to: '/about',    key: 'nav.about'    },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location    = useLocation();
  const lang        = i18n.language;

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="ORVA — Home">
          <img src="/assets/logo-white.webp" alt="ORVA" className="navbar-logo-img" />
        </Link>

        {/* Desktop nav links */}
        <nav className="navbar-links" aria-label="Main navigation">
          {LINKS.map(({ to, key }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-link ${isActive(to) ? 'active' : ''}`}
            >
              {t(key)}
              {isActive(to) && (
                <motion.span
                  layoutId="nav-indicator"
                  className="navbar-link-dot"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}

          {/* Language toggle */}
          <button
            className="navbar-lang"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            title={lang === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
          >
            <span className={lang === 'en' ? 'active' : ''}>EN</span>
            <span className="navbar-lang-sep">|</span>
            <span className={lang === 'bn' ? 'active' : ''}>বাং</span>
          </button>
        </nav>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--nav-h);
          background: var(--bg-overlay);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border-1);
          z-index: var(--z-sticky);
        }
        .navbar-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .navbar-logo-img {
          height: 28px;
          width: auto;
          object-fit: contain;
          filter: brightness(1);
          transition: opacity var(--t-fast);
        }
        .navbar-logo:hover .navbar-logo-img { opacity: 0.75; }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar-link {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 14px;
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: var(--tracking-widest);
          text-transform: uppercase;
          color: var(--text-3);
          transition: color var(--t-fast);
          border-radius: var(--r-s);
        }
        .navbar-link:hover { color: var(--text-1); }
        .navbar-link.active { color: var(--text-1); }
        .navbar-link-dot {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--accent);
        }

        .navbar-lang {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: var(--tracking-wider);
          color: var(--text-3);
          border-radius: var(--r-s);
          transition: color var(--t-fast);
          margin-left: 8px;
          border: 1px solid var(--border-2);
        }
        .navbar-lang:hover { color: var(--text-1); border-color: var(--border-3); }
        .navbar-lang .active { color: var(--text-1); }
        .navbar-lang-sep { color: var(--border-3); }

        /* Hide desktop nav on mobile — MobileTabBar handles it */
        @media (max-width: 640px) {
          .navbar-links { display: none; }
          .navbar-logo-img { height: 22px; }
        }
      `}</style>
    </header>
  );
}
