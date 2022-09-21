import { FC, PropsWithChildren, ReactNode } from "react"
import {
  ModalWindow,
  ModalTitle,
  ModalBody,
  IconsWrapper,
  CloseButton,
  ModalContainer,
} from "./Modal.styled"
import { Backdrop } from "components/Backdrop/Backdrop"
import { IconButton } from "components/IconButton/IconButton"
import { CrossIcon } from "assets/icons/CrossIcon"
import { Dialog, DialogDescription, DialogPortal } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { SizeProps } from "utils/styles"

type Props = {
  open: boolean
  onClose: () => void
  title?: string | undefined
  variant?: "default" | "error"
  secondaryIcon?: { icon: ReactNode; onClick: () => void; name: string }
  withoutClose?: boolean
} & Pick<SizeProps, "width">

export const Modal: FC<PropsWithChildren<Props>> = ({
  children,
  onClose,
  title,
  secondaryIcon,
  withoutClose = false,
  open,
  width,
  variant,
}) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open}>
      <DialogPortal>
        <ModalContainer>
          <Backdrop variant={variant} />
          <ModalWindow width={width} onEscapeKeyDown={onClose}>
            <IconsWrapper>
              {!!secondaryIcon && (
                <IconButton
                  icon={secondaryIcon.icon}
                  onClick={secondaryIcon.onClick}
                  name={secondaryIcon.name}
                />
              )}
              {!withoutClose && (
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
        </ModalContainer>
      </DialogPortal>
    </Dialog>
  )
}
