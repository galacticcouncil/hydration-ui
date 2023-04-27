import { Portal, Root } from "@radix-ui/react-dialog"
import { BackdropVariant } from "components/Backdrop/Backdrop"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useMemo } from "react"
import { SContainer, SContent, SOverlay, STopContent } from "./Modal.styled"
import { usePagination } from "./Modal.utils"
import { ModalContentProps, ModalContents } from "./contents/ModalContents"

type Props = {
  open: boolean
  onClose: () => void
  isDrawer?: boolean
  disableClose?: boolean
  disableCloseOutside?: boolean
  backdrop?: BackdropVariant
  topContent?: ReactNode
  children?: ReactNode
} & ModalContentProps

export const Modal = ({
  open,
  onClose,
  isDrawer,
  disableClose,
  disableCloseOutside,
  backdrop = "default",
  topContent,
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
        page={0}
        direction={0}
        onClose={onClose}
        contents={[{ content: children, ...contentProps }]}
      />
    )
  }, [onClose, children, contentProps])

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

export const ModalTest = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const { page, direction, back, next, reset, paginateTo } = usePagination(0)
  const onLast = () => paginateTo(2)

  return (
    <Modal open={open} onClose={onClose} isDrawer>
      <ModalContents
        page={page}
        direction={direction}
        onBack={back}
        onClose={onClose}
        contents={[
          {
            title: "First Title",
            content: (
              <div sx={{ height: 200, bg: "red700", flex: "column" }}>
                <div sx={{ bg: "black", p: 16, m: "auto", width: "100%" }}>
                  <Text sx={{ mb: 16 }}>First Content</Text>
                  <div sx={{ flex: "row", gap: 16 }}>
                    <Button onClick={next}>Next</Button>
                    <Button onClick={onLast}>Last</Button>
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Second Title",
            content: (
              <div sx={{ height: 800, bg: "brightBlue700", flex: "column" }}>
                <div sx={{ bg: "black", p: 16, m: "auto", width: "100%" }}>
                  <Text sx={{ mb: 16 }}>Second Content</Text>
                  <Button onClick={next}>Next</Button>
                </div>
              </div>
            ),
          },
          {
            title: "Third title which is very long",
            headerVariant: "FontOver",
            content: (
              <div sx={{ height: 400, bg: "green600", flex: "column" }}>
                <div sx={{ bg: "black", p: 16, m: "auto", width: "100%" }}>
                  <Text>Third Content</Text>
                  <Button onClick={reset}>First</Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  )
}
