'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, Bookmark, ExternalLink, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing_model: string;
  website_url: string;
  average_rating: number;
  ratings_count: number;
}

interface ToolsCatalogProps {
  initialTools: Tool[];
  userFavorites: string[];
  isLoggedIn: boolean;
  subscriptionStatus: string;
}

export default function ToolsCatalog({
  initialTools,
  userFavorites: initialFavorites,
  isLoggedIn,
  subscriptionStatus,
}: ToolsCatalogProps) {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');
  const [loadingFav, setLoadingFav] = useState<string | null>(null);

  // Extract unique categories for filter tabs in the requested order
  const categories = useMemo(() => {
    const predefinedOrder = [
      'All',
      'Content Creating',
      'Video Editing',
      'Photo Editing',
      'Code Generation',
      'Code Review',
      'Testing',
      'Documentation',
      'Code Quality',
      'DevOps',
      'Backend',
      'Terminal',
    ];

    const toolCategories = new Set(initialTools.map((t) => t.category));
    const orderedCats: string[] = [];

    // Add predefined categories in order
    predefinedOrder.forEach((cat) => {
      orderedCats.push(cat);
    });

    // Add any other categories from the tool list that are not in the predefined list
    toolCategories.forEach((cat) => {
      if (!orderedCats.includes(cat)) {
        orderedCats.push(cat);
      }
    });

    return orderedCats;
  }, [initialTools]);

  // Handle favorite toggling
  const handleToggleFavorite = async (toolId: string) => {
    if (!isLoggedIn) {
      router.push('/auth/login?message=Log+in+to+save+tools+to+your+favorites');
      return;
    }

    setLoadingFav(toolId);
    const supabase = createClient();
    const isFavorited = favorites.includes(toolId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFavorited) {
        // Delete favorite
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('tool_id', toolId);
        
        setFavorites(prev => prev.filter(id => id !== toolId));
      } else {
        // Insert favorite
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, tool_id: toolId });
        
        setFavorites(prev => [...prev, toolId]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoadingFav(null);
    }
  };

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    return tools
      .filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
          tool.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.average_rating - a.average_rating; // Highest rating first
        } else {
          return a.name.localeCompare(b.name); // Alphabetical A-Z
        }
      });
  }, [tools, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden glass border border-border/80 text-center md:text-left">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Developer Workflows
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white mb-4">
            Find the Best <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI Tools</span> for Developers
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Discover 75+ highly-curated AI tools for developers — organized by workflow, rated by the community. Save your favorites, rate products, and access full reviews.
          </p>
        </div>
      </div>

      {/* Controls Bar (Search, Category Tabs, Sorting) */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              placeholder="Search tools by name, description..."
            />
          </div>

          {/* Sort bar */}
          <div className="flex gap-2 items-center shrink-0 w-full sm:w-auto justify-end">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
              className="bg-slate-950/40 border border-border text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="rating">Highest Rating</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category filtering tags */}
        <div className="flex items-center gap-2 border-b border-border/50 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950/20 border-border text-muted-foreground hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const isFav = favorites.includes(tool.id);
            return (
              <div 
                key={tool.id} 
                className="flex flex-col rounded-2xl glass glass-hover p-6 border border-border/60 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Category badge */}
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-border text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {tool.category}
                  </span>
                  
                  {/* Favorite button */}
                  <button
                    onClick={() => handleToggleFavorite(tool.id)}
                    disabled={loadingFav === tool.id}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isFav 
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                        : 'bg-slate-900/50 border-border text-muted-foreground hover:text-white hover:bg-slate-950'
                    }`}
                    title={isFav ? "Saved" : "Save to Favorites"}
                  >
                    <Bookmark className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex-grow space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Link href={`/tools/${tool.id}`} className="hover:text-primary transition-colors">
                      {tool.name}
                    </Link>
                  </h3>
                  
                  {/* Ratings display */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="flex items-center text-amber-500 font-semibold gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {tool.average_rating ? Number(tool.average_rating).toFixed(1) : '0.0'}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      ({tool.ratings_count || 0} {tool.ratings_count === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed pt-1">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                  {/* Pricing tag */}
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-950/50 px-2 py-0.5 rounded border border-border">
                    {tool.pricing_model}
                  </span>

                  <div className="flex items-center gap-2">
                    <a 
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-950 border border-border text-muted-foreground hover:text-white transition-all"
                      title="Visit Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Link 
                      href={`/tools/${tool.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-border text-xs font-semibold text-white hover:bg-primary hover:border-primary transition-all duration-300"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 glass rounded-2xl border border-border/50">
          <p className="text-slate-400 text-sm">No tools found matching your criteria.</p>
          <button 
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="mt-4 px-4 py-2 bg-primary/10 border border-primary/20 text-xs font-bold text-primary rounded-lg hover:bg-primary/20 transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
