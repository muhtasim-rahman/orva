import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * v1.2 — Scrolls to top on every route change (instant, no animation clash).
 * Place inside <BrowserRouter> in App.jsx.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
