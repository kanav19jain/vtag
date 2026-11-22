import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const styles = {
  error: {
    icon: AlertCircle,
    wrap: 'border-rose-500/25 bg-rose-500/[0.08] text-rose-200',
  },
  success: {
    icon: CheckCircle2,
    wrap: 'border-mint-400/25 bg-mint-400/[0.08] text-mint-300',
  },
  info: {
    icon: Info,
    wrap: 'border-electric/25 bg-electric/[0.08] text-indigo-200',
  },
};

export default function Alert({ type = 'info', children, className = '' }) {
  const { icon: Icon, wrap } = styles[type] || styles.info;
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-xs leading-relaxed ${wrap} ${className}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
