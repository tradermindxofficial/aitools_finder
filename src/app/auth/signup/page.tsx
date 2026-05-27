import { signup } from '@/app/auth/actions';
import Link from 'next/link';
import { AlertCircle, Lock, Mail, Terminal, UserPlus } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl glass shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center gap-2 mb-8 relative">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-border text-primary">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-xs text-muted-foreground">
            Sign up to save tools, rate them, and explore premium reviews
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Sign Up Failed</span>
              <p className="text-xs mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        <form action={signup} className="space-y-4">
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
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg shadow-lg hover:shadow-indigo-500/20 focus:outline-none transition-all duration-300 glow-btn"
          >
            Register
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
