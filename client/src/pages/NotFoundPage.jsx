import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Logo from '../components/Logo.jsx';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="relative">
        <Logo />
        <div className="card mt-10 max-w-md p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-400/10 text-mint-300">
            <Compass size={26} />
          </div>
          <p className="mt-6 font-mono text-xs tracking-[0.3em] text-mint-400">404</p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white">Off the map</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            That page doesn't exist. Head back and keep your tags in one place.
          </p>
          <Link to="/" className="btn-primary mt-7">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
