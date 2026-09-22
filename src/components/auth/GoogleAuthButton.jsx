import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [scriptFailed, setScriptFailed] = useState(false);
  const containerRef = useRef(null);
  const googleBtnRef = useRef(null);

  const isSignup = mode === 'signup';

  const DEFAULT_GOOGLE_CLIENT_ID = '1075432573830-qogm3s2o4s5n9h3kgulg6fne2eoj1i1d.apps.googleusercontent.com';

  const rawClientId = (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GOOGLE_CLIENT_ID) ||
    DEFAULT_GOOGLE_CLIENT_ID
  ).trim();

  const isConfigured = Boolean(
    rawClientId &&
    !rawClientId.includes('dummygoogleclientid') &&
    rawClientId.length > 0
  );

  const handleCredentialResponse = useCallback(async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    try {
      const user = await googleLogin(response.credential);
      const displayName = user?.firstName || user?.name || (language === 'ar' ? 'ضيفنا الكريم' : 'Patron');
      success(
        language === 'ar'
          ? `أهلاً بك في دار الشيخ العربي، ${displayName}.`
          : `Welcome to Arabian Sheikh, ${displayName}.`
      );
      if (onSuccess) {
        onSuccess(user);
      } else if (returnPath && returnPath !== '/login' && returnPath !== '/signup') {
        navigate(returnPath);
      } else {
        navigate('/');
      }
    } catch (err) {
      error(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  }, [googleLogin, language, navigate, onSuccess, returnPath, success, error]);

  const renderGoogleButton = useCallback(() => {
    if (!isConfigured || !window.google?.accounts?.id || !googleBtnRef.current) return;
    try {
      window.google.accounts.id.initialize({
        client_id: rawClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        width: containerRef.current ? Math.min(400, Math.max(220, containerRef.current.offsetWidth - 4)) : 360,
        shape: 'pill',
        text: isSignup ? 'signup_with' : 'signin_with',
        logo_alignment: 'center',
        locale: language === 'ar' ? 'ar' : language || 'en',
      });
      setRendered(true);
    } catch (e) {
      console.warn('Google Identity Services render error:', e);
    }
  }, [isConfigured, rawClientId, handleCredentialResponse, isSignup, language]);

  useEffect(() => {
    if (!isConfigured) return;
    let isMounted = true;
    const scriptId = 'google-gsi-client';

    const onScriptReady = () => {
      if (isMounted) setTimeout(() => { if (isMounted) renderGoogleButton(); }, 50);
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = onScriptReady;
      script.onerror = () => { if (isMounted) setScriptFailed(true); };
      document.body.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        onScriptReady();
      } else {
        let attempts = 0;
        const iv = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.id) { clearInterval(iv); if (isMounted) renderGoogleButton(); }
          if (attempts > 40) { clearInterval(iv); if (isMounted) setScriptFailed(true); }
        }, 100);
      }
    }
    return () => { isMounted = false; };
  }, [isConfigured, renderGoogleButton]);

  useEffect(() => {
    let tid;
    const handleResize = () => {
      clearTimeout(tid);
      tid = setTimeout(() => { if (window.google?.accounts?.id && googleBtnRef.current) renderGoogleButton(); }, 250);
    };
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(tid); window.removeEventListener('resize', handleResize); };
  }, [renderGoogleButton]);

  const retryLoad = () => {
    setScriptFailed(false);
    const old = document.getElementById('google-gsi-client');
    if (old) old.remove();
    const s = document.createElement('script');
    s.id = 'google-gsi-client';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => setTimeout(() => renderGoogleButton(), 50);
    s.onerror = () => setScriptFailed(true);
    document.body.appendChild(s);
  };

  const labelText = isSignup
    ? (language === 'ar' ? 'إنشاء حساب عبر Google' : 'Sign up with Google')
    : (language === 'ar' ? 'تسجيل الدخول عبر Google' : 'Sign in with Google');

  return (
    <div ref={containerRef} className="relative w-full group/google">
      {/* ═══ Luxury outer frame — animated gold border ═══ */}
      <div className="relative w-full rounded-full p-[1.5px] bg-gradient-to-r from-[#8C6239]/50 via-[#D4AF37]/60 to-[#8C6239]/50 group-hover/google:from-[#D4AF37]/80 group-hover/google:via-[#F2D675] group-hover/google:to-[#D4AF37]/80 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover/google:shadow-[0_4px_25px_rgba(212,175,55,0.3)]">

        {/* ═══ Inner surface ═══ */}
        <div className="relative w-full rounded-full bg-gradient-to-b from-[#1A150E] via-[#0F0B07] to-[#15100A] flex items-center justify-center min-h-[52px] overflow-hidden">

          {/* Subtle gold shimmer sweep on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover/google:translate-x-full transition-transform duration-[1200ms] ease-out bg-gradient-to-r from-transparent via-[#F2D675]/[0.07] to-transparent pointer-events-none" />

          {/* ═══ Custom luxury visual button (what the user sees) ═══ */}
          <div className="relative z-10 w-full flex items-center justify-center gap-3 py-3 px-6 pointer-events-none select-none">
            {/* Google "G" Icon */}
            <div className="w-5 h-5 rounded-full bg-white/[0.07] border border-[#D4AF37]/30 flex items-center justify-center shrink-0 group-hover/google:border-[#D4AF37]/60 transition-colors duration-300">
              <svg className="w-3 h-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>

            {/* Label */}
            <span className="font-cinzel text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8B48A] group-hover/google:text-[#F2D675] transition-colors duration-300">
              {labelText}
            </span>
          </div>

          {/* ═══ Invisible real Google button on top — captures actual clicks ═══ */}
          <div
            ref={googleBtnRef}
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{
              opacity: rendered ? 0.011 : 0,
              cursor: rendered ? 'pointer' : 'default',
              minHeight: '52px',
            }}
          />

          {/* ═══ Loading / Connecting state ═══ */}
          {!rendered && !scriptFailed && (
            <div className="absolute inset-0 z-30 flex items-center justify-center gap-2.5 rounded-full bg-[#0F0B07]/95 pointer-events-none">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
              <span className="text-[10px] text-[#D8BE99] font-cinzel tracking-wider uppercase">
                {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
              </span>
            </div>
          )}

          {/* ═══ Script failed — retry ═══ */}
          {scriptFailed && !rendered && (
            <button
              type="button"
              onClick={retryLoad}
              className="absolute inset-0 z-30 flex items-center justify-center gap-2.5 rounded-full bg-[#0F0B07]/95 cursor-pointer transition-colors hover:bg-[#1A150E]/95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#D4AF37" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#D4AF37" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#D4AF37" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#D4AF37" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[10px] text-[#D8BE99] font-cinzel tracking-wider uppercase">
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </span>
            </button>
          )}

        </div>
      </div>

      {/* ═══ Authenticating overlay ═══ */}
      {loading && (
        <div className="absolute inset-0 z-40 rounded-full bg-[#0E0A06]/95 backdrop-blur-sm flex items-center justify-center gap-2.5 border border-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.25)]">
          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <span className="text-[11px] text-[#F2D675] font-cinzel tracking-wider uppercase font-semibold">
            {language === 'ar' ? 'جارٍ المصادقة...' : 'Authenticating...'}
          </span>
        </div>
      )}
    </div>
  );
}
