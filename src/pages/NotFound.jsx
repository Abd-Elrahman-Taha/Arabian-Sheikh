import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { navigate } = useRouter();

  return (
    <div className="pt-36 pb-24 min-h-[70vh] flex items-center justify-center px-4 text-center text-[#F3EEE5] animate-fade-in">
      <div className="max-w-md w-full bg-[#1C120E] border border-[#C6A15B]/30 p-10 space-y-6 shadow-2xl">
        <span className="font-cinzel text-5xl sm:text-6xl font-bold text-[#C6A15B] block">
          404
        </span>
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
          Page or Formulation Not Found
        </h1>
        <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
          The sanctuary room or fragrance creation you are seeking may have been archived into our private reserve vaults.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="luxury-btn-gold px-8 py-3 text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Palace Hall</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
