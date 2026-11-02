import { stakingEventsQuery } from "@galacticcouncil/indexer/neckwork"
import { calculate_accumulated_rps } from "@galacticcouncil/math-staking"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { secondsToMilliseconds } from "date-fns"
import { secondsInYear } from "date-fns/constants"
import { useMemo } from "react"

import { HDXStakingBalanceQuery } from "@/api/balances"
import { bestNumberQuery, useBlockTime } from "@/api/chain"
import { stakingConstsQuery } from "@/api/constants"
import { neckworkClient } from "@/api/neckwork"
import { potBalanceQuery, stakeQuery } from "@/api/staking"
import { useIncreaseStake } from "@/modules/staking/Stake.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

import {
  getAccumulatedRpsFromBlock,
  getLengthOfStaking,
  selectAccumulatedRpsEvents,
  splitAccumulatedRpsEvents,
} from "./DashboardStats.utils"

const BIG_0 = Big(0)
const BIG_10 = Big(10)
const BIG_QUINTILL = BIG_10.pow(18)

export const useStakingSupply = () => {
  const rpc = useRpcProvider()
  const { native } = useAssets()

  const { data: stakeData, isLoading: stakeLoading } = useQuery(stakeQuery(rpc))

  const hdxSupply = "5918000000000000000000"
  const { data: treasuryData } = useQuery(HDXStakingBalanceQuery(rpc))

  const circulatingSupply = Big(hdxSupply).minus(treasuryData?.balance || "0")

  const supplyStaked = toDecimal(
    stakeData?.total_stake.toString() ?? "0",
    native.decimals,
  )

  const supplyStakedPercent =
    stakeData && circulatingSupply.gt(0)
      ? Big(stakeData.total_stake.toString())
          .div(circulatingSupply)
          .mul(100)
          .toString()
      : "0"

  return {
    supplyStaked,
    supplyStakedPercent,
    circulatingSupply: toDecimal(circulatingSupply.toString(), native.decimals),
    isLoading: stakeLoading,
  }
}

const getBlocksPerYear = (blockTimeMs: number) =>
  secondsToMilliseconds(secondsInYear) / blockTimeMs

