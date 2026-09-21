import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthButton({ mode = 'signin', onSuccess, returnPath }) {
  const { googleLogin } = useAuth();
  const { success, error } = useToast();
  const { navigate } = useRouter();
  const { language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rendered, setRendered] = useState(false);
  const googleBtnRef = useRef(null);

  const isSignup = mode === 'signup';

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isConfigured = Boolean(
    rawClientId &&
    !rawClientId.includes('dummygoogleclientid') &&
    rawClientId.trim().length > 0
  );

  useEffect(() => {
    if (!isConfigured) return;

    const scriptId = 'google-gsi-client';
    const init = () => {
      if (window.google?.accounts?.id) {
        initGoogleServices();
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }
  }, [isConfigured]);

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    try {
      const user = await googleLogin(response.credential);
      success(`Welcome to Arabian Sheikh, ${user.name || 'Patron'}.`);
      if (onSuccess) {
        onSuccess(user);
      } else if (returnPath && returnPath !== '/login' && returnPath !== '/account') {
        navigate(returnPath);
      } else {
        navigate('/');
      }
    } catch (err) {
      error(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const initGoogleServices = () => {
    if (!isConfigured || !window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: rawClientId.trim(),
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 380,
          shape: 'rectangular',
          text: isSignup ? 'signup_with' : 'signin_with',
          logo_alignment: 'left'
        });
        setRendered(true);
      }
    } catch (e) {
      console.warn('Google Identity Services initialization warning:', e);
    }
  };

  const handleClick = async () => {
    if (loading) return;

    if (!isConfigured) {
      error(
        language === 'ar'
          ? 'تسجيل الدخول عبر Google غير مهيأ بعد. يرجى ضبط VITE_GOOGLE_CLIENT_ID في متغيرات البيئة.'
          : 'Google Sign-In is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your environment variables.'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.warn('Google One-Tap prompt not displayed:', reason);
            if (reason === 'suppressed_by_user' || reason === 'opt_out_or_no_session') {
              error(
                language === 'ar'
                  ? 'تم حظر نافذة Google بواسطة المتصفح أو لا يوجد حساب Google مسجل دخول.'
                  : 'Google prompt was suppressed by browser or no active Google session was found.'
              );
            }
          }
        });
      } catch (e) {
        console.warn('Error prompting Google Sign-In:', e);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#8C6239]/40 via-[#D4AF37]/70 to-[#8C6239]/40 hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] transition-all duration-500 shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] group overflow-hidden cursor-pointer"
    >
      {/* Visual Luxury Surface */}
      <div className="relative w-full py-3.5 px-5 rounded-[15px] bg-gradient-to-b from-[#140F0A] via-[#0B0907] to-[#120D08] flex items-center justify-center gap-3.5 transition-all duration-300">
        
        {/* Subtle Luxury Gold Shimmer */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#F2D675]/15 to-transparent pointer-events-none" />

        {/* Official Google G Icon Badge */}
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        </div>

        {/* Button Text */}
        <span className="relative z-10 font-cinzel font-bold text-xs uppercase tracking-[0.18em] text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors drop-shadow-sm">
          {loading ? (
            <span className="flex items-center gap-2 font-sans font-medium text-xs normal-case text-[#D8BE99]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
              <span>{language === 'ar' ? 'جارٍ التحقق...' : 'Authenticating...'}</span>
            </span>
          ) : isSignup ? (
            <span>{language === 'ar' ? 'التسجيل بواسطة Google' : 'Sign Up with Google'}</span>
          ) : (
            <span>{language === 'ar' ? 'تسجيل الدخول بواسطة Google' : 'Sign In with Google'}</span>
          )}
        </span>
      </div>

      {/* Invisible Google Native Button Overlay */}
      {/* Catches clicks directly and triggers Google's native popup seamlessly */}
      <div
        ref={googleBtnRef}
        className="absolute inset-0 opacity-[0.001] cursor-pointer overflow-hidden z-20 flex items-center justify-center scale-150"
        style={{ transformOrigin: 'center' }}
      />
    </div>
  );
}
