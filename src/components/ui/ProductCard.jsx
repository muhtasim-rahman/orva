import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tField } from '@/i18n';
import { formatPrice, truncate } from '@/utils';

// v1.2: 10 seconds between image switches
const IMAGE_SWITCH_MS = 10_000;

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const images = product.images || [];
  const [imgIdx, setImgIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef(null);

  // Auto-switch images, reset loaded state on each switch
  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(() => {
      setImgIdx(i => (i + 1) % images.length);
      setLoaded(false); // v1.2: reset fade-in for next image
    }, IMAGE_SWITCH_MS);
    return () => clearInterval(timer.current);
  }, [images.length]);

  const title    = tField(product.title, lang);
  const desc     = tField(product.description, lang);
  const price    = product.basePrice;
  const tags     = (product.tags || []).slice(0, 4);
  const category = tField(product.category, lang) || product.category || '';

  return (
    <Link to={`/products/${product.slug}`} className="product-card" aria-label={title}>

      {/* ── Image (v1.2: fixed height so all cards in a row stay aligned) ── */}
      <div className="product-card-img-wrap">
        {images.length > 0 ? (
          <img
            key={imgIdx}
            src={images[imgIdx]}
            alt={title}
            className={`product-card-img ${loaded ? 'loaded' : ''}`}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="product-card-no-img">
            <img src="/assets/logo-white.webp" alt="ORVA" style={{ height: 24, opacity: 0.2 }} />
          </div>
        )}

        {/* Image dots */}
        {images.length > 1 && (
          <div className="product-card-img-dots">
            {images.map((_, i) => (
              <span key={i} className={`product-card-img-dot ${i === imgIdx ? 'active' : ''}`} />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="product-card-badges">
          {product.badge && (
            <span className="product-card-badge">{product.badge}</span>
          )}
          {product.pinned && !product.badge && (
            <span className="product-card-badge badge-featured">Featured</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="product-card-body">
        <p className="product-card-name">{title}</p>
        {desc && <p className="product-card-desc">{truncate(desc, 60)}</p>}

        {tags.length > 0 && (
          <div className="product-card-tags">
            {tags.map((tag, i) => (
              <span key={i} className="product-card-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="product-card-footer">
          {category && <span className="product-card-category">{category}</span>}
          {price != null && (
            <span className="product-card-price">
              <span className="price-from">{t('products.from_price')}</span>{' '}
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: var(--bg-2);
          border: 1px solid var(--border-1);
          border-radius: var(--r-l);
          overflow: hidden;
          transition: border-color var(--t-base), transform var(--t-base);
          text-decoration: none;
          cursor: pointer;
        }
        .product-card:hover { border-color: var(--border-3); transform: translateY(-2px); }
        .product-card:active { transform: translateY(0); }

        /*
         * v1.2 FIX: Use a fixed responsive height instead of aspect-ratio.
         * This ensures ALL cards in the same grid row have identical image heights,
         * preventing misalignment when images have different natural dimensions.
         * flex-shrink:0 prevents the image area from collapsing.
         */
        .product-card-img-wrap {
          position: relative;
          height: 280px;
          flex-shrink: 0;
          background: var(--bg-3);
          overflow: hidden;
        }
        @media (max-width: 1024px) { .product-card-img-wrap { height: 260px; } }
        @media (max-width: 768px)  { .product-card-img-wrap { height: 240px; } }
        @media (max-width: 480px)  { .product-card-img-wrap { height: 300px; } }

        .product-card-img {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .product-card-img.loaded { opacity: 1; }

        .product-card-no-img {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }

        .product-card-img-dots {
          position: absolute;
          bottom: 8px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 4px;
        }
        .product-card-img-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transition: all var(--t-fast);
        }
        .product-card-img-dot.active {
          background: rgba(255,255,255,0.9);
          width: 12px; border-radius: 2px;
        }

        .product-card-badges {
          position: absolute;
          top: 10px; left: 10px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .product-card-badge {
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--bg-overlay); backdrop-filter: blur(8px);
          color: var(--text-1); padding: 3px 8px;
          border-radius: var(--r-f); border: 1px solid var(--border-2);
        }
        .badge-featured { color: var(--accent); border-color: var(--accent-dim); }

        .product-card-body {
          padding: 14px 16px 16px;
          display: flex; flex-direction: column; gap: 6px;
          flex: 1;
        }
        .product-card-name {
          font-family: var(--font-display);
          font-size: var(--text-md); font-weight: 400;
          color: var(--text-1); line-height: var(--leading-snug); margin: 0;
        }
        .product-card-desc {
          font-size: var(--text-xs); color: var(--text-3);
          line-height: var(--leading-snug); margin: 0;
        }

        .product-card-tags {
          display: flex; flex-wrap: nowrap; gap: 4px; overflow: hidden;
        }
        .product-card-tag {
          font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-3); background: var(--bg-3);
          border: 1px solid var(--border-1);
          padding: 2px 7px; border-radius: var(--r-f); white-space: nowrap;
        }

        .product-card-footer {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-top: 4px; gap: 8px;
        }
        .product-card-category {
          font-size: var(--text-xs); color: var(--text-4);
          letter-spacing: 0.06em; text-transform: uppercase;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .product-card-price {
          font-family: var(--font-display);
          font-size: var(--text-md); color: var(--text-1); white-space: nowrap;
        }
        .product-card-price .price-from {
          font-family: var(--font-body);
          font-size: 9px; letter-spacing: 0.08em;
          color: var(--text-3); text-transform: uppercase;
        }
      `}</style>
    </Link>
  );
}
