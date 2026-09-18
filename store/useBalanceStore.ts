import { create } from "zustand"

interface BalanceState {
  ibkrTotal: number
  ethTotal: number
  setBalances: (ibkr: number, eth: number) => void
}

export const useBalanceStore = create<BalanceState>((set) => ({
  ibkrTotal: 0,
  ethTotal: 0,

  setBalances: (ibkr, eth) => set({ ibkrTotal: ibkr, ethTotal: eth }),
}))
