import { useTranslation } from 'react-i18next';
import { tField } from '@/i18n';
import { formatPrice, truncate } from '@/utils';
import { Tag } from 'lucide-react';

/** Minimal live preview of a product card + slug header */
export default function ProductPreview({ product = {} }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const title    = tField(product.title, lang) || 'Product Title';
  const desc     = tField(product.description, lang) || '';
  const price    = product.basePrice;
  const images   = product.images || [];
  const tags     = product.tags   || [];
  const category = product.category || '';

  return (
    <div className="prev-wrap">
      <p className="prev-label">Card Preview</p>

      {/* Card */}
      <div className="prev-card">
        <div className="prev-img-wrap">
          {images[0] ? (
            <img src={images[0]} alt={title} className="prev-img" />
          ) : (
            <div className="prev-img-placeholder">
              <img src="/assets/logo-white.webp" alt="ORVA" style={{ height: 20, opacity: 0.15 }} />
            </div>
          )}
          {product.badge && <span className="prev-badge">{product.badge}</span>}
          {product.pinned && !product.badge && <span className="prev-badge prev-badge-accent">Featured</span>}
          {!product.published && <span className="prev-badge prev-badge-warn">Draft</span>}
        </div>
        <div className="prev-body">
          <p className="prev-title">{title}</p>
          {desc && <p className="prev-desc">{truncate(desc, 55)}</p>}
          {tags.length > 0 && (
            <div className="prev-tags">
              {tags.slice(0, 3).map((t, i) => <span key={i} className="prev-tag">{t}</span>)}
            </div>
          )}
          <div className="prev-footer">
            {category && <span className="prev-cat">{category}</span>}
            {price != null && (
              <span className="prev-price">
                <span style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)' }}>from </span>
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Slug header preview */}
      <p className="prev-label" style={{ marginTop: 16 }}>Slug Preview</p>
      <div className="prev-slug">
        <div className="prev-slug-img">
          {images[0] ? (
            <img src={images[0]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/logo-white.webp" alt="ORVA" style={{ height: 16, opacity: 0.15 }} />
            </div>
          )}
        </div>
        <div style={{ padding: '10px 0' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', lineHeight: 1.2, color: 'var(--text-1)', marginBottom: 6 }}>
            {title}
          </p>
          {price != null && (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--text-1)' }}>
              {formatPrice(price)}
            </p>
          )}
        </div>
        {images.length > 1 && (
          <p style={{ fontSize: 9, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            +{images.length - 1} more image{images.length > 2 ? 's' : ''}
          </p>
        )}
      </div>

      <style>{`
        .prev-wrap { display: flex; flex-direction: column; }
        .prev-label { font-size: 9px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--text-4); margin-bottom: 8px; }
        .prev-card { background: var(--bg-3); border: 1px solid var(--border-1);
          border-radius: var(--r-l); overflow: hidden; }
        .prev-img-wrap { position: relative; aspect-ratio: 3/4; background: var(--bg-4); }
        .prev-img { width: 100%; height: 100%; object-fit: cover; }
        .prev-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .prev-badge { position: absolute; top: 8px; left: 8px; font-size: 8px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; background: var(--bg-overlay);
          backdrop-filter: blur(6px); color: var(--text-1); padding: 2px 7px;
          border-radius: var(--r-f); border: 1px solid var(--border-2); }
        .prev-badge-accent { color: var(--accent); border-color: var(--accent-dim); }
        .prev-badge-warn { color: var(--warn); border-color: var(--warn-dim); }
        .prev-body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 5px; }
        .prev-title { font-family: var(--font-display); font-size: 14px; font-weight: 400;
          color: var(--text-1); line-height: 1.3; margin: 0; }
        .prev-desc { font-size: 10px; color: var(--text-3); line-height: 1.4; margin: 0; }
        .prev-tags { display: flex; gap: 3px; flex-wrap: nowrap; overflow: hidden; }
        .prev-tag { font-size: 8px; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-3); background: var(--bg-4); border: 1px solid var(--border-1);
          padding: 1px 5px; border-radius: var(--r-f); white-space: nowrap; }
        .prev-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 2px; }
        .prev-cat { font-size: 9px; color: var(--text-4); text-transform: uppercase; letter-spacing: 0.06em; }
        .prev-price { font-family: var(--font-display); font-size: 14px; color: var(--text-1); }

        .prev-slug { border: 1px solid var(--border-1); border-radius: var(--r-m); overflow: hidden; }
        .prev-slug-img { aspect-ratio: 4/3; background: var(--bg-3); overflow: hidden; }
      `}</style>
    </div>
  );
}
