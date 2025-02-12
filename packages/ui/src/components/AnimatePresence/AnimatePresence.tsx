import { ReactNode, useEffect, useState } from "react"

export const AnimatePresence = ({
  open,
  children,
  duration = 200,
}: {
  open: boolean
  children: ReactNode
  duration?: number
}) => {
  const [shouldRender, setShouldRender] = useState(open)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration)
      return () => clearTimeout(timer)
    }
  }, [open, duration])

  return shouldRender ? children : null
}
