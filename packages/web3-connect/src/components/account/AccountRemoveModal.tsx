import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

type Props = {
  readonly align?: "default" | "center"
  readonly onDelete: () => void
  readonly onCancel: () => void
  readonly onBack?: () => void
}

export const AccountRemoveModal: FC<Props> = ({
  align = "default",
  onDelete,
  onCancel,
  onBack,
}) => {
  return (
    <>
      <ModalHeader title="Remove address" onBack={onBack} align={align} />
      <ModalBody sx={{ textAlign: align === "default" ? "left" : "center" }}>
        Are you sure you want to remove this account address?
      </ModalBody>
      <ModalFooter justify="space-between">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onDelete?.()}>
          Yes, remove
        </Button>
      </ModalFooter>
    </>
  )
}
