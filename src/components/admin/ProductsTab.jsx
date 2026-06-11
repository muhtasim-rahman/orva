import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Pencil, Trash2, Eye, EyeOff, Pin, PinOff, Search } from 'lucide-react';
import { ref, update, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAllProducts, useCategories } from '@/hooks/useProducts';
import { tField } from '@/i18n';
import { formatPrice, formatDate } from '@/utils';
import ProductEditor from './ProductEditor';
import ConfirmDialog from './ConfirmDialog';

export default function ProductsTab() {
  const { t, i18n }    = useTranslation();
  const lang            = i18n.language;
  const { products, loading } = useAllProducts();
  const { categories }  = useCategories();

  const [search, setSearch]       = useState('');
  const [menuOpen, setMenuOpen]   = useState(null); // productId
  const [editor, setEditor]       = useState(null);  // null | 'new' | product
  const [confirm, setConfirm]     = useState(null);  // null | { message, action }

  const filtered = products.filter(p =>
    !search || (p.title?.en || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggle = async (id, field) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    await update(ref(db, `products/${id}`), { [field]: !p[field] });
  };

  const deleteProduct = async (id) => {
    await remove(ref(db, `products/${id}`));
  };

  const openConfirm = (message, action) => setConfirm({ message, action });

  return (
    <div className="ptab">
      {/* Toolbar */}
      <div className="ptab-toolbar">
        <div className="ptab-search-wrap">
          <Search size={14} className="ptab-search-icon" strokeWidth={1.5} />
          <input className="input ptab-search" placeholder="Search products…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditor('new')}>
          <Plus size={14} strokeWidth={2} /> {t('admin.add_product')}
        </button>
      </div>

      {/* Table */}
      <div className="ptab-table-wrap">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            No products yet. Add your first product.
          </div>
        ) : (
          <table className="ptab-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="ptab-row">
                  <td>
                    <div className="ptab-product-cell">
                      <div className="ptab-thumb">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.title?.en} />
                        ) : (
                          <img src="/assets/logo-white.webp" alt="ORVA" style={{ height: 14, opacity: 0.2 }} />
                        )}
                      </div>
                      <div>
                        <p className="ptab-name">{tField(p.title, lang) || '—'}</p>
                        <p className="ptab-slug">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="ptab-muted">{p.category || '—'}</td>
                  <td className="ptab-price">{formatPrice(p.basePrice)}</td>
                  <td>
                    <div className="ptab-status-row">
                      <span className={`ptab-status ${p.published ? 'published' : 'draft'}`}>
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                      {p.pinned && <span className="ptab-status pinned">Pinned</span>}
                    </div>
                  </td>
                  <td className="ptab-muted">{formatDate(p.updatedAt)}</td>
                  <td>
                    <div style={{ position: 'relative' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                        aria-label="Product actions"
                      >
                        <MoreVertical size={15} strokeWidth={1.5} />
                      </button>
                      <AnimatePresence>
                        {menuOpen === p.id && (
                          <motion.div
                            className="ptab-menu"
                            initial={{ opacity: 0, scale: 0.94, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            transition={{ duration: 0.12 }}
                          >
                            <button className="ptab-menu-item" onClick={() => { setEditor(p); setMenuOpen(null); }}>
                              <Pencil size={13} /> Edit
                            </button>
                            <button className="ptab-menu-item" onClick={() => { toggle(p.id, 'published'); setMenuOpen(null); }}>
                              {p.published ? <EyeOff size={13} /> : <Eye size={13} />}
                              {p.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button className="ptab-menu-item" onClick={() => { toggle(p.id, 'pinned'); setMenuOpen(null); }}>
                              {p.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                              {p.pinned ? 'Unpin' : 'Pin to Home'}
                            </button>
                            <div className="ptab-menu-divider" />
                            <button className="ptab-menu-item danger" onClick={() => {
                              setMenuOpen(null);
                              openConfirm(t('admin.confirm_delete'), () => deleteProduct(p.id));
                            }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor */}
      <AnimatePresence>
        {editor && (
          <ProductEditor
            existing={editor === 'new' ? null : editor}
            categories={categories}
            onClose={() => setEditor(null)}
            onSaved={() => setEditor(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirm}
        message={confirm?.message}
        confirmLabel={t('admin.confirm_yes')}
        cancelLabel={t('admin.confirm_no')}
        danger
        onConfirm={() => { confirm?.action(); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />

      {/* Click outside to close menu */}
      {menuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(null)} />}

      <style>{`
        .ptab { display: flex; flex-direction: column; height: 100%; }
        .ptab-toolbar { display: flex; align-items: center; gap: 10px; padding: 16px 20px;
          border-bottom: 1px solid var(--border-1); flex-shrink: 0; }
        .ptab-search-wrap { position: relative; flex: 1; }
        .ptab-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: var(--text-3); pointer-events: none; }
        .ptab-search { padding-left: 32px; }

        .ptab-table-wrap { flex: 1; overflow: auto; }
        .ptab-table { width: 100%; border-collapse: collapse; font-size: var(--text-xs); }
        .ptab-table th {
          text-align: left; padding: 10px 16px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-3); border-bottom: 1px solid var(--border-1);
          position: sticky; top: 0; background: var(--bg-2); z-index: 1;
        }
        .ptab-row td { padding: 12px 16px; border-bottom: 1px solid var(--border-1);
          vertical-align: middle; }
        .ptab-row:hover td { background: var(--bg-3); }
        .ptab-row:last-child td { border-bottom: none; }

        .ptab-product-cell { display: flex; align-items: center; gap: 10px; }
        .ptab-thumb { width: 40px; height: 40px; border-radius: var(--r-s);
          background: var(--bg-3); border: 1px solid var(--border-1);
          overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .ptab-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ptab-name { font-weight: 500; color: var(--text-1); margin: 0; }
        .ptab-slug { font-size: 10px; color: var(--text-4); margin: 0; font-family: monospace; }
        .ptab-muted { color: var(--text-3); }
        .ptab-price { font-family: var(--font-display); font-size: 13px; color: var(--text-1); }

        .ptab-status-row { display: flex; gap: 4px; align-items: center; }
        .ptab-status { font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 2px 7px; border-radius: var(--r-f); }
        .ptab-status.published { background: var(--ok-dim); color: var(--ok); }
        .ptab-status.draft { background: var(--warn-dim); color: var(--warn); }
        .ptab-status.pinned { background: var(--accent-dim); color: var(--accent); }

        .ptab-menu { position: absolute; right: 0; top: 36px;
          background: var(--bg-3); border: 1px solid var(--border-2);
          border-radius: var(--r-m); padding: 4px;
          min-width: 150px; z-index: 100;
          box-shadow: var(--shadow-l); }
        .ptab-menu-item { display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 10px; font-size: var(--text-xs);
          color: var(--text-2); border-radius: var(--r-s);
          transition: all var(--t-fast); }
        .ptab-menu-item:hover { background: var(--bg-4); color: var(--text-1); }
        .ptab-menu-item.danger:hover { background: var(--err-dim); color: var(--err); }
        .ptab-menu-divider { height: 1px; background: var(--border-1); margin: 3px 0; }
      `}</style>
    </div>
  );
}
