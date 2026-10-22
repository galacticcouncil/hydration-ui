import { Observable } from "rxjs"

export const toAsyncIterable = <T>(
  source: Observable<T>,
  signal: AbortSignal,
): AsyncIterable<T> => ({
  async *[Symbol.asyncIterator]() {
    const queue: T[] = []
    let wake: (() => void) | undefined
    let done = false
    let error: unknown

    const stop = () => {
      done = true
      wake?.()
    }

    const subscription = source.subscribe({
      next: (value) => {
        queue.push(value)
        wake?.()
      },
      error: (err) => {
        error = err
        stop()
      },
      complete: stop,
    })

    signal.addEventListener("abort", stop)

    try {
      while (!signal.aborted) {
        if (queue.length) {
          yield queue.shift() as T
        } else if (error !== undefined) {
          throw error
        } else if (done) {
          return
        } else {
          await new Promise<void>((resolve) => (wake = resolve))
        }
      }
    } finally {
      signal.removeEventListener("abort", stop)
      subscription.unsubscribe()
    }
  },
})
