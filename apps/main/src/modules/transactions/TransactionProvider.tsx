import { useAccount } from "@galacticcouncil/web3-connect"
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react"
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
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { Transaction, useTransactionsStore } from "@/states/transactions"
import { NATIVE_ASSET_ID } from "@/utils/consts"

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
  ...props
}) => {
  const { cancelTransaction } = useTransactionsStore()
  const [state, dispatch] = useReducer(transactionStatusReducer, INITIAL_STATUS)
  const { account } = useAccount()
  const toasts = useTransactionToasts(props?.toasts)

  const transactionRef = useRef(props)
  const { tx, meta } = transactionRef.current

  const { data: nonce, isLoading: isLoadingNonce } = useNonce({
    address: account?.address,
  })

  const { data: fee, isLoading: isLoadingFeeEstimate } = useEstimateFee({
    address: account?.address ?? "",
    tx: isPapiTransaction(tx) ? tx : undefined,
    feePaymentAssetId: meta?.feePaymentAssetId,
  })

  const onClose = useCallback(() => {
    dispatch(doClose())
    cancelTransaction(transactionRef.current.id)
    transactionRef.current.onClose?.()
  }, [cancelTransaction])

  const reset = useCallback(() => {
    dispatch(doReset())
  }, [])

  const setStatus = useCallback((status: TxStatus) => {
    dispatch(doSetStatus(status))
  }, [])

  const signAndSubmitMutation = useSignAndSubmit(tx, {
    onMutate: () => dispatch(doSign()),
    onError: (err) => doSetError(err.message),
  })

  const openRef = useLatest(state.open)

  const signAndSubmit = () => {
    const { id, meta, ...transaction } = transactionRef.current

    signAndSubmitMutation.mutate({
      chainKey: meta?.chainKey,
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
        cancelTransaction(id)
      },
    })
  }

  const isLoading = isLoadingNonce || isLoadingFeeEstimate

  return (
    <TransactionContext.Provider
      value={{
        ...transactionRef.current,
        ...state,

        isIdle: state.status === "idle",
        isSubmitted: state.status === "submitted",
        isSuccess: state.status === "success",
        isError: state.status === "error",

        nonce,
        isLoadingNonce,

        feeEstimateNative: fee?.feeEstimateNative,
        feeEstimate: fee?.feeEstimate,
        feeAssetId: fee?.feeAssetId ?? NATIVE_ASSET_ID,
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
