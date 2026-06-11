/** Flexible skeleton loader block */
export function Skeleton({ width = '100%', height = 16, radius = 4, style = {} }) {
  return (
    <span
      className="skeleton"
      aria-hidden="true"
      style={{ display: 'block', width, height, borderRadius: radius, ...style }}
    />
  );
}

/** Full product card skeleton */
export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--r-l) var(--r-l) 0 0' }} />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={18} width="75%" />
        <Skeleton height={12} width="55%" />
        <Skeleton height={10} width="40%" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Skeleton height={10} width="30%" />
          <Skeleton height={16} width="25%" />
        </div>
      </div>
      <style>{`
        .product-card-skeleton {
          background: var(--bg-2);
          border: 1px solid var(--border-1);
          border-radius: var(--r-l);
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

/** Page-level loading spinner */
export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="spinner" />
    </div>
  );
}
