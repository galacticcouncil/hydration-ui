import { createContext } from "react"

import type { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"

export type WithdrawCexState = Pick<
  ReturnType<typeof useOnrampStore.getState>,
  | "asset"
  | "cexId"
  | "amount"
  | "page"
  | "setAsset"
  | "setCexId"
  | "setAmount"
  | "paginateTo"
  | "reset"
>

export const WithdrawCexContext = createContext<WithdrawCexState | null>(null)
