import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });

      if (res.success && res.token) {
        login({ token: res.token, user: res.user });
        navigate('/onboarding');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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
      navigate('/onboarding');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 select-none">
      <div className="w-full max-w-sm rounded-custom border border-dark-border bg-dark-card p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <h2 className="text-2xl font-bold tracking-wider font-mono">
            FOUNDR<span className="text-gold">AI</span>
          </h2>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest font-mono">
            Create Founder Workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900 bg-red-950/20 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-600 gold-focus transition-all"
              placeholder="Elon Musk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-600 gold-focus transition-all"
              placeholder="founder@spacex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-600 gold-focus transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-600 gold-focus transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
                Register Workspace <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-5">
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
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already have a workspace?{' '}
          <Link to="/login" className="text-gold hover:underline font-medium">
            Sign In
          </Link>
        </div>

        <div className="mt-6 text-center text-[10px] text-gray-600 leading-relaxed">
          By continuing, you agree to FoundrAI's{' '}
          <Link to="/terms" className="hover:text-gray-300 transition-colors underline decoration-gray-600/50">Terms & Conditions</Link>
          {' '}and{' '}
          <Link to="/privacy" className="hover:text-gray-300 transition-colors underline decoration-gray-600/50">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
};
