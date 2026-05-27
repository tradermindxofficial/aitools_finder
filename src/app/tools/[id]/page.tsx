import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ToolDetail from './tool-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: tool } = await supabase
    .from('tools')
    .select('name, category')
    .eq('id', resolvedParams.id)
    .single();

  return {
    title: tool ? `${tool.name} - AI Developer Tools Directory` : 'Tool Details',
    description: tool ? `Detailed review, pricing, ratings and workflow information for ${tool.name} under ${tool.category}.` : 'Developer Tool details.',
  };
}

export default async function ToolDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const toolId = resolvedParams.id;
  const supabase = await createClient();

  // Query tool details
  const { data: tool, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', toolId)
    .single();

  if (error || !tool) {
    return notFound();
  }

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRating = 0;
  let isFavorited = false;
  let subscriptionStatus = 'free';

  if (user) {
    // Check if user has rated
    const { data: ratingData } = await supabase
      .from('ratings')
      .select('rating')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle();

    if (ratingData) {
      userRating = ratingData.rating;
    }

    // Check if favorited
    const { data: favData } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle();

    isFavorited = !!favData;

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
    <ToolDetail
      tool={tool}
      initialUserRating={userRating}
      initialIsFavorited={isFavorited}
      isLoggedIn={!!user}
      subscriptionStatus={subscriptionStatus}
    />
  );
}
