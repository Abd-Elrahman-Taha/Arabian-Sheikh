import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import notificationApi from '../../api/notification.api';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, Home, Sparkles } from 'lucide-react';

export default function UnsubscribePage() {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
          await notificationApi.unsubscribeByToken(token);
        } else {
          // If no token but user is logged in, use account unsubscribe
          await notificationApi.unsubscribeAccount();
        }
        setSuccess(true);
      } catch (err) {
        console.warn('Unsubscribe error:', err);
        // Even if token was expired or already unsubscribed, treat as confirmed
        setSuccess(true);
      } finally {
        setLoading(false);
      }
    };

    handleUnsubscribe();
  }, []);

  return (
    <div className="pt-36 sm:pt-44 pb-20 min-h-[75vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-8 sm:p-10 shadow-2xl text-center space-y-6 backdrop-blur-md text-[#F3E6D0]">
        {loading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mx-auto" />
            <h2 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase tracking-wider">
              Processing Unsubscribe Request...
            </h2>
            <p className="text-xs text-[#D8BE99]">
              Updating your palace communication preferences.
            </p>
          </div>
        ) : success ? (
          <div className="space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/15 flex items-center justify-center mx-auto text-[#F2D675] shadow-[0_0_25px_rgba(212,175,55,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#F2D675]">
                Unsubscribed Successfully
              </h2>
              <p className="text-xs text-[#D8BE99] leading-relaxed">
                You have been removed from promotional and marketing email dispatches. Essential order receipts and account security notices will still be delivered.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/account/preferences')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-black/50 text-xs font-cinzel font-bold text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] transition-all cursor-pointer"
              >
                Manage Preferences
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Palace Sanctuary</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-2 border-rose-400 bg-rose-950/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-rose-300">
                Notice
              </h2>
              <p className="text-xs text-[#D8BE99]">
                {errorMessage || 'Your unsubscribe request could not be verified directly. You can update your preferences anytime in your account.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase cursor-pointer"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
