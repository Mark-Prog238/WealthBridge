"use server"

import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { parseIBKRflexQueryAuth, parseIBKRaccountStatement } from "./parsers"
import { getUser } from "./queries"
const query_id = process.env.IBKR_FLEX_QUERY_ID
const ibkr_token = process.env.IBKR_TEST_TOKEN
const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY
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

export async function ibkrAccountStatement(url: string) {
  try {
    const res = await parseIBKRaccountStatement(await fetch(url))
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

export async function fetchIbkrData(mappingId: string) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: token, error } = await supabase.rpc("get_ibkr_token", {
    p_mapping_id: mappingId,
  })

  if (error || !token) return null

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

// add usage for this script it gets users wealth on IBKR
export async function refreshIBKRholdings() {
  try {
    const auth_code = await ibkrFlexQueryAuth(
      `${ibkr_base_url}/SendRequest?t=${ibkr_token}&q=${query_id}&v=3`
    )
    const data = await ibkrAccountStatement(
      `${ibkr_base_url}/GetStatement?t=${ibkr_token}&q=${auth_code}&v=3`
    )
    await upsertIBKRholdings(data)
  } catch (err) {
    throw err
  }
}
// --- CRYPTO ACTIONS ---

export async function totalCryptoValue() {
  const cookiStore = await cookies()
  const supabase = await createClient(cookiStore)
  const user = await getUser()
  if (!user) {
    console.log(`user not logged in`)
    return
  }

  try {
    const { data: wallets, error } = await supabase
      .from("crypto_wallets")
      .select("network, address")
      .eq("user_id", user.id)

    if (error || !wallets || wallets.length === 0) {
      console.log("user has no wallets or error ")
      return 0
    }

    const groupedWallets = Object.groupBy(wallets, (wallet) => wallet.network)

    for (const [network, networkWallets] of Object.entries(groupedWallets)) {
      const address_list = await networkWallets
        ?.map((wallet) => wallet.address)
        .join(",")

      try {
        const url = `https://api.etherscan.io/v2/api?module=account&action=balancemulti&apikey=${ETHER_SCAN_API_KEY}&chainid=1&address=${address_list}`
        const options = {
          method: "GET",
        }
        const response = await (await fetch(url, options)).json()
        const accounts = response.result
        let totalWei = BigInt(0)
        for (const item of accounts) {
          totalWei += BigInt(item.balance)
        }
        const totalEth = Number(totalWei) / 1e18
        console.log(`total wei is:   ${totalEth}`)
      } catch (err) {
        console.log(`error:   ${err}`)
      }
    }
  } catch (err) {
    console.log(`error line 58 cryptoFunctions.ts :   ${err}`)
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
