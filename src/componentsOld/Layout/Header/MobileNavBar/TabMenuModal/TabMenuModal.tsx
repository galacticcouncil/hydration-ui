import { Dialog, DialogPortal } from "@radix-ui/react-dialog"
import { PropsWithChildren } from "react"
import { RemoveScroll } from "react-remove-scroll"
import { SBackdrop, SModalContent } from "./TabMenuModal.styled"

type TabMenuModalProps = {
  open: boolean
  onClose: () => void
}

export const TabMenuModal = ({
  open,
  onClose,
  children,
}: PropsWithChildren<TabMenuModalProps>) => (
  <Dialog open={open}>
    <DialogPortal>
      <SBackdrop>
        <SModalContent onInteractOutside={onClose}>
          <RemoveScroll enabled={open}>{children}</RemoveScroll>
        </SModalContent>
      </SBackdrop>
    </DialogPortal>
  </Dialog>
)
