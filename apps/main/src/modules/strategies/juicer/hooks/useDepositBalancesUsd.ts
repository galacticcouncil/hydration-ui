import { useAccount } from "@galacticcouncil/web3-connect"
import { unique } from "remeda"

import { useAccountBalances } from "@/api/balances"
import { JUICER_VAULTS } from "@/modules/strategies/juicer/config/vaults"
import { getDepositOptions } from "@/modules/strategies/juicer/utils/depositOptions"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const DEPOSIT_OPTIONS = getDepositOptions(JUICER_VAULTS)
const DEPOSIT_ASSET_IDS = unique(DEPOSIT_OPTIONS.map((o) => o.assetId))

/**
 * Registry symbol and wallet USD value (transferable balance × spot price)
 * per deposit asset: the inputs of `selectDefaultDeposit`. Loading while a
 * connected wallet's balances or prices are still on their way.
 */
export const useDepositBalancesUsd = () => {
  const { account } = useAccount()
  const address = account?.address
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance, isBalanceLoading } = useAccountBalances()
  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(DEPOSIT_ASSET_IDS)

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

  return {
    address,
    symbols,
    balancesUsd,
    isLoading: !!address && (isBalanceLoading || isPriceLoading),
  }
}
