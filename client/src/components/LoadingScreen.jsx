export default function LoadingScreen({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-xl border-2 border-mint-400/20" />
        <div className="absolute inset-0 animate-spin rounded-xl border-2 border-transparent border-t-mint-400" />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}…</p>
    </div>
  );
}
