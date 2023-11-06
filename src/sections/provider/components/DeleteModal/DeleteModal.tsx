import { Text } from "components/Typography/Text/Text"
import IconRemove from "assets/icons/IconRemove.svg?react"
import { Icon } from "components/Icon/Icon"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { useTranslation } from "react-i18next"
import { SModalContainer, SModalOverlay } from "./DeleteModal.styled"

type DeleteModalProps = {
  onBack: () => void
  onConfirm: () => void
}

export const DeleteModal = ({ onBack, onConfirm }: DeleteModalProps) => {
  const { t } = useTranslation()
  return (
    <SModalOverlay>
      <SModalContainer>
        <Icon size={22} sx={{ color: "white" }} icon={<IconRemove />} />
        <Text fs={24} font="FontOver" tTransform="uppercase">
          {t("rpc.change.modal.removeRpc.title")}
        </Text>
        <Text color="basic400" sx={{ width: 280 }} tAlign="center">
          {t("rpc.change.modal.removeRpc.desc")}
        </Text>
        <Spacer size={36} />
        <div sx={{ flex: "row", gap: 18 }}>
          <Button variant="secondary" sx={{ width: 169 }} onClick={onBack}>
            {t("back")}
          </Button>
          <Button variant="primary" sx={{ width: 212 }} onClick={onConfirm}>
            {t("rpc.change.modal.removeRpc.confirm")}
          </Button>
        </div>
      </SModalContainer>
    </SModalOverlay>
  )
}
