import { isGho } from "@galacticcouncil/money-market/utils"
import {
  DOT_ASSET_ID,
  getAssetIdFromAddress,
  GIGA_ASSETS,
  HOLLAR_ASSET_ID,
  isH160Address,
  MONEY_MARKET_STRATEGY_ASSETS,
  safeConvertAnyToH160,
  safeConvertH160toSS58,
} from "@galacticcouncil/utils"
import { chainsMap, clients } from "@galacticcouncil/xc-cfg"
import type { Parachain } from "@galacticcouncil/xc-core"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { omnipoolPositionsQuery } from "@/api/account"
import { allTokenBalancesQuery, tokenBalanceSDKQuery } from "@/api/balances"
import {
  lendingPoolAddressProvider,
  useBorrowIncentivesContract,
  useBorrowPoolDataContract,
  useGhoServiceContract,
  userBorrowSummaryQuery,
} from "@/api/borrow"
import { omnipoolTokensQuery } from "@/api/pools"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import {
  calculateLiquidityOut,
  getLiquidityOutParams,
} from "@/states/liquidity"
import { scaleHuman, toBigInt } from "@/utils/formatting"

type TreasuryAssetBalance = {
  asset: TAsset
  wallet: string
  liquidity: string
  offchain: string
  netSupply?: string
  supply?: string
  debt?: string
  price?: string
}

export type TreasuryCompositionAsset = TreasuryAssetBalance & {
  price: string
  totalBalance: string
  totalValueDisplay: string
  assetWalletDisplay: string
  liquidityBalanceDisplay: string
  offchainBalanceDisplay: string
  netSupplyBalanceDisplay: string
  supplyBalanceDisplay: string
  debtBalanceDisplay: string
  share: number
}

export type TreasuryData = {
  totalValueDisplay: string
  totalAssetWalletDisplay: string
  totaLiquidityBalanceDisplay: string
  totalOffchainBalanceDisplay: string
  totalNetSupplyBalanceDisplay: string
  totalSupplyBalanceDisplay: string
  totalDebtBalanceDisplay: string
  assets: {
    primary: TreasuryCompositionAsset[]
    others: TreasuryCompositionAsset[]
  }
}

export type GroupedCompositionAsset = TreasuryCompositionAsset & {
  groupedAssets?: TreasuryCompositionAsset[]
}

// fetch MM, wallet balances, bonds and omnipool liq positions
const TREASURY_WALLET = {
  address: "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB",
  label: "Hydration treasury",
}

// fetch only HOLLAR wallet balance
const HOLLAR_COLLECTOR_TREASURY_WALLET = {
  address: "0x8C0f3b9602374198974d2B2679d14a386f5b108e",
  label: "HOLLAR collector treasury",
}

//fetch MM and wallet balances
const PRIME_LOOPED_POSITION_TREASURY_WALLET = {
  address: "15qyoAjtLwtu7stVJ5qdsj7QJsfaxQEU3ZrihHExzC6hQyHA",
  label: "PRIME looped position",
}

//fetch MM and wallet balances
const MONEY_MARKET_TREASURY_WALLET = {
  address: "0xE52567fF06aCd6CBe7BA94dc777a3126e180B6d9",
  label: "Money market treasury",
}

const TREASURY_ASSETHUB_DOT_ACCOUNTS = [
  {
    address: "13RSNAx31mcP5H5KYf12cP5YChq6JeD8Hi64twhhxKtHqBkg",
    label: "Polkadot Asset Hub staking address",
  },
  {
    address: "14kovW62mmGZBRvbNT1w5J7m9SQskd5JTRTLKZLpkpjmZBJ8",
    label: "Polkadot Asset Hub rewards address",
  },
] as const

const sumBigStrings = (...values: Array<string | null | undefined>) =>
  values.reduce((acc, value) => {
    if (!value) return acc

    try {
      return acc.plus(value)
    } catch {
      return acc
    }
  }, new Big(0))

const getBalanceAccountAddress = (address: string) =>
  isH160Address(address) ? safeConvertH160toSS58(address) : address

const getAssetHubDotBalance = async (address: string) => {
  try {
    const assetHub = chainsMap.get("assethub")

    if (!assetHub) return 0n

    const assetHubClient = new clients.AssethubClient(assetHub as Parachain)
    const {
      data: { free, reserved },
    } = await assetHubClient.api().query.System.Account.getValue(address)

    return free + reserved
  } catch {
    return 0n
  }
}

