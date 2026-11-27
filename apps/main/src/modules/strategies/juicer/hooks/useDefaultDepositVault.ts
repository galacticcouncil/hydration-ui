import { useSearch } from "@tanstack/react-router"
import { useCallback, useState } from "react"

import {
  DEPOSIT_OPTIONS,
  useDepositBalancesUsd,
} from "@/modules/strategies/juicer/hooks/useDepositBalancesUsd"
import {
  useJuicerVaults,
  vaultDepositState,
} from "@/modules/strategies/juicer/hooks/useJuicerVaults"
import { selectDefaultDeposit } from "@/modules/strategies/juicer/utils/defaultVault"
import { type JuicerDepositOption } from "@/modules/strategies/juicer/utils/depositOptions"

type ResolvedDefault = {
  deposit: JuicerDepositOption | null
  address: string | undefined
}

/**
 * Deposit option to start the form on. Resolved once per connected account
 * (waiting for balances, prices and the vaults' capacity) and never moved by
 * later balance changes; after `markUserPick` it is fixed for good.
 */
export const useDefaultDepositVault = () => {
  const { asset: assetParam } = useSearch({ from: "/strategies/juicer/" })
  const {
    address,
    symbols,
    balancesUsd,
    isLoading: isBalanceLoading,
  } = useDepositBalancesUsd()
  const { vaults, isLoading: isVaultLoading } = useJuicerVaults()
  const isLoading = isBalanceLoading || isVaultLoading

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
        full: new Set(
          vaults
            .filter(({ stats }) => vaultDepositState(stats) === "full")
            .map(({ vault }) => vault.vaultAddress),
        ),
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
