import {
  Modal,
  ModalFooter,
  ModalHeader,
  Stepper,
} from "@galacticcouncil/ui/components"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { isFunction, omit } from "remeda"

import { useRouteBlock } from "@/hooks/useRouteBlock"
import { ReviewTransactionContent } from "@/modules/transactions/review/ReviewTransaction"
import { ReviewTransactionFeePaymentAssetModal } from "@/modules/transactions/review/ReviewTransactionFeePaymentAssetModal"
import { ReviewTransactionFooter } from "@/modules/transactions/review/ReviewTransactionFooter"
import { TransactionProvider } from "@/modules/transactions/TransactionProvider"
import { AnyTransaction } from "@/modules/transactions/types"
import {
  MultiTransaction,
  SingleTransaction,
  TransactionCommon,
  TSuccessResult,
  useTransactionsStore,
} from "@/states/transactions"

type ReviewMultiTransactionProps = {
  transaction: MultiTransaction
}

export const ReviewMultiTransaction: React.FC<ReviewMultiTransactionProps> = ({
  transaction,
}) => {
  const { t } = useTranslation()
  const { cancelTransaction } = useTransactionsStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [transactionResults, setTransactionResults] = useState<
    TSuccessResult[]
  >([])
  const [currentConfig, setCurrentConfig] = useState<SingleTransaction | null>(
    null,
  )
  const [resolvedTx, setResolvedTx] = useState<AnyTransaction | null>(null)
  const [resolvedConfig, setResolvedConfig] =
    useState<TransactionCommon | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLastSubmitted, setIsLastSubmitted] = useState(false)
  const [hasUserClosedModal, setHasUserClosedModal] = useState(false)

  const txArray = transaction.tx
  const currentBaseConfig = txArray[currentIndex]

  const isFirstTransaction = currentIndex === 0
  const isLastTransaction = currentIndex === txArray.length - 1

  useRouteBlock({ when: currentIndex > 0 && !isLastSubmitted })

  useEffect(() => {
    if (!currentBaseConfig) {
      setResolvedTx(null)
      setResolvedConfig(null)
      return
    }

    const tx = currentBaseConfig.tx

    if (isFunction(tx)) {
      const previousResults = transactionResults.slice(0, currentIndex)
      Promise.resolve(tx(previousResults)).then((resolved) => {
        setResolvedTx(resolved.tx)
        setResolvedConfig(omit(resolved, ["tx"]))
      })
    } else {
      setResolvedTx(tx)
      setResolvedConfig(null)
    }
  }, [currentBaseConfig, currentIndex, transactionResults])

  useEffect(() => {
    if (!currentBaseConfig || !resolvedTx) {
      return
    }

    const config: SingleTransaction = {
      ...transaction,
      ...omit(currentBaseConfig, ["tx"]),
      ...(resolvedConfig || {}),
      id: `${transaction.id}-${currentIndex}`,
      tx: resolvedTx,
      onSubmitted: (txHash) => {
        currentBaseConfig.onSubmitted?.(txHash)
        transaction.onSubmitted?.(txHash)
        setIsLoading(true)
        if (isLastTransaction) {
          setIsLastSubmitted(true)
        }
      },
      onSuccess: (event) => {
        setIsLoading(false)
        setTransactionResults((prev) => [...prev, event])
        if (isLastTransaction) {
          transaction.onSuccess?.(event)
          cancelTransaction(transaction.id)
        } else {
          setResolvedTx(null)
          setResolvedConfig(null)
          setCurrentIndex((prev) => prev + 1)
        }
      },
      onError: (message) => {
        setIsLoading(false)
        transaction.onError?.(message)
      },
      onClose: () => {
        cancelTransaction(transaction.id)
        transaction.onClose?.()
      },
    }

    setCurrentConfig(config)
  }, [
    cancelTransaction,
    currentIndex,
    currentBaseConfig,
    resolvedTx,
    transaction,
    txArray.length,
    isLastTransaction,
    resolvedConfig,
  ])

  if (!currentConfig) {
    return null
  }

  const isModalOpen =
    !hasUserClosedModal && currentIndex < txArray.length && !isLastSubmitted

  const isClosable = isFirstTransaction && !isLoading

  const { title, description } = currentConfig

  return (
    <TransactionProvider key={currentConfig.id} transaction={currentConfig}>
      <Modal
        key={currentConfig.id}
        animationDurationMs={
          isFirstTransaction || isLastSubmitted ? undefined : 0
        }
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (!isLoading) cancelTransaction(currentConfig.id)
            setHasUserClosedModal(true)
          }
        }}
        variant="popup"
        disableInteractOutside
        topContent={
          <Stepper
            maxWidth={txArray.length <= 3 ? 300 : undefined}
            steps={txArray.map((tx) => tx.stepTitle ?? "")}
            activeStepIndex={currentIndex}
          />
        }
      >
        <ModalHeader
          closable={isClosable}
          title={title ?? t("transaction.title")}
          description={description ?? t("transaction.description")}
        />
        <ReviewTransactionContent />
        <ModalFooter justify="space-between">
          <ReviewTransactionFooter closable={isClosable} />
        </ModalFooter>
        <ReviewTransactionFeePaymentAssetModal />
      </Modal>
    </TransactionProvider>
  )
}
