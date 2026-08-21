import createClient, { Middleware } from "openapi-fetch"

import type { paths } from "@/neckwork/__generated__/schema"

export * from "./accounts"
export * from "./dca"
export * from "./fees"
export * from "./money-market"
export * from "./pools"
export * from "./prices"
export * from "./stats"
export * from "./trades"

export const NECKWORK_STALE_TIME = 60000

/**
 * Key prefix for account-scoped neckwork queries. `useNeckworkSync` invalidates
 * this subtree once the indexer has caught up with the user's latest tx.
 */
export const NECKWORK_ACCOUNT_KEY = ["neckwork", "account"] as const

export class NeckworkApiError extends Error {
  readonly status: number
  readonly path: string

  constructor(status: number, path: string, serverMessage?: string) {
    super(
      serverMessage
        ? `Neckwork API ${path} failed with ${status}: ${serverMessage}`
        : `Neckwork API ${path} failed with ${status}`,
    )
    this.name = "NeckworkApiError"
    this.status = status
    this.path = path
  }
}

const readErrorMessage = async (response: Response) => {
  try {
    const body: unknown = await response.clone().json()

    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "object" &&
      body.error !== null &&
      "message" in body.error &&
      typeof body.error.message === "string"
    ) {
      return body.error.message
    }
  } catch {
    // ignore non-JSON error bodies
  }

  return undefined
}

const throwOnErrorResponse: Middleware = {
  onResponse: async ({ response, schemaPath }) => {
    if (response.ok) return

    throw new NeckworkApiError(
      response.status,
      schemaPath,
      await readErrorMessage(response),
    )
  },
}

export const getNeckworkClient = (baseUrl: string) => {
  const client = createClient<paths>({ baseUrl })

  client.use(throwOnErrorResponse)

  return client
}

export type NeckworkClient = ReturnType<typeof getNeckworkClient>
