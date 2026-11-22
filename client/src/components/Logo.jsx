import { Link } from 'react-router-dom';

export default function Logo({ compact = false, to = '/' }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-3" aria-label="VTag home">
      <span className="relative grid h-9 w-9 grid-cols-2 grid-rows-2 gap-1 rounded-xl border border-mint-400/20 bg-ink-900 p-2 shadow-glow">
        <span className="rounded-[3px] bg-mint-400" />
        <span className="rounded-[3px] bg-mint-400/40" />
        <span className="rounded-[3px] bg-mint-400/40" />
        <span className="rounded-[3px] bg-mint-400" />
      </span>
      <span className="flex items-baseline gap-2">
        <span className="font-display text-lg font-bold tracking-tight text-white">VTag</span>
        {!compact && (
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:inline">
            vehicle link
          </span>
        )}
      </span>
    </Link>
  );
}
