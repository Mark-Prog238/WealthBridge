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

  return data
  //select vault.create_secret(token, type,);
}

export async function fetchUserHoldingsCache() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: balances, error } = await supabase
    .from("cached_balances")
    .select("account_type, total_value, base_currency")
  if (error || !balances) {
    console.log(`failed to fetch cached balances ${error?.message}`)
    return { ibkrTotal: 0, ethTotal: 0 }
  }

  const ibkrRow = balances.find((b) => b.account_type === "ibkr")
  const ethRow = balances.find((b) => b.account_type === "eth")
  return {
    ibkrRow,
    ethRow,
  }
}
