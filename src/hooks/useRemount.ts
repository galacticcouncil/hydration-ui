import { useEffect, useState } from "react"
import { usePrevious } from "react-use"

export const useRemount = (trigger: boolean) => {
  const [version, setVersion] = useState(0)
  const prevTriggerValue = usePrevious(trigger)

  const isChanged = !!prevTriggerValue !== trigger

  useEffect(() => {
    if (isChanged) {
      setVersion((version) => version + 1)
    }
  }, [isChanged])

  return version
}
