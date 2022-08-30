import React from "react"
import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { Box } from "components/Box/Box"
import { SDetailRow } from "./PoolReviewTransaction.styled"
import { Button } from "components/Button/Button"
import { TransactionCode } from "components/TransactionCode/TransactionCode"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const PoolReviewTransaction: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("pools.reviewTransaction.modal.title")}
    >
      <Text color="neutralGray400" fw={400} mt={6}>
        {t("pools.reviewTransaction.modal.joining", {
          name: "BSX",
          amount: "2134",
          symbol1: "BSX",
          symbol2: "aUSD",
        })}
      </Text>
      <Box mt={16}>
        <TransactionCode
          name="Method utility.batchAll(calls)"
          src={{
            calls: [
              {
                args: {
                  asset_out: "0",
                  asset_in: "1",
                  amount: "10 000 000 000 000 000",
                  max_limit: "33 000 000 000 000",
                  discount: false,
                },
                method: "buy",
                section: "xyk",
              },
              {
                args: {
                  asset_in: "1",
                  asset_out: "0",
                  amount: "10 000 000 000 000 000",
                  max_limit: "33 000 000 000 000",
                  discount: false,
                },
                method: "sell",
                section: "xyk",
              },
            ],
          }}
        />
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
          onClick={onClose}
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
