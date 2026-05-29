import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardView, { SavedTool } from './dashboard-view';

export const metadata = {
  title: 'Dashboard - DevTools AI Directory',
  description: 'Manage your profile details, membership subscription, and saved favorites catalog.',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if user is not authenticated
  if (!user) {
    return redirect('/auth/login');
  }

  // Get user subscription status
  let subscriptionStatus = 'free';
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  if (profile) {
    subscriptionStatus = profile.subscription_status;
  }

  // Fetch saved tool IDs
  const { data: favs } = await supabase
    .from('favorites')
    .select('tool_id')
    .eq('user_id', user.id);

  let savedTools: SavedTool[] = [];

  if (favs && favs.length > 0) {
    const toolIds = favs.map((f) => f.tool_id);

    // Fetch tool details for those IDs
    const { data: tools, error } = await supabase
      .from('tools')
      .select('*')
      .in('id', toolIds)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching dashboard tools:', error);
    } else if (tools) {
      savedTools = tools as SavedTool[];
    }
  }

  const isVerified = user.user_metadata?.is_verified === true;

  return (
    <DashboardView
      userEmail={user.email || ''}
      initialSubscriptionStatus={subscriptionStatus}
      initialSavedTools={savedTools}
      initialIsVerified={isVerified}
    />
  );
}
