import { queryOptions } from "@tanstack/react-query"

import { fetchGrafana } from "@/api/grafana/fetchGrafana"

import dcaAmount from "./dcaAmount.sql?raw"

type GrafanaSumResponse = ReadonlyArray<ReadonlyArray<number | string | null>>

const readSum = (values: GrafanaSumResponse): string => {
  const raw = values?.[0]?.[0]
  return raw === null || raw === undefined ? "0" : raw.toString()
}

const buildAmountQuery = (
  scheduleId: number,
  amountField: "amountIn" | "amountOut",
) =>
  dcaAmount
    .replace("$amountField", amountField)
    .replace("$scheduleId", scheduleId.toString())

export const dcaReceivedQuery = (scheduleId: number) =>
  queryOptions({
    queryKey: ["trade", "orders", "history", "received", scheduleId],
    queryFn: async ({ signal }) => {
      const values = (await fetchGrafana(
        buildAmountQuery(scheduleId, "amountOut"),
        "received",
        signal,
      )) as GrafanaSumResponse

      return readSum(values)
    },
    enabled: !!scheduleId,
  })

export const dcaSpentQuery = (scheduleId: number) =>
  queryOptions({
    queryKey: ["trade", "orders", "history", "spent", scheduleId],
    queryFn: async ({ signal }) => {
      const values = (await fetchGrafana(
        buildAmountQuery(scheduleId, "amountIn"),
        "spent",
        signal,
      )) as GrafanaSumResponse

      return readSum(values)
    },
    enabled: !!scheduleId,
  })
