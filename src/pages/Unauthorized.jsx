import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="pt-36 pb-24 min-h-[70vh] flex items-center justify-center px-4 text-center text-[#F3EEE5] animate-fade-in">
      <div className="max-w-md w-full bg-[#1C120E] border border-[#C6A15B]/30 p-10 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-none border border-[#C6A15B]/40 bg-[#0F0D0C] flex items-center justify-center mx-auto text-[#C6A15B]">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
          Restricted Palace Vault
        </h1>
        <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
          This sanctuary portal requires authenticated Royal Patron credentials or Master Admin authorization.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="luxury-btn-gold px-6 py-3 text-xs inline-block"
          >
            Sign In with Credentials
          </Link>
          <Link
            to="/"
            className="luxury-btn-outline px-6 py-3 text-xs inline-block"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
