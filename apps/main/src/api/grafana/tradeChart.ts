import { queryOptions } from "@tanstack/react-query"

import { fetchGrafana } from "@/api/grafana/fetchGrafana"
import {
  TradeChartApi,
  TradeChartQueryParams,
  TradeChartRawData,
} from "@/api/grafana/TradeChartApi"

export const tradeChartQuery = (params: TradeChartQueryParams) =>
  queryOptions({
    queryKey: [
      "grafana",
      "tradeChart",
      params.assetInId,
      params.assetOutId,
      params.from,
      params.to,
      params.interval,
    ],
    queryFn: async ({ signal }) => {
      const api = new TradeChartApi()
      const data = (await fetchGrafana(
        api.buildQuery(params),
        "buckets",
        signal,
      )) as TradeChartRawData

      return api.transform(data)
    },
    enabled: !!params.assetInId && !!params.assetOutId,
  })
