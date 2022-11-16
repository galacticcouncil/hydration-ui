import { FC, PropsWithChildren } from "react"
import { ToastViewport } from "components/Toast/ToastViewport"
import { Provider } from "@radix-ui/react-toast"
import { useToast } from "state/toasts"
import { Toast } from "components/Toast/Toast"
import { AnimatePresence } from "framer-motion"

import { ToastSidebar } from "./ToastSidebar"

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const { toasts, hide } = useToast()

  const activeToasts = toasts.filter((i) => !i.hidden)
  const toast = activeToasts[0]

  return (
    <>
      <Provider duration={0}>
        <ToastViewport />
        <AnimatePresence>
          {toast && (
            <Toast
              key={toast.id}
              variant={toast.variant}
              text={toast.text}
              onClose={() => hide(toast.id)}
              index={1}
              count={activeToasts.length}
              persist={toast.persist}
            >
              {toast.children}
            </Toast>
          )}
        </AnimatePresence>
      </Provider>
      {children}
      <ToastSidebar />
    </>
  )
}
