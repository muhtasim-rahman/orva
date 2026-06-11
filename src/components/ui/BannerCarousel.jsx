import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const INTERVAL = 5000;

const PLACEHOLDER_BANNERS = [
  { url: null, link: '/products', alt: 'ORVA Collection' },
];

export default function BannerCarousel({ banners = [] }) {
  const { t } = useTranslation();
  const items = banners.length ? banners : PLACEHOLDER_BANNERS;

  const [current, setCurrent] = useState(0);
  const [dir, setDir]         = useState(1); // 1 = forward, -1 = back
  const timer = useRef(null);

  const go = useCallback((idx, direction = 1) => {
    setDir(direction);
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    go((current + 1) % items.length, 1);
  }, [current, items.length, go]);

  const prev = useCallback(() => {
    go((current - 1 + items.length) % items.length, -1);
  }, [current, items.length, go]);

  // Auto-advance
  useEffect(() => {
    if (items.length <= 1) return;
    timer.current = setInterval(next, INTERVAL);
    return () => clearInterval(timer.current);
  }, [next, items.length]);

  const resetTimer = () => {
    clearInterval(timer.current);
    timer.current = setInterval(next, INTERVAL);
  };

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleDot  = (i) => { go(i, i > current ? 1 : -1); resetTimer(); };

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const banner = items[current];

  return (
    <div className="carousel">
      <div className="carousel-track">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={current}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            className="carousel-slide"
          >
            {banner.url ? (
              <img
                src={banner.url}
                alt={banner.alt || 'ORVA'}
                className="carousel-img"
                loading="eager"
              />
            ) : (
              /* Placeholder when no banners uploaded yet */
              <div className="carousel-placeholder">
                <img src="/assets/logo-white.webp" alt="ORVA" className="carousel-placeholder-logo" />
                <p className="carousel-placeholder-text">New Collection Coming Soon</p>
              </div>
            )}
            {/* Overlay gradient + CTA */}
            <div className="carousel-overlay">
              <div className="container carousel-cta-wrap">
                {banner.link && (
                  <Link to={banner.link} className="btn btn-primary carousel-cta">
                    {t('home.hero_cta')}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrow controls */}
        {items.length > 1 && (
          <>
            <button className="carousel-arrow carousel-arrow-prev" onClick={handlePrev} aria-label="Previous">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button className="carousel-arrow carousel-arrow-next" onClick={handleNext} aria-label="Next">
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="carousel-dots" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Banner ${i + 1}`}
              className={`carousel-dot ${i === current ? 'active' : ''}`}
              onClick={() => handleDot(i)}
            />
          ))}
        </div>
      )}

      <style>{`
        .carousel {
          position: relative;
          width: 100%;
          background: var(--bg-2);
        }
        .carousel-track {
          position: relative;
          width: 100%;
          height: clamp(300px, 55vw, 640px);
          overflow: hidden;
        }
        .carousel-slide {
          position: absolute;
          inset: 0;
        }
        .carousel-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .carousel-placeholder {
          width: 100%; height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: var(--bg-2);
          border-bottom: 1px solid var(--border-1);
        }
        .carousel-placeholder-logo { height: 48px; width: auto; opacity: 0.3; }
        .carousel-placeholder-text {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--text-4);
          letter-spacing: var(--tracking-wider);
          font-style: italic;
          margin: 0;
        }

        .carousel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(9,9,9,0.7) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
        }
        .carousel-cta-wrap { width: 100%; }
        .carousel-cta { font-size: var(--text-xs); letter-spacing: var(--tracking-widest); }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px; height: 44px;
          background: var(--bg-overlay);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-1);
          transition: all var(--t-fast);
          z-index: 2;
        }
        .carousel-arrow:hover { background: var(--bg-4); border-color: var(--border-3); }
        .carousel-arrow-prev { left: 16px; }
        .carousel-arrow-next { right: 16px; }

        @media (max-width: 480px) {
          .carousel-arrow { display: none; }
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 12px 0;
        }
        .carousel-dot {
          width: 20px; height: 3px;
          border-radius: 2px;
          background: var(--border-3);
          transition: all var(--t-base);
          cursor: pointer;
        }
        .carousel-dot.active {
          width: 32px;
          background: var(--text-1);
        }
      `}</style>
    </div>
  );
}
