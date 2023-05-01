import { Portal, Root } from "@radix-ui/react-dialog"
import { BackdropVariant } from "components/Backdrop/Backdrop"
import { ReactNode, useMemo } from "react"
import { SContainer, SContent, SOverlay, STopContent } from "./Modal.styled"
import { ModalContentProps, ModalContents } from "./contents/ModalContents"

type Props = {
  open: boolean
  onClose: () => void
  onBack?: () => void
  isDrawer?: boolean
  disableClose?: boolean
  disableCloseOutside?: boolean
  backdrop?: BackdropVariant
  topContent?: ReactNode
  className?: string
  children?: ReactNode
} & ModalContentProps

export const Modal = ({
  open,
  onClose,
  onBack,
  isDrawer,
  disableClose,
  disableCloseOutside,
  backdrop = "default",
  topContent,
  className,
  children,
  ...contentProps
}: Props) => {
  const hasContentProps = Object.values(contentProps).some(
    (val) => val !== undefined,
  )
  const hasTopContent = topContent !== undefined

  const content = useMemo(() => {
    if (!hasContentProps) return children

    return (
      <ModalContents
        className={className}
        page={0}
        direction={0}
        onClose={onClose}
        onBack={onBack}
        forceBack={!!onBack}
        contents={[{ content: children, ...contentProps }]}
      />
    )
  }, [onClose, onBack, className, children, contentProps])

  return (
    <Root open={open}>
      <Portal>
        <SOverlay variant={backdrop} />
        <SContainer
          onEscapeKeyDown={!disableClose ? onClose : undefined}
          onInteractOutside={
            disableClose || disableCloseOutside || hasTopContent
              ? undefined
              : onClose
          }
        >
          <STopContent>{topContent}</STopContent>
          <SContent isDrawer={isDrawer} hasTopContent={hasTopContent}>
            {content}
          </SContent>
        </SContainer>
      </Portal>
    </Root>
  )
}
