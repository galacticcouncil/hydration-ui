/* eslint-disable @typescript-eslint/no-unused-expressions */
import { u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { useMutation } from "@tanstack/react-query"
import { useAccountAssetBalances } from "api/accountBalances"
import { useBestNumber } from "api/chain"
import { useUserDeposits } from "api/deposits"
import { useFarms, useInactiveFarms, useOraclePrices } from "api/farms"
import { useOmnipoolAssets } from "api/omnipool"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { ToastMessage, useStore } from "state/store"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0 } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { getAccountResolver } from "./claiming/accountResolver"
import { OmnipoolLiquidityMiningClaimSim } from "./claiming/claimSimulator"
import { MultiCurrencyContainer } from "./claiming/multiCurrency"
import { createMutableFarmEntries } from "./claiming/mutableFarms"
import { useRpcProvider } from "providers/rpcProvider"

export const useClaimableAmount = (
  poolId?: string,
  depositNft?: TMiningNftPosition,
) => {
  const bestNumberQuery = useBestNumber()

  const allDeposits = useUserDeposits()

  const filteredDeposits = poolId
    ? allDeposits.filter(
        (deposit) => deposit.data.ammPoolId.toString() === poolId,
      )
    : allDeposits

  const omnipoolAssets = useOmnipoolAssets()

  const poolIds = poolId
    ? [poolId]
    : omnipoolAssets.data?.map((asset) => asset.id.toString()) ?? []

  const farms = useFarms(poolIds)

  const inactiveFarms = useInactiveFarms(poolIds)

  const allFarms = useMemo(
    () => [...(farms.data ?? []), ...(inactiveFarms.data ?? [])],
    [farms.data, inactiveFarms.data],
  )

  const { api, assets } = useRpcProvider()
  const accountResolver = getAccountResolver(api.registry)

  const assetIds = [
    ...new Set(allFarms.map((i) => i.globalFarm.rewardCurrency.toString())),
  ]

  const metas = assets.getAssets(assetIds)
  const spotPrices = useDisplayPrices(assetIds)

  const accountAddresses = useMemo(
    () =>
      allFarms
        ?.map(
          ({ globalFarm }) =>
            [
              [accountResolver(0), globalFarm.rewardCurrency],
              [accountResolver(globalFarm.id), globalFarm.rewardCurrency],
            ] as [AccountId32, u32][],
        )
        .flat(1) ?? [],
    [accountResolver, allFarms],
  )

  const oracleAssetIds = allFarms.map((farm) => ({
    rewardCurrency: farm.globalFarm.rewardCurrency.toString(),
    incentivizedAsset: farm.globalFarm.incentivizedAsset.toString(),
  }))

  const oraclePrices = useOraclePrices(oracleAssetIds ?? [])
  const accountBalances = useAccountAssetBalances(accountAddresses)

  const queries = [
    bestNumberQuery,
    farms,
    inactiveFarms,
    accountBalances,
    spotPrices,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !bestNumberQuery.data ||
      !filteredDeposits ||
      !accountBalances.data ||
      !spotPrices.data
    )
      return undefined

    const deposits = depositNft != null ? [depositNft] : filteredDeposits ?? []
    const bestNumber = bestNumberQuery

    const multiCurrency = new MultiCurrencyContainer(
      accountAddresses,
      accountBalances.data ?? [],
    )
    const simulator = new OmnipoolLiquidityMiningClaimSim(
      getAccountResolver(api.registry),
      multiCurrency,
      metas ?? [],
    )

    const { globalFarms, yieldFarms } = createMutableFarmEntries(allFarms ?? [])

    return deposits
      ?.map((record) =>
        record.data.yieldFarmEntries.map((farmEntry) => {
          const aprEntry = allFarms.find(
            (i) =>
              i.globalFarm.id.eq(farmEntry.globalFarmId) &&
              i.yieldFarm.id.eq(farmEntry.yieldFarmId),
          )

          if (!aprEntry) return null

          const oracle = oraclePrices.find(
            (oracle) =>
              oracle.data?.id.incentivizedAsset ===
                aprEntry.globalFarm.incentivizedAsset.toString() &&
              aprEntry.globalFarm.rewardCurrency.toString() ===
                oracle.data.id.rewardCurrency,
          )

          if (!oracle?.data) return null

          const reward = simulator.claim_rewards(
            globalFarms[aprEntry.globalFarm.id.toString()],
            yieldFarms[aprEntry.yieldFarm.id.toString()],
            farmEntry,
            bestNumber.data.relaychainBlockNumber.toBigNumber(),
            oracle.data.oraclePrice,
          )

          const spotPrice = spotPrices.data?.find(
            (spot) => spot?.tokenIn === reward?.assetId,
          )

          const meta = reward?.assetId
            ? assets.getAsset(reward.assetId)
            : undefined

          if (!reward || !spotPrice) return null

          return {
            displayValue: getFloatingPointAmount(
              reward.value.multipliedBy(spotPrice.spotPrice),
              meta?.decimals ?? 12,
            ),
            asset: {
              id: reward?.assetId,
              value: reward.value,
              yieldFarmId: aprEntry.yieldFarm.id.toString(),
            },
          }
        }),
      )
      .flat(2)
      .reduce<{
        displayValue: BigNumber
        depositRewards: Array<{
          assetId: string
          yieldFarmId: string
          value: BigNumber
        }>
        assets: Record<string, BigNumber>
      }>(
        (memo, item) => {
          if (item == null) return memo
          const { id, value, yieldFarmId } = item.asset

          memo.displayValue = memo.displayValue.plus(item.displayValue)

          memo.depositRewards.push({ yieldFarmId, assetId: id, value })
          !memo.assets[id]
            ? (memo.assets[id] = value)
            : (memo.assets[id] = memo.assets[id].plus(value))

          return memo
        },
        { displayValue: BN_0, assets: {}, depositRewards: [] },
      )
  }, [
    accountAddresses,
    accountBalances.data,
    api.registry,
    assets,
    bestNumberQuery,
    depositNft,
    allFarms,
    filteredDeposits,
    metas,
    oraclePrices,
    spotPrices.data,
  ])

  return { data, isLoading }
}

export const useClaimAllMutation = (
  poolId?: string,
  depositNft?: TMiningNftPosition,
  toast?: ToastMessage,
  onClose?: () => void,
  onBack?: () => void,
) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

  const allUserDeposits = useUserDeposits()

  const filteredDeposits = poolId
    ? allUserDeposits.filter(
        (deposit) => deposit.data.ammPoolId.toString() === poolId.toString(),
      ) ?? []
    : allUserDeposits

  const deposits = depositNft ? [depositNft] : filteredDeposits

  return useMutation(async () => {
    const txs =
      deposits
        ?.map((deposit) =>
          deposit.data.yieldFarmEntries.map((entry) =>
            api.tx.omnipoolLiquidityMining.claimRewards(
              deposit.id,
              entry.yieldFarmId,
            ),
          ),
        )
        .flat(2) ?? []

    if (txs.length > 0) {
      return await createTransaction(
        { tx: txs.length > 1 ? api.tx.utility.forceBatch(txs) : txs[0] },
        { toast, onBack, onClose },
      )
    }
  })
}

// @ts-expect-error
window.decodeAddressToBytes = (bsx: string) => u8aToHex(decodeAddress(bsx))
