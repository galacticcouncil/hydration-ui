const FEED_TIMEOUT_MS = 10_000
const FEED_MAX_RETRIES = 2

/**
 * A non-2xx answer from a feed. A plain `Error` with a number on it, so an
 * errored query stays structured-cloneable for the IndexedDB persister.
 */
export class FeedHttpError extends Error {
  readonly status: number

  constructor(source: string, status: number) {
    super(`${source} responded with ${status}`)
    this.name = "FeedHttpError"
    this.status = status
  }
}

// The proxy has two error body shapes, so failures are judged by status alone.
export const fetchFeedJson = async (
  url: string,
  source: string,
  signal: AbortSignal,
): Promise<unknown> => {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(FEED_TIMEOUT_MS)]),
  })

  if (!response.ok) {
    throw new FeedHttpError(source, response.status)
  }

  return response.json()
}

export const retryFeedQuery = (failureCount: number, error: Error): boolean =>
  failureCount < FEED_MAX_RETRIES &&
  !(error instanceof FeedHttpError && error.status >= 400 && error.status < 500)
