import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (res.success && res.token) {
        login({ token: res.token, user: res.user });
        navigate('/dashboard');
      } else {
        setError(res.message || 'Authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Mock Google Sign In
    setLoading(true);
    setTimeout(() => {
      login({
        token: 'mock_google_token_12345',
        user: {
          id: 'google_user_id',
          name: 'Demo Founder',
          email: 'founder@demo.com',
          role: 'founder',
          subscription: 'free',
          aiCredits: 20,
          isVerified: true,
        },
      });
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 select-none">
      <div className="w-full max-w-sm rounded-custom border border-dark-border bg-dark-card p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="h-10 w-10 rounded-full border border-gold bg-black flex items-center justify-center mb-3">
            <Sparkles className="h-5 w-5 text-gold animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-wider font-mono">
            FOUNDR<span className="text-gold">AI</span>
          </h2>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest font-mono">
            Virtual Co-Founder Platform
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900 bg-red-950/20 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-600 gold-focus transition-all"
              placeholder="founder@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] text-gold hover:underline font-mono"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-600 gold-focus transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs py-3.5 transition-colors cursor-pointer mt-6"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-dark-card px-3 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3.5 rounded-custom border border-dark-border bg-black hover:bg-dark-border/40 text-xs py-3.5 transition-colors cursor-pointer text-gray-200"
        >
          {/* Simple SVG Google Logo */}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 7.37 8.79 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.25c0-.82-.07-1.6-.21-2.35H12v4.45h6.45c-.28 1.48-1.12 2.73-2.38 3.58l3.62 2.8c2.12-1.95 3.81-4.83 3.81-8.48z"
            />
            <path
              fill="#FBBC05"
              d="M5.1 14.7l-3.6 2.8C3.4 21.35 7.35 24 12 24c2.93 0 5.4-.97 7.2-2.63l-3.62-2.8c-1 .67-2.28 1.07-3.58 1.07-3.21 0-6-2.33-6.9-5.46L1.5 11.3l.02.04c.88 2.52 2.45 4.8 5.1 4.8z"
            />
            <path
              fill="#34A853"
              d="M12 5.04c3.21 0 5.99 2.33 6.89 5.46l3.62-2.8C20.6 3.65 16.65 1 12 1S3.4 3.65 1.5 7.5l3.6 2.8c.9-3.13 3.68-5.46 6.9-5.46z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center text-xs text-gray-500">
          New to FoundrAI?{' '}
          <Link to="/register" className="text-gold hover:underline font-medium">
            Start Building Free
          </Link>
        </div>
      </div>
    </div>
  );
};
