import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

export default function CreatorCard() {
  const { t } = useTranslation();

  return (
    <a
      href="https://mdturzo.web.app"
      target="_blank"
      rel="noopener noreferrer"
      className="creator-card"
      aria-label="Crafted by Muhtasim Rahman — mdturzo.web.app"
    >
      <img
        src="/assets/muhtasim.webp"
        alt="Muhtasim Rahman"
        className="creator-avatar"
        loading="lazy"
      />
      <div className="creator-info">
        <span className="creator-label">{t('footer.crafted')}</span>
        <span className="creator-name">Muhtasim Rahman</span>
      </div>
      <ExternalLink size={12} className="creator-arrow" />

      <style>{`
        .creator-card {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px 8px 8px;
          background: var(--bg-3);
          border: 1px solid var(--border-2);
          border-radius: var(--r-f);
          transition: border-color var(--t-base), background var(--t-base);
          cursor: pointer;
          text-decoration: none;
        }
        .creator-card:hover {
          border-color: var(--border-3);
          background: var(--bg-4);
        }

        .creator-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          object-position: top center;
          flex-shrink: 0;
          border: 1px solid var(--border-2);
        }

        .creator-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .creator-label {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-3);
          font-weight: 500;
        }
        .creator-name {
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--text-2);
          line-height: 1;
        }
        .creator-arrow {
          color: var(--text-3);
          flex-shrink: 0;
          margin-left: 2px;
        }
      `}</style>
    </a>
  );
}
