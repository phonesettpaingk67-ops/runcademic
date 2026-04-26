import { useEffect } from 'react';
import I from './Icon';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-back" onClick={onClose} />
      <div className="modal-card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--rule-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="card-title">{title}</div>
          <button className="row-action" onClick={onClose} aria-label="Close">{I.x()}</button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--rule-soft)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
