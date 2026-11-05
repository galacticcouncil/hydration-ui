/** Bounds RPC snapshots across all accounts and chains, including queued refetches. */
export const createDepositRequestLimiter = (concurrency: number) => {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error("Invalid concurrency")
  let active = 0
  const queue: (() => void)[] = []
  return async <T>(task: () => Promise<T>): Promise<T> => {
    await new Promise<void>((resolve) => {
      const start = () => {
        active++
        resolve()
      }
      if (active < concurrency) start()
      else queue.push(start)
    })
    try {
      return await task()
    } finally {
      active--
      queue.shift()?.()
    }
  }
}
