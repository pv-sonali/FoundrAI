import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { apiRequest } from '../utils/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mockLink, setMockLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setMockLink(null);

    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });

      if (res.success) {
        setMessage('Reset link generated successfully!');
        if (res.mockLink) {
          setMockLink(res.mockLink);
        }
      } else {
        setError(res.message || 'Failed to process request.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
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
            Reset Password
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900 bg-red-950/20 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-md border border-gold/40 bg-gold/5 px-4 py-3.5 text-xs text-gold">
            <div className="font-semibold">{message}</div>
            {mockLink && (
              <div className="mt-2 text-white">
                Since this is a simulated sandbox, you can directly click the link below:
                <div className="mt-2 p-2 bg-black rounded-md border border-dark-border break-all font-mono text-[10px] text-gold hover:underline">
                  {window.location.origin}{mockLink}
                </div>
              </div>
            )}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-400 text-center mb-4">
              Enter your email address and we will generate a secure reset link.
            </p>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs py-3.5 transition-colors cursor-pointer mt-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Generate Reset Link <Mail className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-gray-500">
          Back to{' '}
          <Link to="/login" className="text-gold hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
