'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input, button:not([data-close])')?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[92vh] w-full animate-pop overflow-y-auto rounded-t-3xl border border-white/10 bg-ink-850 p-6 shadow-2xl sm:rounded-3xl sm:p-8 ${
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button data-close onClick={onClose} className="-m-2 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
