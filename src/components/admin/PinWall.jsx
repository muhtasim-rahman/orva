import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { validatePin } from '@/lib/cloudflare';
import { useNavigate } from 'react-router-dom';

const MAX_ATTEMPTS = 3;
const IDLE_TIMEOUT = 60_000; // 1 minute

export default function PinWall({ onSuccess }) {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const idleTimer = useRef(null);

  const [pin, setPin]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake]     = useState(false);

  // Focus the hidden input whenever user taps anywhere
  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  useEffect(() => {
    focusInput();
    // Idle timeout — redirect home if user is inactive for 1 minute
    const reset = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => navigate('/', { replace: true }), IDLE_TIMEOUT);
    };
    reset();
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('touchstart', reset);
    return () => {
      clearTimeout(idleTimer.current);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('touchstart', reset);
    };
  }, [navigate, focusInput]);

  const submit = useCallback(async (value) => {
    setLoading(true);
    setError('');
    const { valid } = await validatePin(value);
    if (valid) {
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (newAttempts >= MAX_ATTEMPTS) {
        setError(t('admin.pin_locked'));
        setTimeout(() => navigate('/'), 2500);
      } else {
        setError(t('admin.pin_wrong'));
      }
      // Re-focus after error
      setTimeout(focusInput, 100);
    }
    setLoading(false);
  }, [attempts, t, navigate, onSuccess, focusInput]);

  const handleDigit = useCallback((d) => {
    if (pin.length >= 8 || loading) return;
    const next = pin + d;
    setPin(next);
    setError('');
    if (next.length === 8) submit(next);
  }, [pin, loading, submit]);

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError('');
    focusInput();
  };

  // Physical keyboard support
  const handleKeyDown = useCallback((e) => {
    if (loading) return;
    if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
    else if (e.key === 'Backspace') handleDelete();
  }, [loading, handleDigit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const dots = Array.from({ length: 8 }, (_, i) => i < pin.length);

  return (
    <div className="pin-wall" onClick={focusInput}>
      <motion.div
        className="pin-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="pin-header">
          <div className="pin-icon"><Shield size={22} strokeWidth={1.5} /></div>
          <h1 className="pin-title">{t('admin.pin_title')}</h1>
          <p className="pin-desc">{t('admin.pin_desc')}</p>
        </div>

        <motion.div
          className="pin-dots"
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {dots.map((filled, i) => (
            <span key={i} className={`pin-dot ${filled ? 'filled' : ''}`} />
          ))}
        </motion.div>

        {/* Hidden real input — captures mobile keyboard + keeps focus */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 8);
            setPin(v);
            setError('');
            if (v.length === 8) submit(v);
          }}
          className="pin-hidden-input"
          aria-label="Enter PIN"
          disabled={loading}
          autoFocus
          autoComplete="off"
        />

        {/* On-screen keypad */}
        <div className="pin-keypad">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((key, i) => {
            if (key === '') return <span key={i} />;
            if (key === '⌫') {
              return (
                <button key={i} className="pin-key pin-key-del" type="button"
                  onClick={() => { handleDelete(); focusInput(); }}
                  disabled={!pin.length || loading}>⌫</button>
              );
            }
            return (
              <button key={i} className="pin-key" type="button"
                onClick={() => { handleDigit(String(key)); focusInput(); }}
                disabled={loading || pin.length >= 8}>
                {key}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div className="pin-error"
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <AlertCircle size={13} /> {error}
            </motion.div>
          )}
        </AnimatePresence>
        {loading && <div className="spinner" style={{ margin:'8px auto 0' }} />}
      </motion.div>

      <style>{`
        .pin-wall { min-height:100dvh; display:flex; align-items:center; justify-content:center;
          background:var(--bg); padding:24px; cursor:default; }
        .pin-card { width:100%; max-width:340px; background:var(--bg-2);
          border:1px solid var(--border-1); border-radius:var(--r-xl); padding:36px 28px;
          display:flex; flex-direction:column; align-items:center; gap:24px; }
        .pin-header { text-align:center; }
        .pin-icon { width:48px; height:48px; border-radius:50%; background:var(--bg-3);
          border:1px solid var(--border-2); display:flex; align-items:center; justify-content:center;
          color:var(--text-2); margin:0 auto 14px; }
        .pin-title { font-family:var(--font-display); font-size:var(--text-xl); font-weight:400;
          letter-spacing:var(--tracking-tight); margin-bottom:6px; }
        .pin-desc { font-size:var(--text-xs); color:var(--text-3); }
        .pin-dots { display:flex; gap:10px; }
        .pin-dot { width:12px; height:12px; border-radius:50%; border:1.5px solid var(--border-3);
          background:transparent; transition:all var(--t-fast); }
        .pin-dot.filled { background:var(--text-1); border-color:var(--text-1); }
        .pin-hidden-input { position:absolute; opacity:0; pointer-events:none; width:1px; height:1px; }
        .pin-keypad { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; width:100%; }
        .pin-key { height:56px; border-radius:var(--r-m); background:var(--bg-3);
          border:1px solid var(--border-1); font-size:var(--text-lg); font-weight:400;
          color:var(--text-1); transition:all var(--t-fast); font-family:var(--font-display); }
        .pin-key:hover:not(:disabled) { background:var(--bg-4); border-color:var(--border-3); }
        .pin-key:active:not(:disabled) { transform:scale(0.96); }
        .pin-key:disabled { opacity:0.3; cursor:not-allowed; }
        .pin-key-del { font-size:var(--text-base); font-family:var(--font-body); }
        .pin-error { display:flex; align-items:center; gap:6px;
          font-size:var(--text-xs); color:var(--err); text-align:center; }
      `}</style>
    </div>
  );
}
