'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return redirect('/auth/signup?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  return redirect('/auth/login?message=' + encodeURIComponent('Verification email sent or account created! You can now log in.'));
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return redirect('/tools');
}
