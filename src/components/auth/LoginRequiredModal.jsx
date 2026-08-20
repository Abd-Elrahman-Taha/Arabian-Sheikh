import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Sparkles, X, ArrowRight, UserPlus, LogIn, ShoppingBag } from 'lucide-react';

export default function LoginRequiredModal({ isOpen, onClose, pendingItem, onAuthenticatedAdd }) {
  const { navigate } = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoToLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleGoToSignup = () => {
    onClose();
    navigate('/signup');
  };

  const handleQuickDemoLogin = async () => {
    setQuickLoginLoading(true);
    try {
      const user = await login('sheikh.user@luxury.com', 'user123');
      success(`Welcome to the Palace, ${user.name}.`);
      onClose();
      if (onAuthenticatedAdd && pendingItem) {
        onAuthenticatedAdd(pendingItem.product, pendingItem.size, pendingItem.quantity);
      }
    } catch (err) {
      error(err.message || 'Demo login failed.');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[var(--color-desert-light)] border border-[var(--color-terracotta)]/40 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden text-[var(--color-earth-dark)]"
        style={{
          boxShadow: '0 25px 60px -15px rgba(93, 29, 1, 0.4), 0 0 35px rgba(180, 86, 37, 0.25)'
        }}
      >
        {/* Top Gold Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#B45625]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#B45625]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#B45625]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#B45625]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] transition-colors focus:outline-none cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 border border-[var(--color-terracotta)]/50 bg-[var(--color-desert-primary)]/30 flex items-center justify-center mx-auto text-[var(--color-terracotta)] shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <span className="inline-block font-cinzel text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] font-bold">
            Haute Parfumerie Patronage
          </span>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold uppercase text-[var(--color-earth-dark)]">
            Authentication Required
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-terracotta-deep)] font-sans max-w-sm mx-auto leading-relaxed font-medium">
            Please sign in to add products to your cart.
          </p>
        </div>

        {/* Pending Product Preview Card */}
        {pendingItem?.product && (
          <div className="p-3.5 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/25 flex items-center gap-3.5">
            <img
              src={pendingItem.product.images?.[0] || ''}
              alt={pendingItem.product.name}
              className="w-14 h-16 object-cover border border-[var(--color-terracotta-deep)]/30 bg-[var(--color-desert-primary)] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-terracotta)] font-mono font-bold">
                {pendingItem.product.fragranceFamily}
              </span>
              <h4 className="font-cinzel text-sm font-bold text-[var(--color-earth-dark)] truncate">
                {pendingItem.product.name}
              </h4>
              <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
                Size: {pendingItem.size || '100ml'} • Qty: {pendingItem.quantity || 1}
              </p>
            </div>
            <div className="text-right">
              <span className="font-cinzel text-base font-bold text-[var(--color-terracotta)]">
                ${pendingItem.product.price}
              </span>
            </div>
          </div>
        )}

        {/* Quick Demo 1-Click Login Option */}
        <div className="p-3 bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 text-center space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-terracotta)] font-cinzel font-bold">
            ✦ Instant Patron Evaluation Access
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={quickLoginLoading}
            className="w-full py-2 bg-[var(--color-desert-light)] hover:bg-[var(--color-terracotta)] hover:text-[#F8D188] text-[var(--color-earth-dark)] border border-[var(--color-terracotta)]/40 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-terracotta)] group-hover:text-inherit" />
            <span>{quickLoginLoading ? 'Connecting...' : 'One-Click Demo Sign In & Add to Bag'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleGoToLogin}
              className="luxury-btn-gold py-3 text-xs flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <LogIn className="w-4 h-4" />
              <span>SIGN IN</span>
            </button>
            <button
              onClick={handleGoToSignup}
              className="luxury-btn-outline py-3 text-xs flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <UserPlus className="w-4 h-4" />
              <span>CREATE ACCOUNT</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs uppercase tracking-widest font-cinzel text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] transition-colors cursor-pointer text-center font-bold"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
}
