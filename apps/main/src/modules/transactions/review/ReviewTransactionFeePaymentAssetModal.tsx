import { Modal } from "@galacticcouncil/ui/components"

import { TransactionFeePaymentAssetModal } from "@/modules/transactions/TransactionFeePaymentAssetModal"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionFeePaymentAssetModal = () => {
  const { isFeePaymentModalOpen, setFeePaymentModalOpen } = useTransaction()

  return (
    <Modal open={isFeePaymentModalOpen} onOpenChange={setFeePaymentModalOpen}>
      <TransactionFeePaymentAssetModal
        onSubmitted={() => setFeePaymentModalOpen(false)}
      />
    </Modal>
  )
}
