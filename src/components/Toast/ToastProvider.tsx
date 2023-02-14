import { FC, PropsWithChildren, useEffect, useRef, useState } from "react"
import { ToastViewport } from "components/Toast/ToastViewport"
import { Provider } from "@radix-ui/react-toast"
import { Toast } from "components/Toast/Toast"
import { AnimatePresence } from "framer-motion"

import { ToastSidebar } from "./ToastSidebar"
import { useToastStorage } from "components/AppProviders/ToastContext"

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const { toasts, hide, sidebar, setSidebar } = useToastStorage()

  const activeToasts = toasts.filter((i) => !i.hidden)
  const toast = activeToasts[0]

  const [toastSeenInGroupCount, setToastSeenInGroupCount] = useState(0)

  const currId = toast?.id ?? null
  const lastToastId = useRef<string | null>(currId)
  const lastToastUpdate = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    // ignore quick toast change, user probably hasn't read it within 50ms
    if (Math.abs(now - lastToastUpdate.current) > 50) {
      const prevId = lastToastId.current
      if (prevId !== currId) {
        // if previous toast is null = new session, reset to 0
        // otherwise new toast is in the same "session"
        setToastSeenInGroupCount(prevId == null ? 0 : (counter) => counter + 1)
      }
      lastToastId.current = currId
    }
    lastToastUpdate.current = now
  }, [currId])

  return (
    <>
      <Provider duration={0}>
        <ToastViewport />
        <AnimatePresence>
          {!sidebar && toast && (
            <Toast
              id={toast.id}
              index={1 + toastSeenInGroupCount}
              link={toast.link}
              count={activeToasts.length + toastSeenInGroupCount}
              variant={toast.variant}
              title={toast.title}
              onClick={() => setSidebar(true)}
              onClose={() => hide(toast.id)}
              dateCreated={new Date(toast.dateCreated)}
            />
          )}
        </AnimatePresence>
      </Provider>
      {children}
      <ToastSidebar />
    </>
  )
}
