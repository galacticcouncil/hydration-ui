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
import { RemoveScroll } from "react-remove-scroll"
import { Heading } from "components/Typography/Heading/Heading"

const ToastGroupHeader = (props: { children?: ReactNode }) => (
  <Text
    fw={400}
    fs={14}
    css={{ background: `rgba(${theme.rgbColors.primaryA06}, 0.06)` }}
    sx={{ px: 22, py: 10 }}
    color="basic400"
  >
    {props.children}
  </Text>
)

export function ToastSidebar() {
  const store = useToast()
  const onClose = () => store.setSidebar(false)

  const pendingToasts = store.toasts.filter((x) => x.variant === "progress")
  const completedToasts = store.toasts.filter((x) => x.variant !== "progress")

  const { t } = useTranslation()

  return (
    <Dialog open={store.sidebar}>
      <DialogPortal>
        <SWrapper>
          <Backdrop onClick={onClose} />

          <RemoveScroll enabled={store.sidebar}>
            <SDialogContent onEscapeKeyDown={onClose}>
              <Heading fw={500} fs={15} tAlign="left" sx={{ py: 24, pl: 30 }}>
                {t("toast.sidebar.title")}
              </Heading>

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
                        title={
                          <div
                            dangerouslySetInnerHTML={{ __html: toast.title }}
                          />
                        }
                        actions={toast.actions}
                        dateCreated={
                          typeof toast.dateCreated === "string"
                            ? new Date(toast.dateCreated)
                            : toast.dateCreated
                        }
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
                        title={
                          <div
                            dangerouslySetInnerHTML={{ __html: toast.title }}
                          />
                        }
                        actions={toast.actions}
                        dateCreated={
                          typeof toast.dateCreated === "string"
                            ? new Date(toast.dateCreated)
                            : toast.dateCreated
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </SDialogContent>
          </RemoveScroll>
        </SWrapper>
      </DialogPortal>
    </Dialog>
  )
}
