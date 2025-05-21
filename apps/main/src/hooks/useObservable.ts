import { useEffect, useRef } from "react"
import { doNothing } from "remeda"
import { isObservable, Observable } from "rxjs"

export const useObservable = <T>(
  observable?: Observable<T>,
  callback: (data: T) => void = doNothing,
) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    if (!isObservable(observable)) return

    const sub = observable.subscribe(callbackRef.current)

    return () => {
      sub.unsubscribe()
    }
  }, [observable])
}
