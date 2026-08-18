import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { usePapiEntries } from "@/hooks/usePapiEntries"
import { OrderData, OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type DcaOrder =
  | {
      readonly type: "Sell"
      readonly value: {
        readonly asset_in: number
        readonly asset_out: number
        readonly amount_in: bigint
      }
    }
  | {
      readonly type: "Buy"
      readonly value: {
        readonly asset_in: number
        readonly asset_out: number
        readonly max_amount_in: bigint
      }
    }

type DcaSchedule = {
  readonly period: number
  readonly total_amount: bigint
  readonly order: DcaOrder
}

// DCA storage is not part of the whitelisted descriptors, so it can only be
// read through the unsafe api - typed here to keep call sites type-safe.
type UnsafeDcaQuery = {
  readonly DCA: {
    readonly Schedules: {
      readonly getValues: (
        keys: ReadonlyArray<readonly [number]>,
        options?: { at?: string },
      ) => Promise<Array<DcaSchedule | undefined>>
    }
    readonly RemainingAmounts: {
      readonly getValues: (
        keys: ReadonlyArray<readonly [number]>,
        options?: { at?: string },
      ) => Promise<Array<bigint | undefined>>
    }
  }
}

export const useChainOrdersData = (options?: {
  readonly enabled?: boolean
}) => {
  const { account } = useAccount()
  const { papiClient, isApiLoaded } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()

  // papi takes the account address as-is, no SS58 conversion
  const address = account?.address ?? ""
  const enabled = (options?.enabled ?? true) && isApiLoaded && !!address

  const { data: entries, isLoading: isEntriesLoading } = usePapiEntries(
    "DCA.ScheduleOwnership",
    [address],
    { enabled },
  )

  const scheduleIds = useMemo(
    () =>
      (entries ?? []).map(({ keyArgs }) => keyArgs[1]).sort((a, b) => b - a),
    [entries],
  )

  const { data, isLoading: isSchedulesLoading } = useQuery({
    queryKey: ["trade", "orders", "chain", address, scheduleIds],
    queryFn: async () => {
      const query = papiClient.getUnsafeApi().query as unknown as UnsafeDcaQuery
      const keys = scheduleIds.map((id) => [id] as const)

      const [schedules, remainingAmounts] = await Promise.all([
        query.DCA.Schedules.getValues(keys, { at: "best" }),
        query.DCA.RemainingAmounts.getValues(keys, { at: "best" }),
      ])

      return scheduleIds.map((scheduleId, index) => ({
        scheduleId,
        schedule: schedules[index],
        remaining: remainingAmounts[index] ?? null,
      }))
    },
    enabled: enabled && !!entries,
    placeholderData: keepPreviousData,
  })

  const orders = useMemo<Array<OrderData>>(
    () =>
      (data ?? []).flatMap<OrderData>(({ scheduleId, schedule, remaining }) => {
        if (!schedule) return []

        const { order } = schedule
        const from = getAssetWithFallback(String(order.value.asset_in))
        const to = getAssetWithFallback(String(order.value.asset_out))

        const singleTradeAmount =
          order.type === "Sell"
            ? order.value.amount_in
            : order.value.max_amount_in

        // a zero total budget means the schedule tops itself up indefinitely
        const isOpenBudget = schedule.total_amount === 0n
        const hasBudget = !isOpenBudget && remaining !== null

        return [
          {
            kind: isOpenBudget ? OrderKind.DcaRolling : OrderKind.Dca,
            scheduleId,
            from,
            fromAmountBudget: isOpenBudget
              ? null
              : scaleHuman(schedule.total_amount, from.decimals),
            // RemainingAmounts only counts down for fixed budgets - for rolling
            // schedules it is a reserve the pallet tops back up
            fromAmountExecuted: hasBudget
              ? scaleHuman(schedule.total_amount - remaining, from.decimals)
              : null,
            fromAmountRemaining: hasBudget
              ? scaleHuman(remaining, from.decimals)
              : null,
            singleTradeSize: scaleHuman(singleTradeAmount, from.decimals),
            to,
            toAmountExecuted: null,
            // terminated schedules drop out of ScheduleOwnership, so anything
            // still in the map is open by construction
            status: DcaScheduleStatus.Created,
            blocksPeriod: String(schedule.period),
            isOpenBudget,
          },
        ]
      }),
    [data, getAssetWithFallback],
  )

  const isLoading =
    (isEntriesLoading || isSchedulesLoading) && orders.length === 0

  return { orders, isLoading }
}
