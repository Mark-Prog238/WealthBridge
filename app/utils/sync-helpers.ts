import { cookies } from "next/headers"
import { createClient } from "@/app/utils/supabase/server"
import { ibkrFlexQueryAuth } from "./actions"
import { parseDashboardFinancials } from "./parsers"
import { getSessionUser } from "./queries"
const ibkr_base_url = `https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService`

export async function refreshIBKRholdingsForUser() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  // 1. Fetch the mapping
  const { data: mappingData, error: mappingError } = await supabase
    .from("user_ibkr_queries")
    .select("query_id, secret_id")
    .eq("query_type", "ibkr")
    .single()

  // 2. CRITICAL SAFETY NET: If no connection exists, exit gracefully
  if (mappingError || !mappingData) {
    console.log("No IBKR connection found for this user.")
    return null // Returns null so your UI can show "Connect Account" instead of crashing
  }

  // 3. Decrypt the secret
  const { data: ibkrSecret, error: tokenError } = await supabase.rpc(
    "read_secret",
    {
      p_secret_id: mappingData.secret_id, // No longer needs '?' because we confirmed it exists
    }
  )

  if (tokenError || !ibkrSecret) {
    console.error("Failed to decrypt token.")
    return null
  }

  console.log(`ibkrSecret: ${ibkrSecret} query_id: ${mappingData.query_id}`)

  try {
    // 4. Hit the IBKR API
    const auth_code_url = `${ibkr_base_url}/SendRequest?t=${ibkrSecret}&q=${mappingData.query_id}&v=3`
    const auth_code = await ibkrFlexQueryAuth(auth_code_url)

    const data_url = `${ibkr_base_url}/GetStatement?t=${ibkrSecret}&q=${auth_code}&v=3`

    // 5. Fetch and parse
    const response = await fetch(data_url)
    if (!response.ok) {
      throw new Error(`IBKR API responded with status: ${response.status}`)
    }

    const values = await parseDashboardFinancials(response)
    return values
  } catch (err) {
    console.error("IBKR Sync Error:", err)
    // You might want to return null here too so the UI doesn't crash on a network timeout
    return null
  }
}

// --- CRYPTO ACTIONS ---
export async function totalCryptoValueForUser() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const user = await getSessionUser()

  if (!user) {
    console.log("User not logged in")
    return 0 // Always return a number so your UI doesn't break if it expects one
  }

  try {
    const { data: wallets, error } = await supabase
      .from("crypto_wallets")
      .select("network, address")
      .eq("user_id", user.id)

    if (error || !wallets || wallets.length === 0) {
      console.log("User has no wallets or error")
      return 0
    }

    const groupedWallets = Object.groupBy(wallets, (wallet) => wallet.network)

    // 1. Map over the networks and create an array of background fetch Promises
    const fetchPromises = Object.entries(groupedWallets).map(
      async ([network, networkWallets]) => {
        // Removed the unnecessary await here
        const address_list = networkWallets
          ?.map((wallet) => wallet.address)
          .join(",")

        try {
          // Note: You will eventually need to adjust the API URL/chainid based on the 'network' variable!
          const url = `https://api.etherscan.io/v2/api?module=account&action=balancemulti&apikey=${process.env.ETHER_SCAN_API_KEY}&chainid=1&address=${address_list}`

          const response = await fetch(url)
          const data = await response.json()

          if (!data.result) return 0 // Safeguard against API rate limits or errors

          let totalWei = BigInt(0)
          for (const item of data.result) {
            totalWei += BigInt(item.balance)
          }

          return Number(totalWei) / 1e18
        } catch (err) {
          console.error(`Error fetching ${network}:`, err)
          return 0 // Return 0 for this specific network so it doesn't break the others
        }
      }
    )

    // 2. Fire all network requests at the EXACT SAME TIME using Promise.all
    const networkTotals = await Promise.all(fetchPromises)

    // 3. Add up the results from all the networks
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
