import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { useCallback, useState } from "react"

import { useAccountBalances } from "@/api/balances"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { selectDefaultVault } from "@/modules/strategies/propeller/utils/defaultVault"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

const VAULT_ASSET_IDS = PROPELLER_VAULTS.map((vault) => vault.assetId)

type ResolvedDefault = {
  vault: PropellerVaultConfig | null
  address: string | undefined
}

/**
 * Deposit vault to start the form on. Resolved once per connected account
 * (waiting for balances and prices when a wallet is connected) and never
 * moved by later balance changes; after `markUserPick` it is fixed for good.
 */
export const useDefaultDepositVault = () => {
  const { asset: assetParam } = useSearch({ from: "/strategies/propeller/" })
  const { account } = useAccount()
  const address = account?.address
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance, isBalanceLoading } = useAccountBalances()
  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(VAULT_ASSET_IDS)

  const [resolved, setResolved] = useState<ResolvedDefault | null>(null)
  const [userPicked, setUserPicked] = useState(false)

  const shouldResolve =
    !resolved || (!userPicked && resolved.address !== address)
  const isInputLoading = !!address && (isBalanceLoading || isPriceLoading)

  if (shouldResolve && !isInputLoading) {
    const symbols: Record<string, string> = {}
    const balancesUsd: Record<string, number> = {}
    for (const { assetId } of PROPELLER_VAULTS) {
      const { symbol, decimals } = getAssetWithFallback(assetId)
      symbols[assetId] = symbol
      balancesUsd[assetId] = address
        ? Number(scaleHuman(getTransferableBalance(assetId), decimals)) *
          Number(getAssetPrice(assetId).price || 0)
        : 0
    }

    setResolved({
      vault: selectDefaultVault(PROPELLER_VAULTS, {
        assetParam,
        symbols,
        balancesUsd,
      }),
      address,
    })
  }

  const markUserPick = useCallback(() => setUserPicked(true), [])

  return {
    vault: resolved?.vault ?? null,
    isLoading: shouldResolve,
    markUserPick,
  }
}
