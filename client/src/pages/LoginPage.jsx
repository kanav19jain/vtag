import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, Loader2, LockKeyhole, Smartphone, Sparkles } from 'lucide-react';
import Alert from '../components/Alert.jsx';
import Logo from '../components/Logo.jsx';
import { authApi, getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const requestCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await authApi.requestOtp(phone);
      setDevOtp(data.devOtp || null);
      setCooldown(data.resendAfterSeconds || 60);
      setStep('otp');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(phone, otp);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_.92fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <Logo />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          <div className="chip mb-6 w-fit border-mint-400/20 bg-mint-400/[0.06] text-mint-300">
            <Sparkles size={13} /> {isSignup ? 'Create your account' : 'Owner access'}
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {step === 'phone' ? (isSignup ? 'Start with your number.' : 'Welcome back.') : 'Check your code.'}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {step === 'phone'
              ? 'We use a one-time code instead of a password. In development the code appears right here on screen.'
              : `Enter the 6-digit code for ${phone}. Development codes are displayed below — no SMS is sent.`}
          </p>

          <div className="card mt-9 p-6 sm:p-7">
            {error && <Alert type="error" className="mb-5">{error}</Alert>}

            {step === 'phone' ? (
              <form onSubmit={requestCode} className="space-y-5">
                <div>
                  <label htmlFor="phone" className="label">Mobile number</label>
                  <div className="relative">
                    <Smartphone size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="input pl-11 font-mono tracking-wide"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">10–15 digits. Country code optional.</p>
                </div>
                <button type="submit" disabled={busy} className="btn-primary w-full py-3.5">
                  {busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
                  {busy ? 'Generating code…' : 'Send one-time code'}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="label">6-digit code</label>
                  <div className="relative">
                    <KeyRound size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="input pl-11 font-mono text-lg tracking-[0.35em]"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {devOtp && (
                  <div className="rounded-xl border border-electric/30 bg-electric/[0.08] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                      Development OTP
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <span className="font-mono text-2xl font-bold tracking-[0.3em] text-white">{devOtp}</span>
                      <button type="button" onClick={() => setOtp(devOtp)} className="btn-secondary px-3 py-2 text-[11px]">
                        Use code
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Shown on screen only in development mode.</p>
                  </div>
                )}

                <button type="submit" disabled={busy || otp.length !== 6} className="btn-primary w-full py-3.5">
                  {busy ? <Loader2 size={17} className="animate-spin" /> : <LockKeyhole size={17} />}
                  {busy ? 'Verifying…' : 'Verify & continue'}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                    className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-white"
                  >
                    <ArrowLeft size={14} /> Change number
                  </button>
                  <button
                    type="button"
                    disabled={cooldown > 0 || busy}
                    onClick={async () => {
                      setBusy(true);
                      setError('');
                      try {
                        const { data } = await authApi.requestOtp(phone);
                        setDevOtp(data.devOtp || null);
                        setCooldown(data.resendAfterSeconds || 60);
                      } catch (err) {
                        setError(getErrorMessage(err));
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="text-mint-300 transition hover:text-mint-200 disabled:cursor-not-allowed disabled:text-slate-600"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-slate-600">
            By continuing you agree this is a demo environment.{' '}
            <Link to="/" className="text-slate-400 underline-offset-4 hover:underline">Back to home</Link>
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-white/[0.07] bg-ink-900/50 lg:flex lg:items-center lg:justify-center">
        <div className="grid-backdrop absolute inset-0" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-mint-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-md px-10">
          <div className="rounded-3xl border border-white/10 bg-ink-850/70 p-8 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-mint-400/25 bg-mint-400/10 text-mint-300">
              <QrGlyph />
            </div>
            <h2 className="mt-7 font-display text-2xl font-semibold text-white">A safer way to be reached.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Your VTag dashboard is where you manage tags, download QR codes and review scan and demo-call
              activity.
            </p>
            <ul className="mt-7 space-y-4">
              {['One account, unlimited vehicles', 'Unique QR for every tag', 'Public page never shows your number'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-400/15 text-mint-300">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function QrGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v3M17 20h4" />
    </svg>
  );
}
