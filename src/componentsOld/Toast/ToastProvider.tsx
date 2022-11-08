import { FC, PropsWithChildren, useEffect, useState } from "react"
import { TOAST_CLOSE_TIME } from "utils/constants"
import { ToastViewport } from "components/Toast/ToastViewport"
import { Provider } from "@radix-ui/react-toast"
import { ToastData, useToast } from "state/toasts"
import { Toast } from "components/Toast/Toast"
import { AnimatePresence } from "framer-motion"

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const { toasts, remove } = useToast()
  const [toast, setToast] = useState<ToastData>()

  useEffect(() => {
    if (toasts.length) {
      setToast(toasts[0])
    } else {
      setToast(undefined)
    }
  }, [toasts])

  return (
    <Provider duration={TOAST_CLOSE_TIME}>
      <ToastViewport />
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            variant={toast.variant}
            text={toast.text}
            onClose={() => {
              remove(toast.id)
              toast.onClose?.()
            }}
            index={1}
            count={toasts.length}
            persist={toast.persist}
          >
            {toast.children}
          </Toast>
        )}
      </AnimatePresence>
      {children}
    </Provider>
  )
}
