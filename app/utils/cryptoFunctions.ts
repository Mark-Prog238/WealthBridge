"use server"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY

export async function getWallet(wallet: String) {
  const url = `https://api.etherscan.io/v2/api?module=account&action=balance&apikey=${ETHER_SCAN_API_KEY}&chainid=1&address=${wallet}`
  // now we use the param and get wallet data
  console.log(`getting wallet info for: ${wallet}`)
  //gggg()
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
  }
}

// okay so the logic for geting eth wallet value works now we just need to add the logic so it only checks your wallets and not other peoples for security reasons

// we will use the sql table accounts type will be ETH_Blockchain and name can be whatever then it just needs to match the user ids to get the values
