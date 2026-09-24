import { Modal, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"

type Props = {
  readonly open: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: ReactNode
}

/**
 * The dialog every money-market action opens in. The body does not scroll and
 * there is no footer - each form carries its own submit button, so the same
 * form also works inline on a page.
 */
export const ActionModal: FC<Props> = ({ open, onClose, title, children }) => (
  <Modal open={open} onOpenChange={(open) => !open && onClose()}>
    <ModalHeader title={title} />
    <ModalBody scrollable={false}>{children}</ModalBody>
  </Modal>
)
