"use server";

import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // 2. Attempt the login
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 3. Handle errors
  if (error) {
    // If we fail, redirect back to login and pass the error in the URL
    redirect(`/login?error=${error.message}`);
  }

  // 4. Success!
  // Because of the createClient utility, an HttpOnly cookie has now been set in the user's browser.
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/register?error=${error.message}`);
  }

  redirect("/login");
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  await supabase.auth.signOut();
  redirect("/login");
}
