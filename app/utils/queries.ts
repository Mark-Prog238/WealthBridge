import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"

export async function getUser() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (err) {
    console.log(`error line 55:    ${err}`)
  }
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
  return user
}
