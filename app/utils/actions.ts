"use server"

import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { parseIBKRflexQueryAuth, parseDashboardFinancials } from "./parsers"
import { getUser, insertSecretQuery } from "./queries"
const ibkr_base_url = `https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService`

// --- AUTHENTICATION ACTIONS ---

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${error.message}`)
  }

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

export async function logout() {
  console.log("Logging out user...")
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  await supabase.auth.signOut()
  redirect("/login")
}

// --- IBKR ACTIONS ---

export async function ibkrFlexQueryAuth(url: string) {
  try {
    const res = await parseIBKRflexQueryAuth(await fetch(url))
    return res
  } catch (err) {
    throw err
  }
}

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
  return data
}

// actions.ts

export async function refreshIBKRholdings() {
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
export async function totalCryptoValue() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const user = await getUser()

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

export async function insertSecret(
  token: string,
  queryType: string,
  queryId: string
) {
  const { data: secret_id, error } = await insertSecretQuery(
    token,
    queryType,
    queryId
  )
  if (error) {
    console.error("Failed to store secret in Vault:", error.message)
    return { success: false, error: error.message }
  }

  return { success: true, secret_id: secret_id }
}

export async function refreshDashboardServer() {
  const [ibkrDataResult, totalEthResult] = await Promise.allSettled([
    refreshIBKRholdings(),
    totalCryptoValue(),
  ])
  const ibkrData =
    ibkrDataResult.status === "fulfilled" ? ibkrDataResult.value : null
  const totalEth =
    totalEthResult.status === "fulfilled" ? totalEthResult.value : 0

  const ibkrValueInBase = ibkrData?.totalValue ?? null // null pomeni, da podatkov ni/je napaka
  const ibkrBaseCurrency = ibkrData?.baseCurrency ?? "USD"
  return {
    ibkrValueInBase: ibkrValueInBase,
    ibkrBaseCurrency: ibkrBaseCurrency,
    totalEth: totalEth,
  }
}

export async function fetchAllAccounts() {}
