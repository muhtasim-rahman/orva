import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, LayoutGrid, List, ChevronDown } from 'lucide-react';
import Fuse from 'fuse.js';
import ProductCard from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { tField } from '@/i18n';
import { debounce, formatPrice, truncate } from '@/utils';
import { Link } from 'react-router-dom';

const SORT_OPTIONS = [
  { value: 'newest',     key: 'products.sort_newest' },
  { value: 'price_asc',  key: 'products.sort_price_asc' },
  { value: 'price_desc', key: 'products.sort_price_desc' },
];

export default function Products() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam   = searchParams.get('q')        || '';
  const catParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort')    || 'newest';
  const viewParam = searchParams.get('view')    || 'grid';

  const [inputVal, setInputVal] = useState(qParam);

  const { products, loading } = useProducts();
  const { categories }        = useCategories();

  const setParam = (key, val) => setSearchParams(prev => {
    const n = new URLSearchParams(prev);
    if (val) n.set(key, val); else n.delete(key);
    return n;
  }, { replace: true });

  const updateQ = useCallback(debounce((v) => setParam('q', v), 320), []);
  const handleSearch = (e) => { setInputVal(e.target.value); updateQ(e.target.value); };

  const fuse = useMemo(() => new Fuse(products, {
    keys: [
      { name: 'title.en', weight: 0.4 }, { name: 'title.bn', weight: 0.3 },
      { name: 'description.en', weight: 0.2 }, { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.4,
  }), [products]);

  const filtered = useMemo(() => {
    let res = products;
    if (qParam.trim()) res = fuse.search(qParam).map(r => r.item);
    if (catParam) res = res.filter(p => p.category === catParam);
    res = [...res];
    if (sortParam === 'price_asc')  res.sort((a,b) => (a.basePrice||0) - (b.basePrice||0));
    if (sortParam === 'price_desc') res.sort((a,b) => (b.basePrice||0) - (a.basePrice||0));
    return res;
  }, [products, qParam, catParam, sortParam, fuse]);

  const hasFilters = qParam || catParam || sortParam !== 'newest';
  const clearAll   = () => { setInputVal(''); setSearchParams({}, { replace: true }); };

  return (
    <>
      <Helmet>
        <title>{t('products.heading')} — ORVA</title>
        <meta name="description" content="Browse ORVA's full collection of premium clothing." />
        <meta property="og:title" content={`${t('products.heading')} — ORVA`} />
      </Helmet>

      <main className="page-wrap products-page">
        <div className="container">
          <div className="products-header">
            <h1 className="products-title">{t('products.heading')}</h1>

            {/* ── Row 1: Search + Sort + View toggle ── */}
            <div className="products-row1">
              <div className="products-search-wrap">
                <Search size={15} className="ps-icon" strokeWidth={1.5} />
                <input type="search" className="products-search"
                  placeholder={t('products.search_placeholder')}
                  value={inputVal} onChange={handleSearch}
                  autoComplete="off" />
                {inputVal && (
                  <button className="ps-clear" onClick={() => { setInputVal(''); updateQ(''); }}>
                    <X size={13} />
                  </button>
                )}
              </div>

              <select className="input products-sort" value={sortParam}
                onChange={e => setParam('sort', e.target.value)}>
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{t(o.key)}</option>
                ))}
              </select>

              {/* Grid / List toggle */}
              <div className="view-toggle">
                <button className={`view-btn ${viewParam === 'grid' ? 'active' : ''}`}
                  onClick={() => setParam('view', 'grid')} title="Grid view">
                  <LayoutGrid size={16} strokeWidth={1.5} />
                </button>
                <button className={`view-btn ${viewParam === 'list' ? 'active' : ''}`}
                  onClick={() => setParam('view', 'list')} title="List view">
                  <List size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* ── Row 2: Categories ── */}
            <div className="products-row2">
              <button className={`products-cat-btn ${!catParam ? 'active' : ''}`}
                onClick={() => setParam('category', '')}>
                {t('products.filter_all')}
              </button>
              {categories.map(cat => (
                <button key={cat.id}
                  className={`products-cat-btn ${catParam === cat.id ? 'active' : ''}`}
                  onClick={() => setParam('category', cat.id)}>
                  {tField(cat.label, lang)}
                </button>
              ))}
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="products-chips">
                {qParam && (
                  <span className="filter-chip">"{qParam}"
                    <button onClick={() => { setInputVal(''); updateQ(''); }}><X size={10} /></button>
                  </span>
                )}
                {catParam && (
                  <span className="filter-chip">
                    {tField(categories.find(c => c.id === catParam)?.label, lang) || catParam}
                    <button onClick={() => setParam('category', '')}><X size={10} /></button>
                  </span>
                )}
                <button className="products-clear-all" onClick={clearAll}>
                  {t('products.clear_filters')}
                </button>
              </div>
            )}
          </div>

          {/* ── Grid View ── */}
          {viewParam !== 'list' && (
            <div className="products-grid">
              {loading
                ? Array.from({length:8}).map((_,i) => <ProductCardSkeleton key={i} />)
                : filtered.map((p,i) => (
                  <motion.div key={p.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                    transition={{delay:Math.min(i*0.04,0.3)}}>
                    <ProductCard product={p} />
                  </motion.div>
                ))
              }
            </div>
          )}

          {/* ── List View ── */}
          {viewParam === 'list' && (
            <div className="products-list">
              {loading
                ? Array.from({length:6}).map((_,i) => <ListSkeleton key={i} />)
                : filtered.map((p,i) => (
                  <motion.div key={p.id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}}
                    transition={{delay:Math.min(i*0.03,0.25)}}>
                    <ListCard product={p} lang={lang} t={t} />
                  </motion.div>
                ))
              }
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="products-empty">
              <p className="products-empty-title">{t('products.no_results')}</p>
              <p className="products-empty-sub">{t('products.no_results_sub')}</p>
              {hasFilters && (
                <button className="btn btn-outline" style={{marginTop:16}} onClick={clearAll}>
                  {t('products.clear_filters')}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .products-page { padding-top:calc(var(--nav-h) + 40px); }
        @media(max-width:640px){ .products-page{ padding-top:calc(var(--nav-h) + 24px); } }
        .products-header { margin-bottom:28px; }
        .products-title { font-size:clamp(2rem,5vw,3.5rem); margin-bottom:20px;
          letter-spacing:var(--tracking-tight); }

        /* Row 1 */
        .products-row1 { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
        .products-search-wrap { position:relative; flex:1; min-width:0; }
        .ps-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%);
          color:var(--text-3); pointer-events:none; }
        .products-search { width:100%; background:var(--bg-2); border:1px solid var(--border-2);
          border-radius:var(--r-s); padding:10px 34px; color:var(--text-1);
          font-size:var(--text-sm); font-family:var(--font-body); outline:none;
          transition:border-color var(--t-fast); }
        .products-search::placeholder { color:var(--text-3); }
        .products-search:focus { border-color:var(--border-3); }
        .products-search::-webkit-search-cancel-button { display:none; }
        .ps-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%);
          color:var(--text-3); display:flex; align-items:center; padding:3px;
          border-radius:var(--r-s); transition:color var(--t-fast); }
        .ps-clear:hover { color:var(--text-1); }
        .products-sort { width:auto; min-width:150px; padding:9px 30px 9px 11px;
          font-size:var(--text-xs); flex-shrink:0; }

        .view-toggle { display:flex; border:1px solid var(--border-2); border-radius:var(--r-s);
          overflow:hidden; flex-shrink:0; }
        .view-btn { width:36px; height:36px; display:flex; align-items:center; justify-content:center;
          color:var(--text-3); transition:all var(--t-fast); background:transparent; }
        .view-btn:hover { color:var(--text-1); }
        .view-btn.active { background:var(--bg-3); color:var(--text-1); }
        .view-btn + .view-btn { border-left:1px solid var(--border-2); }

        /* Row 2 — categories */
        .products-row2 { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
        .products-cat-btn { padding:6px 14px; font-size:var(--text-xs); font-weight:500;
          letter-spacing:var(--tracking-wide); text-transform:uppercase; color:var(--text-3);
          border:1px solid var(--border-2); border-radius:var(--r-f); background:transparent;
          transition:all var(--t-fast); white-space:nowrap; }
        .products-cat-btn:hover { color:var(--text-1); border-color:var(--border-3); }
        .products-cat-btn.active { color:var(--text-1); background:var(--bg-3); border-color:var(--border-3); }

        .products-chips { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:6px; }
        .filter-chip { display:inline-flex; align-items:center; gap:5px; padding:4px 10px;
          background:var(--bg-3); border:1px solid var(--border-2); border-radius:var(--r-f);
          font-size:var(--text-xs); color:var(--text-2); }
        .filter-chip button { display:flex; align-items:center; color:var(--text-3);
          transition:color var(--t-fast); }
        .filter-chip button:hover { color:var(--text-1); }
        .products-clear-all { font-size:var(--text-xs); color:var(--text-3); padding:4px 8px;
          transition:color var(--t-fast); text-decoration:underline; text-underline-offset:3px; }
        .products-clear-all:hover { color:var(--text-1); }

        /* Grid */
        .products-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        @media(max-width:1024px){ .products-grid{ grid-template-columns:repeat(3,1fr); } }
        @media(max-width:768px) { .products-grid{ grid-template-columns:repeat(2,1fr); gap:12px; } }
        @media(max-width:400px) { .products-grid{ grid-template-columns:1fr; } }

        /* List */
        .products-list { display:flex; flex-direction:column; gap:10px; }
        .list-card { display:flex; align-items:center; gap:16px; padding:14px;
          background:var(--bg-2); border:1px solid var(--border-1); border-radius:var(--r-l);
          text-decoration:none; transition:border-color var(--t-base); }
        .list-card:hover { border-color:var(--border-3); }
        .list-img { width:80px; height:80px; flex-shrink:0; border-radius:var(--r-m);
          overflow:hidden; background:var(--bg-3); }
        .list-img img { width:100%; height:100%; object-fit:cover; }
        .list-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
        .list-name { font-family:var(--font-display); font-size:var(--text-md); color:var(--text-1);
          font-weight:400; line-height:var(--leading-snug); white-space:nowrap;
          overflow:hidden; text-overflow:ellipsis; }
        .list-desc { font-size:var(--text-xs); color:var(--text-3); }
        .list-tags { display:flex; gap:4px; flex-wrap:nowrap; overflow:hidden; }
        .list-tag  { font-size:9px; letter-spacing:.06em; text-transform:uppercase;
          color:var(--text-3); background:var(--bg-3); border:1px solid var(--border-1);
          padding:1px 6px; border-radius:var(--r-f); white-space:nowrap; }
        .list-right { flex-shrink:0; text-align:right; display:flex; flex-direction:column;
          align-items:flex-end; gap:4px; }
        .list-price { font-family:var(--font-display); font-size:var(--text-lg); color:var(--text-1); }
        .list-cat   { font-size:9px; color:var(--text-4); text-transform:uppercase; letter-spacing:.06em; }
        .list-skeleton { display:flex; gap:16px; padding:14px; background:var(--bg-2);
          border:1px solid var(--border-1); border-radius:var(--r-l); align-items:center; }

        .products-empty { text-align:center; padding:80px 0; display:flex;
          flex-direction:column; align-items:center; gap:8px; }
        .products-empty-title { font-family:var(--font-display); font-size:var(--text-xl);
          color:var(--text-1); margin:0; }
        .products-empty-sub { font-size:var(--text-sm); color:var(--text-3); margin:0; }

        @media(max-width:640px){
          .products-row1 { flex-wrap:wrap; }
          .products-search-wrap { flex:1 1 100%; order:-1; }
          .products-sort { flex:1; }
        }
      `}</style>
    </>
  );
}

function ListCard({ product, lang, t }) {
  const title = tField(product.title, lang);
  const desc  = tField(product.description, lang);
  const img   = product.images?.[0];
  return (
    <Link to={`/products/${product.slug}`} className="list-card">
      <div className="list-img">
        {img
          ? <img src={img} alt={title} loading="lazy" />
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <img src="/assets/logo-white.webp" alt="ORVA" style={{height:16,opacity:.15}} />
            </div>
        }
      </div>
      <div className="list-info">
        <p className="list-name">{title}</p>
        {desc && <p className="list-desc">{truncate(desc, 60)}</p>}
        <div className="list-tags">
          {(product.tags||[]).slice(0,4).map((tag,i)=>(
            <span key={i} className="list-tag">{tag}</span>
          ))}
        </div>
      </div>
      <div className="list-right">
        {product.basePrice != null && (
          <span className="list-price">{formatPrice(product.basePrice)}</span>
        )}
        {product.category && <span className="list-cat">{product.category}</span>}
      </div>
    </Link>
  );
}

function ListSkeleton() {
  return (
    <div className="list-skeleton">
      <div className="skeleton" style={{width:80,height:80,borderRadius:'var(--r-m)',flexShrink:0}} />
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
        <div className="skeleton" style={{height:16,width:'55%'}} />
        <div className="skeleton" style={{height:11,width:'80%'}} />
      </div>
      <div className="skeleton" style={{width:60,height:20}} />
    </div>
  );
}
