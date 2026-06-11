import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Youtube, MessageCircle, Phone } from 'lucide-react';
import { useSettings } from '@/hooks/useProducts';
import CreatorCard from './CreatorCard';

const DEFAULT_SOCIAL = {
  facebook:  'https://www.facebook.com/profile.php?id=61590608312590',
  youtube:   'https://youtube.com/@ORVA-bd',
  messenger: 'http://m.me/61590608312590',
  whatsapp:  '8801799497717',
  phone:     '01799-497717',
};

export default function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const social = settings?.social || DEFAULT_SOCIAL;
  const phone  = settings?.site?.phone || DEFAULT_SOCIAL.phone;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" aria-label="ORVA Home">
              <img src="/assets/logo-white.webp" alt="ORVA" className="footer-logo" />
            </Link>
            <p className="footer-tagline">{t('footer.tagline')}</p>
          </div>

          {/* Navigation */}
          <div className="footer-col">
            <p className="footer-col-title">{t('footer.nav_label')}</p>
            <nav>
              <Link to="/" className="footer-link">{t('nav.home')}</Link>
              <Link to="/products" className="footer-link">{t('nav.products')}</Link>
              <Link to="/about" className="footer-link">{t('nav.about')}</Link>
            </nav>
          </div>

          {/* Social / Contact */}
          <div className="footer-col">
            <p className="footer-col-title">{t('footer.social_label')}</p>
            <div className="footer-socials">
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
                <Facebook size={16} strokeWidth={1.5} />
                <span>Facebook</span>
              </a>
              <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="YouTube">
                <Youtube size={16} strokeWidth={1.5} />
                <span>YouTube</span>
              </a>
              <a href={social.messenger} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Messenger">
                <MessageCircle size={16} strokeWidth={1.5} />
                <span>Messenger</span>
              </a>
              <a href={`tel:${phone.replace(/\D/g,'')}`} className="footer-social-link" aria-label="Phone">
                <Phone size={16} strokeWidth={1.5} />
                <span>{phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">{t('footer.copy')}</p>
          <CreatorCard />
        </div>
      </div>

      <style>{`
        .footer {
          border-top: 1px solid var(--border-1);
          padding: 60px 0 40px;
          margin-top: 80px;
        }

        @media (max-width: 640px) {
          .footer { padding-bottom: calc(var(--tab-bar-h) + 24px); }
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 40px;
          padding-bottom: 48px;
          border-bottom: 1px solid var(--border-1);
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand { grid-column: 1 / -1; }
        }

        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand { grid-column: auto; }
        }

        .footer-logo {
          height: 22px;
          width: auto;
          object-fit: contain;
          margin-bottom: 12px;
          opacity: 0.8;
        }
        .footer-tagline {
          font-size: var(--text-sm);
          color: var(--text-3);
          font-style: italic;
          font-family: var(--font-display);
          margin: 0;
        }

        .footer-col {}
        .footer-col-title {
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: var(--tracking-widest);
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 16px;
        }
        .footer-link {
          display: block;
          font-size: var(--text-sm);
          color: var(--text-3);
          padding: 4px 0;
          transition: color var(--t-fast);
        }
        .footer-link:hover { color: var(--text-1); }

        .footer-socials {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .footer-social-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-sm);
          color: var(--text-3);
          transition: color var(--t-fast);
          padding: 3px 0;
        }
        .footer-social-link:hover { color: var(--text-1); }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 28px;
          flex-wrap: wrap;
        }
        .footer-copy {
          font-size: var(--text-xs);
          color: var(--text-4);
          margin: 0;
        }
      `}</style>
    </footer>
  );
}
