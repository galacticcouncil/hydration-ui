import { useMutation } from "@tanstack/react-query"
import type { UnparseConfig } from "papaparse"

function downloadBlob(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)

  const pom = document.createElement("a")
  pom.href = url
  pom.setAttribute("download", filename)
  pom.click()
}

type UparseConfigExtended<T extends object> = Omit<UnparseConfig, "columns"> & {
  columns?: { key: keyof T; header?: string }[]
  filename?: string
  filenameDatetime?: boolean
}

export function useCsvDownload<T extends object>(
  data: T[],
  config: UparseConfigExtended<T> = {},
) {
  const { mutate: download } = useMutation(
    async () => {
      const Papa = await import("papaparse")

      const headers =
        config?.columns?.map((column) => column.header ?? "").filter(Boolean) ??
        []

      const columns =
        config?.columns?.map((column) => column.key as string) ?? []

      const header = Papa.unparse(
        { fields: headers, data: [] },
        { header: true },
      )

      const body = Papa.unparse(data, { ...config, columns, header: false })

      return headers.length ? header + body : body
    },
    {
      onSuccess: (csv) => {
        const name = `${config?.filename?.replace(".csv", "") ?? "data"}`
        const datetime = config?.filenameDatetime
          ? `_${new Date().toISOString().slice(0, 10)}`
          : ""

        downloadBlob(csv, `${name}${datetime}.csv`, "text/csv")
      },
    },
  )

  return download
}
