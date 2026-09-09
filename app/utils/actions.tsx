"use server"

import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  // 2. Attempt the login
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 3. Handle errors
  if (error) {
    // If we fail, redirect back to login and pass the error in the URL
    redirect(`/login?error=${error.message}`)
  }

  // 4. Success!
  // Because of the createClient utility, an HttpOnly cookie has now been set in the user's browser.
  redirect("/auth/dashboard")
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fname = formData.get("fname") as string
  const lname = formData.get("lname") as string
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: fname,
        last_name: lname,
      },
    },
  })

  if (error) {
    if (error.message.includes("already registered")) {
      console.log("User already exists redirecting to login page")
      redirect("/login")
    }
    redirect(`/register?error=${error.message}`)
  }

  redirect("/login")
}

export async function fetchUserData() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error("Error fetching user data:", error.message)
  }
  //console.log("Fetched user data:", user)
  return user
}

export async function logout() {
  console.log("Logging out user...")
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  await supabase.auth.signOut()
  redirect("/login")
}

// get crypto balanc

export async function getCryptoBalance() {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: ["0xfe3b557e8fb62b89f4916b721be55ceb828dbd73", "latest"],
    }),
  }

  fetch("https://abstract-mainnet.g.alchemy.com/v2/docs-demo", options)
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.error(err))
}
