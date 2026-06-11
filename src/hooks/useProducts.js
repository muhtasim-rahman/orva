import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { objToArray } from '@/utils';

function useDbRef(path, transform) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    // db is null when DATABASE_URL is missing — fail gracefully
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
  }, [path]);

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

export function useSettings() {
  const { data, loading } = useDbRef('settings', (raw) => raw || {});
  return { settings: data, loading };
}
