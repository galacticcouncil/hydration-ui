import { Dialog, DialogPortal, DialogContent } from "@radix-ui/react-dialog"
import { PropsWithChildren } from "react"
import { RemoveScroll } from "react-remove-scroll"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { CloseButton, SModalContent, SBackdrop } from "./TabMenuModal.styled"
import { useTranslation } from "react-i18next"
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion"

type TabMenuModalProps = {
  open: boolean
  onClose: () => void
}

export const TabMenuModal = ({
  open,
  onClose,
  children,
}: PropsWithChildren<TabMenuModalProps>) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open}>
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          {open && (
            <DialogPortal forceMount>
              <SBackdrop
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DialogContent onInteractOutside={onClose} asChild>
                  <SModalContent
                    key="content"
                    initial={{ opacity: 0, x: 200 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 200 }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <CloseButton
                      icon={<CrossIcon />}
                      onClick={onClose}
                      name={t("modal.closeButton.name")}
                    />
                    <RemoveScroll enabled={open}>{children}</RemoveScroll>
                  </SModalContent>
                </DialogContent>
              </SBackdrop>
            </DialogPortal>
          )}
        </AnimatePresence>
      </LazyMotion>
    </Dialog>
  )
}
