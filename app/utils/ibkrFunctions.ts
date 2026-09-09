"use server"
import { XMLParser } from "fast-xml-parser"
const query_id = process.env.IBKR_FLEX_QUERY_ID
const ibkr_token = process.env.IBKR_TEST_TOKEN
let auth_code = "loading"
const ibkr_base_url = `https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService`

// paring logic
async function parseIBKRaccountStatement(res: any) {
  const xml = await res.text()
  const parsner = new XMLParser()
  const jsonObj = parsner.parse(xml)
  return xml
}
export async function parseIBKRflexQueryAuth(res: any) {
  const xml = await res.text()
  const parsner = new XMLParser()
  const jsonObj = parsner.parse(xml)
  const auth_code = jsonObj.FlexStatementResponse.ReferenceCode
  return auth_code
}
export async function ibkrFlexQueryAuth(url: string) {
  console.log(url)
  try {
    const res = await parseIBKRflexQueryAuth(await fetch(url))
    return res
  } catch (err) {
    console.log(err)
  }
}
export async function ibkrAccountStatement(url: string) {
  try {
    console.log("ibkrAccountStatement") // DEBUG
    const res = await parseIBKRaccountStatement(await fetch(url))
    console.log(res) // DEBUG
  } catch (err) {
    console.log(err)
  }
}
export async function ibkrFlexQuery() {
  try {
    const auth_code = await ibkrFlexQueryAuth(
      `${ibkr_base_url}/SendRequest?t=${ibkr_token}&q=${query_id}&v=3`
    )
    const data = await ibkrAccountStatement(
      `${ibkr_base_url}/GetStatement?t=${ibkr_token}&q=${auth_code}&v=3`
    )
    console.log(data)
    console.log(auth_code)
  } catch (err) {
    console.log(err)
  }
}
