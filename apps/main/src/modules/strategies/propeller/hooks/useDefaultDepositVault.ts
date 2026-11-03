import { useSearch } from "@tanstack/react-router"
import { useCallback, useState } from "react"

import {
  DEPOSIT_OPTIONS,
  useDepositBalancesUsd,
} from "@/modules/strategies/propeller/hooks/useDepositBalancesUsd"
import { selectDefaultDeposit } from "@/modules/strategies/propeller/utils/defaultVault"
import { type PropellerDepositOption } from "@/modules/strategies/propeller/utils/depositOptions"

type ResolvedDefault = {
  deposit: PropellerDepositOption | null
  address: string | undefined
}

/**
 * Deposit option to start the form on. Resolved once per connected account
 * (waiting for balances and prices when a wallet is connected) and never
 * moved by later balance changes; after `markUserPick` it is fixed for good.
 */
export const useDefaultDepositVault = () => {
  const { asset: assetParam } = useSearch({ from: "/strategies/juicer/" })
  const { address, symbols, balancesUsd, isLoading } = useDepositBalancesUsd()

  const [resolved, setResolved] = useState<ResolvedDefault | null>(null)
  const [userPicked, setUserPicked] = useState(false)

  const shouldResolve =
    !resolved || (!userPicked && resolved.address !== address)

  if (shouldResolve && !isLoading) {
    setResolved({
      deposit: selectDefaultDeposit(DEPOSIT_OPTIONS, {
        assetParam,
        symbols,
        balancesUsd,
      }),
      address,
    })
  }

  const markUserPick = useCallback(() => setUserPicked(true), [])

  return {
    deposit: resolved?.deposit ?? null,
    isLoading: shouldResolve,
    markUserPick,
  }
}
