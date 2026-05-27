import { createClient } from '@/utils/supabase/server';
import ToolsCatalog, { Tool } from './tools-catalog';

export const metadata = {
  title: 'DevTools AI - Directory of Developer AI Tools',
  description: 'Browse, filter, and search developer AI tools by category, ratings, and pricing models.',
};

export default async function ToolsPage() {
  const supabase = await createClient();

  // Query tools from database
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tools:', error);
  }

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userFavorites: string[] = [];
  let subscriptionStatus = 'free';

  if (user) {
    // Get favorites
    const { data: favs } = await supabase
      .from('favorites')
      .select('tool_id')
      .eq('user_id', user.id);

    if (favs) {
      userFavorites = favs.map((f) => f.tool_id);
    }

    // Get subscription status
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
    <ToolsCatalog
      initialTools={(tools as Tool[]) || []}
      userFavorites={userFavorites}
      isLoggedIn={!!user}
      subscriptionStatus={subscriptionStatus}
    />
  );
}
