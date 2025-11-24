import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { ReviewTransactionFeePaymentAssetModal } from "@/modules/transactions/review/ReviewTransactionFeePaymentAssetModal"
import { ReviewTransactionFooter } from "@/modules/transactions/review/ReviewTransactionFooter"
import { ReviewTransactionJsonView } from "@/modules/transactions/review/ReviewTransactionJsonView"
import { ReviewTransactionStatus } from "@/modules/transactions/review/ReviewTransactionStatus"
import { ReviewTransactionSummary } from "@/modules/transactions/review/ReviewTransactionSummary"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionContent = () => {
  const { isIdle } = useTransaction()

  if (isIdle) {
    return (
      <>
        <ModalBody scrollable={false} noPadding>
          <ReviewTransactionJsonView />
        </ModalBody>
        <ModalBody scrollable={false}>
          <ReviewTransactionSummary />
        </ModalBody>
      </>
    )
  }

  return (
    <ModalBody>
      <ReviewTransactionStatus />
    </ModalBody>
  )
}

export const ReviewTransaction = () => {
  const { t } = useTranslation()
  const { title, description, open, onClose } = useTransaction()

  return (
    <>
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
        <ReviewTransactionContent />
        <ModalFooter justify="space-between">
          <ReviewTransactionFooter />
        </ModalFooter>
      </Modal>
      <ReviewTransactionFeePaymentAssetModal />
    </>
  )
}
