import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CarFront,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  PhoneCall,
  PhoneOff,
  QrCode,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Logo from '../components/Logo.jsx';
import { getErrorMessage, publicApi } from '../api/client.js';

const typeLabels = {
  car: 'Car',
  bike: 'Bike',
  suv: 'SUV',
  truck: 'Truck',
  van: 'Van',
  ev: 'Electric vehicle',
  other: 'Vehicle',
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const terminal = ['connected', 'ended', 'failed'];

export default function PublicContactPage() {
  const { tagId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [call, setCall] = useState(null);
  const [callError, setCallError] = useState('');
  const [forceFailure, setForceFailure] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await publicApi.tag(tagId);
        if (active) setVehicle(data.vehicle);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      clearInterval(pollRef.current);
    };
  }, [tagId]);

  useEffect(() => {
    if (call?.status !== 'connected' || !call.connectedAt) {
      setElapsed(0);
      return undefined;
    }
    const started = new Date(call.connectedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [call?.status, call?.connectedAt]);

  const pollCall = (publicId) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const response = await publicApi.getCall(publicId);
        const next = response.data.call;
        setCall(next);
        if (terminal.includes(next.status)) clearInterval(pollRef.current);
      } catch (err) {
        clearInterval(pollRef.current);
        setCallError(getErrorMessage(err));
      }
    }, 650);
  };

  const startCall = async () => {
    setCallError('');
    setCall({ status: 'initiating' });
    try {
      const response = await publicApi.startCall(tagId, forceFailure);
      const next = response.data.call;
      setCall(next);
      pollCall(next.publicId);
    } catch (err) {
      clearInterval(pollRef.current);
      setCall(null);
      setCallError(getErrorMessage(err));
    }
  };

  const endCall = async () => {
    clearInterval(pollRef.current);
    try {
      const response = await publicApi.endCall(call.publicId);
      setCall(response.data.call);
    } catch (err) {
      setCallError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-mint-400" size={26} />
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Loading VTag…</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <Logo />
        <div className="card mt-10 w-full p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
            <QrCode size={26} />
          </div>
          <h1 className="mt-6 font-display text-xl font-semibold text-white">This VTag isn't available</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {error || 'The tag may have been removed or the link is incorrect.'}
          </p>
        </div>
        <p className="mt-8 text-[11px] text-slate-600">VTag · privacy-first vehicle contact</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-mint-400/[0.08] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex items-center justify-between">
          <Logo compact />
          <span className="chip border-mint-400/20 bg-mint-400/[0.06] text-mint-300">
            <ShieldCheck size={13} /> VTag
          </span>
        </header>

        <main className="mt-10 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mint-400">Vehicle contact</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white">
            Need to reach the owner?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            This tag is linked to the vehicle below. Start a demo call to simulate contacting the owner.
          </p>

          <div className="card mt-8 overflow-hidden p-0">
            <div className="relative h-32 bg-gradient-to-br from-ink-700/70 via-ink-800 to-ink-900">
              <div className="grid-backdrop absolute inset-0" />
              <div className="relative flex h-full flex-col items-center justify-center gap-3">
                <div className="rounded-lg border-2 border-white/20 bg-[#F4F6F8] px-6 py-3 shadow-xl">
                  <span className="font-mono text-xl font-bold tracking-[0.14em] text-ink-900">
                    {vehicle.registrationNumber}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-white">{vehicle.model}</h2>
                  <p className="mt-1 text-xs text-slate-500">{typeLabels[vehicle.vehicleType] || 'Vehicle'}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-mint-300">
                  <CarFront size={19} />
                </span>
              </div>
              <div className="hairline my-5" />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">{vehicle.tagId}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={12} /> Scan recorded</span>
              </div>
            </div>
          </div>

          <Alert type="info" className="mt-5">
            <span className="font-semibold">Demo mode.</span> No real phone call is placed and no phone number
            is exchanged. This simulates initiation, connection, ending and failure states.
          </Alert>

          <div className="mt-7">
            {callError && <Alert type="error" className="mb-4">{callError}</Alert>}

            {call && (
              <div
                className={`rounded-2xl border p-5 transition ${
                  call.status === 'failed'
                    ? 'border-rose-500/25 bg-rose-500/[0.07]'
                    : call.status === 'connected' || call.status === 'ended'
                      ? 'border-mint-400/25 bg-mint-400/[0.07]'
                      : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                {call.status === 'initiating' && (
                  <StatusRow icon={<Loader2 size={19} className="animate-spin" />} title="Starting demo call…" detail="Contacting the simulated provider" />
                )}

                {call.status === 'ringing' && (
                  <StatusRow
                    icon={<span className="relative flex h-5 w-5"><span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-mint-400/60" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint-400" /></span>}
                    title="Connecting…"
                    detail="Simulating a ring — still no real dialling"
                  />
                )}

                {call.status === 'connected' && (
                  <>
                    <StatusRow
                      icon={<CheckCircle2 size={20} className="text-mint-300" />}
                      title="Demo call connected"
                      detail="This is a simulated connection only"
                    />
                    <div className="mt-5 flex items-center justify-between rounded-xl border border-mint-400/15 bg-ink-950/40 px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                        <Clock3 size={14} /> Demo duration
                      </span>
                      <span className="tabular font-mono text-lg text-mint-300">{formatDuration(elapsed)}</span>
                    </div>
                    <button type="button" onClick={endCall} className="btn-danger mt-4 w-full py-3">
                      <PhoneOff size={17} /> End demo call
                    </button>
                  </>
                )}

                {call.status === 'ended' && (
                  <>
                    <StatusRow
                      icon={<CheckCircle2 size={20} className="text-mint-300" />}
                      title="Demo call ended"
                      detail="No real phone call was placed"
                    />
                    {call.durationSec > 0 && (
                      <p className="mt-4 font-mono text-xs text-slate-400">
                        Duration: {formatDuration(call.durationSec)}
                      </p>
                    )}
                  </>
                )}

                {call.status === 'failed' && (
                  <>
                    <StatusRow
                      icon={<XCircle size={20} className="text-rose-300" />}
                      title="Demo call couldn't connect"
                      detail={call.failureReason || 'Simulated failure'}
                    />
                    <p className="mt-4 flex items-center gap-2 text-[11px] text-rose-200/70">
                      <AlertTriangle size={13} /> This failure is part of the demo.
                    </p>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={startCall}
              disabled={['initiating', 'ringing'].includes(call?.status)}
              className="btn-primary mt-5 w-full py-4 text-base shadow-glow"
            >
              {['initiating', 'ringing'].includes(call?.status) ? (
                <><Loader2 size={19} className="animate-spin" /> Demo call in progress…</>
              ) : call ? (
                <><RotateCcw size={19} /> {call.status === 'failed' ? 'Retry demo call' : 'Start another demo call'}</>
              ) : (
                <><PhoneCall size={19} /> Call owner — demo</>
              )}
            </button>

            <details className="group mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs text-slate-400 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2"><SlidersHorizontal size={14} /> Demo controls</span>
                <span className="text-slate-600 group-open:rotate-180">⌄</span>
              </summary>
              <div className="border-t border-white/[0.06] px-4 py-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={forceFailure}
                    onChange={(event) => setForceFailure(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-mint-400"
                  />
                  <span>
                    <span className="block text-xs font-medium text-slate-200">Force a failed call</span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                      Use this to preview the failure state. Still entirely simulated.
                    </span>
                  </span>
                </label>
              </div>
            </details>
          </div>
        </main>

        <footer className="mt-12 space-y-2 text-center text-[11px] leading-relaxed text-slate-600">
          <p>Public VTag page · Only vehicle details are shown.</p>
          <p>No phone numbers are exposed or dialled by this demo.</p>
        </footer>
      </div>
    </div>
  );
}

function StatusRow({ icon, title, detail }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
