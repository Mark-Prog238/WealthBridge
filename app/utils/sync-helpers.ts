import { cookies } from "next/headers"
import { createClient } from "@/app/utils/supabase/server"
import { ibkrFlexQueryAuth } from "./actions"
import { parseDashboardFinancials } from "./parsers"
const ibkr_base_url = `https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService`

export async function refreshIBKRholdingsForUser(
  supabaseAdmin: any,
  user_id: string
) {
  const { data: mappingData, error: mappingError } = await supabaseAdmin
    .from("user_ibkr_queries")
    .select("query_id, secret_id")
    .eq("user_id", user_id)
    .eq("query_type", "ibkr")
    .single()

  if (mappingError || !mappingData) {
    console.log(`No IBKR connection found for this user.
      mappingError: ${mappingError}
      mappingData: ${mappingData}`)
    return null
  }
  console.log(`mappingData: sync::: ${mappingData}`)

  const { data: ibkrSecret, error: tokenError } = await supabaseAdmin.rpc(
    "read_secret",
    {
      p_secret_id: mappingData.secret_id,
    }
  )

  if (tokenError || !ibkrSecret) {
    console.error("Failed to decrypt token.")
    return null
  }

  try {
    const auth_code_url = `${ibkr_base_url}/SendRequest?t=${ibkrSecret}&q=${mappingData.query_id}&v=3`
    const auth_code = await ibkrFlexQueryAuth(auth_code_url)

    const data_url = `${ibkr_base_url}/GetStatement?t=${ibkrSecret}&q=${auth_code}&v=3`

    const response = await fetch(data_url)
    if (!response.ok) {
      throw new Error(`IBKR API responded with status: ${response.status}`)
    }

    const values = await parseDashboardFinancials(response)
    return values
  } catch (err) {
    console.error("IBKR Sync Error:", err)
    return null
  }
}

// --- CRYPTO ACTIONS ---
export async function totalCryptoValueForUser(
  supabaseAdmin: any,
  user_id: string
) {
  const user = user_id

  if (!user) {
    console.log("User not logged in")
    return 0
  }

  try {
    const { data: wallets, error } = await supabaseAdmin
      .from("crypto_wallets")
      .select("network, address")
      .eq("user_id", user_id)

    if (error || !wallets || wallets.length === 0) {
      console.log("User has no wallets or error")
      return null
    }

    const groupedWallets = Object.groupBy(wallets, (wallet) => wallet.network)

    const fetchPromises = Object.entries(groupedWallets).map(
      async ([network, networkWallets]) => {
        const address_list = networkWallets
          ?.map((wallet) => wallet.address)
          .join(",")

        try {
          const url = `https://api.etherscan.io/v2/api?module=account&action=balancemulti&apikey=${process.env.ETHER_SCAN_API_KEY}&chainid=1&address=${address_list}`

          const response = await fetch(url)
          const data = await response.json()

          if (!data.result) return 0

          let totalWei = BigInt(0)
          for (const item of data.result) {
            totalWei += BigInt(item.balance)
          }

          return Number(totalWei) / 1e18
        } catch (err) {
          console.error(`Error fetching ${network}:`, err)
          return 0
        }
      }
    )

    const networkTotals = await Promise.all(fetchPromises)

    const grandTotalEth = networkTotals.reduce(
      (sum, current) => sum + current,
      0
    )

    return grandTotalEth
  } catch (err) {
    console.error(`Error line 58 cryptoFunctions.ts :`, err)
    return 0
  }
}
