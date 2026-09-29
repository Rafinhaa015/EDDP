'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { forwardRef, useId, useState } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const variants = {
  primary: 'bg-brand-500 text-ink-950 hover:bg-brand-400 shadow-lg shadow-brand-500/20',
  secondary: 'bg-white/10 text-white hover:bg-white/15 ring-1 ring-white/10',
  ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};
const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-5 text-sm', lg: 'h-13 px-7 text-base' };

export function Button({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, hint, type, className = '', ...props }, ref) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={`h-11 w-full rounded-xl border bg-ink-900 px-3.5 text-white placeholder:text-slate-500 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none ${
            error ? 'border-red-500/70' : 'border-white/10'
          } ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-white"
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const tones = {
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    success: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, label, className = '' }: { value: number; label?: string; className?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={className}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progresso'}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-[width] duration-700" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-400" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {label}
    </div>
  );
}
