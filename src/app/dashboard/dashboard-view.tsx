'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Bookmark, ExternalLink, ShieldAlert, Sparkles, AlertCircle, CreditCard, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export interface SavedTool {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing_model: string;
  website_url: string;
  average_rating: number;
  ratings_count: number;
}

interface DashboardViewProps {
  userEmail: string;
  initialSubscriptionStatus: string;
  initialSavedTools: SavedTool[];
}

export default function DashboardView({
  userEmail,
  initialSubscriptionStatus,
  initialSavedTools,
}: DashboardViewProps) {
  const router = useRouter();
  const [subStatus, setSubStatus] = useState(initialSubscriptionStatus);
  const [savedTools, setSavedTools] = useState<SavedTool[]>(initialSavedTools);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingUnfav, setLoadingUnfav] = useState<string | null>(null);

  // Handle toggling favorites
  const handleRemoveFavorite = async (toolId: string) => {
    setLoadingUnfav(toolId);
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', toolId);

      setSavedTools(prev => prev.filter(tool => tool.id !== toolId));
      router.refresh();
    } catch (err) {
      console.error('Error removing favorite:', err);
    } finally {
      setLoadingUnfav(null);
    }
  };

  // Toggle membership simulation
  const handleToggleSubscription = async () => {
    setLoadingSub(true);
    const supabase = createClient();
    const nextStatus = subStatus === 'pro' ? 'free' : 'pro';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({ subscription_status: nextStatus })
        .eq('id', user.id);

      if (error) throw error;

      setSubStatus(nextStatus);
      router.refresh();
    } catch (err) {
      console.error('Error updating subscription:', err);
    } finally {
      setLoadingSub(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">User Dashboard</h1>
        <p className="text-slate-400 text-xs mt-1">Manage your account preferences, favorites list, and subscription membership status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Account Info & Billing */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl glass border border-border p-6 space-y-6">
            <h2 className="text-md font-bold text-white tracking-wide border-b border-border/50 pb-3">
              Account Overview
            </h2>

            <div className="space-y-4">
              {/* Profile Details */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Developer Email
                </label>
                <div className="text-sm font-semibold text-white truncate bg-slate-950/40 p-2.5 rounded-lg border border-border">
                  {userEmail}
                </div>
              </div>

              {/* Membership status */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Subscription Status
                </label>
                <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-border">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    subStatus === 'pro' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-slate-800 text-muted-foreground'
                  }`}>
                    {subStatus} Account
                  </span>
                  
                  {subStatus === 'pro' && (
                    <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      Pro Access Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Simulator Card */}
          <div className="rounded-2xl glass border border-border p-6 space-y-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="text-md font-bold text-white tracking-wide flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              Stripe Sandbox Billing
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We have integrated a Sandbox toggle billing widget here. This allows you to simulate payment upgrades and subscription status changes directly in database.
            </p>

            <button
              onClick={handleToggleSubscription}
              disabled={loadingSub}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                subStatus === 'pro'
                  ? 'bg-slate-900 border border-border text-muted-foreground hover:text-white hover:bg-slate-800'
                  : 'bg-primary hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 glow-btn'
              }`}
            >
              {loadingSub ? 'Processing...' : subStatus === 'pro' ? 'Downgrade to Free Tier' : 'Upgrade to Pro Tier ($9.99/mo)'}
            </button>

            <div className="p-3 bg-slate-900/40 rounded-lg border border-border text-[10px] text-muted-foreground flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Upgrading unlocks access to the full editor reviews and detailed documentation insights on all tool detail views.</span>
            </div>
          </div>
        </div>

        {/* Right column: Favorites Catalog list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl glass border border-border p-6 space-y-6 min-h-[400px]">
            <h2 className="text-md font-bold text-white tracking-wide border-b border-border/50 pb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              Saved Developer Tools ({savedTools.length})
            </h2>

            {savedTools.length > 0 ? (
              <div className="space-y-4">
                {savedTools.map(tool => (
                  <div 
                    key={tool.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950/20 hover:bg-slate-950/40 border border-border/60 rounded-xl transition-all gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/tools/${tool.id}`} className="font-bold text-white hover:text-primary transition-colors text-sm">
                          {tool.name}
                        </Link>
                        <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-border">
                          {tool.pricing_model}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleRemoveFavorite(tool.id)}
                        disabled={loadingUnfav === tool.id}
                        className="px-3 py-1.5 rounded-lg border border-border text-[10px] text-muted-foreground hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer bg-slate-900"
                      >
                        Remove
                      </button>
                      <Link
                        href={`/tools/${tool.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-white border border-border transition-all flex items-center gap-0.5"
                      >
                        Details
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <Bookmark className="w-8 h-8 text-slate-700" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-400">Your favorites catalog is empty.</p>
                  <p className="text-xs text-muted-foreground">Save developer products from the catalog to see them featured here.</p>
                </div>
                <Link
                  href="/tools"
                  className="px-4 py-2 bg-primary/10 border border-primary/20 text-xs font-bold text-primary rounded-lg hover:bg-primary/20 transition-all inline-block"
                >
                  Browse Tools Directory
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
