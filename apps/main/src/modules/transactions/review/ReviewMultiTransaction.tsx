import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stepper,
} from "@galacticcouncil/ui/components"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLatest } from "react-use"
import { isFunction, omit } from "remeda"

import { useRouteBlock } from "@/hooks/useRouteBlock"
import { ReviewTransactionContent } from "@/modules/transactions/review/ReviewTransaction"
import { ReviewTransactionFeePaymentAssetModal } from "@/modules/transactions/review/ReviewTransactionFeePaymentAssetModal"
import { ReviewTransactionFooter } from "@/modules/transactions/review/ReviewTransactionFooter"
import { TransactionProvider } from "@/modules/transactions/TransactionProvider"
import { AnyTransaction } from "@/modules/transactions/types"
import { useToasts } from "@/states/toasts"
import {
  MultiTransaction,
  SingleTransaction,
  TransactionCommon,
  TSuccessResult,
  useTransactionsStore,
} from "@/states/transactions"
import { getErrorMessage } from "@/utils/errors"

type ReviewMultiTransactionProps = {
  transaction: MultiTransaction
}

export const ReviewMultiTransaction: React.FC<ReviewMultiTransactionProps> = ({
  transaction,
}) => {
  const { t } = useTranslation()
  const { cancelTransaction } = useTransactionsStore()
  const toasts = useToasts()
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
  const [isPendingResolution, setIsPendingResolution] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLastSubmitted, setIsLastSubmitted] = useState(false)
  const [isLastError, setIsLastError] = useState(false)
  const [hasUserClosedModal, setHasUserClosedModal] = useState(false)

  // Held in a ref so the resolver effect doesn't re-run — and restart a
  // pending wait — every time one of these identities changes.
  const onResolutionErrorRef = useLatest((message: string) => {
    toasts.error({ title: message })
    transaction.onError?.(message)
    cancelTransaction(transaction.id)
  })

  const txArray = transaction.tx
  const currentBaseConfig = txArray[currentIndex]

  const isFirstTransaction = currentIndex === 0
  const isLastTransaction = currentIndex === txArray.length - 1

  useRouteBlock({
    when:
      (currentIndex > 0 || isLoading || isPendingResolution) &&
      !isLastSubmitted,
  })

  useEffect(() => {
    if (!currentBaseConfig) {
      setResolvedTx(null)
      setResolvedConfig(null)
      return
    }

    const tx = currentBaseConfig.tx

    if (isFunction(tx)) {
      setIsPendingResolution(true)
      const previousResults = transactionResults.slice(0, currentIndex)
      Promise.resolve(tx(previousResults))
        .then((resolved) => {
          setIsPendingResolution(false)
          setResolvedTx(resolved.tx)
          setResolvedConfig(omit(resolved, ["tx"]))
        })
        .catch((error) => {
          setIsPendingResolution(false)
          onResolutionErrorRef.current(getErrorMessage(error))
        })
    } else {
      setIsPendingResolution(false)
      setResolvedTx(tx)
      setResolvedConfig(null)
    }
  }, [
    currentBaseConfig,
    currentIndex,
    onResolutionErrorRef,
    transactionResults,
  ])

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
      onSuccess: async (event) => {
        setIsLoading(false)
        setTransactionResults((prev) => [...prev, event])

        if (isLastTransaction) {
          transaction.onSuccess?.(event)
          cancelTransaction(transaction.id)
          return
        }

        // Held here rather than after the switch, so the stepper stays on the
        // step whose settlement we're actually waiting for.
        if (currentBaseConfig.beforeNext) {
          setIsPendingResolution(true)
          try {
            await currentBaseConfig.beforeNext()
          } catch (error) {
            onResolutionErrorRef.current(getErrorMessage(error))
            return
          } finally {
            setIsPendingResolution(false)
          }
        }

        setResolvedTx(null)
        setResolvedConfig(null)
        setCurrentIndex((prev) => prev + 1)
      },
      onError: (message) => {
        setIsLoading(false)
        if (isLastTransaction) {
          setIsLastError(true)
        }
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
    onResolutionErrorRef,
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

  const isClosable = (isFirstTransaction && !isLoading) || isLastError

  const { title, description } = currentConfig

  const PendingComponent =
    isPendingResolution && currentBaseConfig?.pendingComponent

  return (
    <TransactionProvider key={currentConfig.id} transaction={currentConfig}>
      <Modal
        key={currentConfig.id}
        animationDurationMs={
          isFirstTransaction || isLastSubmitted ? undefined : 0
        }
        open={isModalOpen}
        onOpenChange={(open) => {
          if (open) return
          if (!isLoading) {
            cancelTransaction(transaction.id)
            transaction.onClose?.()
          }
          setHasUserClosedModal(true)
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
        {PendingComponent ? (
          <ModalBody>
            <PendingComponent />
          </ModalBody>
        ) : (
          <ReviewTransactionContent />
        )}
        <ModalFooter justify="space-between">
          <ReviewTransactionFooter closable={isClosable} />
        </ModalFooter>
        <ReviewTransactionFeePaymentAssetModal />
      </Modal>
    </TransactionProvider>
  )
}
