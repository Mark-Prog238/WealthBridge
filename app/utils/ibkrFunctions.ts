"use server"
import {
  parseIBKRflexQueryAuth,
  parseIBKRaccountStatement,
} from "@/app/utils/parsner"
const query_id = process.env.IBKR_FLEX_QUERY_ID
const ibkr_token = process.env.IBKR_TEST_TOKEN
import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"
const ibkr_base_url = `https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService`

export async function ibkrFlexQueryAuth(url: string) {
  try {
    const res = await parseIBKRflexQueryAuth(await fetch(url))
    return res
  } catch (err) {
    throw err
  }
}
export async function ibkrAccountStatement(url: string) {
  try {
    const res = await parseIBKRaccountStatement(await fetch(url))
    return res
  } catch (err) {
    throw err
  }
}

// To save a new integration from your frontend UI
export async function saveIbkrConnection(
  name: string,
  queryId: string,
  token: string
) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data, error } = await supabase.rpc("add_ibkr_query", {
    p_query_name: name,
    p_ibkr_query_id: queryId,
    p_token: token,
  })

  if (error) console.error(error)
  return data // Returns the new mapping row ID
}

// To get the token when running your Flex Web Service
export async function fetchIbkrData(mappingId: string) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: token, error } = await supabase.rpc("get_ibkr_token", {
    p_mapping_id: mappingId,
  })

  if (error || !token) return null

  // Now you have the raw token to build your IBKR SendRequest URL!
  console.log("Successfully retrieved decrypted token.")
  return token
}

export async function upsertIBKRholdings(parsedData: any) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const upsert_payload = [
    {
      ibkr_account_id: parsedData.ibkr_account_id,
      asset_type: "cash",
      ticker: "EUR",
      amount: parsedData.cash,
      base_currency_value: parsedData.cash,
    },
    // Spread out the mapped stock positions array
    ...parsedData.positions.map((pos: any) => ({
      ibkr_account_id: parsedData.ibkr_account_id,
      asset_type: "stock",
      ticker: pos.symbol,
      amount: pos.quantity,
      base_currency_value: pos.valueInBase,
    })),
  ]

  const { data, error } = await supabase
    .from("ibkr_holdings")
    .upsert(upsert_payload, { onConflict: "user_id, ibkr_account_id, ticker" })
  if (error) {
    console.log("Failed to sync holdings:", error)
  } else {
    console.log("Successfully inserted/updated holdings!")
  }
}

export async function getTotalIBKRworth() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: assets, error } = await supabase
    .from("ibkr_holdings")
    .select("base_currency_value")

  if (error || !assets) {
    console.error("Failed to fetch assets:", error)
    return 0
  }

  const total = assets.reduce((sum, item) => {
    return sum + Number(item.base_currency_value)
  }, 0)

  console.log(`Total IBKR Worth: €${total.toFixed(2)}`)
  return total
}
