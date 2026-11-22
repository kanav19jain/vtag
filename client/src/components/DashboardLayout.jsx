import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CarFront, LayoutDashboard, LogOut, QrCode, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicles', icon: CarFront },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export default function DashboardLayout({ children }) {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const go = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.07] bg-ink-900/70 backdrop-blur-xl lg:flex">
        <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Workspace
          </p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active === id
                  ? 'bg-mint-400/10 text-mint-300'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-mint-400/15 bg-mint-400/[0.05] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-mint-300">
              <ShieldCheck size={15} /> Demo environment
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Calls shown here are simulations. No real phone calls are ever placed.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric/15 text-electric">
              <QrCode size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-200">Owner account</p>
              <p className="truncate font-mono text-[10px] text-slate-500">{owner?.phone}</p>
            </div>
            <button type="button" onClick={handleLogout} className="btn-icon h-8 w-8" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-ink-950/85 px-5 backdrop-blur-xl lg:hidden">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-slate-500">{owner?.phone}</span>
          <button type="button" onClick={handleLogout} className="btn-icon" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="lg:pl-64">{children}</main>

      {/* Mobile section nav */}
      <nav className="sticky bottom-0 z-30 flex border-t border-white/[0.07] bg-ink-950/90 px-4 py-2 backdrop-blur-xl lg:hidden">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium ${
              active === id ? 'text-mint-300' : 'text-slate-500'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
