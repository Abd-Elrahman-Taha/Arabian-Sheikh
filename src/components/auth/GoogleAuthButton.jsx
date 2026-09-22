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

  const getButtonWidth = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      if (w > 0) {
        // Google GSI accepts width between 200 and 400
        return Math.min(400, Math.max(220, Math.floor(w - 12)));
      }
    }
    return 360;
  }, []);

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
        width: getButtonWidth(),
        shape: 'rectangular',
        text: isSignup ? 'signup_with' : 'signin_with',
        logo_alignment: 'left',
        locale: language === 'ar' ? 'ar' : language || 'en',
      });
      setRendered(true);
    } catch (e) {
      console.warn('Google Identity Services render error:', e);
    }
  }, [isConfigured, rawClientId, handleCredentialResponse, getButtonWidth, isSignup, language]);

  useEffect(() => {
    if (!isConfigured) return;

    let isMounted = true;
    const scriptId = 'google-gsi-client';

    const onScriptReady = () => {
      if (isMounted) {
        renderGoogleButton();
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = onScriptReady;
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
      };
      document.body.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        renderGoogleButton();
      } else {
        const checkInterval = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkInterval);
            if (isMounted) renderGoogleButton();
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 4000);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isConfigured, renderGoogleButton]);

  // Re-render button on window resize to ensure responsive width
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.google?.accounts?.id && googleBtnRef.current) {
          renderGoogleButton();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [renderGoogleButton]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#8C6239]/40 via-[#D4AF37]/70 to-[#8C6239]/40 hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] transition-all duration-500 shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] overflow-hidden"
    >
      {/* Luxury Surface Frame */}
      <div className="relative w-full py-1.5 px-2 rounded-[15px] bg-gradient-to-b from-[#140F0A] via-[#0B0907] to-[#120D08] flex items-center justify-center min-h-[48px]">
        {/* Subtle Gold Shimmer */}
        <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#F2D675]/10 to-transparent pointer-events-none" />

        {/* Native Google Identity Services Button: 100% visible, official security compliant, un-obscured */}
        <div
          ref={googleBtnRef}
          className={`w-full flex items-center justify-center transition-opacity duration-300 ${
            rendered ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
          }`}
        />

        {/* Placeholder state while GSI script initializes */}
        {!rendered && (
          <div className="flex items-center justify-center gap-2.5 py-2 text-xs text-[#D8BE99] font-medium font-sans">
            <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
            <span>
              {language === 'ar'
                ? 'جارٍ تهيئة تسجيل الدخول عبر Google...'
                : 'Connecting Google Sign-In...'}
            </span>
          </div>
        )}

        {/* High-priority Authenticating Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#0E0A06]/95 backdrop-blur-sm rounded-[15px] flex items-center justify-center gap-2.5 z-30 border border-[#D4AF37]/50">
            <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
            <span className="text-xs text-[#F2D675] font-cinzel tracking-wider uppercase font-semibold">
              {language === 'ar' ? 'جارٍ التحقق والمصادقة...' : 'Authenticating Patron...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
