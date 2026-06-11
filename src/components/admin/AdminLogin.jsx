import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Chrome } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const { t } = useTranslation();
  const { loginWithGoogle, loginWithEmail } = useAuth();

  const [mode, setMode]         = useState('choose'); // choose | email
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(e.message || t('admin.login_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
    } catch (e) {
      setError(t('admin.login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <img src="/assets/logo-white.webp" alt="ORVA" className="admin-login-logo" />
        <h1 className="admin-login-title">{t('admin.login_title')}</h1>

        {mode === 'choose' ? (
          <div className="admin-login-options">
            <button
              className="btn btn-outline admin-login-option"
              onClick={handleGoogle}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Chrome size={16} strokeWidth={1.5} />}
              {t('admin.login_google')}
            </button>

            <div className="admin-login-sep">
              <span>or</span>
            </div>

            <button
              className="btn btn-ghost admin-login-option"
              onClick={() => setMode('email')}
            >
              <Mail size={16} strokeWidth={1.5} />
              {t('admin.login_email')}
            </button>
          </div>
        ) : (
          <form className="admin-login-form" onSubmit={handleEmail}>
            <div className="admin-login-field">
              <Mail size={14} className="admin-input-icon" strokeWidth={1.5} />
              <input
                className="input admin-input-padded"
                type="email"
                placeholder={t('admin.login_email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="admin-login-field">
              <Lock size={14} className="admin-input-icon" strokeWidth={1.5} />
              <input
                className="input admin-input-padded"
                type="password"
                placeholder={t('admin.login_pass')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> {t('admin.login_submit')}</>
                : t('admin.login_submit')
              }
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMode('choose')} style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
              ← Back
            </button>
          </form>
        )}

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={13} /> {error}
          </div>
        )}
      </motion.div>

      <style>{`
        .admin-login-wrap {
          min-height: 100dvh;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg); padding: 24px;
        }
        .admin-login-card {
          width: 100%; max-width: 360px;
          background: var(--bg-2); border: 1px solid var(--border-1);
          border-radius: var(--r-xl); padding: 40px 32px;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }
        .admin-login-logo { height: 24px; opacity: 0.7; }
        .admin-login-title {
          font-family: var(--font-display); font-size: var(--text-xl);
          font-weight: 400; letter-spacing: var(--tracking-tight);
        }
        .admin-login-options { width: 100%; display: flex; flex-direction: column; gap: 8px; }
        .admin-login-option { width: 100%; gap: 8px; }
        .admin-login-sep {
          display: flex; align-items: center; gap: 12px;
          font-size: var(--text-xs); color: var(--text-4);
        }
        .admin-login-sep::before, .admin-login-sep::after {
          content: ''; flex: 1; height: 1px; background: var(--border-1);
        }
        .admin-login-form { width: 100%; display: flex; flex-direction: column; gap: 8px; }
        .admin-login-field { position: relative; }
        .admin-input-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: var(--text-3);
          pointer-events: none;
        }
        .admin-input-padded { padding-left: 36px; }
        .admin-login-error {
          display: flex; align-items: center; gap: 6px;
          font-size: var(--text-xs); color: var(--err);
          background: var(--err-dim); padding: 8px 12px;
          border-radius: var(--r-s); width: 100%;
          border: 1px solid rgba(196,83,74,0.2);
        }
      `}</style>
    </div>
  );
}
