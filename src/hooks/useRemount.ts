import { useEffect, useState } from "react"
import { usePrevious } from "react-use"

export const useRemount = <T extends string | number | boolean>(
  triggers: T[],
) => {
  const [version, setVersion] = useState(0)
  const prevTriggersValue = usePrevious(triggers)

  const isChanged =
    prevTriggersValue !== undefined
      ? triggers.some((trigger, i) => prevTriggersValue[i] !== trigger)
      : false

  useEffect(() => {
    if (isChanged) {
      setVersion((version) => version + 1)
    }
  }, [isChanged])

  return version
}
