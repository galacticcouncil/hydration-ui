import { calculate_accumulated_rps } from "@galacticcouncil/math-staking"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { bestNumberQuery } from "@/api/chain"
import { stakingConstsQuery } from "@/api/constants"
import { useIndexerClient } from "@/api/provider"
import { potBalanceQuery } from "@/api/staking"
import {
  accumulatedRpsUpdatedEventsQuery,
  StakeEventAccumulatedRps,
  stakeQuery,
  stakingInitializedEventsQuery,
  subscanHDXSupplyQuery,
} from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_DECIMALS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

// TODO
const stakeValue = "0"

const BIG_0 = Big(0)
const BIG_10 = Big(10)
const BIG_QUINTILL = BIG_10.pow(18)

export const useStakingSupply = () => {
  const rpc = useRpcProvider()

  const { data: stakeData, isLoading: stakeLoading } = useQuery(stakeQuery(rpc))
  const { data: hdxSupply, isLoading: hdxSupplyLoading } = useQuery(
    subscanHDXSupplyQuery,
  )

  const circulatingSupply = Big(hdxSupply?.available_balance || "0")

  const supplyStaked =
    stakeData && circulatingSupply.gt(0)
      ? Big(stakeData.total_stake.toString())
          .div(circulatingSupply)
          .mul(100)
          .toString()
      : "0"

  return {
    supplyStaked,
    circulatingSupply: scaleHuman(
      circulatingSupply.toString(),
      NATIVE_ASSET_DECIMALS,
    ),
    isLoading: hdxSupplyLoading || stakeLoading,
  }
}

const lengthOfStaking = 100800 // min. amount of block for how long we want to calculate APR from = one week
const blocksPerYear = 5256000 // blocks per year with 6s block period

export const useStakingAPR = (positionId: bigint) => {
  const rpc = useRpcProvider()

  const { data: bestNumber, isLoading: bestNumberLoading } = useQuery(
    bestNumberQuery(rpc),
  )
  const { data: stake, isLoading: stakeLoading } = useQuery(stakeQuery(rpc))

  const indexerSdk = useIndexerClient()

  const {
    data: accumulatedRpsUpdated,
    isLoading: accumulatedRpsUpdatedLoading,
  } = useQuery(accumulatedRpsUpdatedEventsQuery(indexerSdk))

  const { data: initializedEvents, isLoading: initializedEventsLoading } =
    useQuery(stakingInitializedEventsQuery(indexerSdk))

  const { data: stakingConsts, isLoading: stakingConstsLoading } = useQuery(
    stakingConstsQuery(rpc),
  )

  const { data: potBalance, isLoading: potBalanceLoading } = useQuery(
    potBalanceQuery(rpc),
  )

  const isLoading =
    bestNumberLoading ||
    stakeLoading ||
    accumulatedRpsUpdatedLoading ||
    initializedEventsLoading ||
    stakingConstsLoading ||
    potBalanceLoading

  const stakingAPR = useMemo(() => {
    if (
      !stake ||
      !stakingConsts ||
      !bestNumber ||
      !accumulatedRpsUpdated ||
      !initializedEvents ||
      !potBalance
    ) {
      return undefined
    }

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

    const {
      filteredAccumulatedRpsUpdatedBefore,
      filteredAccumulatedRpsUpdatedAfter,
    } = accumulatedRpsUpdated.reduce(
      (acc, event) => {
        const isBeforeStaking = currentBlockNumber
          .minus(lengthOfStaking)
          .gt(event.block.height)
        acc[
          isBeforeStaking
            ? "filteredAccumulatedRpsUpdatedBefore"
            : "filteredAccumulatedRpsUpdatedAfter"
        ].push(event)

        return acc
      },
      {
        filteredAccumulatedRpsUpdatedBefore: [] as StakeEventAccumulatedRps[],
        filteredAccumulatedRpsUpdatedAfter: [] as StakeEventAccumulatedRps[],
      },
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

      const lastAccumulatedRpsUpdated =
        filteredAccumulatedRpsUpdatedBefore[
          filteredAccumulatedRpsUpdatedBefore.length - 1
        ] // the newest event

      if (lastAccumulatedRpsUpdated) {
        deltaRps = rpsNow.minus(lastAccumulatedRpsUpdated.args.accumulatedRps)
        deltaBlocks = currentBlockNumber.minus(
          lastAccumulatedRpsUpdated.block.height,
        )
      } else if (stakingInitialized) {
        const blockNumber = stakingInitialized.block.height
        deltaRps = rpsNow
        deltaBlocks = currentBlockNumber.minus(blockNumber)
      }

      const rpsAvg = deltaRps.div(deltaBlocks) // per block

      return rpsAvg.div(BIG_QUINTILL).mul(blocksPerYear).mul(100)
    } else {
      const totalToStake = Big(total_stake.toString()).plus(stakeValue ?? 0)

      const rpsNow = pendingRewards.div(totalToStake)
      let deltaBlocks = BIG_0
      let rpsAvg = BIG_0

      const lastAccumulatedRpsUpdated =
        filteredAccumulatedRpsUpdatedBefore?.[
          filteredAccumulatedRpsUpdatedBefore.length - 1
        ] // the newest event

      if (
        filteredAccumulatedRpsUpdatedAfter &&
        filteredAccumulatedRpsUpdatedAfter.length
      ) {
        let deltaRpsAdjusted = BIG_0

        filteredAccumulatedRpsUpdatedAfter.forEach((event, index, events) => {
          let re = BIG_0
          if (index === 0) {
            if (lastAccumulatedRpsUpdated) {
              re = Big(event.args.accumulatedRps)
                .minus(lastAccumulatedRpsUpdated.args.accumulatedRps)
                .mul(event.args.totalStake)
            } else {
              re = Big(event.args.accumulatedRps).mul(event.args.totalStake)
            }
          } else {
            re = Big(event.args.accumulatedRps)
              .minus(events[index - 1]?.args.accumulatedRps ?? "0")
              .mul(event.args.totalStake)
          }
          deltaRpsAdjusted = deltaRpsAdjusted.plus(
            re.div(Big(event.args.totalStake).plus(stakeValue ?? 0)),
          )
        })

        deltaRpsAdjusted = deltaRpsAdjusted.plus(rpsNow)

        if (lastAccumulatedRpsUpdated) {
          deltaBlocks = currentBlockNumber.minus(
            lastAccumulatedRpsUpdated.block.height,
          )
        } else if (stakingInitialized) {
          deltaBlocks = currentBlockNumber.minus(
            stakingInitialized.block.height,
          )
        }

        const rpsAvg = deltaRpsAdjusted.div(deltaBlocks)

        return rpsAvg.div(BIG_QUINTILL).mul(blocksPerYear).mul(100)
      } else if (stakingInitialized) {
        deltaBlocks = currentBlockNumber.minus(stakingInitialized.block.height)

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
  ])

  return { stakingAPR, isLoading }
}
