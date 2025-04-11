import { Portal, Root } from "@radix-ui/react-dialog"
import { BackdropVariant } from "components/Backdrop/Backdrop"
import { ReactNode, useMemo, useState } from "react"
import {
  SBottomContent,
  SContainer,
  SContent,
  SModalSection,
  SOverlay,
  STopContent,
} from "./Modal.styled"
import { ModalContentProps, ModalContents } from "./contents/ModalContents"
import { Separator } from "components/Separator/Separator"
import { SxProps } from "jsx/jsx-sx-convert"

type Props = {
  open: boolean
  onClose?: () => void
  onBack?: () => void
  isDrawer?: boolean
  disableClose?: boolean
  disableCloseOutside?: boolean
  backdrop?: BackdropVariant
  topContent?: ReactNode
  bottomContent?: ReactNode
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
  bottomContent,
  className,
  children,
  ...contentProps
}: Props) => {
  const hasContentProps = Object.values(contentProps).some(
    (val) => val !== undefined,
  )

  const [isAnimating, setIsAnimating] = useState(true)

  const hasTopContent = topContent !== undefined

  const content = useMemo(() => {
    if (!hasContentProps) return children

    return (
      <ModalContents
        page={0}
        direction={0}
        onClose={onClose}
        onBack={onBack}
        forceBack={!!onBack}
        contents={[{ content: children, ...contentProps }]}
      />
    )
  }, [hasContentProps, children, onClose, onBack, contentProps])

  return (
    <Root open={open}>
      <Portal>
        <SOverlay
          onClick={(e) => e.stopPropagation()}
          variant={backdrop}
          onAnimationEnd={() => setIsAnimating(false)}
          className={className}
          css={{ overflow: isAnimating ? "hidden" : undefined }}
        >
          <SContainer
            onOpenAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={!disableClose ? onClose : undefined}
            onInteractOutside={
              disableClose || disableCloseOutside || hasTopContent
                ? undefined
                : onClose
            }
          >
            <STopContent>{topContent}</STopContent>
            <SContent
              onClick={(e) => e.stopPropagation()}
              isDrawer={isDrawer}
              hasTopContent={hasTopContent}
              className={!hasContentProps ? className : undefined}
            >
              <SModalSection>{content}</SModalSection>
              {bottomContent && (
                <SBottomContent>{bottomContent}</SBottomContent>
              )}
            </SContent>
          </SContainer>
        </SOverlay>
      </Portal>
    </Root>
  )
}

export const ModalScrollableContent = ({
  content,
  footer,
  className,
}: {
  content: ReactNode
  footer?: ReactNode
  className?: string
}) => {
  return (
    <>
      <div
        className={className}
        css={{
          overflow: "overlay",
          maxHeight: "80%",
          marginRight: "calc(-1 * var(--modal-content-padding) / 2)",
          paddingRight: "calc(var(--modal-content-padding) / 2)",
        }}
      >
        {content}
      </div>
      {footer}
    </>
  )
}

export const ModalHorizontalSeparator = (sx: SxProps) => {
  return (
    <Separator
      sx={sx}
      color="darkBlue401"
      css={{
        marginInline: "calc(-1 * var(--modal-header-padding-x))",
        width: "calc(100% + 2 * var(--modal-header-padding-x))",
      }}
    />
  )
}