export const useStakingAPR = (positionId: bigint) => {
  const rpc = useRpcProvider()
  const { data: blockTimeMs, isLoading: blockTimeLoading } = useBlockTime()

  const { data: bestNumber, isLoading: bestNumberLoading } = useQuery(
    bestNumberQuery(rpc),
  )
  const { data: stake, isLoading: stakeLoading } = useQuery(stakeQuery(rpc))

  const fromBlock =
    bestNumber && blockTimeMs
      ? getAccumulatedRpsFromBlock(bestNumber.parachainBlockNumber, blockTimeMs)
      : undefined

  const {
    data: accumulatedRpsUpdated,
    isLoading: accumulatedRpsUpdatedLoading,
  } = useQuery({
    ...stakingEventsQuery(neckworkClient, {
      types: ["AccumulatedRpsUpdated"],
      fromBlock,
      limit: 200,
    }),
    enabled: fromBlock !== undefined,
    placeholderData: keepPreviousData,
    select: selectAccumulatedRpsEvents,
  })

  const { data: initializedEvents, isLoading: initializedEventsLoading } =
    useQuery(
      stakingEventsQuery(neckworkClient, { types: ["StakingInitialized"] }),
    )

  const { data: stakingConsts, isLoading: stakingConstsLoading } = useQuery(
    stakingConstsQuery(rpc),
  )

  const { data: potBalance, isLoading: potBalanceLoading } = useQuery(
    potBalanceQuery(rpc),
  )

  const stakeValue = useIncreaseStake((state) => state.stakeValue)

  const isLoading =
    bestNumberLoading ||
    stakeLoading ||
    accumulatedRpsUpdatedLoading ||
    initializedEventsLoading ||
    stakingConstsLoading ||
    potBalanceLoading ||
    blockTimeLoading

  const stakingAPR = useMemo(() => {
    if (
      !stake ||
      !stakingConsts ||
      !bestNumber ||
      !accumulatedRpsUpdated ||
      !initializedEvents ||
      !potBalance ||
      !blockTimeMs
    ) {
      return undefined
    }

    const blocksPerYear = getBlocksPerYear(blockTimeMs)

    const stakingInitialized = initializedEvents.length
      ? initializedEvents[0]
      : undefined

    const { pot_reserved_balance, accumulated_reward_per_stake, total_stake } =
      stake

    const hasPosition = !!positionId

    const currentBlockNumber = Big(bestNumber.parachainBlockNumber)

    const pendingRewards = Big(potBalance.transferable.toString()).minus(
      pot_reserved_balance.toString(),
    )
    const lengthOfStaking = getLengthOfStaking(blockTimeMs)
    const {
      before: lastAccumulatedRpsUpdated,
      after: filteredAccumulatedRpsUpdatedAfter,
    } = splitAccumulatedRpsEvents(
      accumulatedRpsUpdated,
      currentBlockNumber.minus(lengthOfStaking).toNumber(),
    )

    if (hasPosition) {
      let rpsNow = BIG_0
      let deltaRps = BIG_0
      let deltaBlocks = BIG_0

      if (pendingRewards.eq(0)) {
        rpsNow = Big(accumulated_reward_per_stake.toString())
      } else {
        rpsNow = Big(
          calculate_accumulated_rps(
            accumulated_reward_per_stake.toString(),
            pendingRewards.toString(),
            total_stake.toString(),
          ),
        )
      }

      if (lastAccumulatedRpsUpdated) {
        deltaRps = rpsNow.minus(lastAccumulatedRpsUpdated.accumulatedRps)
        deltaBlocks = currentBlockNumber.minus(
          lastAccumulatedRpsUpdated.blockHeight,
        )
      } else if (stakingInitialized) {
        const blockNumber = stakingInitialized.blockHeight
        deltaRps = rpsNow
        deltaBlocks = currentBlockNumber.minus(blockNumber)
      }

      const rpsAvg = deltaRps.div(deltaBlocks) // per block

      return rpsAvg.div(BIG_QUINTILL).mul(blocksPerYear).mul(100)
    } else {
      const totalToStake = Big((total_stake + (stakeValue ?? 0n)).toString())

      const rpsNow = pendingRewards.div(totalToStake)
      let deltaBlocks = BIG_0
      let rpsAvg = BIG_0

      if (
        filteredAccumulatedRpsUpdatedAfter &&
        filteredAccumulatedRpsUpdatedAfter.length
      ) {
        let deltaRpsAdjusted = BIG_0

        filteredAccumulatedRpsUpdatedAfter.forEach((event, index, events) => {
          let re = BIG_0
          if (index === 0) {
            if (lastAccumulatedRpsUpdated) {
              re = Big(event.accumulatedRps)
                .minus(lastAccumulatedRpsUpdated.accumulatedRps)
                .mul(event.totalStake)
            } else {
              re = Big(event.accumulatedRps).mul(event.totalStake)
            }
          } else {
            re = Big(event.accumulatedRps)
              .minus(events[index - 1]?.accumulatedRps ?? "0")
              .mul(event.totalStake)
          }
          deltaRpsAdjusted = deltaRpsAdjusted.plus(
            re.div(Big(event.totalStake).plus(stakeValue?.toString() ?? "0")),
          )
        })

        deltaRpsAdjusted = deltaRpsAdjusted.plus(rpsNow)

        if (lastAccumulatedRpsUpdated) {
          deltaBlocks = currentBlockNumber.minus(
            lastAccumulatedRpsUpdated.blockHeight,
          )
        } else if (stakingInitialized) {
          deltaBlocks = currentBlockNumber.minus(stakingInitialized.blockHeight)
        }

        const rpsAvg = deltaRpsAdjusted.div(deltaBlocks)

        return rpsAvg.div(BIG_QUINTILL).mul(blocksPerYear).mul(100)
      } else if (stakingInitialized) {
        deltaBlocks = currentBlockNumber.minus(stakingInitialized.blockHeight)

        rpsAvg = rpsNow.div(deltaBlocks)

        return rpsAvg.div(BIG_QUINTILL).mul(blocksPerYear).mul(100)
      }
    }
  }, [
    bestNumber,
    stake,
    stakingConsts,
    accumulatedRpsUpdated,
    initializedEvents,
    positionId,
    potBalance,
    blockTimeMs,
    stakeValue,
  ])

  return { stakingAPR, isLoading }
}
