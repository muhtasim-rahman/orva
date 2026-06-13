import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { objToArray } from '@/utils';

function useDbRef(path, transform) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!db) {
      setError('Database not configured. Check VITE_FIREBASE_DATABASE_URL in .env');
      setLoading(false);
      return;
    }
    const r = ref(db, path);
    const handler = (snap) => {
      try {
        setData(transform(snap.val()));
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    onValue(r, handler, (e) => { setError(e.message); setLoading(false); });
    return () => off(r, 'value', handler);
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

export function useProducts() {
  const { data, loading, error } = useDbRef('products', (raw) =>
    objToArray(raw || {})
      .filter(p => p.published !== false)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  );
  return { products: data || [], loading, error };
}

export function useProduct(slug) {
  const { data, loading, error } = useDbRef('products', (raw) => {
    const arr = objToArray(raw || {});
    return arr.find(p => p.slug === slug && p.published !== false) || null;
  });
  return { product: data, loading, error: data === null && !loading ? 'Not found' : error };
}

export function useAllProducts() {
  const { data, loading, error } = useDbRef('products', (raw) =>
    objToArray(raw || {}).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  );
  return { products: data || [], loading, error };
}

export function usePinnedProducts() {
  const { products, loading, error } = useProducts();
  return { products: products.filter(p => p.pinned), loading, error };
}

export function useCategories() {
  const { data, loading } = useDbRef('categories', (raw) =>
    objToArray(raw || {})
      .filter(c => c.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  );
  return { categories: data || [], loading };
}

export function useAllCategories() {
  const { data, loading } = useDbRef('categories', (raw) =>
    objToArray(raw || {}).sort((a, b) => (a.order || 0) - (b.order || 0))
  );
  return { categories: data || [], loading };
}

/**
 * FIX v1.2: Read settings/site and settings/social SEPARATELY as public paths.
 * Previously useDbRef('settings', ...) failed for unauthenticated users because
 * settings/admin/$other has auth-required rules, causing the entire parent read to fail.
 * Reading the two public sub-paths directly bypasses this cascade failure.
 */
export function useSettings() {
  const { data: siteData,   loading: l1 } = useDbRef('settings/site',   raw => raw || {});
  const { data: socialData, loading: l2 } = useDbRef('settings/social', raw => raw || {});
  return {
    settings: { site: siteData || {}, social: socialData || {} },
    loading: l1 || l2,
  };
}
