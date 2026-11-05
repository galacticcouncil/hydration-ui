import { createContext, useContext } from "react"

import type { Account } from "@/hooks/useWeb3Connect"

// undefined inherits the portfolio account; null explicitly has no source yet.
const AccountOverrideContext = createContext<Account | null | undefined>(
  undefined,
)

export const AccountOverrideProvider = AccountOverrideContext.Provider
export const useAccountOverride = () => useContext(AccountOverrideContext)
