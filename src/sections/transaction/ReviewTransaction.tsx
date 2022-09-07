import React from "react"
import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { Box } from "components/Box/Box"
import { SDetailRow } from "./ReviewTransaction.styled"
import { Button } from "components/Button/Button"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { Transaction } from "../../state/store"
import { getTransactionJSON } from "./ReviewTransaction.utils"

type Props = {
  onCancel: () => void
  onBack?: () => void
} & Transaction

export const ReviewTransaction: React.FC<Props> = ({ onCancel, tx, title }) => {
  const { t } = useTranslation()

  const json = getTransactionJSON(tx)

  return (
    <Modal
      open={true}
      onClose={onCancel}
      title={t("pools.reviewTransaction.modal.title")}
    >
      {title && (
        <Text color="neutralGray400" fw={400} mt={6}>
          {title}
        </Text>
      )}
      <Box mt={16}>
        <TransactionCode name={`Method ${json.name}`} src={json.code} />
      </Box>
      <Box mt={10}>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.cost")}
          </Text>
          <Box flex column align="end">
            <Text color="white">~12 BSX</Text>
            <Text color="primary400" fs={12}>
              2%
            </Text>
          </Box>
        </SDetailRow>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.lifetime")}
          </Text>
          <Text color="white">12/10/2022, 10:00:00</Text>
        </SDetailRow>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.tip")}
          </Text>
          <Text color="white">0.0066 BSX</Text>
        </SDetailRow>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.nonce")}
          </Text>
          <Text color="white">0</Text>
        </SDetailRow>
      </Box>
      <Box mt={24} flex spread>
        <Button
          onClick={onCancel}
          text={t("pools.reviewTransaction.modal.cancel")}
          variant="secondary"
        />
        <Button
          text={t("pools.reviewTransaction.modal.confirmButton")}
          variant="primary"
        />
      </Box>
    </Modal>
  )
}
