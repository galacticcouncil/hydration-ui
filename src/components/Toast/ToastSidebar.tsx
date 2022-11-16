import { Dialog, DialogPortal } from "@radix-ui/react-dialog"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Backdrop } from "components/Backdrop/Backdrop"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { ReactNode } from "react"
import { SWrapper, SDialogContent, SCloseButton } from "./ToastSidebar.styled"
import { ToastContent } from "./ToastContent"
import { useToast } from "state/toasts"

const ToastGroupHeader = (props: { children?: ReactNode }) => (
  <Text
    fw={400}
    fs={14}
    css={{ background: `rgba(${theme.rgbColors.black}, 0.2)` }}
    sx={{ px: 22, py: 10 }}
  >
    {props.children}
  </Text>
)

export function ToastSidebar() {
  const store = useToast()
  const onClose = () => store.setSidebar(false)

  return (
    <Dialog open={store.sidebar}>
      <DialogPortal>
        <SWrapper>
          <Backdrop onClick={onClose} />
          <SDialogContent onEscapeKeyDown={onClose}>
            <Text fw={500} fs={16} tAlign="center" sx={{ py: 24 }}>
              Recent Transactions
            </Text>

            <SCloseButton name="Close" icon={<CrossIcon />} onClick={onClose} />

            <ToastGroupHeader>Pending</ToastGroupHeader>

            <div sx={{ flex: "column", gap: 6, p: 8 }}>
              {store.toasts
                .filter((x) => x.persist)
                .map((toast) => (
                  <ToastContent
                    key={toast.id}
                    variant={toast.variant}
                    content={{ text: toast.text, children: toast.children }}
                  />
                ))}
            </div>

            <ToastGroupHeader>Completed</ToastGroupHeader>

            <div sx={{ flex: "column", gap: 6, p: 8 }}>
              {store.toasts.map((toast) => (
                <ToastContent
                  key={toast.id}
                  variant={toast.variant}
                  content={{ text: toast.text, children: toast.children }}
                />
              ))}
            </div>
          </SDialogContent>
        </SWrapper>
      </DialogPortal>
    </Dialog>
  )
}
