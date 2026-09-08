import Big from "big.js"
import { useMemo } from "react"

import { useVaultShares, useVaultStates, VaultState } from "@/api/gamma/vaults"
import { useV3Pools, V3PoolBase } from "@/api/pools"
import { ENV } from "@/config/env"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export type VaultTable = {
  id: string
  pool: V3PoolBase
  tokens: [TAsset, TAsset]
  feeTier: number
  tvlDisplay: string | undefined
  price: string | undefined
  vault: VaultState | null
  status: VaultStatus
  vaultTvlDisplay: string | undefined
  canDeposit: boolean
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
  const gammaEnabled = ENV.VITE_UNIV3_GAMMA_ENABLED
  const { data: pools, isLoading } = useV3Pools()
  const { getAssetWithFallback } = useAssets()
  const { data: vaults, isLoading: isVaultLoading } = useVaultStates(
    gammaEnabled ? (pools ?? []) : [],
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
    if (!gammaEnabled || !pools?.length) return []

    return pools.map((pool, index) => {
      const vault = vaults[index] ?? null
      const token0 = getAssetWithFallback(pool.token0.toString())
      const token1 = getAssetWithFallback(pool.token1.toString())

      const tvlDisplay = pool.tokens
        .reduce((total, token) => {
          const price = getAssetPrice(token.id.toString())
          if (!price?.isValid) return total

          const meta = getAssetWithFallback(token.id.toString())
          const amount = scaleHuman(token.balance ?? 0n, meta.decimals)

          return total.plus(Big(amount).times(price.price))
        }, Big(0))
        .toString()

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
        canDeposit: status === "empty" || status === "inRange",
        positionShares,
        positionValueDisplay,
      }
    })
  }, [gammaEnabled, pools, vaults, shares, getAssetWithFallback, getAssetPrice])

  return {
    data,
    isLoading: isLoading || isVaultLoading,
    isPositionError: sharesQuery.isError,
    isDisconnected: sharesQuery.isDisconnected,
  }
}

const getVaultStatus = (
  pool: V3PoolBase,
  vault: VaultState | null,
): VaultStatus => {
  if (!vault) return "noVault"

  const hasPosition = vault.baseLower !== 0 || vault.baseUpper !== 0
  if (!hasPosition) return "notStarted"

  if (vault.whitelisted.toLowerCase() !== vault.uniProxy.toLowerCase())
    return "depositsClosed"

  if (pool.tick < vault.baseLower || pool.tick >= vault.baseUpper)
    return "outOfRange"

  if (vault.totalSupply === 0n) return "empty"

  return "inRange"
}

export const feeTierPercent = (fee: number) => fee / 10_000
