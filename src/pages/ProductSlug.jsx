import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Maximize2, MessageCircle,
  Phone, ArrowLeft, Tag, Copy, Check, Info, Loader2, Image as ImageIcon
} from 'lucide-react';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { tField } from '@/i18n';
import { formatPrice } from '@/utils';
import {
  generateOrderId, calculatePrice, generateReceiptCanvas,
  uploadReceiptImage, buildCompactMessage, openMessenger,
  openWhatsApp, copyToClipboard
} from '@/lib/orderBuilder';
import ImageLightbox from '@/components/ui/ImageLightbox';
import ProductCard from '@/components/ui/ProductCard';
import { PageLoader, Skeleton } from '@/components/ui/Skeleton';

const IMAGE_INTERVAL = 4000;

export default function ProductSlug() {
  const { slug }     = useParams();
  const { t, i18n } = useTranslation();
  const lang         = i18n.language;

  const { product, loading, error } = useProduct(slug);
  const { products: allProducts }   = useProducts();

  const [imgIdx, setImgIdx]           = useState(0);
  const [lightboxOpen, setLightbox]   = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const imgTimer = useRef(null);

  const [selections, setSelections] = useState({});
  const [quantity, setQuantity]     = useState(1);
  const [customer, setCustomer]     = useState({ name: '', phone: '', address: '', note: '' });
  const [orderId]                   = useState(generateOrderId);

  // Order processing state
  const [orderState, setOrderState] = useState('idle'); // idle | generating | uploading | ready | error
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null); // base64 for local preview
  const [copied, setCopied]         = useState(false);
  const [showInfo, setShowInfo]     = useState(false);

  const images = product?.images || [];

  useEffect(() => {
    if (images.length <= 1) return;
    imgTimer.current = setInterval(() => setImgIdx(i => (i + 1) % images.length), IMAGE_INTERVAL);
    return () => clearInterval(imgTimer.current);
  }, [images.length]);

  const goImg = (dir) => {
    clearInterval(imgTimer.current);
    setImgIdx(i => (i + dir + images.length) % images.length);
    imgTimer.current = setInterval(() => setImgIdx(i => (i + 1) % images.length), IMAGE_INTERVAL);
  };

  const totalPrice = product
    ? calculatePrice(product.basePrice, { ...selections, quantity }, product.variants || [])
    : 0;

  const canOrder = customer.name.trim() && customer.phone.trim() && customer.address.trim();

  // Build the order details object
  const buildDetails = useCallback(() => {
    const extras = {};
    (product?.customOptions || []).forEach((opt, i) => {
      const val = selections[`custom_${i}`];
      if (val) extras[opt.label] = val;
    });
    return {
      orderId,
      product: tField(product?.title, lang),
      size:     selections.size     || '',
      color:    selections.color    || '',
      quantity,
      userName: customer.name,
      phone:    customer.phone,
      address:  customer.address,
      note:     customer.note,
      extras,
    };
  }, [product, selections, quantity, customer, orderId, lang]);

  /* ── Process order: generate image → upload → build message ── */
  const processOrder = useCallback(async () => {
    if (!canOrder || !product) return null;
    setOrderState('generating');
    try {
      const details = buildDetails();
      const base64  = await generateReceiptCanvas(details);
      setReceiptPreview(base64);
      setOrderState('uploading');
      const imgUrl = await uploadReceiptImage(base64, details);
      setReceiptUrl(imgUrl);
      setOrderState('ready');
      return { details, imgUrl };
    } catch (e) {
      setOrderState('error');
      console.error('Order processing error:', e);
      return null;
    }
  }, [canOrder, product, buildDetails]);

  const handleMessenger = async () => {
    let ctx = receiptUrl ? { details: buildDetails(), imgUrl: receiptUrl } : await processOrder();
    if (!ctx) return;
    const msg = buildCompactMessage(ctx.details, ctx.imgUrl);
    openMessenger(msg);
  };

  const handleWhatsApp = async () => {
    let ctx = receiptUrl ? { details: buildDetails(), imgUrl: receiptUrl } : await processOrder();
    if (!ctx) return;
    const msg = buildCompactMessage(ctx.details, ctx.imgUrl);
    openWhatsApp(msg);
  };

  const handleCopy = async () => {
    let ctx = receiptUrl ? { details: buildDetails(), imgUrl: receiptUrl } : await processOrder();
    if (!ctx) return;
    await copyToClipboard(buildCompactMessage(ctx.details, ctx.imgUrl));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const related = allProducts
    .filter(p => p.id !== product?.id && p.category === product?.category)
    .slice(0, 4);

  if (loading) return <div className="page-wrap"><PageLoader /></div>;
  if (error || !product) {
    return (
      <div className="page-wrap slug-not-found">
        <div className="container">
          <p className="slug-404-title">Product not found</p>
          <Link to="/products" className="btn btn-outline" style={{ gap: 6 }}>
            <ArrowLeft size={14} /> {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  const title    = tField(product.title, lang);
  const desc     = tField(product.description, lang);
  const metaDesc = tField(product.metaDescription, lang) || desc?.slice(0, 160);
  const ogImage  = images[0] || '/assets/logo-blackBG.webp';
  const isProcessing = orderState === 'generating' || orderState === 'uploading';

  return (
    <>
      <Helmet>
        <title>{title} — ORVA</title>
        <meta name="description"        content={metaDesc} />
        <meta property="og:title"       content={`${title} — ORVA`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image"       content={ogImage} />
        <meta property="og:type"        content="product" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: title,
          description: metaDesc,
          image: images,
          offers: { '@type': 'Offer', priceCurrency: 'BDT', price: product.basePrice, availability: 'https://schema.org/InStock' }
        })}</script>
      </Helmet>

      <main className="page-wrap slug-page">
        <div className="container">
          <Link to="/products" className="slug-back">
            <ArrowLeft size={14} strokeWidth={1.5} /> {t('common.back')}
          </Link>

          <div className="slug-layout">
            {/* ── Images ── */}
            <div className="slug-images">
              <div className="slug-main-img-wrap">
                <AnimatePresence mode="wait">
                  {images.length > 0 ? (
                    <motion.img key={imgIdx} src={images[imgIdx]} alt={`${title} — ${imgIdx + 1}`}
                      className="slug-main-img"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => { setLightboxIdx(imgIdx); setLightbox(true); }}
                      loading="eager"
                    />
                  ) : (
                    <div className="slug-no-img">
                      <img src="/assets/logo-white.webp" alt="ORVA" style={{ height: 36, opacity: 0.15 }} />
                    </div>
                  )}
                </AnimatePresence>
                {images.length > 0 && (
                  <button className="slug-zoom-btn" onClick={() => { setLightboxIdx(imgIdx); setLightbox(true); }}>
                    <Maximize2 size={14} strokeWidth={1.5} />
                  </button>
                )}
                {images.length > 1 && (<>
                  <button className="slug-img-arrow slug-img-arrow-l" onClick={() => goImg(-1)}><ChevronLeft size={18} /></button>
                  <button className="slug-img-arrow slug-img-arrow-r" onClick={() => goImg(1)}><ChevronRight size={18} /></button>
                </>)}
              </div>
              {images.length > 1 && (
                <div className="slug-thumbs">
                  {images.map((src, i) => (
                    <button key={i} className={`slug-thumb ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)}>
                      <img src={src} alt={`Thumb ${i + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info + Order ── */}
            <div className="slug-info">
              <div className="slug-meta-top">
                {product.category && (
                  <Link to={`/products?category=${product.category}`} className="slug-category">
                    {tField(product.category, lang) || product.category}
                  </Link>
                )}
                {(product.tags || []).map((tag, i) => (
                  <span key={i} className="slug-tag"><Tag size={10} />{tag}</span>
                ))}
              </div>

              <h1 className="slug-title">{title}</h1>
              <div className="slug-price-row">
                <span className="slug-price">{formatPrice(totalPrice)}</span>
                {totalPrice !== product.basePrice && (
                  <span className="slug-base-price">Base: {formatPrice(product.basePrice)}</span>
                )}
              </div>
              {desc && <p className="slug-desc">{desc}</p>}

              {/* Variants */}
              {(product.variants || []).map(v => (
                <VariantSection key={v.type} variant={v} selected={selections[v.type]}
                  onSelect={val => setSelections(s => ({ ...s, [v.type]: val }))} t={t} />
              ))}

              {/* Custom options */}
              {(product.customOptions || []).map((opt, i) => (
                <CustomOption key={i} option={opt}
                  value={selections[`custom_${i}`] || ''}
                  onChange={val => setSelections(s => ({ ...s, [`custom_${i}`]: val }))} />
              ))}

              {/* Quantity */}
              <div className="slug-section">
                <p className="slug-section-label">{t('product.quantity')}</p>
                <div className="slug-qty">
                  <button className="slug-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>—</button>
                  <span className="slug-qty-val">{quantity}</span>
                  <button className="slug-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
              </div>

              <div className="slug-divider" />

              {/* Customer Info */}
              <div className="slug-section">
                <p className="slug-section-label">{t('product.order_summary')}</p>
                <div className="slug-customer-form">
                  <input className="input" placeholder={`${t('product.customer_name')} *`}
                    value={customer.name} onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))} required />
                  <input className="input" placeholder={`${t('product.customer_phone')} *`}
                    value={customer.phone} onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))} type="tel" required />
                  <textarea className="input" placeholder={`${t('product.customer_address')} *`}
                    value={customer.address} onChange={e => setCustomer(c => ({ ...c, address: e.target.value }))} rows={2} required />
                  <textarea className="input" placeholder={t('product.customer_note')}
                    value={customer.note} onChange={e => setCustomer(c => ({ ...c, note: e.target.value }))} rows={2} />
                </div>
              </div>

              {/* Order ID */}
              <div className="slug-order-id-row">
                <span className="slug-order-id-label">{t('product.order_id')}</span>
                <span className="slug-order-id">{orderId}</span>
              </div>

              {/* Receipt preview if generated */}
              {receiptPreview && (
                <div className="slug-receipt-preview">
                  <div className="slug-receipt-header">
                    <ImageIcon size={13} strokeWidth={1.5} />
                    <span>Order Receipt Generated</span>
                    {receiptUrl && <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="slug-receipt-link">View →</a>}
                  </div>
                  <img src={receiptPreview} alt="Order Receipt" className="slug-receipt-img" />
                </div>
              )}

              {/* Status indicator */}
              {isProcessing && (
                <div className="slug-processing">
                  <Loader2 size={14} className="slug-spin" />
                  <span>{orderState === 'generating' ? 'Generating receipt…' : 'Uploading receipt…'}</span>
                </div>
              )}

              {/* Order Actions */}
              <div className="slug-order-actions">
                <button className="btn btn-primary slug-order-btn" onClick={handleMessenger}
                  disabled={!canOrder || isProcessing}>
                  {isProcessing ? <Loader2 size={15} className="slug-spin" /> : <MessageCircle size={15} strokeWidth={1.5} />}
                  {t('product.order_via_messenger')}
                </button>
                <button className="btn btn-outline slug-order-btn" onClick={handleWhatsApp}
                  disabled={!canOrder || isProcessing}>
                  <Phone size={15} strokeWidth={1.5} />
                  {t('product.order_via_whatsapp')}
                </button>
                <button className="btn btn-ghost slug-copy-btn" onClick={handleCopy}
                  disabled={!canOrder || isProcessing}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t('product.copied') : t('product.copy_order')}
                </button>
              </div>

              {!canOrder && (
                <p className="slug-order-hint"><Info size={12} /> Fill in name, phone and address to order.</p>
              )}

              <button className="slug-how-btn" onClick={() => setShowInfo(v => !v)}>
                <Info size={13} strokeWidth={1.5} /> {t('product.how_to_order')}
              </button>
              <AnimatePresence>
                {showInfo && (
                  <motion.p className="slug-how-desc"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    {t('product.how_to_order_desc')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="slug-related">
              <h2 className="slug-related-title">{t('product.related')}</h2>
              <div className="slug-related-grid">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>

        {lightboxOpen && (
          <ImageLightbox images={images} initialIndex={lightboxIdx} onClose={() => setLightbox(false)} />
        )}
      </main>

      <style>{`
        .slug-page { padding-top: calc(var(--nav-h) + 32px); padding-bottom: 80px; }
        .slug-not-found { display: flex; align-items: center; padding-top: calc(var(--nav-h) + 80px); }
        .slug-404-title { font-family: var(--font-display); font-size: var(--text-2xl); margin-bottom: 20px; }
        .slug-back { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-xs); font-weight: 500;
          letter-spacing: var(--tracking-wider); text-transform: uppercase; color: var(--text-3);
          margin-bottom: 28px; transition: color var(--t-fast); }
        .slug-back:hover { color: var(--text-1); }
        .slug-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        @media (max-width: 900px) { .slug-layout { grid-template-columns: 1fr; gap: 32px; } }
        .slug-main-img-wrap { position: relative; aspect-ratio: 3/4; background: var(--bg-2);
          border: 1px solid var(--border-1); border-radius: var(--r-l); overflow: hidden; cursor: zoom-in; }
        .slug-main-img { width: 100%; height: 100%; object-fit: cover; }
        .slug-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .slug-zoom-btn { position: absolute; bottom: 10px; right: 10px; padding: 7px;
          background: var(--bg-overlay); backdrop-filter: blur(8px);
          border: 1px solid var(--border-2); border-radius: var(--r-s);
          color: var(--text-2); transition: all var(--t-fast); }
        .slug-zoom-btn:hover { color: var(--text-1); }
        .slug-img-arrow { position: absolute; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px; background: var(--bg-overlay); backdrop-filter: blur(6px);
          border: 1px solid var(--border-2); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-1); transition: all var(--t-fast); z-index: 2; }
        .slug-img-arrow:hover { background: var(--bg-4); }
        .slug-img-arrow-l { left: 10px; } .slug-img-arrow-r { right: 10px; }
        .slug-thumbs { display: flex; gap: 8px; margin-top: 10px; overflow-x: auto; padding-bottom: 4px; }
        .slug-thumbs::-webkit-scrollbar { display: none; }
        .slug-thumb { width: 64px; height: 64px; flex-shrink: 0; border-radius: var(--r-s);
          overflow: hidden; border: 2px solid var(--border-1); transition: border-color var(--t-fast);
          cursor: pointer; padding: 0; background: var(--bg-2); }
        .slug-thumb.active { border-color: var(--text-1); }
        .slug-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .slug-meta-top { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .slug-category { font-size: var(--text-xs); font-weight: 500; letter-spacing: var(--tracking-wider);
          text-transform: uppercase; color: var(--text-3); padding: 3px 10px;
          background: var(--bg-3); border: 1px solid var(--border-2); border-radius: var(--r-f);
          transition: color var(--t-fast); }
        .slug-category:hover { color: var(--text-1); }
        .slug-tag { display: inline-flex; align-items: center; gap: 4px;
          font-size: var(--text-xs); color: var(--text-3); padding: 3px 8px;
          border: 1px solid var(--border-1); border-radius: var(--r-f); }
        .slug-title { font-family: var(--font-display); font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 400; line-height: var(--leading-snug); letter-spacing: var(--tracking-tight);
          margin-bottom: 14px; }
        .slug-price-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
        .slug-price { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--text-1); }
        .slug-base-price { font-size: var(--text-sm); color: var(--text-3); }
        .slug-desc { font-size: var(--text-sm); color: var(--text-2); line-height: var(--leading-base);
          margin-bottom: 24px; font-weight: 300; }
        .slug-section { margin-bottom: 20px; }
        .slug-section-label { font-size: var(--text-xs); font-weight: 500; letter-spacing: var(--tracking-widest);
          text-transform: uppercase; color: var(--text-3); margin-bottom: 10px; }
        .slug-qty { display: inline-flex; align-items: center; border: 1px solid var(--border-2); border-radius: var(--r-s); overflow: hidden; }
        .slug-qty-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          font-size: var(--text-md); color: var(--text-2); background: var(--bg-3); transition: all var(--t-fast); }
        .slug-qty-btn:hover:not(:disabled) { background: var(--bg-4); color: var(--text-1); }
        .slug-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .slug-qty-val { width: 44px; text-align: center; font-size: var(--text-sm); font-weight: 500;
          color: var(--text-1); background: var(--bg-2); padding: 8px 4px;
          border-left: 1px solid var(--border-2); border-right: 1px solid var(--border-2); }
        .slug-divider { height: 1px; background: var(--border-1); margin: 24px 0; }
        .slug-customer-form { display: flex; flex-direction: column; gap: 8px; }
        .slug-order-id-row { display: flex; align-items: center; gap: 8px; padding: 10px 14px;
          background: var(--bg-2); border: 1px solid var(--border-1); border-radius: var(--r-s); margin-bottom: 16px; }
        .slug-order-id-label { font-size: var(--text-xs); color: var(--text-3); letter-spacing: 0.1em; text-transform: uppercase; }
        .slug-order-id { font-family: monospace; font-size: var(--text-sm); color: var(--accent); letter-spacing: 0.05em; }

        /* Receipt preview */
        .slug-receipt-preview { border: 1px solid var(--border-1); border-radius: var(--r-m); overflow: hidden; margin-bottom: 14px; }
        .slug-receipt-header { display: flex; align-items: center; gap: 6px; padding: 8px 12px;
          background: var(--bg-3); border-bottom: 1px solid var(--border-1);
          font-size: var(--text-xs); color: var(--text-3); }
        .slug-receipt-link { margin-left: auto; color: var(--accent); font-size: var(--text-xs); }
        .slug-receipt-img { width: 100%; display: block; }

        .slug-processing { display: flex; align-items: center; gap: 8px;
          font-size: var(--text-xs); color: var(--text-3); margin-bottom: 12px;
          padding: 10px 14px; background: var(--bg-2); border: 1px solid var(--border-1); border-radius: var(--r-s); }
        .slug-spin { animation: spin 1s linear infinite; }

        .slug-order-actions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
        .slug-order-btn { width: 100%; justify-content: center; gap: 8px; }
        .slug-copy-btn { width: 100%; justify-content: center; font-size: var(--text-xs); gap: 6px; }
        .slug-order-hint { display: flex; align-items: center; gap: 5px;
          font-size: var(--text-xs); color: var(--text-3); margin-bottom: 12px; }
        .slug-how-btn { display: flex; align-items: center; gap: 6px; font-size: var(--text-xs);
          color: var(--text-3); transition: color var(--t-fast); margin-top: 8px; padding: 6px 0; }
        .slug-how-btn:hover { color: var(--text-1); }
        .slug-how-desc { font-size: var(--text-xs); color: var(--text-3); line-height: var(--leading-base);
          margin-top: 6px; padding: 10px 12px; background: var(--bg-2);
          border: 1px solid var(--border-1); border-radius: var(--r-s); overflow: hidden; }
        .slug-related { margin-top: 80px; }
        .slug-related-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 400;
          margin-bottom: 28px; letter-spacing: var(--tracking-tight); }
        .slug-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1024px) { .slug-related-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .slug-related-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .slug-page { padding-top: calc(var(--nav-h) + 20px); } }
      `}</style>
    </>
  );
}

function VariantSection({ variant, selected, onSelect, t }) {
  const label = variant.type === 'size' ? t('product.select_size')
              : variant.type === 'color' ? t('product.select_color')
              : variant.type;
  return (
    <div className="slug-section">
      <p className="slug-section-label">{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(variant.options || []).map(opt => {
          const active = selected === opt.label;
          const off    = opt.available === false;
          if (variant.type === 'color' && opt.hex) {
            return (
              <button key={opt.label} title={opt.label}
                style={{ width: 32, height: 32, borderRadius: '50%', background: opt.hex, border: `2px solid ${active ? 'var(--text-1)' : 'transparent'}`,
                  outline: active ? '2px solid var(--text-1)' : 'none', outlineOffset: 2,
                  opacity: off ? 0.3 : 1, cursor: off ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                onClick={() => !off && onSelect(opt.label)} disabled={off} aria-label={opt.label} />
            );
          }
          return (
            <button key={opt.label}
              style={{ padding: '7px 16px', border: `1px solid ${active ? 'var(--text-1)' : 'var(--border-2)'}`,
                borderRadius: 'var(--r-s)', fontSize: 'var(--text-xs)', fontWeight: 500,
                color: active ? 'var(--text-1)' : 'var(--text-2)', background: active ? 'var(--bg-3)' : 'transparent',
                opacity: off ? 0.3 : 1, cursor: off ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
              onClick={() => !off && onSelect(opt.label)} disabled={off}>
              {opt.label}
              {opt.priceAdd > 0 && <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block' }}>+{formatPrice(opt.priceAdd)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomOption({ option, value, onChange }) {
  if (option.type === 'select') {
    return (
      <div className="slug-section">
        <p className="slug-section-label">{option.label}</p>
        <select className="input" value={value} onChange={e => onChange(e.target.value)}>
          <option value="">—</option>
          {(option.values || []).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="slug-section">
      <p className="slug-section-label">{option.label}</p>
      <input className="input" placeholder={option.placeholder || option.label}
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
