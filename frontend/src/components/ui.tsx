import React from 'react';

/* ── Button ── */
export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'gradient';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
      : variant === 'gradient'
        ? 'gradient-btn rounded-2xl px-6 py-3 font-semibold'
        : variant === 'danger'
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white text-slate-700 shadow-sm ring-1 ring-surface-border hover:bg-slate-50';
  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ── Card ── */
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-card ring-1 ring-surface-border/60 ${className}`}>{children}</div>
  );
}

/* ── Page header ── */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Metric card (LoopAI style) ── */
export function MetricCard({
  label,
  value,
  delta,
  deltaLabel,
  positive = true,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaLabel?: string;
  positive?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      {delta && (
        <span
          className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs font-semibold ${
            positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}
        >
          {positive ? '+' : ''}
          {delta}
        </span>
      )}
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {deltaLabel && <p className="mt-3 text-xs text-slate-400">{deltaLabel}</p>}
    </Card>
  );
}

/* ── Status badge ── */
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'border-amber-200 bg-amber-50 text-amber-700',
  DRAFT: 'border-slate-200 bg-slate-50 text-slate-600',
  PAUSED: 'border-blue-200 bg-blue-50 text-blue-700',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  INACTIVE: 'border-red-200 bg-red-50 text-red-600',
  CALL: 'border-blue-200 bg-blue-50 text-blue-700',
  EMAIL: 'border-violet-200 bg-violet-50 text-violet-700',
  MEETING: 'border-amber-200 bg-amber-50 text-amber-700',
  NOTE: 'border-slate-200 bg-slate-50 text-slate-600',
  WON: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  LOST: 'border-red-200 bg-red-50 text-red-600',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'border-slate-200 bg-slate-50 text-slate-600';
  const labels: Record<string, string> = {
    ACTIVE: 'Activa',
    DRAFT: 'Borrador',
    PAUSED: 'Pausada',
    COMPLETED: 'Completada',
    INACTIVE: 'Inactivo',
    CALL: 'Llamada',
    EMAIL: 'Email',
    MEETING: 'Reunión',
    NOTE: 'Nota',
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {labels[status] ?? status}
    </span>
  );
}

/* ── Tab filter ── */
export function TabFilter<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-surface-border pb-px">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition ${
            active === t.id
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.label}
          {t.count != null && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active === t.id ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Avatar ── */
export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const hues = ['bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700'];
  const hue = hues[name.length % hues.length];
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${hue} ${className}`}
    >
      {initials || '?'}
    </span>
  );
}

/* ── Modal ── */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <Card className={`max-h-[90vh] w-full overflow-y-auto ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

/* ── Form fields ── */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'mt-0 w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls} {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputCls} {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={inputCls} {...props} />;
}

/* ── Data table wrapper ── */
export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}

export function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-surface-border bg-surface-muted/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
        {cols.map((c) => (
          <th key={c} className="px-5 py-3.5">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}
