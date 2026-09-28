import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Snowflake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

function getFriendlyErrorMessage(error) {
  const firebaseCode = error?.code || '';

  const backendMessage =
    error?.response?.data?.message ||
    error?.message ||
    'Unable to sign in. Please try again.';

  if (firebaseCode === 'auth/popup-closed-by-user') {
    return 'Google sign-in was cancelled.';
  }

  if (firebaseCode === 'auth/popup-blocked') {
    return 'Your browser blocked the Google sign-in popup. Please allow popups and try again.';
  }

  if (firebaseCode === 'auth/cancelled-popup-request') {
    return 'Google sign-in was interrupted. Please try again.';
  }

  return backendMessage;
}

function SnowfallBackground() {
  const flakes = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      size: `${12 + Math.random() * 14}px`,
      duration: `${10 + Math.random() * 10}s`,
      delay: `${Math.random() * 10}s`,
      opacity: 0.28 + Math.random() * 0.45,
      drift: `${(Math.random() - 0.5) * 120}px`,
    }));
  }, []);

  return (
    <div
      className="wishlink-login-snow-layer"
      aria-hidden="true"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="wishlink-login-snowflake"
          style={{
            left: flake.left,
            fontSize: flake.size,
            opacity: flake.opacity,
            animationDuration: flake.duration,
            animationDelay: `-${flake.delay}`,
            '--snow-drift': flake.drift,
          }}
        >
          🦖
        </span>
      ))}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.23 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />

      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"
      />

      <path
        fill="#4CAF50"
        d="M24 44c5.17 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.144 35.091 26.715 36 24 36c-5.209 0-9.617-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />

      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.046 12.046 0 0 1-4.084 5.57h.001l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const {
    loginWithGoogle,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    error,
    setError,
  ] = useState('');

  const [
    busy,
    setBusy,
  ] = useState(false);

  async function handleGoogleLogin() {
    setBusy(true);
    setError('');

    try {
      await loginWithGoogle();

      navigate(
        '/officer'
      );
    } catch (error) {
      setError(
        getFriendlyErrorMessage(
          error
        )
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wishlink-login-page">
      <SnowfallBackground />

      <div className="wishlink-login-shell">
        <section className="wishlink-login-left">
          <div className="wishlink-login-brand-top">
            <div className="wishlink-login-brand-text">
          
              <span>
                MIDSAKatuparan: Handog ng Pasko
              </span>
            </div>
          </div>

          <div className="wishlink-login-logo-wrap">
            <img
              src={logo}
              alt="MIDSA WishLink"
              className="wishlink-login-main-logo"
            />
          </div>

          <div className="wishlink-login-left-footer">
            <span>
              Share a little wonder.
            </span>
          </div>
        </section>

        <section className="wishlink-login-right">
          <div className="wishlink-login-panel">
            <div className="wishlink-login-eyebrow">
              <Snowflake
                size={14}
              />

              <span>
                WELCOME BACK
              </span>
            </div>

            <h1>
              Sign in
            </h1>

            <p className="wishlink-login-subtext">
              Continue with the authorized Google account to access MIDSA WishLink.
            </p>

            {error && (
              <div className="alert">
                {error}
              </div>
            )}

            <button
              type="button"
              className="wishlink-google-button"
              onClick={handleGoogleLogin}
              disabled={busy}
            >
              <span className="wishlink-google-button-left">
                <span className="wishlink-google-icon-wrap">
                  <GoogleIcon />
                </span>

                <span>
                  {busy
                    ? 'Connecting to Google…'
                    : 'Continue with Google'}
                </span>
              </span>

              {!busy && (
                <ArrowRight
                  size={18}
                />
              )}
            </button>

            <p className="wishlink-login-note">
              Access is limited to the authorized MIDSA Google account.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}