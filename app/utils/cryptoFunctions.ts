"use server"
import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"
const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY

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

    // all work for ETH just add more chains and thats it
  } catch (err) {
    console.log(`error line 58 cryptoFunctions.ts :   ${err}`)
  }
}
