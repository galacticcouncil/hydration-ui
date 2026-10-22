/**
 * Rejects with a `TimeoutError` (same `name` as `AbortSignal.timeout`) if the
 * promise doesn't settle within `ms`. Only stops waiting — the underlying work
 * is not cancelled.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new DOMException(message ?? "Timed out", "TimeoutError")),
      ms,
    )
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}
