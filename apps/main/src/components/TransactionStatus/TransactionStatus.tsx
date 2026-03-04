import { Flex } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import {
  TransactionStatusIcon,
  TransactionStatusText,
} from "@/components/TransactionStatus"
import { TxStatus } from "@/modules/transactions/types"

export type TransactionStatusProps = {
  status: Omit<TxStatus, "idle">
  errorActions?: React.ReactNode
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  errorActions,
}) => {
  const { t } = useTranslation(["common"])

  return (
    <Flex direction="column" justify="center" align="center" gap="base" p="xl">
      <TransactionStatusIcon status={status} />
      {status === "submitted" && (
        <TransactionStatusText
          title={t("transaction.status.submitted.title")}
          description={t("transaction.status.submitted.description")}
        />
      )}

      {status === "success" && (
        <TransactionStatusText
          title={t("transaction.status.success.title")}
          description={t("transaction.status.success.description")}
        />
      )}
      {status === "error" && (
        <>
          <TransactionStatusText
            title={t("transaction.status.error.title")}
            description={t("transaction.status.error.description")}
          />
          {errorActions && (
            <Flex gap="base" mt="base">
              {errorActions}
            </Flex>
          )}
        </>
      )}
    </Flex>
  )
}
