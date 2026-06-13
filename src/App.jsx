import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import ScrollToTop from '@/components/layout/ScrollToTop';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { PageLoader } from '@/components/ui/Skeleton';

// Lazy-loaded pages (code splitting)
const Home        = lazy(() => import('@/pages/Home'));
const Products    = lazy(() => import('@/pages/Products'));
const ProductSlug = lazy(() => import('@/pages/ProductSlug'));
const About       = lazy(() => import('@/pages/About'));
const Admin       = lazy(() => import('@/pages/Admin'));
const NotFound    = lazy(() => import('@/pages/NotFound'));

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Global nav — hidden on admin pages */}
      {!isAdmin && <Navbar />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Suspense fallback={<PageLoader />}>
            <Routes location={location}>
              <Route path="/"              element={<Home />} />
              <Route path="/products"      element={<Products />} />
              <Route path="/products/:slug" element={<ProductSlug />} />
              <Route path="/about"         element={<About />} />
              <Route path="/admin"         element={<Admin />} />
              <Route path="*"              element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Footer + mobile tab bar — hidden on admin */}
      {!isAdmin && (
        <>
          <Footer />
          <MobileTabBar />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}
