import { createQueryString } from "@galacticcouncil/utils"
import z from "zod/v4"

export * from "./events"
export * from "./transfers"

export class ScanApiError extends Error {
  readonly status: number
  readonly path: string

  constructor(status: number, path: string) {
    super(`Scan API ${path} failed with ${status}`)
    this.name = "ScanApiError"
    this.status = status
    this.path = path
  }
}

export const isScanNotFound = (error: unknown): boolean =>
  error instanceof ScanApiError && error.status === 404

type ScanQuery = Record<string, string | number | undefined>

/**
 * Client of one scan app (transfers, intents), each on its own host. The scan
 * publishes no spec, so each response is checked against a schema here.
 */
export const getScanClient = (baseUrl: string) => {
  const get = async <T extends z.ZodType>(
    path: string,
    schema: T,
    query: ScanQuery = {},
  ): Promise<z.output<T>> => {
    const params = Object.fromEntries(
      Object.entries(query).filter(
        (entry): entry is [string, string | number] =>
          entry[1] !== undefined && entry[1] !== "",
      ),
    )
    // A hung scan fails, so callers fall back rather than wait
    const res = await fetch(`${baseUrl}${path}${createQueryString(params)}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new ScanApiError(res.status, path)

    const body: unknown = await res.json()
    return schema.parse(body)
  }

  return { baseUrl, get }
}

export type ScanClient = ReturnType<typeof getScanClient>
