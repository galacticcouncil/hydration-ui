import WarningStatus from "@galacticcouncil/ui/assets/images/WarningStatus.webp"
import {
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const CancelConfirmationModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) => {
  const { t } = useTranslation(["staking", "common"])

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalHeader title="Confirmation" customTitle={<></>} closable hidden />
      <ModalBody noPadding scrollable={false} sx={{ pb: pxToRem(40) }}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="s"
          width={312}
          m="auto"
        >
          <Image
            src={WarningStatus}
            width={100}
            height={100}
            sx={{ mb: "base" }}
          />
          <Text
            fs="h7"
            fw={500}
            lh={1}
            color={getToken("text.high")}
            font="primary"
            align="center"
          >
            {t("gigaStaking.cancelPendingPosition.confirm.title")}
          </Text>
          <Text
            fs="p5"
            fw={400}
            lh={1}
            color={getToken("text.medium")}
            align="center"
          >
            {t("gigaStaking.cancelPendingPosition.confirm.desc")}
          </Text>
        </Flex>
      </ModalBody>
      <ModalFooter justify="space-between">
        <Button
          variant="secondary"
          size="large"
          onClick={onClose}
          minWidth={120}
        >
          {t("common:cancel")}
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            onConfirm()
            onClose()
          }}
          minWidth={120}
        >
          {t("common:confirm")}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
