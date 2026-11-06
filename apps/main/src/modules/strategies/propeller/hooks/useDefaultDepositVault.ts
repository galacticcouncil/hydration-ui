import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import { unique } from "remeda"

import { useAccountBalances } from "@/api/balances"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"
import { selectDefaultDeposit } from "@/modules/strategies/propeller/utils/defaultVault"
import {
  getDepositOptions,
  type PropellerDepositOption,
} from "@/modules/strategies/propeller/utils/depositOptions"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

const DEPOSIT_OPTIONS = getDepositOptions(PROPELLER_VAULTS)
const DEPOSIT_ASSET_IDS = unique(DEPOSIT_OPTIONS.map((o) => o.assetId))

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
  const { account } = useAccount()
  const address = account?.address
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance, isBalanceLoading } = useAccountBalances()
  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(DEPOSIT_ASSET_IDS)

  const [resolved, setResolved] = useState<ResolvedDefault | null>(null)
  const [userPicked, setUserPicked] = useState(false)

  const shouldResolve =
    !resolved || (!userPicked && resolved.address !== address)
  const isInputLoading = !!address && (isBalanceLoading || isPriceLoading)

  if (shouldResolve && !isInputLoading) {
    const symbols: Record<string, string> = {}
    const balancesUsd: Record<string, number> = {}
    for (const assetId of DEPOSIT_ASSET_IDS) {
      const { symbol, decimals } = getAssetWithFallback(assetId)
      symbols[assetId] = symbol
      balancesUsd[assetId] = address
        ? Number(scaleHuman(getTransferableBalance(assetId), decimals)) *
          Number(getAssetPrice(assetId).price || 0)
        : 0
    }

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
