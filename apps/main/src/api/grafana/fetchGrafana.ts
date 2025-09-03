const grafanaUrl = import.meta.env.VITE_GRAFANA_URL
const grafanaDsn = Number(import.meta.env.VITE_GRAFANA_DSN)

export const fetchGrafana = async (
  sql: string,
  refId: "buckets" | "price",
  signal?: AbortSignal,
) =>
  fetch(grafanaUrl, {
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
          datasourceId: grafanaDsn,
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
