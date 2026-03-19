import { Modal } from "@galacticcouncil/ui/components"

import { TransactionFeePaymentAssetModal } from "@/modules/transactions/TransactionFeePaymentAssetModal"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionFeePaymentAssetModal = () => {
  const {
    isFeePaymentModalOpen,
    setFeePaymentModalOpen,
    setIsChangingFeePaymentAsset,
  } = useTransaction()

  return (
    <Modal open={isFeePaymentModalOpen} onOpenChange={setFeePaymentModalOpen}>
      <TransactionFeePaymentAssetModal
        onSubmitted={() => {
          setFeePaymentModalOpen(false)
          setIsChangingFeePaymentAsset(true)
        }}
        onSuccess={() => setIsChangingFeePaymentAsset(false)}
        onError={() => setIsChangingFeePaymentAsset(false)}
      />
    </Modal>
  )
}
