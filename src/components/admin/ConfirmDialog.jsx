import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, message, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="dialog-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="dialog-card"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          {danger && (
            <div className="dialog-icon">
              <AlertTriangle size={18} strokeWidth={1.5} />
            </div>
          )}
          <p className="dialog-message">{message}</p>
          <div className="dialog-actions">
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>{cancelLabel}</button>
            <button
              className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .dialog-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          z-index: var(--z-modal);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .dialog-card {
          background: var(--bg-2); border: 1px solid var(--border-2);
          border-radius: var(--r-l); padding: 28px 24px;
          max-width: 360px; width: 100%;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          text-align: center;
        }
        .dialog-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--err-dim); color: var(--err);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(196,83,74,0.2);
        }
        .dialog-message { font-size: var(--text-sm); color: var(--text-2); line-height: 1.5; }
        .dialog-actions { display: flex; gap: 8px; justify-content: center; }
        .btn-danger {
          background: var(--err); color: #fff;
          border: 1px solid var(--err);
        }
        .btn-danger:hover { background: #b04840; border-color: #b04840; }
      `}</style>
    </AnimatePresence>
  );
}
