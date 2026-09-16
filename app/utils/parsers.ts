import { XMLParser } from "fast-xml-parser"
import { stat } from "fs"

export async function parseDashboardFinancials(res: any) {
  const xml = await res.text()
  const parsner = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
  })
  const jsonObj = parsner.parse(xml)
  const statement = jsonObj.FlexQueryResponse.FlexStatements.FlexStatement
  const baseCur = statement.AccountInformation.currency
  const totalVal =
    statement.EquitySummaryInBase.EquitySummaryByReportDateInBase.total
  console.log(`baseCurrency: ${baseCur}   && totalValue: ${totalVal}`)
  return {
    baseCurrency: baseCur,
    totalValue: totalVal,
  }
}

export async function parseIBKRflexQueryAuth(res: any) {
  const xml = await res.text()
  const parsner = new XMLParser()
  const jsonObj = parsner.parse(xml)
  const auth_code = jsonObj.FlexStatementResponse.ReferenceCode
  return auth_code
}
