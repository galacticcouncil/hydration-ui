import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { ApiPromise } from "@polkadot/api"
import { useBestNumber } from "./chain"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { useAccountStore } from "state/store"
import { BN_0, ORLMVEST } from "utils/constants"
import { useMemo } from "react"
import { useApiPromise } from "utils/api"

export const useVestingSchedules = (address: Maybe<AccountId32 | string>) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.vestingSchedules(address),
    address != null ? getVestingSchedules(api, address) : undefinedNoop,
    { enabled: !!address },
  )
}

export const useVestingLockBalance = (address: Maybe<AccountId32 | string>) => {
  const api = useApiPromise()
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
    return (
      data
        .find((lock) => lock.id.toString() === ORLMVEST)
        ?.amount.toBigNumber() ?? BN_0
    )
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
  const blockNumberAsBigNumber = blockNumber.toBigNumber()

  const numOfPeriods = blockNumberAsBigNumber.minus(start).div(period)
  const vestedOverPeriods = numOfPeriods.times(
    new BigNumber(schedule.perPeriod.toHex()),
  )
  const originalLock = periodCount.times(
    new BigNumber(schedule.perPeriod.toHex()),
  )

  return originalLock.minus(vestedOverPeriods)
}

export const useVestingClaimableBalance = () => {
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
        acc.plus(
          getScheduleClaimableBalance(
            cur,
            bestNumberQuery.data.relaychainBlockNumber,
          ),
        )
        return acc
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

export const useVestingTotalVestedAmount = () => {
  const { account } = useAccountStore()
  const { data, isLoading } = useVestingSchedules(account?.address)

  const totalVestedAmount = useMemo(() => {
    if (data) {
      return data.reduce((acc, cur) => {
        const perPeriod = new BigNumber(cur.perPeriod.toHex())
        const periodCount = new BigNumber(cur.periodCount.toHex())
        acc.plus(perPeriod.times(periodCount))
        return acc
      }, BN_0)
    }

    return null
  }, [data])

  return {
    data: totalVestedAmount,
    isLoading,
  }
}
