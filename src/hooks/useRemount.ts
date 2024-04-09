import { useEffect, useState } from "react"

export const useRemount = (trigger: boolean) => {
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    // Logic to unmount component when trigger changes
    return () => {
      setMounted(false)
    }
  }, [trigger])

  useEffect(() => {
    // Logic to remount component when trigger changes
    if (!mounted) {
      setMounted(true)
    }
  }, [mounted])

  return mounted
}
