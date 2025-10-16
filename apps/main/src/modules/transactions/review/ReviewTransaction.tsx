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
import { TransactionFeePaymentAssetModal } from "@/modules/transactions/TransactionFeePaymentAssetModal"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransaction = () => {
  const {
    open,
    title,
    description,
    onClose,
    isIdle,
    isFeePaymentModalOpen,
    setFeePaymentModalOpen,
  } = useTransaction()

  const { t } = useTranslation()

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
        {isIdle && (
          <>
            <ModalBody scrollable={false} noPadding>
              <ReviewTransactionJsonView />
            </ModalBody>
            <ModalBody scrollable={false}>
              <ReviewTransactionSummary />
            </ModalBody>
          </>
        )}
        {!isIdle && (
          <ModalBody>
            <ReviewTransactionStatus />
          </ModalBody>
        )}

        <ModalFooter justify="space-between">
          <ReviewTransactionFooter />
        </ModalFooter>
      </Modal>
      <Modal open={isFeePaymentModalOpen} onOpenChange={setFeePaymentModalOpen}>
        <TransactionFeePaymentAssetModal
          onSubmitted={() => setFeePaymentModalOpen(false)}
        />
      </Modal>
    </>
  )
}
