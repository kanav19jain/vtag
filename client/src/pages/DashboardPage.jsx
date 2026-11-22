import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CarFront,
  Inbox,
  Loader2,
  PhoneCall,
  Plus,
  QrCode,
  ScanLine,
  Trash2,
} from 'lucide-react';
import Alert from '../components/Alert.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Modal from '../components/Modal.jsx';
import QRPanel from '../components/QRPanel.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import { getErrorMessage, ownerApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const vehicleTypes = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'ev', label: 'Electric' },
  { value: 'other', label: 'Other' },
];

const relativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const emptyForm = { registrationNumber: '', model: '', vehicleType: 'car' };

export default function DashboardPage() {
  const { owner } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState({ scans: [], calls: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [qrVehicle, setQrVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [historyTab, setHistoryTab] = useState('scans');

  const load = useCallback(async () => {
    try {
      const [vehicleRes, historyRes] = await Promise.all([ownerApi.vehicles(), ownerApi.history()]);
      setVehicles(vehicleRes.data.vehicles);
      setHistory(historyRes.data);
      setPageError('');
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  const createVehicle = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const { data } = await ownerApi.createVehicle(form);
      setForm(emptyForm);
      setFormOpen(false);
      await load();
      setQrVehicle(data.vehicle);
      flash('Vehicle added. Your QR tag is ready.');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      flash('Clipboard unavailable — copy the link from the QR panel.');
    }
  };

  const downloadQr = async (vehicle) => {
    if (!vehicle) return;
    setDownloading(true);
    try {
      const { data } = await ownerApi.downloadQr(vehicle.id);
      const url = URL.createObjectURL(data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `vtag-${vehicle.registrationNumber.replace(/\s+/g, '-')}-${vehicle.tagId}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const openQr = (vehicle, download = false) => {
    setQrVehicle(vehicle);
    setCopied(false);
    if (download) downloadQr(vehicle);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await ownerApi.deleteVehicle(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      flash('Vehicle removed.');
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <DashboardLayout><LoadingScreen label="Loading dashboard" /></DashboardLayout>;
  }

  const stats = [
    { label: 'Vehicles', value: history.totals.vehicles ?? vehicles.length, icon: CarFront, tone: 'text-mint-300' },
    { label: 'Total scans', value: history.totals.scans ?? 0, icon: ScanLine, tone: 'text-electric' },
    { label: 'Demo calls', value: history.totals.calls ?? 0, icon: PhoneCall, tone: 'text-amber-300' },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <section id="overview" className="scroll-mt-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-mint-400">Owner workspace</p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your garage, connected.
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Signed in as <span className="font-mono text-slate-300">{owner?.phone}</span>
              </p>
            </div>
            <button type="button" onClick={() => setFormOpen(true)} className="btn-primary w-full sm:w-auto">
              <Plus size={17} /> Add vehicle
            </button>
          </div>

          {success && <Alert type="success" className="mt-6">{success}</Alert>}
          {pageError && <Alert type="error" className="mt-6">{pageError}</Alert>}

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="card flex items-center justify-between p-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="tabular mt-2 font-display text-3xl font-bold text-white">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] ${tone}`}>
                  <Icon size={21} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="vehicles" className="mt-14 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-white">Vehicles</h2>
            <span className="chip">{vehicles.length} total</span>
          </div>

          {vehicles.length === 0 ? (
            <div className="card mt-5 flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-mint-400/20 bg-mint-400/[0.06] text-mint-300">
                <Inbox size={28} />
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-white">No vehicles yet</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Add your first vehicle to generate a unique QR tag and a public contact page.
              </p>
              <button type="button" onClick={() => setFormOpen(true)} className="btn-primary mt-7">
                <Plus size={16} /> Add your first vehicle
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onQr={openQr}
                  onCopy={copyLink}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>

        <section id="activity" className="mt-14 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-white">Recent activity</h2>
            <div className="flex rounded-xl border border-white/[0.08] bg-ink-900/60 p-1">
              {[
                { id: 'scans', label: 'Scans', icon: ScanLine },
                { id: 'calls', label: 'Demo calls', icon: PhoneCall },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setHistoryTab(id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    historyTab === id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="card mt-5 divide-y divide-white/[0.06] p-0">
            {(historyTab === 'scans' ? history.scans : history.calls).length === 0 ? (
              <div className="flex items-center gap-3 px-6 py-10 text-sm text-slate-500">
                <Activity size={17} /> No activity recorded yet.
              </div>
            ) : (
              (historyTab === 'scans' ? history.scans : history.calls).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400">
                      {historyTab === 'scans' ? <ScanLine size={16} /> : <PhoneCall size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {item.vehicle?.registrationNumber || 'Removed vehicle'}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {item.vehicle?.model || '—'}
                        {historyTab === 'calls' && ` · ${item.status}`}
                        {historyTab === 'calls' && item.durationSec > 0 && ` · ${item.durationSec}s`}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-slate-500">{relativeTime(item.createdAt)}</span>
                </div>
              ))
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-600">
            Activity is stored for your dashboard only. Visitor IPs are hashed and never stored in plain text.
          </p>
        </section>
      </div>

      {/* Add vehicle */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add a vehicle"
        subtitle="A unique QR tag is generated automatically."
      >
        <form onSubmit={createVehicle} className="space-y-5">
          {formError && <Alert type="error">{formError}</Alert>}
          <div>
            <label htmlFor="registrationNumber" className="label">Registration number</label>
            <input
              id="registrationNumber"
              className="input font-mono uppercase tracking-wide"
              value={form.registrationNumber}
              onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })}
              placeholder="MH 12 AB 3456"
              maxLength={20}
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="model" className="label">Model</label>
            <input
              id="model"
              className="input"
              value={form.model}
              onChange={(event) => setForm({ ...form, model: event.target.value })}
              placeholder="Honda Civic"
              maxLength={80}
              required
            />
          </div>
          <div>
            <label htmlFor="vehicleType" className="label">Vehicle type</label>
            <select
              id="vehicleType"
              className="input appearance-none"
              value={form.vehicleType}
              onChange={(event) => setForm({ ...form, vehicleType: event.target.value })}
            >
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value} className="bg-ink-850">{type.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-[1.5]">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
              {saving ? 'Generating…' : 'Create tag'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR display */}
      <Modal
        open={Boolean(qrVehicle)}
        onClose={() => setQrVehicle(null)}
        title="Your VTag is ready"
        subtitle={`${qrVehicle?.registrationNumber || ''} · ${qrVehicle?.model || ''}`}
        width="max-w-2xl"
      >
        {qrVehicle && (
          <QRPanel
            vehicle={qrVehicle}
            onDownload={() => downloadQr(qrVehicle)}
            downloading={downloading}
            onCopy={() => copyLink(qrVehicle.tagUrl)}
            copied={copied}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this vehicle?"
        subtitle="This also removes its scan and demo-call history."
        width="max-w-md"
      >
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-200">
          <span className="font-mono font-semibold">{deleteTarget?.registrationNumber}</span> · {deleteTarget?.model}
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Keep it</button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={Boolean(busyId)}
            className="btn-danger flex-1"
          >
            {busyId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
