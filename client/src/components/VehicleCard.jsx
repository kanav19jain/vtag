import { CarFront, Copy, FileDown, QrCode, ScanLine, Trash2 } from 'lucide-react';

const typeLabels = {
  car: 'Car',
  bike: 'Bike',
  suv: 'SUV',
  truck: 'Truck',
  van: 'Van',
  ev: 'Electric',
  other: 'Other',
};

export default function VehicleCard({ vehicle, onQr, onDelete, onCopy }) {
  return (
    <article className="group card overflow-hidden p-0 transition duration-300 hover:border-mint-400/25 hover:shadow-glow">
      <div className="relative h-28 overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-ink-700/60 via-ink-800 to-ink-900">
        <div className="grid-backdrop absolute inset-0 opacity-70" />
        <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-mint-400/10 blur-2xl" />
        <div className="relative flex h-full items-center justify-between px-5">
          <div className="rounded-lg border-2 border-slate-300/20 bg-[#F4F6F8] px-4 py-2 shadow-lg">
            <p className="font-mono text-base font-bold tracking-[0.12em] text-ink-900">
              {vehicle.registrationNumber}
            </p>
          </div>
          <CarFront size={54} strokeWidth={1} className="text-white/10" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold text-white">{vehicle.model}</h3>
            <p className="mt-1 text-xs text-slate-500">Added {new Date(vehicle.createdAt).toLocaleDateString()}</p>
          </div>
          <span className="chip shrink-0 text-mint-300">{typeLabels[vehicle.vehicleType] || 'Vehicle'}</span>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-ink-950/50 px-3 py-2.5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">Tag</p>
            <p className="mt-0.5 font-mono text-xs text-slate-300">{vehicle.tagId}</p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(vehicle.tagUrl)}
            className="btn-icon h-8 w-8"
            title="Copy public link"
          >
            <Copy size={14} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <ScanLine size={14} className="text-mint-400" /> {vehicle.scanCount} scan{vehicle.scanCount === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CarFront size={14} className="text-electric" /> {vehicle.callCount} demo call{vehicle.callCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-2 border-t border-white/[0.07] pt-4">
          <button type="button" onClick={() => onQr(vehicle)} className="btn-primary px-3 py-2.5 text-xs">
            <QrCode size={15} /> View QR
          </button>
          <button type="button" onClick={() => onQr(vehicle, true)} className="btn-secondary px-3 py-2.5" title="Download QR PNG">
            <FileDown size={15} />
          </button>
          <button type="button" onClick={() => onDelete(vehicle)} className="btn-danger px-3 py-2.5" title="Delete vehicle">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
