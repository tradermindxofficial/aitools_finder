'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return redirect('/auth/login?error=' + encodeURIComponent('Email and password are required.'));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/auth/login?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  return redirect('/tools');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return redirect('/auth/signup?error=' + encodeURIComponent('Email and password are required.'));
  }

  // 1. Attempt standard signup to trigger the verification email
  let userId: string | undefined;
  let emailSent = false;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
      data: {
        is_verified: false, // Custom verification status starts as false
      },
    },
  });

  const isRateLimit = signUpError?.status === 429 || signUpError?.code === 'over_email_send_rate_limit';

  if (signUpError && !isRateLimit) {
    return redirect('/auth/signup?error=' + encodeURIComponent(signUpError.message));
  }

  if (signUpData?.user) {
    userId = signUpData.user.id;
    emailSent = true;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const serviceClient = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  // 2. Fallback: If standard signup failed due to email rate limits, create user via Admin API
  if (isRateLimit) {
    console.log('Signup email rate limit hit, falling back to Admin API creation.');
    const { data: adminData, error: adminError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_verified: false },
    });

    if (adminError) {
      return redirect('/auth/signup?error=' + encodeURIComponent(adminError.message));
    }

    if (adminData?.user) {
      userId = adminData.user.id;
    }
  } else if (userId) {
    // 3. If standard signup succeeded, immediately confirm email via Admin API
    // so they can log in and use the site immediately
    const { error: confirmError } = await serviceClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (confirmError) {
      console.error('Error confirming email via admin API:', confirmError);
    }
  }

  // 4. Automatically sign in the user to grant instant access
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('Immediate signin error:', signInError);
    return redirect('/auth/login?message=' + encodeURIComponent('Account created! Please log in.'));
  }

  revalidatePath('/', 'layout');
  
  const successMsg = emailSent 
    ? 'Account created and verification email sent! You have been logged in automatically.'
    : 'Account created! You have been logged in automatically.';
    
  return redirect('/tools?message=' + encodeURIComponent(successMsg) + '&signup_success=true');
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    }
  });

  if (error) {
    console.error('Error resending verification:', error);
    throw new Error(error.message);
  }

  return { success: true };
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return redirect('/tools');
}
