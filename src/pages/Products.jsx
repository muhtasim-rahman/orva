import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Fuse from 'fuse.js';
import ProductCard from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { tField } from '@/i18n';
import { debounce } from '@/utils';

const SORT_OPTIONS = [
  { value: 'newest',     key: 'products.sort_newest' },
  { value: 'price_asc',  key: 'products.sort_price_asc' },
  { value: 'price_desc', key: 'products.sort_price_desc' },
];

const COLS = { desktop: 4, tablet: 3, mobile: 2 };

export default function Products() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [searchParams, setSearchParams] = useSearchParams();
  const qParam       = searchParams.get('q')        || '';
  const catParam     = searchParams.get('category') || '';
  const sortParam    = searchParams.get('sort')     || 'newest';

  const [inputVal, setInputVal] = useState(qParam);
  const [showFilters, setShowFilters] = useState(false);

  const { products, loading } = useProducts();
  const { categories }        = useCategories();

  // Debounced URL update for search
  const updateQ = useCallback(
    debounce((val) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (val) next.set('q', val); else next.delete('q');
        return next;
      }, { replace: true });
    }, 320),
    [setSearchParams]
  );

  const handleSearch = (e) => {
    setInputVal(e.target.value);
    updateQ(e.target.value);
  };

  const setCategory = (cat) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (cat) next.set('category', cat); else next.delete('category');
      return next;
    }, { replace: true });
  };

  const setSort = (s) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('sort', s);
      return next;
    }, { replace: true });
  };

  const clearAll = () => {
    setInputVal('');
    setSearchParams({}, { replace: true });
  };

  // Fuse.js fuzzy search
  const fuse = useMemo(() => new Fuse(products, {
    keys: [
      { name: 'title.en',      weight: 0.4 },
      { name: 'title.bn',      weight: 0.3 },
      { name: 'description.en', weight: 0.2 },
      { name: 'tags',          weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
  }), [products]);

  const filtered = useMemo(() => {
    let result = products;

    // Search
    if (qParam.trim()) {
      result = fuse.search(qParam).map(r => r.item);
    }

    // Category filter
    if (catParam) {
      result = result.filter(p => p.category === catParam);
    }

    // Sort
    result = [...result];
    if (sortParam === 'price_asc')  result.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    if (sortParam === 'price_desc') result.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    // 'newest' is already default sort from hook

    return result;
  }, [products, qParam, catParam, sortParam, fuse]);

  const hasActiveFilters = qParam || catParam || (sortParam && sortParam !== 'newest');
  const activeSort = SORT_OPTIONS.find(s => s.value === sortParam) || SORT_OPTIONS[0];

  return (
    <>
      <Helmet>
        <title>{t('products.heading')} — ORVA</title>
        <meta name="description" content="Browse ORVA's full collection of premium clothing." />
        <meta property="og:title"       content={`${t('products.heading')} — ORVA`} />
        <meta property="og:description" content="Browse ORVA's full collection of premium clothing." />
      </Helmet>

      <main className="page-wrap products-page">
        <div className="container">

          {/* Page header */}
          <div className="products-header">
            <h1 className="products-title">{t('products.heading')}</h1>

            {/* Search + Filter row */}
            <div className="products-toolbar">
              {/* Search */}
              <div className="products-search-wrap">
                <Search size={15} className="products-search-icon" strokeWidth={1.5} />
                <input
                  type="search"
                  className="products-search"
                  placeholder={t('products.search_placeholder')}
                  value={inputVal}
                  onChange={handleSearch}
                  aria-label={t('products.search_placeholder')}
                  autoComplete="off"
                />
                {inputVal && (
                  <button
                    className="products-search-clear"
                    onClick={() => { setInputVal(''); updateQ(''); }}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter toggle (mobile) */}
              <button
                className="products-filter-toggle"
                onClick={() => setShowFilters(v => !v)}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal size={16} strokeWidth={1.5} />
              </button>

              {/* Category filter — desktop inline */}
              <div className="products-cats desktop-only">
                <button
                  className={`products-cat-btn ${!catParam ? 'active' : ''}`}
                  onClick={() => setCategory('')}
                >
                  {t('products.filter_all')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`products-cat-btn ${catParam === cat.id ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    {tField(cat.label, lang)}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="products-sort-wrap">
                <select
                  className="input products-sort"
                  value={sortParam}
                  onChange={e => setSort(e.target.value)}
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{t(o.key)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="products-filter-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="products-cats mobile-only">
                    <button
                      className={`products-cat-btn ${!catParam ? 'active' : ''}`}
                      onClick={() => { setCategory(''); setShowFilters(false); }}
                    >
                      {t('products.filter_all')}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`products-cat-btn ${catParam === cat.id ? 'active' : ''}`}
                        onClick={() => { setCategory(cat.id); setShowFilters(false); }}
                      >
                        {tField(cat.label, lang)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="products-active-filters">
                {qParam && (
                  <span className="filter-chip">
                    "{qParam}"
                    <button onClick={() => { setInputVal(''); updateQ(''); }} aria-label="Remove search">
                      <X size={10} />
                    </button>
                  </span>
                )}
                {catParam && (
                  <span className="filter-chip">
                    {tField(categories.find(c => c.id === catParam)?.label, lang) || catParam}
                    <button onClick={() => setCategory('')} aria-label="Remove category">
                      <X size={10} />
                    </button>
                  </span>
                )}
                <button className="products-clear-all" onClick={clearAll}>
                  {t('products.clear_filters')}
                </button>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="products-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))
            }
          </div>

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="products-empty">
              <p className="products-empty-title">{t('products.no_results')}</p>
              <p className="products-empty-sub">{t('products.no_results_sub')}</p>
              {hasActiveFilters && (
                <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={clearAll}>
                  {t('products.clear_filters')}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .products-page { padding-top: calc(var(--nav-h) + 40px); }

        .products-header { margin-bottom: 32px; }
        .products-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 24px;
          letter-spacing: var(--tracking-tight);
        }

        .products-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .products-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .products-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-3);
          pointer-events: none;
        }
        .products-search {
          width: 100%;
          background: var(--bg-2);
          border: 1px solid var(--border-2);
          border-radius: var(--r-s);
          padding: 10px 36px;
          color: var(--text-1);
          font-size: var(--text-sm);
          font-family: var(--font-body);
          font-weight: 400;
          transition: border-color var(--t-fast);
          outline: none;
        }
        .products-search::placeholder { color: var(--text-3); }
        .products-search:focus { border-color: var(--border-3); }
        .products-search::-webkit-search-cancel-button { display: none; }
        .products-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-3);
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: var(--r-s);
          transition: color var(--t-fast);
        }
        .products-search-clear:hover { color: var(--text-1); }

        .products-filter-toggle {
          display: none;
          padding: 9px 12px;
          background: var(--bg-2);
          border: 1px solid var(--border-2);
          border-radius: var(--r-s);
          color: var(--text-2);
          transition: all var(--t-fast);
        }
        .products-filter-toggle:hover { border-color: var(--border-3); color: var(--text-1); }
        @media (max-width: 768px) {
          .products-filter-toggle { display: flex; }
          .desktop-only { display: none !important; }
        }

        .products-cats {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .products-cat-btn {
          padding: 7px 14px;
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--text-3);
          border: 1px solid var(--border-2);
          border-radius: var(--r-f);
          background: transparent;
          transition: all var(--t-fast);
          white-space: nowrap;
        }
        .products-cat-btn:hover { color: var(--text-1); border-color: var(--border-3); }
        .products-cat-btn.active { color: var(--text-1); background: var(--bg-3); border-color: var(--border-3); }

        .products-sort-wrap { flex-shrink: 0; }
        .products-sort {
          width: auto;
          padding: 9px 32px 9px 12px;
          font-size: var(--text-xs);
          letter-spacing: 0.05em;
          min-width: 160px;
        }

        .products-filter-panel { overflow: hidden; }
        .products-filter-panel .mobile-only {
          padding: 12px 0;
          border-top: 1px solid var(--border-1);
          margin-top: 8px;
        }

        .products-active-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: var(--bg-3);
          border: 1px solid var(--border-2);
          border-radius: var(--r-f);
          font-size: var(--text-xs);
          color: var(--text-2);
        }
        .filter-chip button {
          display: flex;
          align-items: center;
          color: var(--text-3);
          transition: color var(--t-fast);
          padding: 1px;
          border-radius: 2px;
        }
        .filter-chip button:hover { color: var(--text-1); }
        .products-clear-all {
          font-size: var(--text-xs);
          color: var(--text-3);
          padding: 4px 8px;
          transition: color var(--t-fast);
          letter-spacing: 0.05em;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .products-clear-all:hover { color: var(--text-1); }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        @media (max-width: 400px)  { .products-grid { grid-template-columns: 1fr; } }

        .products-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          text-align: center;
          gap: 8px;
        }
        .products-empty-title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--text-1);
          margin: 0;
        }
        .products-empty-sub {
          font-size: var(--text-sm);
          color: var(--text-3);
          margin: 0;
        }

        @media (max-width: 640px) {
          .products-page { padding-top: calc(var(--nav-h) + 24px); }
          .products-title { margin-bottom: 16px; }
        }
      `}</style>
    </>
  );
}
