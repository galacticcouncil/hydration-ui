import { useAccount } from "@galacticcouncil/web3-connect"
import { createContext, useCallback, useContext, useReducer } from "react"
import { useLatest } from "react-use"

import { useNonce } from "@/api/account"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useSignAndSubmit } from "@/modules/transactions/hooks/useSignAndSubmit"
import { useTransactionToasts } from "@/modules/transactions/hooks/useTransactionToasts"
import {
  doClose,
  doReset,
  doSetError,
  doSetStatus,
  doSign,
  INITIAL_STATUS,
  transactionStatusReducer,
} from "@/modules/transactions/TransactionProvider.utils"
import { TxState, TxStatus } from "@/modules/transactions/types"
import { Transaction, useTransactionsStore } from "@/states/transactions"
import { HYDRATION_CHAIN_KEY, NATIVE_ASSET_ID } from "@/utils/consts"

export type TransactionContext = Transaction &
  TxState & {
    isIdle: boolean
    isSubmitted: boolean
    isSuccess: boolean
    isError: boolean

    nonce?: number
    isLoadingNonce: boolean

    feeEstimateNative?: string
    feeEstimate?: string
    feeAssetId: string
    isLoadingFeeEstimate: boolean

    isLoading: boolean
    setStatus: (status: TxStatus) => void
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
  const { account } = useAccount()

  const [state, dispatch] = useReducer(transactionStatusReducer, INITIAL_STATUS)
  const toasts = useTransactionToasts(transaction.toasts)

  const { data: nonce, isLoading: isLoadingNonce } = useNonce({
    address: account?.address,
  })

  const { data: fee, isLoading: isLoadingFeeEstimate } =
    useEstimateFee(transaction)

  const feeEstimateNative = fee?.feeEstimateNative
  const feeEstimate = fee?.feeEstimate
  const feeAssetId = fee?.feeAssetId ?? NATIVE_ASSET_ID

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

  const signAndSubmitMutation = useSignAndSubmit(transaction, {
    onMutate: () => dispatch(doSign()),
    onError: (err) => doSetError(err.message),
  })

  const openRef = useLatest(state.open)

  const signAndSubmit = () => {
    signAndSubmitMutation.mutate({
      chainKey: transaction.meta?.chainKey ?? HYDRATION_CHAIN_KEY,
      feeAssetId,
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

        nonce,
        isLoadingNonce,

        feeEstimateNative,
        feeEstimate,
        feeAssetId,
        isLoadingFeeEstimate,

        isLoading,

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