type WithAssetId = { readonly assetId: string }

const convertBalancesToMap = <T extends WithAssetId>(balances: readonly T[]) =>
  new Map(balances.map((balance) => [balance.assetId, balance]))

export const useTreasuryBalances = () => {
  const {
    tokens,
    stableswap,
    erc20,
    hub,
    getAssetWithFallback,
    getAsset,
    isErc20AToken,
    getRelatedAToken,
  } = useAssets()
  const rpc = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const ghoServiceContract = useGhoServiceContract()
  const incentivesContract = useBorrowIncentivesContract()

  return useQuery({
    queryKey: ["treasuryBalances"],
    queryFn: async () => {
      const hollarAsset = getAssetWithFallback(HOLLAR_ASSET_ID)
      const fetchTreasuryWalletBalances = rpc.queryClient
        .ensureQueryData(allTokenBalancesQuery(rpc, TREASURY_WALLET.address))
        .then(convertBalancesToMap)

      const fetchPrimeLoopedPositionTreasuryBalances = rpc.queryClient
        .ensureQueryData(
          allTokenBalancesQuery(
            rpc,
            getBalanceAccountAddress(
              PRIME_LOOPED_POSITION_TREASURY_WALLET.address,
            ),
          ),
        )
        .then(convertBalancesToMap)

      const fetchMoneyMarketTreasuryBalances = rpc.queryClient
        .ensureQueryData(
          allTokenBalancesQuery(
            rpc,
            getBalanceAccountAddress(MONEY_MARKET_TREASURY_WALLET.address),
          ),
        )
        .then(convertBalancesToMap)

      const fetchHollarCollectorTreasuryBalances =
        rpc.queryClient.ensureQueryData(
          tokenBalanceSDKQuery(
            rpc,
            getBalanceAccountAddress(HOLLAR_COLLECTOR_TREASURY_WALLET.address),
            hollarAsset,
          ),
        )

      const fetchTreasuryOffchainBalances = Promise.all(
        TREASURY_ASSETHUB_DOT_ACCOUNTS.map(
          async (account) => await getAssetHubDotBalance(account.address),
        ),
      )

      const fetchMoneyMarketData = Promise.all(
        [
          TREASURY_WALLET.address,
          PRIME_LOOPED_POSITION_TREASURY_WALLET.address,
          MONEY_MARKET_TREASURY_WALLET.address,
        ].map(async (address) => {
          const data = await rpc.queryClient.ensureQueryData(
            userBorrowSummaryQuery(
              safeConvertAnyToH160(address),
              rpc,
              lendingPoolAddressProvider,
              poolDataContract,
              ghoServiceContract,
              incentivesContract,
            ),
          )

          const hollarBalance = await rpc.queryClient.ensureQueryData(
            tokenBalanceSDKQuery(
              rpc,
              getBalanceAccountAddress(address),
              hollarAsset,
            ),
          )

          return {
            data,
            hollarBalance,
          }
        }),
      )

      const supplyAssetsById = new Map<
        string,
        {
          balance: string
          debt: string
          collateral: string
          asset: TAsset
          price: string
        }
      >()

      const priceIds = new Set<string>()
      let totalHollarBalance = Big(0)

      const assetBalances = await Promise.all([
        rpc.queryClient
          .ensureQueryData(omnipoolTokensQuery(rpc.sdk, rpc.queryClient))
          .then((tokens) => {
            return new Map(tokens.map((token) => [token.id, token]))
          }),
        rpc.queryClient.ensureQueryData(
          omnipoolPositionsQuery(rpc, TREASURY_WALLET.address),
        ),
        fetchTreasuryWalletBalances,
        fetchTreasuryOffchainBalances,
        fetchHollarCollectorTreasuryBalances,
        fetchPrimeLoopedPositionTreasuryBalances,
        fetchMoneyMarketTreasuryBalances,
        fetchMoneyMarketData,
      ]).then(
        ([
          omnipoolTokensData,
          positions,
          treasuryWalletBalances,
          dotHubBalances,
          hollarCollectorTreasuryBalance,
          primeLoopedPositionTreasuryBalances,
          moneyMarketTreasuryBalances,
          moneyMarketData,
        ]) => {
          for (const { data, hollarBalance } of moneyMarketData) {
            let totalSupplyUsd = Big(0)
            let totalBorrowUsd = Big(0)
            const supplyAssets = []

            for (const reserve of data.userReservesData) {
              const isHollar = isGho(reserve.reserve)
              const assetId = isHollar
                ? HOLLAR_ASSET_ID
                : getAssetIdFromAddress(reserve.underlyingAsset)
              const asset = getAsset(assetId)

              if (!asset) continue

              if (isHollar) {
                totalHollarBalance = totalHollarBalance.plus(
                  Big.max(
                    Big(scaleHuman(hollarBalance.total, asset.decimals))
                      .minus(reserve.variableBorrows)
                      .minus(reserve.stableBorrows),
                    0,
                  ),
                )
              }

              if (Big(reserve.underlyingBalanceUSD).gt(0)) {
                const isCollateral = reserve.usageAsCollateralEnabledOnUser

                if (isCollateral) {
                  totalSupplyUsd = totalSupplyUsd.plus(
                    Big(reserve.underlyingBalanceUSD),
                  )
                }

                supplyAssets.push({
                  balance: reserve.underlyingBalance,
                  isCollateral,
                  price: reserve.reserve.priceInUSD,
                  asset,
                })
              }

              const borrowedBalanceUsd = Big(reserve.variableBorrowsUSD).plus(
                Big(reserve.stableBorrowsUSD),
              )

              if (borrowedBalanceUsd.gt(0)) {
                totalBorrowUsd = totalBorrowUsd.plus(borrowedBalanceUsd)
              }
            }

            const supplyRatio = totalSupplyUsd.gt(totalBorrowUsd)
              ? totalSupplyUsd.minus(totalBorrowUsd).div(totalSupplyUsd)
              : Big(0)

            for (const supplyAsset of supplyAssets) {
              let debt = Big(0)
              const collateral = supplyAsset.balance
              let balance = supplyAsset.balance

              if (supplyAsset.isCollateral) {
                balance = Big(collateral).times(supplyRatio).toString()
                debt = Big(collateral).minus(balance)
              }

              const existing = supplyAssetsById.get(supplyAsset.asset.id)
              supplyAssetsById.set(supplyAsset.asset.id, {
                balance: existing
                  ? sumBigStrings(existing.balance, balance).toString()
                  : balance,
                debt: existing
                  ? sumBigStrings(existing.debt, debt.toString()).toString()
                  : debt.toString(),
                collateral: existing
                  ? sumBigStrings(existing.collateral, collateral).toString()
                  : collateral.toString(),
                asset: supplyAsset.asset,
                price: supplyAsset.price,
              })
            }
          }

          const liquidityBalanceByAssetId = positions.reduce((acc, pos) => {
            const omnipoolToken = omnipoolTokensData.get(Number(pos.assetId))
            if (!omnipoolToken) return acc

            const { liquidity, hubLiquidity } = calculateLiquidityOut(
              getLiquidityOutParams(omnipoolToken, pos),
            )

            const meta = getAssetWithFallback(pos.assetId)

            if (isErc20AToken(meta)) {
              const formatedAssetId = GIGA_ASSETS.includes(meta.id)
                ? meta.id
                : meta.underlyingAssetId
              acc.set(
                formatedAssetId,
                (acc.get(formatedAssetId) ?? 0n) + BigInt(liquidity),
              )
            } else {
              acc.set(
                pos.assetId,
                (acc.get(pos.assetId) ?? 0n) + BigInt(liquidity),
              )
            }

            acc.set(hub.id, (acc.get(hub.id) ?? 0n) + BigInt(hubLiquidity))

            return acc
          }, new Map<string, bigint>())

          const dotHubBalance = dotHubBalances.reduce((acc, balance) => {
            return acc + BigInt(balance)
          }, 0n)

          return [...tokens, ...stableswap, ...erc20].reduce<
            TreasuryAssetBalance[]
          >((acc, asset) => {
            const liquidityBalance = liquidityBalanceByAssetId.get(asset.id)
            const isDot = DOT_ASSET_ID === asset.id
            const isHollar = HOLLAR_ASSET_ID === asset.id
            const treasuryWalletBalance =
              treasuryWalletBalances.get(asset.id)?.total ?? 0n
            const hollarBalance = isHollar
              ? toBigInt(totalHollarBalance, asset.decimals) +
                hollarCollectorTreasuryBalance.total
              : 0n
            const primeLoopedPositionTreasuryBalance =
              primeLoopedPositionTreasuryBalances.get(asset.id)?.total ?? 0n
            const moneyMarketTreasuryBalance =
              moneyMarketTreasuryBalances.get(asset.id)?.total ?? 0n

            const walletBalance =
              treasuryWalletBalance +
              hollarBalance +
              primeLoopedPositionTreasuryBalance +
              moneyMarketTreasuryBalance

            const supplyAsset = supplyAssetsById.get(asset.id)

            if (
              !isDot &&
              !liquidityBalance &&
              walletBalance === 0n &&
              !supplyAsset
            ) {
              return acc
            }

            if (!supplyAsset) {
              priceIds.add(asset.id)
            }

            const formatedAsset = MONEY_MARKET_STRATEGY_ASSETS.includes(
              asset.id,
            )
              ? (getRelatedAToken(asset.id) ?? asset)
              : asset

            acc.push({
              asset: formatedAsset,
              wallet: scaleHuman(walletBalance, asset.decimals),
              liquidity: scaleHuman(liquidityBalance ?? 0n, asset.decimals),
              offchain: scaleHuman(isDot ? dotHubBalance : 0n, asset.decimals),
              netSupply: supplyAsset?.balance,
              supply: supplyAsset?.collateral,
              debt: supplyAsset?.debt,
              price: supplyAsset?.price,
            })

            return acc
          }, [])
        },
      )

      return { assetBalances, priceIds }
    },
    enabled: rpc.isApiLoaded && tokens.length > 0,
  })
}

