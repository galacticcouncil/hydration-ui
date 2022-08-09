import { FC, ReactNode } from "react"
import {
  ModalWindow,
  ModalTitle,
  ModalBody,
  IconsWrapper,
  CloseButton,
} from "./Modal.styled"
import { Backdrop } from "components/Backdrop/Backdrop"
import { IconButton } from "components/IconButton/IconButton"
import { CrossIcon } from "assets/icons/CrossIcon"
import { Dialog, DialogDescription, DialogPortal } from "@radix-ui/react-dialog"

type ModalProps = {
  children: ReactNode
  close: () => void
  title: string
  secondaryIcon?: { icon: ReactNode; onClick: () => void }
  withoutClose?: boolean
  open: boolean
}

export const Modal: FC<ModalProps> = ({
  children,
  close,
  title,
  secondaryIcon,
  withoutClose = false,
  open,
}) => (
  <Dialog open={open}>
    <DialogPortal>
      <Backdrop />
      <ModalWindow onEscapeKeyDown={close}>
        <IconsWrapper>
          {!!secondaryIcon && (
            <IconButton
              icon={secondaryIcon.icon}
              onClick={secondaryIcon.onClick}
            />
          )}
          {withoutClose || <CloseButton icon={<CrossIcon />} onClick={close} />}
        </IconsWrapper>
        <ModalBody>
          <ModalTitle>{title}</ModalTitle>
          {children}
        </ModalBody>
        <DialogDescription />
      </ModalWindow>
    </DialogPortal>
  </Dialog>
)
