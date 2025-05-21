import { Modal, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import React from "react"

export interface BasicModalProps {
  title: string
  open: boolean
  children: React.ReactNode
  setOpen: (value: boolean) => void
}

export const BasicModal = ({
  title,
  open,
  setOpen,
  children,
}: BasicModalProps) => {
  const handleClose = () => setOpen(false)

  return (
    <Modal open={open} onOpenChange={handleClose} disableInteractOutside>
      <ModalHeader title={title} />
      <ModalBody>{children}</ModalBody>
    </Modal>
  )
}
