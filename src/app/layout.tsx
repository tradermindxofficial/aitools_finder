import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signout } from '@/app/auth/actions';
import { Compass, BookOpen, Star, User, LogOut, Code } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DevTools AI - Directory of Developer AI Tools',
  description: 'Find and filter the best AI tools, platforms, and utilities built specifically for developers.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subscriptionStatus = 'free';
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single();
    if (profile) {
      subscriptionStatus = profile.subscription_status;
    }
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground bg-grid-glow">
        <header className="sticky top-0 z-40 w-full border-b border-border glass bg-opacity-70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/tools" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
              <div className="logo-icon shrink-0 w-[50px] h-[50px] md:w-[70px] md:h-[70px]">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="48" fill="#1F2937" stroke="#FF6B35" strokeWidth="3"/>
                  
                  {/* Code brackets - thick and bold */}
                  <path d="M 30 30 L 18 50 L 30 70" stroke="#FF6B35" strokeWidth="7" 
                        fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 55 30 L 67 50 L 55 70" stroke="#FF6B35" strokeWidth="7" 
                        fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* AI dot in center */}
                  <circle cx="42" cy="50" r="5" fill="white"/>
                  
                  {/* Small orange dot */}
                  <circle cx="80" cy="25" r="6" fill="#FF6B35"/>
                  <circle cx="78" cy="27" r="3" fill="white"/>
                </svg>
              </div>
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                DevTools <span className="text-white">AI</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/tools" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                <Compass className="w-4 h-4" />
                Browse Tools
              </Link>
              {user && (
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                  <Star className="w-4 h-4" />
                  My Favorites
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-border text-xs">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="max-w-[120px] truncate text-muted-foreground">{user.email}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      subscriptionStatus === 'pro' 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'bg-slate-800 text-muted-foreground'
                    }`}>
                      {subscriptionStatus}
                    </span>
                  </div>
                  
                  <form action={signout}>
                    <button 
                      type="submit" 
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-muted-foreground hover:text-destructive border border-border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/auth/login" 
                    className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-white hover:bg-slate-900 transition-all"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-indigo-700 text-xs font-medium text-white transition-all glow-btn shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-border mt-auto py-6 glass">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()} DevTools AI. Built for developer productivity.
            </div>
            <div className="flex gap-4">
              <Link href="/tools" className="hover:underline">Catalog</Link>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
