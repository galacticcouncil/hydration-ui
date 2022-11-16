import { Dialog, DialogPortal } from "@radix-ui/react-dialog"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Backdrop } from "components/Backdrop/Backdrop"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { ReactNode } from "react"
import { SWrapper, SDialogContent, SCloseButton } from "./ToastSidebar.styled"
import { ToastContent } from "./ToastContent"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"

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

  const pendingToasts = store.toasts.filter((x) => x.variant === "loading")
  const completedToasts = store.toasts.filter((x) => x.variant !== "loading")

  const { t } = useTranslation()

  return (
    <Dialog open={store.sidebar}>
      <DialogPortal>
        <SWrapper>
          <Backdrop onClick={onClose} />
          <SDialogContent onEscapeKeyDown={onClose}>
            <Text fw={500} fs={16} tAlign="center" sx={{ py: 24 }}>
              {t("toast.sidebar.title")}
            </Text>

            <SCloseButton
              name={t("toast.close")}
              icon={<CrossIcon />}
              onClick={onClose}
            />

            {pendingToasts.length > 0 && (
              <>
                <ToastGroupHeader>
                  {t("toast.sidebar.pending")}
                </ToastGroupHeader>

                <div sx={{ flex: "column", gap: 6, p: 8 }}>
                  {pendingToasts.map((toast) => (
                    <ToastContent
                      key={toast.id}
                      variant={toast.variant}
                      content={{ text: toast.text, children: toast.children }}
                      dateCreated={toast.dateCreated}
                    />
                  ))}
                </div>
              </>
            )}

            {completedToasts.length > 0 && (
              <>
                <ToastGroupHeader>
                  {t("toast.sidebar.completed")}
                </ToastGroupHeader>

                <div sx={{ flex: "column", gap: 6, p: 8 }}>
                  {completedToasts.map((toast) => (
                    <ToastContent
                      key={toast.id}
                      variant={toast.variant}
                      content={{ text: toast.text, children: toast.children }}
                      dateCreated={toast.dateCreated}
                    />
                  ))}
                </div>
              </>
            )}
          </SDialogContent>
        </SWrapper>
      </DialogPortal>
    </Dialog>
  )
}
