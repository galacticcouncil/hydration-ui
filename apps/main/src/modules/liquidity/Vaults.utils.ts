import Big from "big.js"
import { useMemo } from "react"

import { useV3Pools, V3PoolBase } from "@/api/pools"
import { useVaultShares, useVaultStates, VaultState } from "@/api/vaults"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export type VaultTable = {
  id: string
  pool: V3PoolBase
  tokens: [TAsset, TAsset]
  feeTier: number
  tvlDisplay: string | undefined
  /** Price of token0 denominated in token1, decimal-adjusted */
  price: string | undefined
  vault: VaultState | null
  status: VaultStatus
  /** Value the vault itself holds, as opposed to the whole pool */
  vaultTvlDisplay: string | undefined
  canDeposit: boolean
  /** The connected account's holding, zero when there is none */
  positionShares: bigint
  positionValueDisplay: string | undefined
}

export type VaultStatus =
  | "noVault"
  | "notStarted"
  | "depositsClosed"
  | "empty"
  | "inRange"
  | "outOfRange"

export const useVaults = () => {
  const { data: pools, isLoading } = useV3Pools()
  const { getAssetWithFallback } = useAssets()
  const { data: vaults, isLoading: isVaultLoading } = useVaultStates(
    pools ?? [],
  )
  const sharesQuery = useVaultShares(vaults)
  const shares = sharesQuery.data

  const assetIds = useMemo(
    () =>
      Array.from(
        new Set(
          (pools ?? []).flatMap((pool) => [
            pool.token0.toString(),
            pool.token1.toString(),
          ]),
        ),
      ),
    [pools],
  )

  const { getAssetPrice } = useAssetsPrice(assetIds)

  const data = useMemo<VaultTable[]>(() => {
    if (!pools?.length) return []

    return pools.map((pool, index) => {
      const vault = vaults[index] ?? null
      const token0 = getAssetWithFallback(pool.token0.toString())
      const token1 = getAssetWithFallback(pool.token1.toString())

      // whole pool, not the vault's share of it
      const tvlDisplay = pool.tokens
        .reduce((total, token) => {
          const price = getAssetPrice(token.id.toString())
          if (!price?.isValid) return total

          const meta = getAssetWithFallback(token.id.toString())
          const amount = scaleHuman(token.balance ?? 0n, meta.decimals)

          return total.plus(Big(amount).times(price.price))
        }, Big(0))
        .toString()

      // sqrtPriceX96^2 / 2^192 is token1 per token0 in raw units; the decimal
      // difference converts it to a human price.
      const raw = Big(pool.sqrtPriceX96.toString()).pow(2).div(Big(2).pow(192))
      const price = raw
        .times(Big(10).pow(token0.decimals - token1.decimals))
        .toString()

      const vaultTvlDisplay = vault
        ? [
            { id: pool.token0, amount: vault.total0 },
            { id: pool.token1, amount: vault.total1 },
          ]
            .reduce((total, { id, amount }) => {
              const assetPrice = getAssetPrice(id.toString())
              if (!assetPrice?.isValid) return total

              const meta = getAssetWithFallback(id.toString())

              return total.plus(
                Big(scaleHuman(amount, meta.decimals)).times(assetPrice.price),
              )
            }, Big(0))
            .toString()
        : undefined

      const status = getVaultStatus(pool, vault)

      // pro-rata claim on the vault's underlying, not a share price
      const positionShares = shares[index] ?? 0n
      const positionValueDisplay =
        vault && vaultTvlDisplay && vault.totalSupply > 0n
          ? Big(vaultTvlDisplay)
              .times(positionShares.toString())
              .div(vault.totalSupply.toString())
              .toString()
          : undefined
      return {
        id: pool.address,
        pool,
        tokens: [token0, token1],
        feeTier: pool.fee,
        tvlDisplay,
        price,
        vault,
        status,
        vaultTvlDisplay,
        // out of range excluded: ClearingV2 rejects those deposits outright
        canDeposit: status === "empty" || status === "inRange",
        positionShares,
        positionValueDisplay,
      }
    })
  }, [pools, vaults, shares, getAssetWithFallback, getAssetPrice])

  return {
    data,
    isLoading: isLoading || isVaultLoading,
    /** True when a wallet is connected but the share read failed */
    isPositionError: sharesQuery.isError,
    isDisconnected: sharesQuery.isDisconnected,
  }
}

const getVaultStatus = (
  pool: V3PoolBase,
  vault: VaultState | null,
): VaultStatus => {
  if (!vault) return "noVault"

  // until the keeper rebalances once, both bands read zero
  const hasPosition = vault.baseLower !== 0 || vault.baseUpper !== 0
  if (!hasPosition) return "notStarted"

  // deposit is onlyWhitelisted against a single slot; unless it holds the
  // UniProxy, this deposit path is shut
  if (vault.whitelisted.toLowerCase() !== vault.uniProxy.toLowerCase())
    return "depositsClosed"

  // ClearingV2.clearDeposit's test, strict upper bound included. Checked before
  // emptiness, since an empty vault out of range still cannot be joined.
  if (pool.tick < vault.baseLower || pool.tick >= vault.baseUpper)
    return "outOfRange"

  // the bootstrap rebalance sets bands with nothing deployed
  if (vault.totalSupply === 0n) return "empty"

  return "inRange"
}

/** Pool fee in hundredths of a bip, as a percentage */
export const formatFeeTier = (fee: number) => (fee / 10_000).toString()
