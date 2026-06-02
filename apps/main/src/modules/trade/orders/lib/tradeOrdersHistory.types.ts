import { TAsset } from "@/providers/assetsProvider"

export type TradeOrderHistoryStatus = {
  type: "Terminated" | "Completed"
  err?: string
  desc?: string
}

export type TradeOrderHistoryItem = {
  id: number
  from: TAsset
  to: TAsset
  intervalBlocks: number
  amount: string | null
  totalBudget: string | null
  isOpenBudget: boolean
  status: TradeOrderHistoryStatus | null
}