const COMPOSITION_PRIMARY_MIN_VALUE_USD = 600

const getSymbolGroupKey = (item: TreasuryCompositionAsset) =>
  item.asset.symbol.trim().toLowerCase()

const mergeOptionalDecimalStrings = (first?: string, second?: string) => {
  if (!first) return second
  if (!second) return first

  return sumBigStrings(first, second).toString()
}

const mergeGroupedCompositionAsset = (
  current: GroupedCompositionAsset,
  next: TreasuryCompositionAsset,
): GroupedCompositionAsset => {
  const currentValueUsd = Number(current.totalValueDisplay ?? 0)
  const nextValueUsd = Number(next.totalValueDisplay ?? 0)
  const representative = nextValueUsd > currentValueUsd ? next : current
  const totalBalance = sumBigStrings(
    current.totalBalance,
    next.totalBalance,
  ).toString()
  const totalValueDisplay = sumBigStrings(
    current.totalValueDisplay,
    next.totalValueDisplay,
  ).toString()
  const groupedAssets = [...(current.groupedAssets ?? [current]), next].sort(
    (a, b) =>
      Number(b.totalValueDisplay ?? 0) - Number(a.totalValueDisplay ?? 0),
  )

  return {
    ...representative,
    groupedAssets,
    wallet: mergeOptionalDecimalStrings(current.wallet, next.wallet) ?? "",
    liquidity:
      mergeOptionalDecimalStrings(current.liquidity, next.liquidity) ?? "",
    offchain:
      mergeOptionalDecimalStrings(current.offchain, next.offchain) ?? "",
    netSupply: mergeOptionalDecimalStrings(current.netSupply, next.netSupply),
    supply: mergeOptionalDecimalStrings(current.supply, next.supply),
    debt: mergeOptionalDecimalStrings(current.debt, next.debt),
    totalBalance,
    totalValueDisplay,
    share: current.share + next.share,
  }
}

