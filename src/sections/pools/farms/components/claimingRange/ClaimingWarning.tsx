import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import WarningIcon from "assets/icons/WarningFull.svg?react"

export const ClaimingWarning = ({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void
  onClose: () => void
}) => {
  const { t } = useTranslation()
  return (
    <Modal open title="">
      <div sx={{ flex: "column", gap: 20, align: "center" }}>
        <Icon icon={<WarningIcon />} />
        <Text
          fs={19}
          font="GeistMono"
          color="white"
          tTransform="uppercase"
          tAlign="center"
        >
          <Trans t={t} i18nKey="claimingRange.modal.warning.title" />
        </Text>
        <Text fs={16} color="basic400" tAlign="center">
          <Trans t={t} i18nKey="claimingRange.modal.warning.description" />
        </Text>
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            gap: 20,
            mt: 30,
            width: "100%",
          }}
        >
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="button" onClick={onConfirm}>
            {t("continue")}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
