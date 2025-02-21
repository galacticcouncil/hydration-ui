import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { ReviewTransactionFooter } from "@/modules/transactions/review/ReviewTransactionFooter"
import { ReviewTransactionJsonView } from "@/modules/transactions/review/ReviewTransactionJsonView"
import { ReviewTransactionStatus } from "@/modules/transactions/review/ReviewTransactionStatus"
import { ReviewTransactionSummary } from "@/modules/transactions/review/ReviewTransactionSummary"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransaction = () => {
  const { open, title, description, onClose, isIdle } = useTransaction()

  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      variant="popup"
      disableInteractOutside
    >
      <ModalHeader
        title={title ?? t("transaction.title")}
        description={description ?? t("transaction.description")}
      />
      <ModalBody>
        {!isIdle && <ReviewTransactionStatus />}
        {isIdle && (
          <>
            <ReviewTransactionJsonView />
            <ReviewTransactionSummary />
          </>
        )}
      </ModalBody>
      <ModalFooter justify="space-between">
        <ReviewTransactionFooter />
      </ModalFooter>
    </Modal>
  )
}
