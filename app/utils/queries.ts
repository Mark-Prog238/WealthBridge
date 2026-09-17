"use server"
import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"
import { create } from "node:domain"
import { StringDecoder } from "node:string_decoder"

export async function getUser() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error("Error fetching user data:", error.message)
  }
  return user
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user
}

export async function insertSecretQuery(
  token: string,
  queryType: string,
  queryId: string
) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  let { data, error } = await supabase.rpc("add_ibkr_secret", {
    p_query_id: queryId,
    p_query_type: queryType,
    p_query_token: token,
  })

  console.log(`queries id:   ${data}`)
  return data
  //select vault.create_secret(token, type,);
}
