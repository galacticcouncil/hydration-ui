import {
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { createContext, useContext, useState } from "react"
import { useTranslation } from "react-i18next"

import { ReviewTransactionFooter } from "@/modules/transactions/review/ReviewTransactionFooter"
import { ReviewTransactionJsonView } from "@/modules/transactions/review/ReviewTransactionJsonView"
import { ReviewTransactionStatus } from "@/modules/transactions/review/ReviewTransactionStatus"
import { ReviewTransactionSummary } from "@/modules/transactions/review/ReviewTransactionSummary"
import { TransactionFeePaymentAssetModal } from "@/modules/transactions/TransactionFeePaymentAssetModal"
import {
  TransactionProvider,
  useTransaction,
} from "@/modules/transactions/TransactionProvider"
import { Transaction, useTransactionsStore } from "@/states/transactions"

type ModalCtxValue = { open: boolean; setOpen: (open: boolean) => void }
const ModalContext = createContext<ModalCtxValue | null>(null)

export const useModalContext = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error("ModalContext missing")
  return ctx
}

export const ReviewMultipleTransactions = ({
  transactions,
}: {
  transactions: Transaction[]
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const { cancelTransaction } = useTransactionsStore()

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      <Modal
        open={open}
        onOpenChange={setOpen}
        variant="popup"
        disableInteractOutside
        topContent={
          <Flex direction="column" gap={2}>
            Stepper
          </Flex>
        }
      >
        {transactions.map((transaction) => (
          <TransactionProvider key={transaction.id} {...transaction}>
            <TransactionItem />
          </TransactionProvider>
        ))}
      </Modal>
    </ModalContext.Provider>
  )
}

const TransactionItem = () => {
  const { t } = useTranslation("common")

  const {
    title,
    description,
    onClose,
    isIdle,
    isFeePaymentModalOpen,
    setFeePaymentModalOpen,
  } = useTransaction()

  return (
    <>
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

      <Modal open={isFeePaymentModalOpen} onOpenChange={setFeePaymentModalOpen}>
        <TransactionFeePaymentAssetModal
          onSubmitted={() => setFeePaymentModalOpen(false)}
        />
      </Modal>
    </>
  )
}
