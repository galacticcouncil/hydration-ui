import createClient, { Middleware } from "openapi-fetch"

import type { paths } from "@/neckwork/__generated__/schema"

export * from "./accounts"
export * from "./pools"
export * from "./stats"

export const NECKWORK_STALE_TIME = 60000

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
    // body was absent or not JSON — fall back to status only
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
