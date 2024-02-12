import { useCallback, useState } from "react"
import { toggleLocalStorageClick } from "sections/lending/helpers/toggle-local-storage-click"

export function useLocalStorageBool(
  localStorageName: string,
): [boolean, (value: boolean) => void] {
  const [state, setState] = useState(
    localStorage.getItem(localStorageName) === "true",
  )
  const onChange = useCallback(
    (value: boolean) => {
      toggleLocalStorageClick(!value, () => setState(value), localStorageName)
    },
    [localStorageName],
  )
  return [state, onChange]
}
