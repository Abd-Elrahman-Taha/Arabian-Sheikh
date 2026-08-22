import React from 'react';
import { Link } from '../router/RouterContext';
import { Lock } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="pt-36 pb-6 min-h-[70vh] flex items-center justify-center px-4 text-center text-[var(--color-earth-dark)] animate-fade-in">
      <div className="max-w-md w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-10 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-none border border-[var(--color-terracotta)]/40 bg-[var(--color-desert-primary)]/30 flex items-center justify-center mx-auto text-[var(--color-terracotta)]">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
          Restricted Palace Vault
        </h1>
        <p className="text-xs text-[var(--color-terracotta-deep)] font-sans leading-relaxed font-medium">
          This sanctuary portal requires authenticated Royal Patron credentials or Master Admin authorization.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="luxury-btn-gold px-6 py-3 text-xs inline-block cursor-pointer shadow-md"
          >
            Sign In with Credentials
          </Link>
          <Link
            to="/"
            className="luxury-btn-outline px-6 py-3 text-xs inline-block cursor-pointer"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
