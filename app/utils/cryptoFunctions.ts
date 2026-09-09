"use server"
import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"
const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY

export async function getWallet(wallet: String) {}
/*   const url = `https://api.etherscan.io/v2/api?module=account&action=balance&apikey=${ETHER_SCAN_API_KEY}&chainid=1&address=${wallet}`
  console.log(`getting wallet info for: ${wallet}`)
  const options = { method: "GET" }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    const rawWei = data.result
    const trueBalance = Number(BigInt(rawWei)) / 1e18
    console.log(`Balance in ETH: ${trueBalance}`)

    return trueBalance
  } catch (err) {
    console.log(`error: ${err}`)
  } */

// this function gets all your accounts
export async function getAccounts() {
  /*   const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  try {
    const response = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user?.id)
    console.log(`data returned: ${response}`)
    console.log(response)
  } catch (err) {
    console.log(`error: ${err}`)
  } */
  totalCryptoValue()
}

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
      // network is network name and network wallets is all the wallets in it
      const address_list = await networkWallets
        ?.map((wallet) => wallet.address)
        .join(",")

      // now we will look up all the wallets at once per chain to consume less api tokens and get the total
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
    // add the logic if more than 20 wallets to split the payload or just limit to max 20 wallets per person

    // now we return the value of them so it will display
  } catch (err) {
    console.log(`error line 58 cryptoFunctions.ts :   ${err}`)
  }
}

// now we will make it search up all the values of all those wallets so we need to add a column to that table of acccounts but not sure what should i call it tho
