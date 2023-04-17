import { Portal, Root } from "@radix-ui/react-dialog"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { SContent, SOverlay } from "./Modal.styled"
import { usePagination } from "./Modal.utils"
import { ModalContents } from "./contents/ModalContents"

type Props = { open: boolean; onClose: () => void; children: ReactNode }

export const Modal = ({ open, onClose, children }: Props) => {
  return (
    <Root open={open}>
      <Portal>
        <SOverlay />
        <SContent onEscapeKeyDown={onClose} onInteractOutside={onClose}>
          {children}
        </SContent>
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
  const [{ page, direction }, paginate] = usePagination(0)

  const onBack = () => paginate(-1)
  const onNext = () => paginate(1)
  const onLast = () => paginate(2)
  const onFirst = () => paginate(-2)

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContents
        page={page}
        direction={direction}
        onBack={onBack}
        onClose={onClose}
        contents={[
          {
            title: "First Title",
            content: (
              <div sx={{ height: 200, bg: "red700", flex: "column" }}>
                <div sx={{ bg: "black", p: 16, m: "auto", width: "100%" }}>
                  <Text sx={{ mb: 16 }}>First Content</Text>
                  <div sx={{ flex: "row", gap: 16 }}>
                    <Button onClick={onNext}>Next</Button>
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
                  <Button onClick={onNext}>Next</Button>
                </div>
              </div>
            ),
          },
          {
            title: "Third Title",
            content: (
              <div sx={{ height: 400, bg: "green600", flex: "column" }}>
                <div sx={{ bg: "black", p: 16, m: "auto", width: "100%" }}>
                  <Text>Third Content</Text>
                  <Button onClick={onFirst}>First</Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  )
}
