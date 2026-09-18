"use client"

import { useRef } from "react"
import { useBalanceStore } from "./useBalanceStore"

export default function BalanceInitializer({
  ibkr,
  eth,
}: {
  ibkr: number
  eth: number
}) {
  const initialized = useRef(false)
  if (!initialized.current) {
    useBalanceStore.getState().setBalances(ibkr, eth)
    initialized.current = true
  }
  return null
}
