import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { apiRequest } from '../utils/api';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No verification token provided in the URL.');
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest('/auth/verify-email', {
          method: 'POST',
          body: { token },
        });

        if (res.success) {
          setVerified(true);
        } else {
          setError(res.message || 'Verification failed.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 select-none">
      <div className="w-full max-w-sm rounded-custom border border-dark-border bg-dark-card p-8 shadow-2xl text-center">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <h2 className="text-2xl font-bold tracking-wider font-mono">
            FOUNDR<span className="text-gold">AI</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-8">
            <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto mb-4" />
            <p className="text-xs text-gray-400 font-mono">Verifying your email address...</p>
          </div>
        ) : verified ? (
          <div className="py-6">
            <CheckCircle2 className="h-12 w-12 text-gold mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white mb-2">Email Verified Successfully</h3>
            <p className="text-xs text-gray-400 mb-6">
              Thank you for verifying your email. Your founder workspace is now active.
            </p>
            <Link
              to="/login"
              className="inline-block w-full rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs py-3.5 transition-colors"
            >
              Sign In to Workspace
            </Link>
          </div>
        ) : (
          <div className="py-6">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white mb-2">Verification Failed</h3>
            <p className="text-xs text-red-400/80 mb-6">
              {error || 'The verification link is invalid or has expired.'}
            </p>
            <Link
              to="/login"
              className="inline-block w-full rounded-custom border border-dark-border bg-black hover:bg-dark-border/40 text-xs py-3.5 text-white transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
