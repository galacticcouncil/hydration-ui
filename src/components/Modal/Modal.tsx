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
import { useTranslation } from "react-i18next"

type ModalProps = {
  children: ReactNode
  close: () => void
  title: string
  secondaryIcon?: { icon: ReactNode; onClick: () => void; name: string }
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
}) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open}>
      <DialogPortal>
        <Backdrop />
        <ModalWindow onEscapeKeyDown={close}>
          <IconsWrapper>
            {!!secondaryIcon && (
              <IconButton
                icon={secondaryIcon.icon}
                onClick={secondaryIcon.onClick}
                name={secondaryIcon.name}
              />
            )}
            {withoutClose || (
              <CloseButton
                icon={<CrossIcon />}
                onClick={close}
                name={t("modal.closeButton.name")}
              />
            )}
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
}
