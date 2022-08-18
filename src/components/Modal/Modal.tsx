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
import { SizeProps } from "common/styles"

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  secondaryIcon?: { icon: ReactNode; onClick: () => void; name: string }
  withoutClose?: boolean
  children: ReactNode
} & Pick<SizeProps, "width">

export const Modal: FC<ModalProps> = ({
  children,
  onClose,
  title,
  secondaryIcon,
  withoutClose = false,
  open,
  width,
}) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open}>
      <DialogPortal>
        <Backdrop />
        <ModalWindow width={width} onEscapeKeyDown={onClose}>
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
                onClick={onClose}
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
