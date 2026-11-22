import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CarFront,
  Fingerprint,
  PhoneCall,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';

const steps = [
  {
    icon: QrCode,
    number: '01',
    title: 'Create your tags',
    text: 'Register your number, add a vehicle and get a unique QR tag in seconds. Download and print it.',
  },
  {
    icon: ScanLine,
    number: '02',
    title: 'Someone scans it',
    text: 'A scan opens a clean mobile page with only the vehicle details you allow. Your number stays hidden.',
  },
  {
    icon: PhoneCall,
    number: '03',
    title: 'They reach out',
    text: 'The demo call flow connects instantly through a simulated provider — ready for a real provider later.',
  },
];

const features = [
  {
    icon: Fingerprint,
    title: 'Random, unguessable tags',
    text: 'Every tag uses a cryptographically random identifier. No sequential IDs, no enumeration.',
  },
  {
    icon: ShieldCheck,
    title: 'Phone number never exposed',
    text: 'Public endpoints return vehicle details only. Your contact number is never part of a public response.',
  },
  {
    icon: Zap,
    title: 'Provider-ready architecture',
    text: 'Telephony sits behind a small interface. Swap the mock for a real provider without touching UI code.',
  },
];

function DecorativeQr() {
  const cells = Array.from({ length: 81 }, (_, i) => {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const finder =
      (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
    if (finder) {
      const fr = row < 3 ? 0 : 6;
      const fc = col < 3 ? 0 : 6;
      const inside = row - fr >= 1 && row - fr <= 1 && col - fc >= 1 && col - fc <= 1;
      return row - fr === 0 || row - fr === 2 || col - fc === 0 || col - fc === 2 || inside;
    }
    return (row * 7 + col * 13 + row * col) % 3 !== 0;
  });

  return (
    <div className="grid h-full w-full grid-cols-9 gap-[2px] rounded-md bg-white p-1.5">
      {cells.map((filled, i) => (
        <span key={i} className={`rounded-[1px] ${filled ? 'bg-ink-900' : 'bg-transparent'}`} />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />

      <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a href="#how" className="transition hover:text-white">How it works</a>
          <a href="#privacy" className="transition hover:text-white">Privacy</a>
        </nav>
        <Link to="/login" className="btn-secondary px-4 py-2.5 text-xs sm:text-sm">
          Owner sign in <ArrowRight size={15} />
        </Link>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-32 lg:pt-20">
          <div className="animate-fade-up">
            <div className="chip mb-6 border-mint-400/20 bg-mint-400/[0.06] text-mint-300">
              <Sparkles size={13} /> Privacy-first vehicle contact
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              One scan.
              <br />
              <span className="text-gradient">The right person.</span>
              <br />
              Zero numbers shared.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              VTag turns a small QR sticker into a private bridge between a vehicle and its owner. No app
              to install, no phone number on display, no awkward conversations.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/login?mode=signup" className="btn-primary px-6 py-3.5">
                Create your first tag <ArrowRight size={17} />
              </Link>
              <a href="#how" className="btn-secondary px-6 py-3.5">
                See how it works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-mint-500" /> Owner number hidden</span>
              <span className="inline-flex items-center gap-2"><QrCode size={15} className="text-mint-500" /> Unique random tags</span>
              <span className="inline-flex items-center gap-2"><Zap size={15} className="text-mint-500" /> Demo calls only</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-float lg:mr-0">
            <div className="absolute -inset-10 rounded-full bg-mint-400/[0.07] blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-ink-900/80 p-4 shadow-panel backdrop-blur-xl">
              <div className="flex items-center justify-between px-2 pb-4 pt-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Live tag preview</span>
                <span className="chip border-mint-400/20 text-mint-300"><span className="h-1.5 w-1.5 rounded-full bg-mint-400" /> Active</span>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-ink-800 to-ink-950 p-6">
                <div className="mx-auto w-fit rounded-lg border-2 border-white/20 bg-[#F4F6F8] px-5 py-3">
                  <span className="font-mono text-lg font-bold tracking-[0.15em] text-ink-900">MH 12 AB 3456</span>
                </div>
                <p className="mt-4 text-center font-display text-lg font-semibold text-white">Honda Civic</p>
                <p className="text-center text-xs text-slate-500">Car · VTag vt_7fK2pQ9xLm3R</p>

                <div className="mx-auto mt-6 h-28 w-28 rounded-xl bg-white p-2 shadow-glow">
                  <DecorativeQr />
                </div>

                <div className="mt-6 rounded-2xl border border-mint-400/20 bg-mint-400/[0.07] px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-mint-300">Demo call · no real dialling</p>
                  <p className="mt-1 text-[10px] text-slate-500">Calling is simulated end to end</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 top-10 hidden rounded-2xl border border-white/10 bg-ink-850/95 px-4 py-3 shadow-panel backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <CarFront size={16} className="text-mint-400" /> Vehicle verified
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-500">scan logged · 2s ago</p>
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-white/[0.06] bg-ink-900/40 py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-mint-400">The flow</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
              Three steps, zero friction.
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map(({ icon: Icon, number, title, text }) => (
                <div key={number} className="card group p-6 transition hover:border-mint-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-mint-400/20 bg-mint-400/[0.07] text-mint-300">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-xs text-slate-600">{number}</span>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-electric">By design</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Helpful to strangers. Private to you.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-slate-400">
                A VTag page shows what a driver needs to identify the vehicle. It never reveals the number
                behind it. Scans and demo calls are logged only for your own dashboard.
              </p>
              <Link to="/login?mode=signup" className="btn-primary mt-7 px-5 py-3 text-sm">
                Get started <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="glass rounded-2xl p-5">
                  <Icon size={19} className="text-mint-400" />
                  <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-mint-400/20 bg-gradient-to-br from-mint-400/[0.12] via-ink-850 to-ink-900 px-8 py-14 text-center">
            <div className="grid-backdrop absolute inset-0 opacity-60" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Make your next tag a VTag.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400">
                Set up takes a minute. The OTP is displayed on screen in development — no paid SMS service
                required.
              </p>
              <Link to="/login?mode=signup" className="btn-primary mt-8 px-7 py-3.5">
                Create account <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-xs text-slate-500 sm:flex-row sm:px-8">
          <Logo compact />
          <p>MVP demo · No real phone calls are placed · No payment services integrated</p>
        </div>
      </footer>
    </div>
  );
}
