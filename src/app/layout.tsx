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
              <div className="logo-icon shrink-0">
                <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                  {/* Define gradient */}
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B35" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF8C42" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  
                  {/* Code Bracket */}
                  <path d="M 60 80 L 50 120 L 60 160" stroke="#FF6B35" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 120 80 L 130 120 L 120 160" stroke="#FF6B35" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="65" y1="120" x2="115" y2="120" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
                  
                  {/* Brain Circuit */}
                  <circle cx="150" cy="100" r="35" stroke="white" strokeWidth="4" fill="none"/>
                  <circle cx="165" cy="90" r="5" fill="white"/>
                  <circle cx="170" cy="110" r="5" fill="white"/>
                  <circle cx="155" cy="125" r="5" fill="white"/>
                  <circle cx="140" cy="115" r="5" fill="white"/>
                  
                  {/* Brain connections */}
                  <line x1="165" y1="90" x2="170" y2="110" stroke="white" strokeWidth="2.5"/>
                  <line x1="170" y1="110" x2="155" y2="125" stroke="white" strokeWidth="2.5"/>
                  <line x1="155" y1="125" x2="140" y2="115" stroke="white" strokeWidth="2.5"/>
                  <line x1="140" y1="115" x2="150" y2="100" stroke="white" strokeWidth="2.5"/>
                  
                  {/* Corner circles (tech aesthetic) */}
                  <circle cx="65" cy="75" r="4" fill="#FF6B35"/>
                  <circle cx="185" cy="95" r="4" fill="#FF6B35"/>
                  <circle cx="70" cy="165" r="4" fill="#FF6B35"/>
                  <circle cx="180" cy="140" r="4" fill="#FF6B35"/>
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
