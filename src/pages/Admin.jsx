import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Package, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PinWall from '@/components/admin/PinWall';
import AdminLogin from '@/components/admin/AdminLogin';
import ProductsTab from '@/components/admin/ProductsTab';
import SettingsTab from '@/components/admin/SettingsTab';
import { PageLoader } from '@/components/ui/Skeleton';
import { useState } from 'react';

const TABS = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Admin() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin, pinPassed, loading, markPinPassed, logout } = useAuth();
  const [tab, setTab] = useState('products');

  // Redirect non-admin users away after auth loads
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) return <PageLoader />;

  // Step 1: PIN wall (skip if already passed in this session)
  if (!pinPassed) {
    return <PinWall onSuccess={markPinPassed} />;
  }

  // Step 2: Firebase login
  if (!user) {
    return <AdminLogin />;
  }

  // Waiting for isAdmin check (user just logged in)
  if (user && isAdmin === false && !loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <ShieldCheck size={32} style={{ color: 'var(--err)' }} strokeWidth={1.5} />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Access Denied</p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)' }}>Your account is not authorized as admin.</p>
        <button className="btn btn-outline" onClick={logout}>Sign Out</button>
      </div>
    );
  }

  // Full admin panel
  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <img src="/assets/logo-white.webp" alt="ORVA" className="admin-logo" />
          <span className="admin-label">Admin</span>
        </div>

        <nav className="admin-nav">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`admin-nav-item ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span>{label}</span>
              {tab === id && (
                <motion.span layoutId="admin-nav-dot" className="admin-nav-dot"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <img
              src={user?.photoURL || '/assets/logo-white.webp'}
              alt={user?.displayName || 'Admin'}
              className="admin-user-avatar"
            />
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.displayName || 'Admin'}</span>
              <span className="admin-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm admin-logout" onClick={logout}>
            <LogOut size={13} strokeWidth={1.5} /> {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-main-header">
          <h1 className="admin-page-title">
            {TABS.find(tb => tb.id === tab)?.label}
          </h1>
        </div>

        <div className="admin-content">
          {tab === 'products' && <ProductsTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </main>

      <style>{`
        .admin-panel {
          display: flex;
          min-height: 100dvh;
          background: var(--bg);
        }

        /* Sidebar */
        .admin-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--bg-2);
          border-right: 1px solid var(--border-1);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100dvh;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .admin-panel { flex-direction: column; }
          .admin-sidebar { width: 100%; height: auto; position: static; flex-direction: row; align-items: center; border-right: none; border-bottom: 1px solid var(--border-1); padding: 10px 16px; }
          .admin-sidebar-top { margin-bottom: 0; margin-right: 12px; }
          .admin-nav { flex-direction: row; flex: 1; gap: 4px; }
          .admin-sidebar-bottom { display: none; }
        }

        .admin-sidebar-top {
          padding: 20px 16px 12px;
          border-bottom: 1px solid var(--border-1);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .admin-logo { height: 18px; width: auto; object-fit: contain; opacity: 0.7; }
        .admin-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-4);
          padding: 2px 6px;
          background: var(--bg-3);
          border: 1px solid var(--border-2);
          border-radius: var(--r-f);
        }

        .admin-nav {
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: var(--r-s);
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--text-3);
          transition: all var(--t-fast);
          position: relative;
          text-align: left;
        }
        .admin-nav-item:hover { color: var(--text-1); background: var(--bg-3); }
        .admin-nav-item.active { color: var(--text-1); background: var(--bg-3); }
        .admin-nav-dot {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          background: var(--accent);
          border-radius: 2px;
        }
        @media (max-width: 640px) {
          .admin-nav-dot { display: none; }
          .admin-nav-item.active { background: var(--bg-4); }
        }

        .admin-sidebar-bottom {
          padding: 12px 10px;
          border-top: 1px solid var(--border-1);
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        .admin-user { display: flex; align-items: center; gap: 8px; padding: 4px 4px; }
        .admin-user-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          object-fit: cover; border: 1px solid var(--border-2);
          background: var(--bg-3);
        }
        .admin-user-info { flex: 1; min-width: 0; }
        .admin-user-name { display: block; font-size: var(--text-xs); font-weight: 500; color: var(--text-2);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .admin-user-email { display: block; font-size: 10px; color: var(--text-4);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .admin-logout { width: 100%; justify-content: center; font-size: 11px; gap: 6px; }

        /* Main */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .admin-main-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-1);
          flex-shrink: 0;
          background: var(--bg);
        }
        .admin-page-title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: 400;
        }
        .admin-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
