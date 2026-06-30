import {
  EthereumTransactionTypeExtended,
  ProtocolAction,
} from "@aave/contract-helpers"
import { SignatureLike } from "@ethersproject/bytes"
import { PopulatedTransaction } from "ethers"
import { DependencyList, useEffect, useRef, useState } from "react"

import { SIGNATURE_AMOUNT_MARGIN } from "@/hooks/paraswap/common"
import { useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { ToastsConfig } from "@/types"
import { getErrorTextFromError, TxAction } from "@/ui-config/errorMapping"

interface UseParaSwapTransactionHandlerProps {
  /**
   * This function is called when the user clicks the action button in the modal and should return the transaction for the swap or repay.
   * The swap rate provider should be called in the implementation to get the required transaction parameters.
   */
  handleGetTxns: (
    signature?: SignatureLike,
    deadline?: string,
  ) => Promise<EthereumTransactionTypeExtended[]>
  /**
   * This function is only called once on initial load, and should return a transaction for the swap or repay,
   * but the swap rate provider should not be called in the implementation. This is to determine if an approval is needed and
   * to get the gas limit for the swap or repay.
   */
  handleGetApprovalTxns: () => Promise<EthereumTransactionTypeExtended[]>
  /**
   * The gas limit recommendation to use for the swap or repay. This is used in the case where there is no approval needed.
   */
  gasLimitRecommendation: string
  /**
   * If true, handleGetApprovalTxns will not be called. Can be used if the route information is still loading.
   */
  skip?: boolean
  deps?: DependencyList
  protocolAction?: ProtocolAction
  /**
   * Toasts to surface while the transaction is processed by the money-market transaction store.
   */
  toasts: ToastsConfig
}

export const useParaSwapTransactionHandler = ({
  handleGetTxns,
  handleGetApprovalTxns,
  gasLimitRecommendation,
  skip,
  protocolAction,
  toasts,
  deps = [],
}: UseParaSwapTransactionHandlerProps) => {
  const {
    approvalTxState,
    setApprovalTxState,
    mainTxState,
    setMainTxState,
    setGasLimit,
    loadingTxns,
    setLoadingTxns,
    setTxError,
    close,
  } = useModalContext()
  const { sendTx } = useWeb3Context()

  const [approvalTx, setApprovalTx] = useState<
    EthereumTransactionTypeExtended | undefined
  >()
  const [requestingApproval, setRequestingApproval] = useState(true)
  const [actionTx, setActionTx] = useState<
    EthereumTransactionTypeExtended | undefined
  >()
  interface Dependency {
    asset: string
    amount: string
  }
  const [previousDeps, setPreviousDeps] = useState<Dependency>({
    asset: deps[0] as string,
    amount: deps[1] as string,
  })
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true // Will set it to true on mount ...
    return () => {
      mounted.current = false
    } // ... and to false on unmount
  }, [])

  const approval = async () => {
    if (approvalTx) {
      try {
        setApprovalTxState({ ...approvalTxState, loading: true })
        const params = await approvalTx.tx()
        delete params.gasPrice
        await sendTx(params as PopulatedTransaction, toasts)
        if (!mounted.current) return
        setApprovalTxState({
          loading: false,
          success: true,
        })
        setTxError(undefined)
      } catch (error) {
        if (!mounted.current) return
        const parsedError = getErrorTextFromError(
          error as Error,
          TxAction.APPROVAL,
          false,
        )
        setTxError(parsedError)
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        })
      }
    }
  }

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true })
    setTxError(undefined)
    try {
      const data = await handleGetTxns()
      const actionTx = data.find((tx) => ["DLP_ACTION"].includes(tx.txType))
      if (actionTx) {
        const params = await actionTx.tx()
        delete params.gasPrice
        await sendTx(params as PopulatedTransaction, toasts, protocolAction)
        if (!mounted.current) return
        setMainTxState({
          loading: false,
          success: true,
        })
        setTxError(undefined)
      }
    } catch (error) {
      if (!mounted.current) return
      const parsedError = getErrorTextFromError(
        error as Error,
        TxAction.GAS_ESTIMATION,
        false,
      )
      setTxError(parsedError)
      setMainTxState({
        ...mainTxState,
        loading: false,
      })
    } finally {
      close()
    }
  }

  // Populates the approval transaction and sets the default gas estimation.
  useEffect(() => {
    if (!skip) {
      setLoadingTxns(true)
      handleGetApprovalTxns()
        .then(async (data) => {
          const approval = data.find((tx) => tx.txType === "ERC20_APPROVAL")
          // reset error and approval state if new signature request is required
          if (
            deps[0] !== previousDeps.asset ||
            Number(deps[1]) >
              Number(previousDeps.amount) +
                Number(previousDeps.amount) * (SIGNATURE_AMOUNT_MARGIN / 2)
          ) {
            setApprovalTxState({ success: false })
            setTxError(undefined)
          }
          // clear error but use existing approval if amount changes
          if (Number(deps[1]) < Number(previousDeps.amount)) {
            setTxError(undefined)
          }
          setPreviousDeps({
            asset: deps[0] as string,
            amount: deps[1] as string,
          })
          setApprovalTx(approval)
          setRequestingApproval(false)
        })
        .finally(() => {
          setMainTxState({
            txHash: undefined,
          })
          setGasLimit(gasLimitRecommendation)
          setLoadingTxns(false)
          setRequestingApproval(false)
        })
    } else {
      setApprovalTx(undefined)
      setActionTx(undefined)
      setRequestingApproval(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps])

  return {
    approval,
    action,
    loadingTxns,
    requestingApproval,
    requiresApproval: !!approvalTx,
    approvalTxState,
    mainTxState,
    actionTx,
    approvalTx,
  }
}
