import { CallType } from "@galacticcouncil/xcm-core"
import { createContext, useCallback, useContext, useReducer } from "react"
import { useLatest } from "react-use"

import { useAccountInfo } from "@/api/account"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useSignAndSubmit } from "@/modules/transactions/hooks/useSignAndSubmit"
import { useTransactionEcosystem } from "@/modules/transactions/hooks/useTransactionEcosystem"
import { useTransactionTip } from "@/modules/transactions/hooks/useTransactionTip"
import { useTransactionToasts } from "@/modules/transactions/hooks/useTransactionToasts"
import {
  doClose,
  doReset,
  doSetError,
  doSetFeePaymentModalOpen,
  doSetStatus,
  doSetTip,
  doSign,
  INITIAL_STATUS,
  transactionStatusReducer,
} from "@/modules/transactions/TransactionProvider.utils"
import { TxState, TxStatus } from "@/modules/transactions/types"
import { Transaction, useTransactionsStore } from "@/states/transactions"
import { NATIVE_ASSET_ID } from "@/utils/consts"

export type TransactionContext = Transaction &
  TxState & {
    isIdle: boolean
    isSubmitted: boolean
    isSuccess: boolean
    isError: boolean

    ecosystem: CallType

    nonce?: number
    isLoadingNonce: boolean

    feeEstimateNative?: string
    feeEstimate?: string
    feeAssetBalance?: string
    feeAssetId: string
    isLoadingFeeEstimate: boolean

    isLoading: boolean

    setTip: (tip: string) => void
    setStatus: (status: TxStatus) => void
    setFeePaymentModalOpen: (open: boolean) => void
    signAndSubmit: () => void
    reset: () => void
  }

const TransactionContext = createContext<TransactionContext>(
  {} as TransactionContext,
)

export const useTransaction = () => useContext(TransactionContext)

export type TransactionProviderProps = Transaction & {
  children: React.ReactNode
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
  ...transaction
}) => {
  const { cancelTransaction } = useTransactionsStore()

  const [state, dispatch] = useReducer(transactionStatusReducer, INITIAL_STATUS)
  const ecosystem = useTransactionEcosystem(transaction)
  const toasts = useTransactionToasts(transaction, ecosystem)

  const { data: accountInfo, isLoading: isLoadingNonce } = useAccountInfo()
  const nonce = accountInfo?.nonce

  const { data: fee, isLoading: isLoadingFeeEstimate } =
    useEstimateFee(transaction)

  const feeEstimateNative = fee?.feeEstimateNative
  const feeEstimate = fee?.feeEstimate
  const feeAssetId = fee?.feeAssetId ?? NATIVE_ASSET_ID
  const feeAssetBalance = fee?.feeAssetBalance

  const onClose = useCallback(() => {
    dispatch(doClose())
    cancelTransaction(transaction.id)
    transaction.onClose?.()
  }, [cancelTransaction, transaction])

  const reset = useCallback(() => {
    dispatch(doReset())
  }, [])

  const setStatus = useCallback((status: TxStatus) => {
    dispatch(doSetStatus(status))
  }, [])

  const setTip = useCallback(
    (tip: string) => {
      dispatch(doSetTip(tip))
    },
    [dispatch],
  )

  const setFeePaymentModalOpen = useCallback(
    (open: boolean) => {
      dispatch(doSetFeePaymentModalOpen(open))
    },
    [dispatch],
  )

  const signAndSubmitMutation = useSignAndSubmit(transaction, {
    onMutate: () => dispatch(doSign()),
    onError: (err) => doSetError(err.message),
  })

  const openRef = useLatest(state.open)

  const tip = useTransactionTip(state.tip, state.tipAssetId)

  const signAndSubmit = () => {
    signAndSubmitMutation.mutate({
      chainKey: transaction.meta.srcChainKey,
      feeAssetId,
      tip,
      mortalityPeriod: state.mortalityPeriod,
      onSubmitted: (txHash) => {
        dispatch(doSetStatus("submitted"))
        transaction.onSubmitted?.(txHash)
        toasts.onSubmitted?.(txHash)
      },
      onSuccess: () => {
        dispatch(doSetStatus("success"))
        transaction.onSuccess?.()
        toasts.onSuccess?.()
      },
      onError: (message) => {
        dispatch(doSetError(message))
        transaction.onError?.(message)

        if (!openRef.current) {
          toasts.onError?.(message)
        }
      },
      onFinalized: () => {
        cancelTransaction(transaction.id)
      },
    })
  }

  const isLoading = isLoadingNonce || isLoadingFeeEstimate

  return (
    <TransactionContext.Provider
      value={{
        ...transaction,
        ...state,

        isIdle: state.status === "idle",
        isSubmitted: state.status === "submitted",
        isSuccess: state.status === "success",
        isError: state.status === "error",

        ecosystem,

        nonce,
        isLoadingNonce,

        feeEstimateNative,
        feeEstimate,
        feeAssetBalance,
        feeAssetId,
        isLoadingFeeEstimate,

        isLoading,

        setTip,
        setFeePaymentModalOpen,
        onClose,
        setStatus,
        signAndSubmit,
        reset,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
