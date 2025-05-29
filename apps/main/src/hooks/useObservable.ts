import { useEffect, useRef } from "react"
import { doNothing } from "remeda"
import { isObservable, Observable } from "rxjs"

type UseObservableOptions<T> = {
  enabled?: boolean
  onUpdate?: (data: T) => void
}

export const useObservable = <T>(
  observable?: Observable<T>,
  options: UseObservableOptions<T> = {
    enabled: true,
    onUpdate: doNothing,
  },
) => {
  const { onUpdate, enabled } = options
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!enabled || !isObservable(observable)) return

    const sub = observable.subscribe(onUpdateRef.current)

    return () => {
      sub.unsubscribe()
    }
  }, [enabled, observable])
}
