import { Dialog, DialogPortal } from "@radix-ui/react-dialog"
import { PropsWithChildren } from "react"
import { RemoveScroll } from "react-remove-scroll"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { CloseButton, SBackdrop, SModalContent } from "./TabMenuModal.styled"
import { useTranslation } from "react-i18next"

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
      <DialogPortal>
        <SBackdrop>
          <SModalContent>
            <CloseButton
              icon={<CrossIcon />}
              onClick={onClose}
              name={t("modal.closeButton.name")}
            />
            <RemoveScroll enabled={open}>{children}</RemoveScroll>
          </SModalContent>
        </SBackdrop>
      </DialogPortal>
    </Dialog>
  )
}
