/** The server answered with an error status. `code` is the body's `error`. */
export class HbrApiError extends Error {
  readonly status: number
  readonly code: string
  readonly body: unknown

  constructor(status: number, code: string, body: unknown = null) {
    super(`HBR ${status} ${code}`)
    this.name = "HbrApiError"
    this.status = status
    this.code = code
    this.body = body
  }
}

/**
 * No answer was observed (network failure, CORS, a refused redirect). The
 * request may have reached the server: the outcome is unknown, never "failed".
 */
export class HbrNetworkError extends Error {
  constructor() {
    super("HBR request got no answer")
    this.name = "HbrNetworkError"
  }
}

/** A success status whose body did not match the schema; nothing is assumed from it. */
export class HbrResponseError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`HBR ${status} answer did not match its schema`)
    this.name = "HbrResponseError"
    this.status = status
  }
}

export const isHbrApiError = (
  error: unknown,
  status?: number,
  code?: string,
): error is HbrApiError =>
  error instanceof HbrApiError &&
  (status === undefined || error.status === status) &&
  (code === undefined || error.code === code)
