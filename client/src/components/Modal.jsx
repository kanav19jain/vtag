import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} animate-fade-up overflow-hidden rounded-t-3xl border border-white/10 bg-ink-850 shadow-panel sm:rounded-3xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-icon shrink-0" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
