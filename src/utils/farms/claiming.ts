/* eslint-disable @typescript-eslint/no-unused-expressions */
import { HYDRA_ADDRESS_PREFIX, useApiPromise } from "utils/api"
import { ToastMessage, useStore } from "state/store"
import { useMutation } from "@tanstack/react-query"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { u8aToHex } from "@polkadot/util"
import { DepositNftType, useAccountDeposits } from "api/deposits"
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

export const useClaimableAmount = (
  pool: OmnipoolPool,
  depositNft?: DepositNftType,
) => {
  const bestNumberQuery = useBestNumber()
  const userDeposits = useAccountDeposits(pool.id)
  const farms = useFarms(pool.id)

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

  useQueryReduce(
    [userDeposits, farms, accountBalances, assetList, bestNumberQuery] as const,
    (userDeposits, farms, accountBalances, assetList, bestNumberQuery) => {
      const deposits = depositNft != null ? [depositNft] : userDeposits ?? []

      for (const record of deposits) {
        for (const farmEntry of record.deposit.yieldFarmEntries) {
          const farm = farms?.find(
            (i) =>
              i.globalFarm.id.eq(farmEntry.globalFarmId) &&
              i.yieldFarm.id.eq(farmEntry.yieldFarmId),
          )

          if (farm == null) continue

          console.log(`
const accountResolver = getAccountResolver(registry)

const multiCurrency = new MultiCurrencyContainer(
  [
    ${accountAddresses
      .map(
        ([address, assetId]) => `[
      new GenericAccountId32(
        registry,
        decodeAddress("${encodeAddress(address, HYDRA_ADDRESS_PREFIX)}"),
      ),
      new U32(registry, "${assetId.toHex()}"),
    ],`,
      )
      .join("\n    ")
      .trimStart()}
  ],
  [
    ${(accountBalances ?? [])
      .map(
        (balances) => `{
      free: new BN("${balances.free.toString()}"),
      reserved: new BN("${balances.reserved.toString()}"),
      frozen: new BN("${balances.frozen.toString()}"),
    },`,
      )
      .join("\n    ")
      .trimStart()}
  ],
)

const entries = createMutableFarmEntries([{
  globalFarm: createStruct<PalletLiquidityMiningGlobalFarmData>(registry, {
    id: [U32, new U32(registry, "${farm.globalFarm.id.toString()}")],
    owner: [
      GenericAccountId,
      decodeAddress("${encodeAddress(
        farm.globalFarm.owner,
        HYDRA_ADDRESS_PREFIX,
      )}"),
    ],
    updatedAt: [U32, new U32(registry, "${farm.globalFarm.updatedAt.toString()}")],
    totalSharesZ: [
      U128,
      new U128(registry, "${farm.globalFarm.totalSharesZ.toString()}"),
    ],
    accumulatedRpz: [
      U128,
      new U128(registry, "${farm.globalFarm.accumulatedRpz.toString()}"),
    ],
    rewardCurrency: [U32, new U32(registry, "${farm.globalFarm.rewardCurrency.toString()}")],
    pendingRewards: [U128, new U128(registry, "${farm.globalFarm.pendingRewards.toString()}")],
    accumulatedPaidRewards: [
      U128,
      new U128(registry, "${farm.globalFarm.accumulatedPaidRewards.toString()}"),
    ],
    yieldPerPeriod: [UInt, new UInt(registry, "${farm.globalFarm.yieldPerPeriod.toString()}")],
    plannedYieldingPeriods: [U32, new U32(registry, "${farm.globalFarm.plannedYieldingPeriods.toString()}")],
    blocksPerPeriod: [U32, new U32(registry, "${farm.globalFarm.blocksPerPeriod.toString()}")],
    incentivizedAsset: [U32, new U32(registry, "${farm.globalFarm.incentivizedAsset.toString()}")],
    maxRewardPerPeriod: [U128, new U128(registry, "${farm.globalFarm.maxRewardPerPeriod.toString()}")],
    minDeposit: [U128, new U128(registry, "${farm.globalFarm.minDeposit.toString()}")],
    liveYieldFarmsCount: [U32, new U32(registry, "${farm.globalFarm.liveYieldFarmsCount.toString()}")],
    totalYieldFarmsCount: [U32, new U32(registry, "${farm.globalFarm.totalYieldFarmsCount.toString()}")],
    priceAdjustment: [
      U128,
      new U128(registry, "${farm.globalFarm.priceAdjustment.toString()}"),
    ],
    state: [
      Enum,
      createEnum<PalletLiquidityMiningFarmState>(registry, {
        Active: [Text, new Text(registry, "Active")],
        Stopped: [Text],
        Terminated: [Text],
      }),
    ],
  }),

  yieldFarm: createStruct<PalletLiquidityMiningYieldFarmData>(registry, {
    id: [U32, new U32(registry, "${farm.yieldFarm.id.toString()}")],
    updatedAt: [U32, new U32(registry, "${farm.yieldFarm.updatedAt.toString()}")],
    totalShares: [
      U128,
      new U128(registry, "${farm.yieldFarm.totalShares.toString()}"),
    ],
    totalValuedShares: [
      U128,
      new U128(registry, "${farm.yieldFarm.totalValuedShares.toString()}"),
    ],
    accumulatedRpvs: [
      U128,
      new U128(registry, "${farm.yieldFarm.accumulatedRpvs.toString()}"),
    ],
    accumulatedRpz: [
      U128,
      new U128(registry, "${farm.yieldFarm.accumulatedRpz.toString()}"),
    ],
    loyaltyCurve: [
      Option,
      new Option(
        registry,
        Struct,
        ${
          farm.yieldFarm.loyaltyCurve.isNone
            ? "undefined"
            : `createStruct<PalletLiquidityMiningLoyaltyCurve>(registry, {
          initialRewardPercentage: [
            U128,
            new U128(registry, "${farm.yieldFarm.loyaltyCurve
              .unwrap()
              .initialRewardPercentage.toString()}"),
          ],
          scaleCoef: [U32, new U32(registry, "${farm.yieldFarm.loyaltyCurve
            .unwrap()
            .scaleCoef.toString()}")],
        })`
        },
      ),
    ],
    multiplier: [
      U128,
      new U128(registry, "${farm.yieldFarm.multiplier.toString()}"),
    ],
    entriesCount: [U64, new U64(registry, "${farm.yieldFarm.entriesCount.toString()}")],
    totalStopped: [U32, new U32(registry, "${farm.yieldFarm.totalStopped.toString()}")],
    leftToDistribute: [U128, new U128(registry, "${farm.yieldFarm.leftToDistribute.toString()}")],
    state: [
      Enum,
      createEnum<PalletLiquidityMiningFarmState>(registry, {
        Active: [Text, new Text(registry, "Active")],
        Stopped: [Text],
        Terminated: [Text],
      }),
    ],
  }),
}])

const simulator = new OmnipoolLiquidityMiningClaimSim(
  accountResolver,
  multiCurrency,
  [
    ${assetList
      .map(
        (asset) => `
    {
      id: "${asset.id.toString()}",
      existentialDeposit: new BigNumber("${asset.existentialDeposit.toString()}"),
    }`,
      )
      .join("\n    ")
      .trimStart()}
  ],
)

const result = simulator.claim_rewards(
  entries.globalFarms["${farmEntry.globalFarmId.toString()}"],
  entries.yieldFarms["${farmEntry.yieldFarmId.toString()}"],
  createStruct<PalletLiquidityMiningYieldFarmEntry>(registry, {
    globalFarmId: [U32, new U32(registry, "${farmEntry.globalFarmId.toString()}")],
    yieldFarmId: [U32, new U32(registry, "${farmEntry.yieldFarmId.toString()}")],
    valuedShares: [
      U128,
      new U128(registry, "${farmEntry.valuedShares.toString()}"),
    ],
    stoppedAtCreation: [U32, new U32(registry, "${farmEntry.stoppedAtCreation.toString()}")],
    accumulatedRpvs: [U128, new U128(registry, "${farmEntry.accumulatedRpvs.toString()}")],
    accumulatedClaimedRewards: [U128, new U128(registry, "${farmEntry.accumulatedClaimedRewards.toString()}")],
    enteredAt: [U32, new U32(registry, "${farmEntry.enteredAt.toString()}")],
    updatedAt: [U32, new U32(registry, "${farmEntry.updatedAt.toString()}")],
  }),
  new BigNumber("${bestNumberQuery.relaychainBlockNumber.toString()}"),
)
`)
        }
      }
    },
  ).data

  return useQueryReduce(
    [bestNumberQuery, userDeposits, farms, assetList, accountBalances] as const,
    (bestNumberQuery, userDeposits, farms, assetList, accountBalances) => {
      const deposits = depositNft != null ? [depositNft] : userDeposits ?? []
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
              (spot) => spot.data?.tokenIn === reward?.assetId,
            )?.data

            if (!reward || !usd) return null
            return {
              usd: reward.value.multipliedBy(usd.spotPrice),
              asset: { id: reward?.assetId, value: reward.value },
            }
          }),
        )
        .flat(2)
        .reduce<{
          usd: BigNumber
          assets: Record<string, BigNumber>
        }>(
          (memo, item) => {
            if (item == null) return memo
            const { id, value } = item.asset
            memo.usd = memo.usd.plus(item.usd)
            !memo.assets[id]
              ? (memo.assets[id] = value)
              : (memo.assets[id] = memo.assets[id].plus(value))

            return memo
          },
          { usd: BN_0, assets: {} },
        )
    },
  )
}

export const useClaimAllMutation = (
  poolId: u32,
  depositNft?: DepositNftType,
  toast?: ToastMessage,
) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const userDeposits = useAccountDeposits(poolId)

  const deposits = depositNft ? [depositNft] : userDeposits.data

  return useMutation(async () => {
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
        { toast },
      )
    }
  })
}

// @ts-expect-error
window.decodeAddressToBytes = (bsx: string) => u8aToHex(decodeAddress(bsx))
