import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
} from "@galacticcouncil/ui/components"
import React from "react"

export interface BasicModalProps {
  title: string
  variant?: ModalVariant
  open: boolean
  children: React.ReactNode
  setOpen: (value: boolean) => void
}

export const BasicModal = ({
  title,
  variant,
  open,
  setOpen,
  children,
}: BasicModalProps) => {
  const handleClose = () => setOpen(false)

  return (
    <Modal
      variant={variant}
      open={open}
      onOpenChange={handleClose}
      disableInteractOutside
    >
      <ModalHeader title={title} />
      <ModalBody scrollable={false}>{children}</ModalBody>
    </Modal>
  )
}
