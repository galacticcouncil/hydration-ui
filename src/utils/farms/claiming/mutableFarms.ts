import { BN_QUINTILL } from "utils/constants"
import BN from "bignumber.js"
import { Option, u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import {
  PalletLiquidityMiningFarmState,
  PalletLiquidityMiningGlobalFarmData,
  PalletLiquidityMiningLoyaltyCurve,
  PalletLiquidityMiningYieldFarmData,
} from "@polkadot/types/lookup"

export interface MutableYieldFarm {
  readonly id: u32
  readonly loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>
  readonly state: PalletLiquidityMiningFarmState
  updatedAt: BN
  totalShares: BN
  totalValuedShares: BN
  accumulatedRpvs: BN
  accumulatedRpz: BN
  multiplier: BN
  entriesCount: BN
  leftToDistribute: BN
  totalStopped: BN
}

export interface MutableGlobalFarm {
  readonly id: u32
  readonly incentivizedAsset: u32
  readonly owner: AccountId32
  readonly rewardCurrency: u32
  readonly state: PalletLiquidityMiningFarmState
  updatedAt: BN
  totalSharesZ: BN
  accumulatedRpz: BN
  pendingRewards: BN
  accumulatedPaidRewards: BN
  yieldPerPeriod: BN
  plannedYieldingPeriods: BN
  blocksPerPeriod: BN
  maxRewardPerPeriod: BN
  minDeposit: BN
  liveYieldFarmsCount: BN
  totalYieldFarmsCount: BN
  priceAdjustment: BN
}

export function createMutableFarmEntries(
  farms: Array<{
    globalFarm: PalletLiquidityMiningGlobalFarmData
    yieldFarm: PalletLiquidityMiningYieldFarmData
  }>,
) {
  const yieldFarms: Record<string, MutableYieldFarm> = {}
  const globalFarms: Record<string, MutableGlobalFarm> = {}

  farms.forEach(({ globalFarm, yieldFarm }) => {
    globalFarms[globalFarm.id.toString()] = {
      id: globalFarm.id,
      incentivizedAsset: globalFarm.incentivizedAsset,
      owner: globalFarm.owner,
      rewardCurrency: globalFarm.rewardCurrency,
      state: globalFarm.state,
      // PeriodOf<T>
      updatedAt: globalFarm.updatedAt.toBigNumber(),
      // Balance
      totalSharesZ: globalFarm.totalSharesZ.toBigNumber(),
      // FixedU128
      accumulatedRpz: globalFarm.accumulatedRpz.toBigNumber(),
      // Balance
      pendingRewards: globalFarm.pendingRewards.toBigNumber(),
      // Balance
      accumulatedPaidRewards: globalFarm.accumulatedPaidRewards.toBigNumber(),
      // Perquintill
      yieldPerPeriod: globalFarm.yieldPerPeriod
        .toBigNumber()
        .dividedBy(BN_QUINTILL),
      // PeriodOf<T>
      plannedYieldingPeriods: globalFarm.plannedYieldingPeriods.toBigNumber(),
      // BlockNumberFor<T>
      blocksPerPeriod: globalFarm.blocksPerPeriod.toBigNumber(),
      // Balance
      maxRewardPerPeriod: globalFarm.maxRewardPerPeriod.toBigNumber(),
      // Balance
      minDeposit: globalFarm.minDeposit.toBigNumber(),
      // u32
      liveYieldFarmsCount: globalFarm.liveYieldFarmsCount.toBigNumber(),
      // u32
      totalYieldFarmsCount: globalFarm.totalYieldFarmsCount.toBigNumber(),
      // FixedU128
      priceAdjustment: globalFarm.priceAdjustment.toBigNumber(),
    }

    yieldFarms[yieldFarm.id.toString()] = {
      id: yieldFarm.id,
      // PeriodOf<T>
      updatedAt: yieldFarm.updatedAt.toBigNumber(),
      // Balance
      totalShares: yieldFarm.totalShares.toBigNumber(),
      // Balance
      totalValuedShares: yieldFarm.totalValuedShares.toBigNumber(),
      // FixedU128
      accumulatedRpvs: yieldFarm.accumulatedRpvs.toBigNumber(),
      // FixedU128
      accumulatedRpz: yieldFarm.accumulatedRpz.toBigNumber(),
      // FarmMultiplier
      multiplier: yieldFarm.multiplier.toBigNumber(),
      // u64
      entriesCount: yieldFarm.entriesCount.toBigNumber(),
      // Balance
      leftToDistribute: yieldFarm.leftToDistribute.toBigNumber(),
      // PeriodOf<T>
      totalStopped: yieldFarm.totalStopped.toBigNumber(),
      loyaltyCurve: yieldFarm.loyaltyCurve,
      state: yieldFarm.state,
    }
  })

  return { yieldFarms, globalFarms }
}
