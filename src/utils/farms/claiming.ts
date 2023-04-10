/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useApiPromise } from "utils/api"
import { BackTransactionAction, ToastMessage, useStore } from "state/store"
import { useMutation } from "@tanstack/react-query"
import { decodeAddress } from "@polkadot/util-crypto"
import { u8aToHex } from "@polkadot/util"
import { DepositNftType, useUserDeposits } from "api/deposits"
import { u32 } from "@polkadot/types"
import { useBestNumber } from "api/chain"
import { useFarms } from "api/farms"
import { getAccountResolver } from "./claiming/accountResolver"
import { useAssetDetailsList } from "api/assetDetails"
import { useSpotPrices } from "api/spotPrice"
import { AccountId32 } from "@polkadot/types/interfaces"
import { MultiCurrencyContainer } from "./claiming/multiCurrency"
import { OmnipoolLiquidityMiningClaimSim } from "./claiming/claimSimulator"
import { createMutableFarmEntries } from "./claiming/mutableFarms"
import { useApiIds } from "api/consts"
import { useAsset } from "api/asset"
import { useAccountAssetBalances } from "api/accountBalances"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import BigNumber from "bignumber.js"
import { BN_0 } from "utils/constants"
import { useQueryReduce } from "utils/helpers"
import { useOmnipoolAssets } from "api/omnipool"

export const useClaimableAmount = (
  pool?: OmnipoolPool,
  depositNft?: DepositNftType,
) => {
  const bestNumberQuery = useBestNumber()

  const allDeposits = useUserDeposits()

  const filteredDeposits = pool
    ? {
        ...allDeposits,
        data:
          allDeposits.data?.filter(
            (deposit) =>
              deposit.deposit.ammPoolId.toString() === pool?.id.toString(),
          ) ?? [],
      }
    : allDeposits

  const assets = useOmnipoolAssets()

  const farms = useFarms(
    pool?.id ? [pool.id] : assets.data?.map((asset) => asset.id) ?? [],
  )

  const apiIds = useApiIds()
  const usd = useAsset(apiIds.data?.usdId)

  const api = useApiPromise()
  const accountResolver = getAccountResolver(api.registry)

  const assetIds = [
    ...new Set(farms.data?.map((i) => i.globalFarm.rewardCurrency.toString())),
  ]

  const assetList = useAssetDetailsList(assetIds)
  const usdSpotPrices = useSpotPrices(assetIds, usd.data?.id)

  const accountAddresses =
    farms.data
      ?.map(
        ({ globalFarm }) =>
          [
            [accountResolver(0), globalFarm.rewardCurrency],
            [accountResolver(globalFarm.id), globalFarm.rewardCurrency],
          ] as [AccountId32, u32][],
      )
      .flat(1) ?? []

  const accountBalances = useAccountAssetBalances(accountAddresses)

  return useQueryReduce(
    [
      bestNumberQuery,
      filteredDeposits,
      farms,
      assetList,
      accountBalances,
      ...usdSpotPrices,
    ] as const,
    (
      bestNumberQuery,
      filteredDeposits,
      farms,
      assetList,
      accountBalances,
      ...usdSpotPrices
    ) => {
      const deposits =
        depositNft != null ? [depositNft] : filteredDeposits ?? []
      const bestNumber = bestNumberQuery

      const multiCurrency = new MultiCurrencyContainer(
        accountAddresses,
        accountBalances ?? [],
      )
      const simulator = new OmnipoolLiquidityMiningClaimSim(
        getAccountResolver(api.registry),
        multiCurrency,
        assetList ?? [],
      )

      const { globalFarms, yieldFarms } = createMutableFarmEntries(farms ?? [])

      return deposits
        ?.map((record) =>
          record.deposit.yieldFarmEntries.map((farmEntry) => {
            const aprEntry = farms?.find(
              (i) =>
                i.globalFarm.id.eq(farmEntry.globalFarmId) &&
                i.yieldFarm.id.eq(farmEntry.yieldFarmId),
            )

            if (!aprEntry) return null

            const reward = simulator.claim_rewards(
              globalFarms[aprEntry.globalFarm.id.toString()],
              yieldFarms[aprEntry.yieldFarm.id.toString()],
              farmEntry,
              bestNumber.relaychainBlockNumber.toBigNumber(),
            )

            const usd = usdSpotPrices.find(
              (spot) => spot?.tokenIn === reward?.assetId,
            )

            if (!reward || !usd) return null

            return {
              usd: reward.value.multipliedBy(usd.spotPrice),
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
          usd: BigNumber
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

            memo.usd = memo.usd.plus(item.usd)

            memo.depositRewards.push({ yieldFarmId, assetId: id, value })
            !memo.assets[id]
              ? (memo.assets[id] = value)
              : (memo.assets[id] = memo.assets[id].plus(value))

            return memo
          },
          { usd: BN_0, assets: {}, depositRewards: [] },
        )
    },
  )
}

export const useClaimAllMutation = (
  poolId?: u32,
  depositNft?: DepositNftType,
  toast?: ToastMessage,
  onClose?: () => void,
) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  const allUserDeposits = useUserDeposits()

  const filteredDeposits = poolId
    ? allUserDeposits.data?.filter(
        (deposit) => deposit.deposit.ammPoolId.toString() === poolId.toString(),
      ) ?? []
    : allUserDeposits.data

  const deposits = depositNft ? [depositNft] : filteredDeposits

  return useMutation(
    async () => {
      const txs =
        deposits
          ?.map((deposit) =>
            deposit.deposit.yieldFarmEntries.map((entry) =>
              api.tx.omnipoolLiquidityMining.claimRewards(
                deposit.id,
                entry.yieldFarmId,
              ),
            ),
          )
          .flat(2) ?? []

      if (txs.length > 0) {
        return await createTransaction(
          { tx: txs.length > 1 ? api.tx.utility.batch(txs) : txs[0] },
          { toast, withBack: true },
        )
      }
    },
    {
      onError: (error) =>
        !(error instanceof BackTransactionAction) && onClose?.(),
    },
  )
}

// @ts-expect-error
window.decodeAddressToBytes = (bsx: string) => u8aToHex(decodeAddress(bsx))
