import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { formatSourceChainAddress } from "@galacticcouncil/utils"
import { getChainAssetId, getChainId } from "@galacticcouncil/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { EvmParachain } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useMemo } from "react"

import {
  useCrossChainBalance,
  useCrossChainBalanceSubscription,
} from "@/api/xcm"
import { MultichainChainKey } from "@/routes/wallet/multichain"
import { useAssetsPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

export type MultichainAssetRow = {
  key: string
  originSymbol: string
  chainAssetId: string
  chainId: string
  amount: string
  usdValue: number
  spotPriceIds: string[]
}

const registryChain = chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain

// All Hydration assets indexed by originSymbol for quick same-symbol lookup
const hydrationAssetsBySymbol = registryChain
  ? [...registryChain.assetsData.values()].reduce<Record<string, string[]>>(
      (acc, d) => {
        const sym = d.asset.originSymbol
        if (!acc[sym]) acc[sym] = []
        if (d.id !== undefined) acc[sym].push(d.id.toString())
        return acc
      },
      {},
    )
  : {}

const resolveUsdValue = (
  spotPriceIds: string[],
  amount: string,
  getAssetPrice: (id: string) => { price: string; isValid: boolean },
): number => {
  for (const id of spotPriceIds) {
    const { price, isValid } = getAssetPrice(id)
    if (isValid && price) {
      try {
        return Big(amount).mul(price).toNumber()
      } catch {
        // try next id
      }
    }
  }
  return 0
}

export const useMultichainAssets = (
  chainKey: MultichainChainKey,
  account: Account,
) => {
  const chain = chainsMap.get(chainKey)

  const xcmAssets = useMemo(
    () => (chain ? [...chain.assetsData.values()].map((d) => d.asset) : []),
    [chain],
  )

  const address = chain
    ? formatSourceChainAddress(account.address, chain)
    : account.address

  const { isLoading, isError } = useCrossChainBalanceSubscription(
    address,
    chainKey,
  )
  const { data: balances } = useCrossChainBalance(address, chainKey)

  // Collect all candidate price IDs up front for a single batch subscription
  const allSpotPriceIds = useMemo(() => {
    return [
      ...new Set(
        xcmAssets.flatMap((asset) => {
          const primaryId = registryChain?.getBalanceAssetId(asset)?.toString()
          const sameSymbolIds =
            hydrationAssetsBySymbol[asset.originSymbol] ?? []
          return [primaryId, ...sameSymbolIds].filter(Boolean) as string[]
        }),
      ),
    ]
  }, [xcmAssets])

  // One batch price subscription for all assets on this chain
  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(allSpotPriceIds)

  const rows = useMemo<MultichainAssetRow[]>(() => {
    if (!chain || !balances) return []

    return xcmAssets
      .map((asset) => {
        const balance = balances.get(asset.key)
        if (!balance) return null

        const amount = toDecimal(balance.amount, balance.decimals)

        // Primary Hydration ID + same-symbol fallbacks (e.g. sUSDS: 1000626 → 1000745)
        const primaryId = registryChain?.getBalanceAssetId(asset)?.toString()
        const sameSymbolIds = hydrationAssetsBySymbol[asset.originSymbol] ?? []
        const spotPriceIds = [
          ...new Set([primaryId, ...sameSymbolIds].filter(Boolean) as string[]),
        ]

        const usdValue = resolveUsdValue(spotPriceIds, amount, getAssetPrice)

        return {
          key: asset.key,
          originSymbol: asset.originSymbol,
          chainAssetId: getChainAssetId(chain, asset).toString(),
          chainId: getChainId(chain) ?? "",
          amount,
          usdValue,
          spotPriceIds,
        }
      })
      .filter((row): row is MultichainAssetRow => row !== null)
      .sort((a, b) => {
        // Sort by USD value desc; fall back to token amount for unpriced assets
        if (a.usdValue !== b.usdValue) return b.usdValue - a.usdValue
        return Big(b.amount).minus(Big(a.amount)).toNumber()
      })
  }, [xcmAssets, balances, chain, getAssetPrice])

  return { rows, isLoading, isPriceLoading, isError, address, chain }
}
