import { ENV } from "@/config/env"

export const fetchGrafana = async (
  sql: string,
  refId: "buckets" | "price",
  signal?: AbortSignal,
) =>
  fetch(ENV.VITE_GRAFANA_URL, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      queries: [
        {
          refId,
          rawSql: sql,
          format: "table",
          datasourceId: ENV.VITE_GRAFANA_DSN,
        },
      ],
    }),
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(response.status + "\n" + (await response.text()))
      }

      return response.json()
    })
    .then((data) => data.results[refId].frames[0].data.values)
