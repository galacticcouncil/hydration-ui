import { log } from "@galacticcouncil/common"

export const logger = {
  ...log.logger,
  table,
}

function table<T extends object>(data: T[]) {
  if (!data.length) return

  try {
    const headers: string[] = Object.keys(data[0])

    const rows = data.map((row) =>
      headers.map((h) => String((row as Record<string, unknown>)[h] ?? "")),
    )

    const colWidths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => r[i].length)),
    )

    const formatRow = (row: string[]) =>
      row
        .map((cell: string, i: number) => cell.padEnd(colWidths[i]))
        .join(" | ")

    logger.debug(formatRow(headers))
    logger.debug(colWidths.map((w) => "-".repeat(w)).join("-|-"))

    rows.forEach((r) => logger.debug(formatRow(r)))
  } catch {
    // ignore error
  }
}
