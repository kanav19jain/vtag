import { Check, Copy, Download, ExternalLink, Loader2 } from 'lucide-react';

export default function QRPanel({ vehicle, onDownload, downloading, onCopy, copied }) {
  return (
    <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
      <div className="mx-auto w-full max-w-[200px]">
        <div className="rounded-2xl bg-white p-3 shadow-[0_20px_60px_-30px_rgba(52,216,176,.7)]">
          <img src={vehicle.qrDataUrl} alt={`QR code for ${vehicle.registrationNumber}`} className="w-full" />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] text-slate-500">{vehicle.tagId}</p>
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Public link</p>
        <div className="mt-2 break-all rounded-xl border border-white/[0.08] bg-ink-950/60 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-mint-300">
          {vehicle.tagUrl}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Anyone scanning this tag sees only your vehicle details — never your phone number. The demo call
          never dials a real number.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onDownload} disabled={downloading} className="btn-primary px-4 py-2.5 text-xs">
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Download PNG
          </button>
          <button type="button" onClick={onCopy} className="btn-secondary px-4 py-2.5 text-xs">
            {copied ? <Check size={15} className="text-mint-400" /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <a
            href={`/t/${vehicle.tagId}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-4 py-2.5 text-xs"
          >
            <ExternalLink size={15} /> Open page
          </a>
        </div>
      </div>
    </div>
  );
}
