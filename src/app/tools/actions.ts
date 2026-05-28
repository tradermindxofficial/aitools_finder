'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function rateTool(toolId: number | string, rating: number) {
  // 1. Get user session using server client (cookie-based)
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Please log in to rate this tool.');
  }

  // 2. Perform the upsert using the service role client to bypass RLS issues
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const serviceClient = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  const parsedToolId = typeof toolId === 'string' ? parseInt(toolId, 10) : toolId;

  if (isNaN(parsedToolId)) {
    throw new Error('Invalid tool ID format.');
  }

  const { data, error } = await serviceClient
    .from('ratings')
    .upsert(
      { user_id: user.id, tool_id: parsedToolId, rating },
      { onConflict: 'user_id,tool_id' }
    )
    .select();

  if (error) {
    console.error('Error in rateTool server action:', error);
    throw new Error(error.message);
  }

  // 3. Revalidate path to refresh cache
  revalidatePath(`/tools/${toolId}`);
  revalidatePath('/tools');

  return { success: true, data };
}
