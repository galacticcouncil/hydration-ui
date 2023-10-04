type EmptyFc = () => void
type AnyFc<TArgs extends unknown[]> = (...a: TArgs) => void

const deferred = (ms: number) => {
  let cancel: EmptyFc | undefined
  const promise = new Promise((resolve, reject) => {
    cancel = reject
    setTimeout(resolve, ms)
  })
  return { promise, cancel }
}

type DeferredResult = ReturnType<typeof deferred>

export const debounce = <TArgs extends unknown[]>(
  fc: AnyFc<TArgs>,
  ms: number,
): [AnyFc<TArgs>, DeferredResult["cancel"]] => {
  let t: DeferredResult | undefined
  return [
    async (...args: Parameters<typeof fc>) => {
      try {
        t?.cancel?.()
        t = deferred(ms)
        await t.promise
        fc(...args)
      } catch {
        /* do nothing */
      }
    },
    () => t?.cancel?.(),
  ]
}
