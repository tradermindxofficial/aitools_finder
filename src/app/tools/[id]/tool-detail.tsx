'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Bookmark, ExternalLink, Lock, CheckCircle, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { rateTool } from '@/app/tools/actions';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing_model: string;
  website_url: string;
  average_rating: number;
  ratings_count: number;
  full_review?: string | null;
}

interface ToolDetailProps {
  tool: Tool;
  initialUserRating: number;
  initialIsFavorited: boolean;
  isLoggedIn: boolean;
  subscriptionStatus: string;
}

export default function ToolDetail({
  tool,
  initialUserRating,
  initialIsFavorited,
  isLoggedIn,
  subscriptionStatus,
}: ToolDetailProps) {
  const router = useRouter();
  const [userRating, setUserRating] = useState(initialUserRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [subStatus, setSubStatus] = useState(subscriptionStatus);
  
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  // Handle toggling favorites
  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login?message=Log+in+to+save+tools+to+your+favorites');
      return;
    }

    setLoadingFav(true);
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('tool_id', tool.id);
        setIsFavorited(false);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, tool_id: tool.id });
        setIsFavorited(true);
      }
      router.refresh();
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoadingFav(false);
    }
  };

  // Handle rating submissions
  const handleRate = async (rating: number) => {
    if (!isLoggedIn) {
      router.push('/auth/login?message=Log+in+to+rate+this+tool');
      return;
    }

    setLoadingRate(true);
    setRatingMessage('');
    try {
      await rateTool(tool.id, rating);
      setUserRating(rating);
      setRatingMessage('Rating saved successfully!');
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error saving rating:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('Session expired')) {
        setRatingMessage('Session expired. Please log in again.');
      } else {
        setRatingMessage('Failed to save rating.');
      }
    } finally {
      setLoadingRate(false);
    }
  };

  // Toggle subscription between 'free' and 'pro' for demo purposes
  const handleToggleSubscription = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login?message=Log+in+to+test+membership+billing');
      return;
    }

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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/tools" 
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tools Catalog
      </Link>

      {/* Main card */}
      <div className="rounded-3xl glass border border-border p-8 relative overflow-hidden space-y-6">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Title and details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-border text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {tool.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {tool.name}
            </h1>
            
            {/* Aggregate rating */}
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="flex items-center text-amber-500 font-semibold gap-0.5">
                <Star className="w-4 h-4 fill-current" />
                {tool.average_rating ? Number(tool.average_rating).toFixed(2) : '0.00'}
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {tool.ratings_count || 0} {tool.ratings_count === 1 ? 'rating' : 'ratings'}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 text-xs font-semibold border border-border text-slate-400">
                {tool.pricing_model}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              disabled={loadingFav}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                isFavorited 
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' 
                  : 'bg-slate-900 border-border text-muted-foreground hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
            </button>

            {/* Visit site */}
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-indigo-700 text-sm font-semibold text-white transition-all glow-btn shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </a>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">Overview</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {tool.description}
          </p>
        </div>

        {/* Dynamic Rating System */}
        <div className="p-5 rounded-2xl bg-slate-950/40 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isLoggedIn ? 'Your Rating' : 'Ratings & Feedback'}
            </h3>
            {ratingMessage && (
              <span className={`text-xs font-medium ${ratingMessage.includes('saved') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ratingMessage}
              </span>
            )}
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating || userRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={loadingRate}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRate(star)}
                      className="p-1 rounded transition-colors hover:scale-110 cursor-pointer text-slate-700"
                    >
                      <Star 
                        className={`w-7 h-7 transition-all ${
                          isActive 
                            ? 'text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                            : 'text-slate-700 hover:text-slate-500'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {userRating > 0 ? `You rated this ${userRating} stars.` : 'Click a star to save your rating.'}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const ratingVal = Math.round(tool.average_rating || 0);
                  const isGold = ratingVal >= star;
                  return (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${isGold ? 'text-amber-500 fill-current' : 'text-slate-800'}`} 
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">Log in</Link> to rate this developer tool.
              </p>
            </div>
          )}
        </div>

        {/* Premium Paywall Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-t border-border/50 pt-6">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Editor Full Review
            </h2>
            
            {/* Quick upgrade toggle for testing */}
            {isLoggedIn && (
              <button
                onClick={handleToggleSubscription}
                disabled={loadingSub}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-border text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                {subStatus === 'pro' ? 'Switch to Free Account' : 'Switch to Pro Account'}
              </button>
            )}
          </div>

          {subStatus === 'pro' ? (
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-slate-300 text-sm leading-relaxed space-y-4 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 uppercase tracking-wide">
                <Check className="w-3.5 h-3.5" />
                Unlocked with Pro
              </div>
              <div className="prose prose-invert max-w-none space-y-4 whitespace-pre-wrap font-sans">
                {tool.full_review || 'Full review details are currently pending editor publication.'}
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl glass p-8 border border-border text-center overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              {/* Blur backdrop overlay */}
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0 pointer-events-none" />
              
              <div className="relative z-10 max-w-md flex flex-col items-center space-y-4">
                <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-md font-bold text-white">Full Review Locked</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed px-4">
                    Our editor reviews contain detailed workflow integrations, test observations, and deep performance analysis.
                  </p>
                </div>
                
                {isLoggedIn ? (
                  <button
                    onClick={handleToggleSubscription}
                    disabled={loadingSub}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Upgrade to Pro (Demo Unlock)
                  </button>
                ) : (
                  <Link
                    href="/auth/login?message=Log+in+and+upgrade+your+account+to+read+the+full+review"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Log In to Unlock
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
