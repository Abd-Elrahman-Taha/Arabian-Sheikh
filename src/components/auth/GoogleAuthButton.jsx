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

  const getButtonWidth = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      if (w > 0) {
        // Google GSI accepts width between 200 and 400
        return Math.min(400, Math.max(240, Math.floor(w)));
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
        shape: 'pill',
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
        setTimeout(() => {
          if (isMounted) renderGoogleButton();
        }, 50);
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
        if (isMounted) setScriptFailed(true);
      };
      document.body.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        onScriptReady();
      } else {
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.id) {
            clearInterval(checkInterval);
            if (isMounted) renderGoogleButton();
          }
          if (attempts > 40) {
            clearInterval(checkInterval);
            if (isMounted) setScriptFailed(true);
          }
        }, 100);
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
    <div className="w-full flex items-center justify-center my-1.5">
      <div
        ref={containerRef}
        className="relative w-full max-w-[400px] rounded-full p-[1.5px] bg-gradient-to-r from-[#8C6239] via-[#D4AF37] to-[#8C6239] hover:from-[#F2D675] hover:via-[#FFE8A3] hover:to-[#F2D675] transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.22)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] group overflow-hidden"
      >
        <div className="relative w-full rounded-full bg-[#131314] overflow-hidden flex items-center justify-center min-h-[44px]">
          {/* Native Google Identity Services Button */}
          <div
            ref={googleBtnRef}
            className="w-full flex items-center justify-center transition-opacity duration-300"
            style={{
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: rendered ? 1 : 0,
            }}
          />

          {/* Luxury Loading / Initializing Skeleton State */}
          {!rendered && !scriptFailed && (
            <div className="absolute inset-0 w-full h-full bg-[#131314] rounded-full flex items-center justify-center gap-3 px-4">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-xs text-[#F3E6D0] font-sans font-medium">
                {isSignup
                  ? (language === 'ar' ? 'التسجيل بواسطة Google' : 'Sign up with Google')
                  : (language === 'ar' ? 'تسجيل الدخول بواسطة Google' : 'Sign in with Google')}
              </span>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37] ml-1" />
            </div>
          )}

          {/* Script failed — show manual fallback button */}
          {scriptFailed && !rendered && (
            <button
              type="button"
              onClick={() => {
                setScriptFailed(false);
                const oldScript = document.getElementById('google-gsi-client');
                if (oldScript) oldScript.remove();
                const script = document.createElement('script');
                script.id = 'google-gsi-client';
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.onload = () => {
                  setTimeout(() => renderGoogleButton(), 50);
                };
                script.onerror = () => setScriptFailed(true);
                document.body.appendChild(script);
              }}
              className="w-full h-full flex items-center justify-center gap-2.5 py-2.5 px-4 text-xs text-[#D8BE99] font-medium font-sans hover:text-[#F2D675] cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                {language === 'ar' ? 'إعادة تحميل تسجيل Google' : 'Retry Google Sign-In'}
              </span>
            </button>
          )}

          {/* High-priority Authenticating Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-[#0E0A06]/95 backdrop-blur-sm rounded-full flex items-center justify-center gap-2.5 z-30 border border-[#D4AF37]/60">
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span className="text-xs text-[#F2D675] font-cinzel tracking-wider uppercase font-semibold">
                {language === 'ar' ? 'جارٍ التحقق والمصادقة...' : 'Authenticating Patron...'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
