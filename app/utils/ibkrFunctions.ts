"use server"
import { dbg } from "@/lib/utils"
import {
  parseIBKRflexQueryAuth,
  parseIBKRaccountStatement,
} from "@/app/utils/parsner"
const query_id = process.env.IBKR_FLEX_QUERY_ID
const ibkr_token = process.env.IBKR_TEST_TOKEN
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

// add usage for this script it gets users wealth on IBKR
export async function ibkrFlexQuery() {
  try {
    const auth_code = await ibkrFlexQueryAuth(
      `${ibkr_base_url}/SendRequest?t=${ibkr_token}&q=${query_id}&v=3`
    )
    const data = await ibkrAccountStatement(
      `${ibkr_base_url}/GetStatement?t=${ibkr_token}&q=${auth_code}&v=3`
    )
    return data
  } catch (err) {
    throw err
  }
}
