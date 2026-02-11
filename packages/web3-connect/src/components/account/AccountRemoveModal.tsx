import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
  return (
    <>
      <ModalHeader
        title={t("account.remove.title")}
        onBack={onBack}
        align={align}
      />
      <ModalBody sx={{ textAlign: align === "default" ? "left" : "center" }}>
        {t("account.remove.confirmation")}
      </ModalBody>
      <ModalFooter justify="space-between">
        <Button variant="secondary" onClick={onCancel}>
          {t("account.remove.cancel")}
        </Button>
        <Button variant="primary" onClick={() => onDelete?.()}>
          {t("account.remove.confirm")}
        </Button>
      </ModalFooter>
    </>
  )
}
