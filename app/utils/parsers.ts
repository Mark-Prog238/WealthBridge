import { XMLParser } from "fast-xml-parser"

export async function parseIBKRaccountStatement(res: any) {
  const xml = await res.text()
  const parsner = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
  })
  const jsonObj = parsner.parse(xml)
  const statement = jsonObj.FlexQueryResponse.FlexStatements.FlexStatement
  const cashBalance = statement.CashReport.CashReportCurrency.endingSettledCash
  const ibkr_account_id = statement.accountId
  let rawPositions = statement.OpenPositions.OpenPosition
  if (!Array.isArray(rawPositions)) {
    rawPositions = [rawPositions]
  }

  const formatedPositions = rawPositions.map((pos: any) => ({
    symbol: pos.symbol,
    quantity: pos.position,
    value: pos.positionValue,
    valueInBase: pos.positionValueInBase,
  }))

  return {
    ibkr_account_id: ibkr_account_id,
    cash: cashBalance,
    positions: formatedPositions,
  }
}

export async function parseIBKRflexQueryAuth(res: any) {
  const xml = await res.text()
  const parsner = new XMLParser()
  const jsonObj = parsner.parse(xml)
  const auth_code = jsonObj.FlexStatementResponse.ReferenceCode
  return auth_code
}
