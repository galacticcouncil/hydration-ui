import { BN_0, BN_1, BN_QUINTILL } from "utils/constants"
import BN from "bignumber.js"
import { Option, u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import {
  PalletLiquidityMiningLoyaltyCurve,
  PalletLiquidityMiningYieldFarmEntry,
} from "@polkadot/types/lookup"

import {
  MutableGlobalFarm,
  MutableYieldFarm,
} from "utils/farms/claiming/mutableFarms"

import { MultiCurrencyContainer } from "utils/farms/claiming/multiCurrency"
import * as liquidityMining from "@galacticcouncil/math-liquidity-mining"

export class OmnipoolLiquidityMiningClaimSim {
  protected get_account: (sub: u32 | number) => AccountId32
  protected multiCurrency: MultiCurrencyContainer

  constructor(
    addressResolver: (sub: u32 | number) => AccountId32,
    multiCurrency: MultiCurrencyContainer,
    protected assetRegistry: Array<{
      id: string
      existentialDeposit: BN
    }>,
  ) {
    this.get_account = addressResolver
    this.multiCurrency = multiCurrency
  }

  calculate_rewards_from_pot(
    global_farm: MutableGlobalFarm,
    yield_farm: MutableYieldFarm,
    stake_in_global_farm: BN,
  ) {
    let reward = new BN(
      liquidityMining.calculate_reward(
        yield_farm.accumulatedRpz.toFixed(),
        global_farm.accumulatedRpz.toFixed(),
        stake_in_global_farm.toFixed(),
      )!,
    )

    yield_farm.accumulatedRpz = global_farm.accumulatedRpz

    global_farm.accumulatedPaidRewards =
      global_farm.accumulatedPaidRewards.plus(reward)

    global_farm.pendingRewards = global_farm.pendingRewards.minus(reward)

    return reward
  }

  sync_global_farm(
    global_farm: MutableGlobalFarm,
    current_period: BN,
    oraclePrice: BN,
  ) {
    // Inactive farm should not be updated
    if (!global_farm.state.isActive) {
      return BN_0
    }

    // Farm should be updated only once in the same period.
    if (global_farm.updatedAt.eq(current_period)) {
      return BN_0
    }

    // Nothing to update if there is no stake in the farm.
    if (global_farm.totalSharesZ.isZero()) {
      global_farm.updatedAt = current_period
      return BN_0
    }

    // Number of periods since last farm update.
    let periods_since_last_update = current_period.minus(global_farm.updatedAt)

    let global_farm_account = this.get_account(global_farm.id)
    let reward_currency_ed = this.assetRegistry.find(
      (i) => i.id === global_farm.rewardCurrency.toString(),
    )?.existentialDeposit
    if (reward_currency_ed == null)
      throw new Error("Missing reward currency asset list")

    let global_farm_balance = this.multiCurrency.free_balance(
      global_farm.rewardCurrency,
      global_farm_account,
    )
    // saturating sub
    let left_to_distribute = global_farm_balance.minus(
      BN.min(reward_currency_ed, global_farm_balance),
    )

    let reward = new BN(
      liquidityMining.calculate_global_farm_rewards(
        global_farm.totalSharesZ.toFixed(),
        oraclePrice.toFixed(),
        global_farm.yieldPerPeriod
          .multipliedBy(BN_QUINTILL)
          .integerValue(BN.ROUND_FLOOR)
          .toFixed(),
        global_farm.maxRewardPerPeriod.toFixed(),
        periods_since_last_update.toFixed(),
      ),
    )
    if (left_to_distribute.lt(reward)) reward = left_to_distribute

    if (!reward.isZero()) {
      let pot = this.get_account(0)
      this.multiCurrency.transfer(
        global_farm.rewardCurrency,
        global_farm_account,
        pot,
        reward,
      )

      global_farm.accumulatedRpz = new BN(
        liquidityMining.calculate_accumulated_rps(
          global_farm.accumulatedRpz.toFixed(),
          global_farm.totalSharesZ.toFixed(),
          reward.toFixed(),
        )!,
      )

      global_farm.pendingRewards = global_farm.pendingRewards.plus(reward)
    }

    global_farm.updatedAt = current_period
    return reward
  }

  sync_yield_farm(
    yield_farm: MutableYieldFarm,
    global_farm: MutableGlobalFarm,
    current_period: BN,
  ) {
    if (!yield_farm.state.isActive) {
      return
    }

    if (yield_farm.updatedAt.eq(current_period)) {
      return
    }

    if (yield_farm.totalValuedShares.isZero()) {
      yield_farm.accumulatedRpz = global_farm.accumulatedRpz
      yield_farm.updatedAt = current_period
      return
    }

    const yield_farm_rewards = liquidityMining.calculate_yield_farm_rewards(
      yield_farm.accumulatedRpz.toFixed(),
      global_farm.accumulatedRpz.toFixed(),
      yield_farm.multiplier.toFixed(),
      yield_farm.totalValuedShares.toFixed(),
    )

    const delta_rpvs = liquidityMining.calculate_yield_farm_delta_rpvs(
      yield_farm.accumulatedRpz.toFixed(),
      global_farm.accumulatedRpz.toFixed(),
      yield_farm.multiplier.toFixed(),
      yield_farm.totalValuedShares.toFixed(),
    )

    yield_farm.accumulatedRpz = global_farm.accumulatedRpz

    global_farm.accumulatedPaidRewards =
      global_farm.accumulatedPaidRewards.plus(yield_farm_rewards)

    global_farm.pendingRewards =
      global_farm.pendingRewards.minus(yield_farm_rewards)

    yield_farm.accumulatedRpvs = yield_farm.accumulatedRpvs.plus(delta_rpvs)

    yield_farm.updatedAt = current_period

    yield_farm.leftToDistribute =
      yield_farm.leftToDistribute.plus(yield_farm_rewards)
  }

  get_loyalty_multiplier(
    periods: BN,
    loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>,
  ) {
    let loyaltyMultiplier = BN_1.multipliedBy(BN_QUINTILL)
      .integerValue(BN.ROUND_FLOOR)
      .toString()

    if (!loyaltyCurve.isNone) {
      const { initialRewardPercentage, scaleCoef } = loyaltyCurve.unwrap()

      loyaltyMultiplier = liquidityMining.calculate_loyalty_multiplier(
        periods.toFixed(),
        initialRewardPercentage.toBigNumber().toFixed(),
        scaleCoef.toBigNumber().toFixed(),
      )!
    }
    return loyaltyMultiplier
  }

  claim_rewards(
    global_farm: MutableGlobalFarm,
    yield_farm: MutableYieldFarm,
    farmEntry: PalletLiquidityMiningYieldFarmEntry,
    relaychainBlockNumber: BN,
    oraclePrice: BN,
  ) {
    // if yield farm is terminated, cannot claim
    if (yield_farm.state.isTerminated.valueOf()) {
      return null
    }

    const current_period = relaychainBlockNumber.dividedToIntegerBy(
      global_farm.blocksPerPeriod,
    )

    // avoid double claiming, if possible
    if (farmEntry.updatedAt.toBigNumber().eq(current_period)) {
      return null
    }

    this.sync_global_farm(global_farm, current_period, oraclePrice)
    this.sync_yield_farm(yield_farm, global_farm, current_period)

    let delta_stopped = yield_farm.totalStopped.minus(
      farmEntry.stoppedAtCreation.toBigNumber(),
    )

    let periods = yield_farm.updatedAt
      .minus(farmEntry.enteredAt.toBigNumber())
      .minus(delta_stopped)

    // calculate loyalty multiplier
    let loyaltyMultiplier = this.get_loyalty_multiplier(
      periods,
      yield_farm.loyaltyCurve,
    )

    const reward = new BN(
      liquidityMining.calculate_user_reward(
        farmEntry.accumulatedRpvs.toBigNumber().toFixed(),
        farmEntry.valuedShares.toBigNumber().toFixed(),
        farmEntry.accumulatedClaimedRewards.toBigNumber().toFixed(),
        yield_farm.accumulatedRpvs.toFixed(),
        loyaltyMultiplier,
      ),
    )

    if (!reward.isZero()) {
      yield_farm.leftToDistribute = yield_farm.leftToDistribute.minus(reward)
    }

    return { value: reward, assetId: global_farm.rewardCurrency.toString() }
  }
}
