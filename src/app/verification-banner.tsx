'use client';

import { useState, useEffect } from 'react';
import { Mail, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { resendVerificationEmail } from '@/app/auth/actions';

interface VerificationBannerProps {
  email: string;
}

export default function VerificationBanner({ email }: VerificationBannerProps) {
  const [dismissed, setDismissed] = useState(true); // Hidden during SSR to prevent layout shifts
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check localStorage on mount to show/hide the banner
    const isDismissed = localStorage.getItem('hide_verification_banner') === 'true';
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hide_verification_banner', 'true');
    setDismissed(true);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSent(false);
    try {
      await resendVerificationEmail(email);
      setSent(true);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20 backdrop-blur-md relative overflow-hidden py-3 px-4 z-50">
      {/* Sparkle decorative effect */}
      <div className="absolute -top-10 left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
            <Mail className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 justify-center md:justify-start">
              <Sparkles className="w-3 h-3 text-amber-400 fill-current" />
              Verify your email to unlock full features (optional)
            </p>
            <p className="text-[10px] text-slate-400">
              A verification link was sent to <span className="text-amber-400 font-semibold">{email}</span>. Click it to unlock pro-tier paywall simulators and reviews!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {sent ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <Check className="w-3 h-3" />
              Email Sent!
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-slate-950 font-bold text-[10px] rounded-lg shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification'
              )}
            </button>
          )}

          {error && <span className="text-[10px] text-rose-400 font-semibold">{error}</span>}

          <button
            onClick={handleDismiss}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-border text-[10px] font-bold text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Verify Later"
          >
            Verify Later
          </button>
        </div>
      </div>
    </div>
  );
}
