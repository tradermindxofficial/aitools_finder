import { login } from '@/app/auth/actions';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Lock, Mail, Terminal } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined;
  const message = typeof params.message === 'string' ? params.message : undefined;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl glass shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center gap-2 mb-8 relative">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-border text-primary">
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-xs text-muted-foreground">
            Sign in to access your saved tools and rate products
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Authentication Error</span>
              <p className="text-xs mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Success</span>
              <p className="text-xs mt-0.5 opacity-90">{message}</p>
            </div>
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="developer@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg shadow-lg hover:shadow-indigo-500/20 focus:outline-none transition-all duration-300 glow-btn"
          >
            Log In
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
          New to the directory?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
