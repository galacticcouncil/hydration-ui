import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { ApiPromise } from "@polkadot/api"
import { useBestNumber } from "./chain"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { useAccountStore } from "state/store"
import { BLOCK_TIME, BN_0, ORMLVEST } from "utils/constants"
import { useMemo } from "react"
import { getExpectedBlockDate } from "utils/block"
import { compareAsc } from "date-fns"
import { useRpcProvider } from "providers/rpcProvider"

export const useVestingSchedules = (address: Maybe<AccountId32 | string>) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.vestingSchedules(address),
    address != null ? getVestingSchedules(api, address) : undefinedNoop,
    { enabled: !!address },
  )
}

export const useVestingLockBalance = (address: Maybe<AccountId32 | string>) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.vestingLockBalance(address),
    address != null ? getVestingLockBalance(api, address) : undefinedNoop,
    {
      enabled: !!address,
    },
  )
}

const getVestingLockBalance =
  (api: ApiPromise, address: AccountId32 | string) => async () => {
    const data = await api.query.balances.locks(address)

    const amount = data
      .find((lock) => lock.id.toHuman() === ORMLVEST)
      ?.amount.toBigNumber()

    return amount ?? null
  }

export const getVestingSchedules =
  (api: ApiPromise, address: AccountId32 | string) => async () => {
    return api.query.vesting.vestingSchedules(address)
  }

export type ScheduleType = Awaited<
  ReturnType<ReturnType<typeof getVestingSchedules>>
>[number]

const getScheduleClaimableBalance = (
  schedule: ScheduleType,
  blockNumber: u32,
) => {
  const start = schedule.start.toBigNumber()
  const period = schedule.period.toBigNumber()
  const periodCount = schedule.periodCount.toBigNumber()
  const perPeriod = new BigNumber(schedule.perPeriod.toHex())
  const blockNumberAsBigNumber = blockNumber.toBigNumber()
  const currentPeriod = blockNumberAsBigNumber.minus(start).div(period)

  const numOfPeriods = new BigNumber(
    Math.floor(
      currentPeriod.isGreaterThan(periodCount)
        ? periodCount.toNumber()
        : currentPeriod.toNumber(),
    ),
  )

  const vestedOverPeriods = numOfPeriods.times(
    new BigNumber(schedule.perPeriod.toHex()),
  )

  return {
    originalLock: periodCount.times(perPeriod),
    vestedOverPeriods,
  }
}

const getNextClaimableDate = (
  schedule: ScheduleType,
  blockNumber: BigNumber,
) => {
  const start = schedule.start.toBigNumber()
  const period = schedule.period.toBigNumber() //blocks in a period
  const periodNumber = blockNumber.minus(start).div(period) //167.3 => 0.3
  const pediodNumberDiff = periodNumber.mod(1)

  console.log(
    pediodNumberDiff.toString(),
    pediodNumberDiff.times(period).toString(),
    "pediodNumberDiff",
  )

  const nextClaimingBlock = new BigNumber(
    Math.ceil(blockNumber.plus(pediodNumberDiff.times(period)).toNumber()),
  )
  console.log(
    start.toString(),
    blockNumber.toString(),
    nextClaimingBlock.toString(),
    periodNumber.times(period).toString(),
    getExpectedBlockDate(blockNumber, nextClaimingBlock),
    "next claimable block date",
  )
  return getExpectedBlockDate(blockNumber, nextClaimingBlock)
}

/**
 * Returns first claimable date of all vestings
 **/
export const useNextClaimableDate = () => {
  const { account } = useAccountStore()
  const { data: schedules } = useVestingSchedules(account?.address)
  const bestNumberQuery = useBestNumber()

  const nextClaimableDates = useMemo(() => {
    if (bestNumberQuery.data && schedules) {
      const blockNumber =
        bestNumberQuery.data.relaychainBlockNumber.toBigNumber()
      return schedules.map((schedule) =>
        getNextClaimableDate(schedule, blockNumber),
      )
    }
    return null
  }, [schedules, bestNumberQuery.data])

  const nextClaimableDate = useMemo(() => {
    if (nextClaimableDates) {
      return nextClaimableDates.sort(compareAsc)[0]
    }
    return null
  }, [nextClaimableDates])

  return {
    data: nextClaimableDate,
    isLoading: bestNumberQuery.isLoading,
  }
}

/**
 * Returns Bignumber of total claimable balance
 **/
export const useVestingTotalClaimableBalance = () => {
  const { account } = useAccountStore()
  const vestingSchedulesQuery = useVestingSchedules(account?.address)
  const vestingLockBalanceQuery = useVestingLockBalance(account?.address)
  const bestNumberQuery = useBestNumber()

  const queries = [vestingSchedulesQuery, vestingLockBalanceQuery]
  const isLoading = queries.some((query) => query.isLoading)

  const claimableBalance = useMemo(() => {
    if (
      vestingSchedulesQuery.data &&
      bestNumberQuery.data &&
      vestingLockBalanceQuery.data
    ) {
      const futureLocks = vestingSchedulesQuery.data.reduce((acc, cur) => {
        const claimable = getScheduleClaimableBalance(
          cur,
          bestNumberQuery.data.relaychainBlockNumber,
        )
        return acc.plus(
          claimable.originalLock.minus(claimable.vestedOverPeriods),
        )
      }, BN_0)

      return vestingLockBalanceQuery.data.minus(futureLocks)
    }

    return null
  }, [
    vestingSchedulesQuery.data,
    bestNumberQuery.data,
    vestingLockBalanceQuery.data,
  ])

  return {
    data: claimableBalance,
    isLoading,
  }
}

/**
 * Returns BigNumber of totalVestedAmount
 **/
export const useVestingTotalVestedAmount = () => {
  const { account } = useAccountStore()
  const { data, isLoading } = useVestingSchedules(account?.address)

  const totalVestedAmount = useMemo(() => {
    if (data) {
      return data.reduce((acc, cur) => {
        const perPeriod = new BigNumber(cur.perPeriod.toHex())
        const periodCount = new BigNumber(cur.periodCount.toHex())
        return acc.plus(perPeriod.times(periodCount))
      }, BN_0)
    }

    return null
  }, [data])

  return {
    data: totalVestedAmount,
    isLoading,
  }
}

/**
 * Returns the most future vesting time ending in milliseconds
 **/
export const useVestingScheduleEnd = () => {
  const { account } = useAccountStore()
  const schedulesQuery = useVestingSchedules(account?.address)
  const bestNumberQuery = useBestNumber()

  const queries = [schedulesQuery, bestNumberQuery]
  const isLoading = queries.some((query) => query.isLoading)

  const estimatedEnds = useMemo(() => {
    if (schedulesQuery.data && bestNumberQuery.data) {
      const endings = schedulesQuery.data.map((schedule) => {
        const start = schedule.start.toBigNumber()
        const period = schedule.period.toBigNumber()
        const periodCount = schedule.periodCount.toBigNumber()
        const currentBlock =
          bestNumberQuery.data.relaychainBlockNumber.toBigNumber()

        const end = start.plus(period.times(periodCount))
        const blocksToEnd = end.minus(currentBlock)

        return blocksToEnd.times(BLOCK_TIME.times(1000))
      })
      const mostFuture = BigNumber.max(...endings)
      return mostFuture.isNaN() ? null : mostFuture
    }

    return null
  }, [schedulesQuery, bestNumberQuery])

  return {
    data: estimatedEnds,
    isLoading,
  }
}
