import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { clamp } from '@/utils';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function ImageLightbox({ images = [], initialIndex = 0, onClose }) {
  const [idx, setIdx]     = useState(initialIndex);
  const [zoom, setZoom]   = useState(1);
  const [pan, setPan]     = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const image = images[idx];

  // Reset zoom/pan on image change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [idx]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')       onClose?.();
      if (e.key === 'ArrowRight')   goNext();
      if (e.key === 'ArrowLeft')    goPrev();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-')            zoomOut();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx, zoom]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const goNext = useCallback(() => {
    setIdx(i => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setIdx(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const zoomIn  = () => setZoom(z => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  const zoomOut = () => setZoom(z => {
    const next = clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
    if (next === 1) setPan({ x: 0, y: 0 });
    return next;
  });

  const handleDoubleClick = (e) => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  // Drag to pan (when zoomed)
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const onMouseMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  // Touch pinch-to-zoom
  const lastDist = useRef(null);
  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist.current != null) {
        const delta = dist - lastDist.current;
        setZoom(z => clamp(z + delta * 0.008, MIN_ZOOM, MAX_ZOOM));
      }
      lastDist.current = dist;
    }
  };
  const onTouchEnd = () => { lastDist.current = null; };

  return (
    <AnimatePresence>
      <motion.div
        className="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      >
        {/* Controls bar */}
        <div className="lightbox-bar">
          <span className="lightbox-counter">{idx + 1} / {images.length}</span>
          <div className="lightbox-controls">
            <button className="lightbox-btn" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
              <ZoomOut size={18} strokeWidth={1.5} />
            </button>
            <span className="lightbox-zoom-val">{Math.round(zoom * 100)}%</span>
            <button className="lightbox-btn" onClick={zoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
              <ZoomIn size={18} strokeWidth={1.5} />
            </button>
            <button className="lightbox-btn lightbox-close" onClick={onClose} aria-label="Close">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Image area */}
        <div
          className="lightbox-img-area"
          style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={image}
              alt={`Image ${idx + 1}`}
              className="lightbox-img"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: dragging ? 'none' : 'transform 0.2s ease',
              }}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* Side arrows */}
        {images.length > 1 && (
          <>
            <button
              className="lightbox-arrow lightbox-arrow-l"
              onClick={goPrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <button
              className="lightbox-arrow lightbox-arrow-r"
              onClick={goNext}
              aria-label="Next image"
            >
              <ChevronRight size={22} strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="lightbox-thumbs">
            {images.map((src, i) => (
              <button
                key={i}
                className={`lightbox-thumb ${i === idx ? 'active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Image ${i + 1}`}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <style>{`
        .lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.96);
          z-index: var(--z-modal);
          display: flex;
          flex-direction: column;
        }

        .lightbox-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-1);
          flex-shrink: 0;
        }
        .lightbox-counter {
          font-size: var(--text-xs);
          color: var(--text-3);
          letter-spacing: 0.1em;
        }
        .lightbox-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .lightbox-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--r-s);
          color: var(--text-2);
          transition: all var(--t-fast);
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .lightbox-btn:hover { background: var(--bg-3); color: var(--text-1); }
        .lightbox-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .lightbox-btn.lightbox-close { margin-left: 8px; }
        .lightbox-zoom-val {
          font-size: var(--text-xs);
          color: var(--text-3);
          width: 36px;
          text-align: center;
        }

        .lightbox-img-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .lightbox-img {
          max-width: 90%;
          max-height: 100%;
          object-fit: contain;
          user-select: none;
          pointer-events: none;
        }

        .lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px; height: 48px;
          background: var(--bg-overlay);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-1);
          transition: all var(--t-fast);
          z-index: 2;
          cursor: pointer;
        }
        .lightbox-arrow:hover { background: var(--bg-4); }
        .lightbox-arrow-l { left: 16px; }
        .lightbox-arrow-r { right: 16px; }
        @media (max-width: 480px) { .lightbox-arrow { display: none; } }

        .lightbox-thumbs {
          display: flex;
          gap: 6px;
          padding: 10px 16px;
          border-top: 1px solid var(--border-1);
          overflow-x: auto;
          justify-content: center;
          flex-shrink: 0;
        }
        .lightbox-thumbs::-webkit-scrollbar { display: none; }
        .lightbox-thumb {
          width: 52px; height: 52px;
          flex-shrink: 0;
          border-radius: var(--r-s);
          overflow: hidden;
          border: 2px solid transparent;
          transition: border-color var(--t-fast);
          cursor: pointer;
          padding: 0;
          background: none;
        }
        .lightbox-thumb.active { border-color: var(--text-1); }
        .lightbox-thumb img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </AnimatePresence>
  );
}