export const useTreasuryStatsData = () => {
  const { data: treasuryBalances, isLoading } = useTreasuryBalances()
  const { getAssetPrice, isLoading: isAssetsPriceLoading } = useAssetsPrice(
    Array.from(treasuryBalances?.priceIds ?? []),
  )

  const data = useMemo<TreasuryData | undefined>(() => {
    if (!treasuryBalances) return undefined

    let totalValueDisplayBig = Big(0)
    let totalAssetWalletDisplay = Big(0)
    let totaLiquidityBalanceDisplay = Big(0)
    let totalOffchainBalanceDisplay = Big(0)
    let totalNetSupplyBalanceDisplay = Big(0)
    let totalSupplyBalanceDisplay = Big(0)
    let totalDebtBalanceDisplay = Big(0)

    const assets: TreasuryCompositionAsset[] = []

    for (const asset of treasuryBalances.assetBalances) {
      let price = asset.price

      if (!price) {
        const assetPrice = getAssetPrice(asset.asset.id)

        if (assetPrice.isValid) {
          price = assetPrice.price
        }
      }
      if (!price) continue

      const totalBalance = sumBigStrings(
        asset.wallet,
        asset.liquidity,
        asset.offchain,
        asset.netSupply,
      ).toString()

      const totalValueDisplay = Big(price).times(totalBalance).toString()

      if (Big(totalValueDisplay).lt(1)) continue
      const assetWalletDisplay = Big(price).times(asset.wallet).toString()
      const liquidityBalanceDisplay = Big(price)
        .times(asset.liquidity)
        .toString()
      const offchainBalanceDisplay = Big(price).times(asset.offchain).toString()
      const netSupplyBalanceDisplay = Big(price)
        .times(asset.netSupply ?? 0)
        .toString()
      const supplyBalanceDisplay = Big(price)
        .times(asset.supply ?? 0)
        .toString()
      const debtBalanceDisplay = Big(price)
        .times(asset.debt ?? 0)
        .toString()

      totalAssetWalletDisplay = totalAssetWalletDisplay.plus(assetWalletDisplay)
      totaLiquidityBalanceDisplay = totaLiquidityBalanceDisplay.plus(
        liquidityBalanceDisplay,
      )
      totalOffchainBalanceDisplay = totalOffchainBalanceDisplay.plus(
        offchainBalanceDisplay,
      )
      totalNetSupplyBalanceDisplay = totalNetSupplyBalanceDisplay.plus(
        netSupplyBalanceDisplay,
      )
      totalSupplyBalanceDisplay =
        totalSupplyBalanceDisplay.plus(supplyBalanceDisplay)
      totalDebtBalanceDisplay = totalDebtBalanceDisplay.plus(debtBalanceDisplay)

      totalValueDisplayBig = totalValueDisplayBig.plus(totalValueDisplay)

      const isSmallWalletBalance = Big(assetWalletDisplay).lt(1)
      assets.push({
        ...asset,
        wallet: isSmallWalletBalance ? "0" : asset.wallet,
        totalBalance,
        price,
        totalValueDisplay,
        assetWalletDisplay: isSmallWalletBalance ? "0" : assetWalletDisplay,
        liquidityBalanceDisplay,
        offchainBalanceDisplay,
        netSupplyBalanceDisplay,
        supplyBalanceDisplay,
        debtBalanceDisplay,
        share: 0,
      })
    }

    const assetsWithShare = Array.from(
      assets
        .map((item) => ({
          ...item,
          share: item.totalValueDisplay
            ? new Big(item.totalValueDisplay)
                .div(totalValueDisplayBig)
                .times(100)
                .toNumber()
            : 0,
        }))
        .reduce((groups, item) => {
          const key = getSymbolGroupKey(item)
          const existing = groups.get(key)

          groups.set(
            key,
            existing ? mergeGroupedCompositionAsset(existing, item) : item,
          )

          return groups
        }, new Map<string, GroupedCompositionAsset>())
        .values(),
    )
      .sort((a, b) => b.share - a.share)
      .reduce<{
        primary: GroupedCompositionAsset[]
        others: GroupedCompositionAsset[]
      }>(
        (acc, item) => {
          if (
            Number(item.totalValueDisplay ?? 0) >=
            COMPOSITION_PRIMARY_MIN_VALUE_USD
          ) {
            acc.primary.push(item)
          } else {
            acc.others.push(item)
          }
          return acc
        },
        { primary: [], others: [] },
      )

    return {
      totalValueDisplay: totalValueDisplayBig.toString(),
      totalAssetWalletDisplay: totalAssetWalletDisplay.toString(),
      totaLiquidityBalanceDisplay: totaLiquidityBalanceDisplay.toString(),
      totalOffchainBalanceDisplay: totalOffchainBalanceDisplay.toString(),
      totalNetSupplyBalanceDisplay: totalNetSupplyBalanceDisplay.toString(),
      totalSupplyBalanceDisplay: totalSupplyBalanceDisplay.toString(),
      totalDebtBalanceDisplay: totalDebtBalanceDisplay.toString(),
      assets: assetsWithShare,
    }
  }, [treasuryBalances, getAssetPrice])

  return { data, isLoading: isLoading || isAssetsPriceLoading }
}
