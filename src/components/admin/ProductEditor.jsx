import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Eye, EyeOff, Pin, Star } from 'lucide-react';
import { ref, set, push, serverTimestamp } from 'firebase/database';
import { db } from '@/lib/firebase';
import { slugify } from '@/utils';
import ImageUploader from './ImageUploader';
import ProductPreview from './ProductPreview';

const EMPTY_PRODUCT = {
  title:         { en: '', bn: '' },
  slug:          '',
  description:   { en: '', bn: '' },
  metaTitle:     { en: '', bn: '' },
  metaDescription: { en: '', bn: '' },
  category:      '',
  tags:          [],
  basePrice:     '',
  images:        [],
  variants:      [],
  customOptions: [],
  badge:         '',
  pinned:        false,
  published:     true,
  freeShipping:  false,
  sku:           '',
  sortOrder:     0,
  whatsappNote:  '',
};

export default function ProductEditor({ existing = null, categories = [], onClose, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!existing;

  const [data, setData]     = useState(() => existing ? { ...EMPTY_PRODUCT, ...existing } : { ...EMPTY_PRODUCT });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tab, setTab]       = useState('basic'); // basic | media | variants | seo | advanced
  const [preview, setPreview] = useState(false);

  // Auto-generate slug from English title
  useEffect(() => {
    if (!isEdit && data.title.en && !data.slug) {
      setData(d => ({ ...d, slug: slugify(d.title.en) }));
    }
  }, [data.title.en, isEdit]);

  // Auto-fill meta from title/desc
  useEffect(() => {
    if (!data.metaTitle.en && data.title.en)
      setData(d => ({ ...d, metaTitle: { ...d.metaTitle, en: d.title.en } }));
    if (!data.metaTitle.bn && data.title.bn)
      setData(d => ({ ...d, metaTitle: { ...d.metaTitle, bn: d.title.bn } }));
  }, [data.title]);

  useEffect(() => {
    if (!data.metaDescription.en && data.description.en)
      setData(d => ({ ...d, metaDescription: { ...d.metaDescription, en: d.description.en.slice(0, 160) } }));
    if (!data.metaDescription.bn && data.description.bn)
      setData(d => ({ ...d, metaDescription: { ...d.metaDescription, bn: d.description.bn.slice(0, 160) } }));
  }, [data.description]);

  const set_ = (key, val) => setData(d => ({ ...d, [key]: val }));
  const setI18n = (key, lang, val) => setData(d => ({ ...d, [key]: { ...d[key], [lang]: val } }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !data.tags.includes(tag)) {
      set_('tags', [...data.tags, tag]);
    }
    setTagInput('');
  };
  const removeTag = (t) => set_('tags', data.tags.filter(x => x !== t));

  // Variant helpers
  const addVariant = () => set_('variants', [...data.variants, { type: 'size', options: [] }]);
  const removeVariant = (i) => set_('variants', data.variants.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, val) => {
    const v = [...data.variants];
    v[i] = { ...v[i], [field]: val };
    set_('variants', v);
  };
  const addVariantOption = (vi) => {
    const v = [...data.variants];
    v[vi].options = [...(v[vi].options || []), { label: '', priceAdd: 0, available: true, hex: '' }];
    set_('variants', v);
  };
  const updateVariantOption = (vi, oi, field, val) => {
    const v = [...data.variants];
    v[vi].options[oi] = { ...v[vi].options[oi], [field]: val };
    set_('variants', v);
  };
  const removeVariantOption = (vi, oi) => {
    const v = [...data.variants];
    v[vi].options = v[vi].options.filter((_, i) => i !== oi);
    set_('variants', v);
  };

  // Custom options
  const addCustom = () => set_('customOptions', [...data.customOptions, { type: 'text', label: '', placeholder: '', values: [] }]);
  const removeCustom = (i) => set_('customOptions', data.customOptions.filter((_, idx) => idx !== i));
  const updateCustom = (i, field, val) => {
    const c = [...data.customOptions];
    c[i] = { ...c[i], [field]: val };
    set_('customOptions', c);
  };

  const handleSave = async () => {
    if (!data.title.en.trim()) { setError('English title is required.'); return; }
    if (!data.slug.trim())     { setError('Slug is required.'); return; }
    if (!data.basePrice)       { setError('Base price is required.'); return; }

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...data,
        basePrice: Number(data.basePrice),
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await set(ref(db, `products/${existing.id}`), { ...payload, id: existing.id, createdAt: existing.createdAt });
      } else {
        const newRef = push(ref(db, 'products'));
        await set(newRef, { ...payload, id: newRef.key, createdAt: serverTimestamp() });
      }

      onSaved?.();
      onClose?.();
    } catch (e) {
      setError('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'basic',    label: 'Basic Info' },
    { id: 'media',    label: 'Images' },
    { id: 'variants', label: 'Variants' },
    { id: 'seo',      label: 'SEO' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <motion.div
      className="editor-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="editor-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      >
        {/* Header */}
        <div className="editor-header">
          <h2 className="editor-title">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <div className="editor-header-actions">
            <button className="btn btn-ghost btn-icon" onClick={() => setPreview(v => !v)} title="Toggle preview">
              {preview ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="editor-body">
          {/* Left: Form */}
          <div className="editor-form-wrap">
            {/* Tab bar */}
            <div className="editor-tabs">
              {TABS.map(tb => (
                <button
                  key={tb.id}
                  className={`editor-tab ${tab === tb.id ? 'active' : ''}`}
                  onClick={() => setTab(tb.id)}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            <div className="editor-form">
              {/* ── BASIC ── */}
              {tab === 'basic' && (
                <>
                  <Field label="Title (English) *">
                    <input className="input" value={data.title.en}
                      onChange={e => setI18n('title','en',e.target.value)} placeholder="Product name in English" />
                  </Field>
                  <Field label="Title (বাংলা)">
                    <input className="input lang-bn" value={data.title.bn}
                      onChange={e => setI18n('title','bn',e.target.value)} placeholder="পণ্যের নাম বাংলায়" />
                  </Field>
                  <Field label="Slug (URL) *">
                    <input className="input" value={data.slug}
                      onChange={e => set_('slug', slugify(e.target.value))} placeholder="auto-generated from title" />
                  </Field>
                  <Field label="Description (English)">
                    <textarea className="input" rows={4} value={data.description.en}
                      onChange={e => setI18n('description','en',e.target.value)} placeholder="Full product description..." />
                  </Field>
                  <Field label="Description (বাংলা)">
                    <textarea className="input lang-bn" rows={4} value={data.description.bn}
                      onChange={e => setI18n('description','bn',e.target.value)} placeholder="পণ্যের বর্ণনা বাংলায়..." />
                  </Field>
                  <Field label="Category">
                    <select className="input" value={data.category} onChange={e => set_('category', e.target.value)}>
                      <option value="">— Select —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.label?.en || c.id}</option>)}
                    </select>
                  </Field>
                  <Field label="Base Price (৳) *">
                    <input className="input" type="number" min="0" value={data.basePrice}
                      onChange={e => set_('basePrice', e.target.value)} placeholder="e.g. 850" />
                  </Field>
                  <Field label="Tags">
                    <div className="tag-input-wrap">
                      <div className="tag-list">
                        {data.tags.map(tag => (
                          <span key={tag} className="tag-chip-edit">
                            {tag}
                            <button onClick={() => removeTag(tag)} type="button"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input className="input" value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Type tag + Enter" />
                        <button className="btn btn-ghost btn-sm" onClick={addTag} type="button">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </Field>
                  <Field label="Badge Label">
                    <input className="input" value={data.badge}
                      onChange={e => set_('badge', e.target.value)} placeholder="e.g. NEW, SALE, HOT" />
                  </Field>
                  <div className="editor-toggles">
                    <Toggle label="Published" value={data.published} onChange={v => set_('published', v)} />
                    <Toggle label="Pinned on Home" value={data.pinned} onChange={v => set_('pinned', v)} />
                    <Toggle label="Free Shipping" value={data.freeShipping} onChange={v => set_('freeShipping', v)} />
                  </div>
                </>
              )}

              {/* ── IMAGES ── */}
              {tab === 'media' && (
                <Field label="Product Images (first = cover)">
                  <ImageUploader
                    images={data.images}
                    onChange={imgs => set_('images', imgs)}
                    slug={data.slug || 'product'}
                    maxImages={8}
                  />
                </Field>
              )}

              {/* ── VARIANTS ── */}
              {tab === 'variants' && (
                <>
                  {data.variants.map((variant, vi) => (
                    <div key={vi} className="variant-block">
                      <div className="variant-block-header">
                        <select className="input" style={{ flex: 1 }}
                          value={variant.type}
                          onChange={e => updateVariant(vi, 'type', e.target.value)}>
                          <option value="size">Size</option>
                          <option value="color">Color</option>
                          <option value="material">Material</option>
                          <option value="fit">Fit</option>
                          <option value="style">Style</option>
                        </select>
                        <button className="btn btn-ghost btn-icon" onClick={() => removeVariant(vi)} type="button">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="variant-options-list">
                        {(variant.options || []).map((opt, oi) => (
                          <div key={oi} className="variant-opt-row">
                            <input className="input" placeholder="Label (e.g. S, Red)"
                              value={opt.label} onChange={e => updateVariantOption(vi, oi, 'label', e.target.value)}
                              style={{ flex: 2 }} />
                            <input className="input" placeholder="+৳" type="number" min="0"
                              value={opt.priceAdd} onChange={e => updateVariantOption(vi, oi, 'priceAdd', Number(e.target.value))}
                              style={{ flex: 1 }} />
                            {variant.type === 'color' && (
                              <input type="color" value={opt.hex || '#ffffff'}
                                onChange={e => updateVariantOption(vi, oi, 'hex', e.target.value)}
                                style={{ width: 36, height: 36, padding: 2, background: 'none', border: '1px solid var(--border-2)', borderRadius: 4, cursor: 'pointer' }} />
                            )}
                            <Toggle label="Avail." value={opt.available !== false} onChange={v => updateVariantOption(vi, oi, 'available', v)} mini />
                            <button className="btn btn-ghost btn-icon" onClick={() => removeVariantOption(vi, oi)} type="button">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={() => addVariantOption(vi)} type="button" style={{ alignSelf: 'flex-start' }}>
                          <Plus size={12} /> Add Option
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-outline btn-sm" onClick={addVariant} type="button">
                    <Plus size={14} /> Add Variant Group
                  </button>

                  {/* Custom options */}
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-1)' }}>
                    <p className="editor-section-label">Custom Options</p>
                    {data.customOptions.map((opt, i) => (
                      <div key={i} className="custom-opt-block">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <select className="input" value={opt.type} onChange={e => updateCustom(i, 'type', e.target.value)} style={{ flex: 1 }}>
                            <option value="text">Text Input</option>
                            <option value="select">Dropdown</option>
                          </select>
                          <button className="btn btn-ghost btn-icon" onClick={() => removeCustom(i)} type="button">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input className="input" placeholder="Label" value={opt.label} onChange={e => updateCustom(i, 'label', e.target.value)} />
                        <input className="input" placeholder="Placeholder text" value={opt.placeholder} onChange={e => updateCustom(i, 'placeholder', e.target.value)} />
                        {opt.type === 'select' && (
                          <input className="input" placeholder="Options (comma-separated)"
                            value={(opt.values || []).join(', ')}
                            onChange={e => updateCustom(i, 'values', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                        )}
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={addCustom} type="button">
                      <Plus size={12} /> Add Custom Option
                    </button>
                  </div>
                </>
              )}

              {/* ── SEO ── */}
              {tab === 'seo' && (
                <>
                  <Field label="Meta Title (EN)">
                    <input className="input" value={data.metaTitle.en}
                      onChange={e => setI18n('metaTitle','en',e.target.value)} placeholder="Auto from title" />
                  </Field>
                  <Field label="Meta Title (BN)">
                    <input className="input lang-bn" value={data.metaTitle.bn}
                      onChange={e => setI18n('metaTitle','bn',e.target.value)} />
                  </Field>
                  <Field label="Meta Description (EN)">
                    <textarea className="input" rows={3} value={data.metaDescription.en}
                      onChange={e => setI18n('metaDescription','en',e.target.value.slice(0,160))}
                      placeholder="Max 160 chars. Auto from description." />
                    <small style={{ color: 'var(--text-4)' }}>{data.metaDescription.en.length}/160</small>
                  </Field>
                  <Field label="Meta Description (BN)">
                    <textarea className="input lang-bn" rows={3} value={data.metaDescription.bn}
                      onChange={e => setI18n('metaDescription','bn',e.target.value.slice(0,160))} />
                  </Field>
                </>
              )}

              {/* ── ADVANCED ── */}
              {tab === 'advanced' && (
                <>
                  <Field label="SKU Code">
                    <input className="input" value={data.sku}
                      onChange={e => set_('sku', e.target.value)} placeholder="Auto-generated if empty" />
                  </Field>
                  <Field label="Sort Order (lower = first)">
                    <input className="input" type="number" min="0" value={data.sortOrder}
                      onChange={e => set_('sortOrder', Number(e.target.value))} />
                  </Field>
                  <Field label="WhatsApp Note (shown to admin)">
                    <input className="input" value={data.whatsappNote}
                      onChange={e => set_('whatsappNote', e.target.value)} placeholder="Special handling note..." />
                  </Field>
                </>
              )}

              {/* Error */}
              {error && <p className="editor-error">{error}</p>}
            </div>
          </div>

          {/* Right: Preview */}
          {preview && (
            <div className="editor-preview-wrap">
              <p className="editor-section-label">Live Preview</p>
              <ProductPreview product={data} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="editor-footer">
          <button className="btn btn-ghost" onClick={onClose}>{t('admin.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> {t('admin.saving')}</>
              : t('admin.save')
            }
          </button>
        </div>
      </motion.div>

      <style>{`
        .editor-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: var(--z-drawer);
          display: flex; justify-content: flex-end;
        }
        .editor-panel {
          width: 100%; max-width: 900px;
          height: 100dvh;
          background: var(--bg-2);
          border-left: 1px solid var(--border-1);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        @media (max-width: 640px) { .editor-panel { max-width: 100%; } }

        .editor-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border-1);
          flex-shrink: 0;
        }
        .editor-title { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 400; }
        .editor-header-actions { display: flex; gap: 4px; }

        .editor-body {
          flex: 1; display: flex; overflow: hidden;
        }
        .editor-form-wrap {
          flex: 1; display: flex; flex-direction: column; overflow: hidden;
          min-width: 0;
        }

        .editor-tabs {
          display: flex; gap: 2px; padding: 8px 12px;
          border-bottom: 1px solid var(--border-1);
          overflow-x: auto; flex-shrink: 0;
        }
        .editor-tabs::-webkit-scrollbar { display: none; }
        .editor-tab {
          padding: 6px 14px; border-radius: var(--r-s);
          font-size: var(--text-xs); font-weight: 500;
          letter-spacing: 0.04em; color: var(--text-3);
          white-space: nowrap; transition: all var(--t-fast);
        }
        .editor-tab.active { background: var(--bg-4); color: var(--text-1); }
        .editor-tab:hover:not(.active) { color: var(--text-2); }

        .editor-form {
          flex: 1; overflow-y: auto;
          padding: 20px; display: flex; flex-direction: column; gap: 16px;
        }
        .editor-section-label {
          font-size: var(--text-xs); font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-3); margin-bottom: 8px;
        }
        .editor-error { color: var(--err); font-size: var(--text-xs); }

        .editor-toggles { display: flex; flex-wrap: wrap; gap: 12px; }

        .editor-preview-wrap {
          width: 280px; flex-shrink: 0;
          border-left: 1px solid var(--border-1);
          overflow-y: auto; padding: 16px;
        }
        @media (max-width: 768px) { .editor-preview-wrap { display: none; } }

        .editor-footer {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 8px; padding: 12px 20px;
          border-top: 1px solid var(--border-1); flex-shrink: 0;
        }

        /* Tag input */
        .tag-input-wrap { display: flex; flex-direction: column; gap: 8px; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag-chip-edit {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; background: var(--bg-3);
          border: 1px solid var(--border-2); border-radius: var(--r-f);
          font-size: var(--text-xs); color: var(--text-2);
        }
        .tag-chip-edit button { display: flex; align-items: center; color: var(--text-3); transition: color var(--t-fast); }
        .tag-chip-edit button:hover { color: var(--err); }

        /* Variant blocks */
        .variant-block {
          background: var(--bg-3); border: 1px solid var(--border-1);
          border-radius: var(--r-m); padding: 12px; margin-bottom: 8px;
        }
        .variant-block-header { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
        .variant-options-list { display: flex; flex-direction: column; gap: 6px; }
        .variant-opt-row { display: flex; gap: 6px; align-items: center; }
        .custom-opt-block {
          display: flex; flex-direction: column; gap: 8px;
          background: var(--bg-3); border: 1px solid var(--border-1);
          border-radius: var(--r-m); padding: 10px; margin-bottom: 8px;
        }
      `}</style>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, mini = false }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <span
        onClick={() => onChange(!value)}
        style={{
          width: mini ? 28 : 36, height: mini ? 16 : 20,
          borderRadius: 999, background: value ? 'var(--accent)' : 'var(--border-3)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          display: 'flex', alignItems: 'center',
          padding: 2, cursor: 'pointer',
        }}
      >
        <span style={{
          width: mini ? 12 : 16, height: mini ? 12 : 16,
          borderRadius: '50%', background: '#fff',
          transform: value ? `translateX(${mini ? 12 : 16}px)` : 'translateX(0)',
          transition: 'transform 0.2s',
        }} />
      </span>
      {!mini && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>{label}</span>}
    </label>
  );
}
