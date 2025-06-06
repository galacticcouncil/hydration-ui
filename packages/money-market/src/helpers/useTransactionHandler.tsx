import {
  EthereumTransactionTypeExtended,
  ProtocolAction,
} from "@aave/contract-helpers"
import { SignatureLike } from "@ethersproject/bytes"
import { useQueryClient } from "@tanstack/react-query"
import { BigNumber, PopulatedTransaction } from "ethers"
import { DependencyList, useEffect, useRef, useState } from "react"

import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { TransactionDetails } from "@/store/transactionsSlice"
import { ApprovalMethod } from "@/store/walletSlice"
import { getErrorTextFromError, TxAction } from "@/ui-config/errorMapping"
import { gasLimitRecommendations } from "@/ui-config/gasLimit"
import { queryKeysFactory } from "@/ui-config/queries"

interface UseTransactionHandlerProps {
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>
  handleGetPermitTxns?: (
    signatures: SignatureLike[],
    deadline: string,
  ) => Promise<EthereumTransactionTypeExtended[]>
  tryPermit?: boolean
  permitAction?: ProtocolAction
  skip?: boolean
  protocolAction?: ProtocolAction
  deps?: DependencyList
  eventTxInfo?: TransactionDetails
}

export type Approval = {
  amount: string
  underlyingAsset: string
  permitType?: "POOL" | "SUPPLY_MIGRATOR_V3" | "BORROW_MIGRATOR_V3"
}

export const useTransactionHandler = ({
  handleGetTxns,
  handleGetPermitTxns,
  tryPermit = false,
  permitAction,
  skip,
  protocolAction,
  deps = [],
}: UseTransactionHandlerProps) => {
  const queryClient = useQueryClient()

  const {
    approvalTxState,
    mainTxState,
    setMainTxState,
    gasLimit,
    setGasLimit,
    loadingTxns,
    setLoadingTxns,
    setTxError,
    close,
  } = useModalContext()
  const { sendTx } = useWeb3Context()
  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()

  const [walletApprovalMethodPreference, jsonRpcProvider] = useRootStore(
    (state) => [state.walletApprovalMethodPreference, state.jsonRpcProvider],
  )

  const [approvalTxes, setApprovalTxes] = useState<
    EthereumTransactionTypeExtended[] | undefined
  >()
  const [actionTx, setActionTx] = useState<
    EthereumTransactionTypeExtended | undefined
  >()
  const [usePermit, setUsePermit] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true // Will set it to true on mount ...
    return () => {
      mounted.current = false
    } // ... and to false on unmount
  }, [])
  /**
   * Executes the transactions and handles loading & error states.
   * @param fn
   * @returns
   */
  // eslint-disable-next-line
  const processTx = async ({
    tx,
    errorCallback,
  }: {
    tx: () => Promise<void>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorCallback?: (error: any, hash?: string) => void
  }) => {
    try {
      await tx()

      try {
        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
        refetchPoolData && refetchPoolData()
        refetchGhoData && refetchGhoData()
        refetchIncentiveData && refetchIncentiveData()
      } catch (e) {
        console.error("Error in success callback", e)
      } finally {
        close()
      }

      return
    } catch (e) {
      errorCallback && errorCallback(e)
    }
  }

  const action = async () => {
    if ((!usePermit || !approvalTxes) && actionTx) {
      try {
        setMainTxState({ ...mainTxState, loading: true })
        const params = await actionTx.tx()
        delete params.gasPrice
        delete params.gasLimit
        params.gasLimit = BigNumber.from(gasLimit).mul(12).div(10)
        const gasPrice = await jsonRpcProvider().getGasPrice()
        const gasOnePrc = gasPrice.div(100)
        const gasPricePlus = gasPrice.add(gasOnePrc)

        Object.assign(params, {
          maxFeePerGas: gasPricePlus,
          maxPriorityFeePerGas: gasPricePlus,
        })
        return processTx({
          tx: () => sendTx(params as PopulatedTransaction, protocolAction),
          errorCallback: (error, hash) => {
            const parsedError = getErrorTextFromError(
              error,
              TxAction.MAIN_ACTION,
            )
            setTxError(parsedError)
            setMainTxState({
              txHash: hash,
              loading: false,
            })
          },
        })
      } catch (error) {
        const parsedError = getErrorTextFromError(
          error as Error,
          TxAction.GAS_ESTIMATION,
          false,
        )
        console.log(error, parsedError)
        setTxError(parsedError)
        setMainTxState({
          txHash: undefined,
          loading: false,
        })
      }
    }
  }

  // populate txns
  // fetches standard txs (optional approval + action), then based off availability and user preference, set tx flow and gas estimation to permit or approve
  useEffect(() => {
    if (!skip) {
      setLoadingTxns(true)
      const timeout = setTimeout(() => {
        setLoadingTxns(true)
        return handleGetTxns()
          .then(async (txs) => {
            if (!mounted.current) return
            const approvalTransactions = txs.filter(
              (tx) => tx.txType === "ERC20_APPROVAL",
            )
            if (approvalTransactions.length > 0) {
              setApprovalTxes(approvalTransactions)
            }
            const preferPermit =
              tryPermit &&
              walletApprovalMethodPreference === ApprovalMethod.PERMIT &&
              handleGetPermitTxns &&
              permitAction
            if (approvalTransactions.length > 0 && preferPermit) {
              // For permit flow, just use recommendation for gas limit as estimation will always fail without signature and tx must be rebuilt with signature anyways
              setUsePermit(true)
              const gas = gasLimitRecommendations[permitAction]
              setGasLimit(gas?.limit || "")
              setMainTxState({
                txHash: undefined,
              })
              setTxError(undefined)
              setLoadingTxns(false)
            } else {
              setUsePermit(false)
              // For approval flow, set approval/action status and gas limit accordingly
              if (approvalTransactions.length > 0) {
                setApprovalTxes(approvalTransactions)
              }
              setActionTx(
                txs.find((tx) =>
                  [
                    "DLP_ACTION",
                    "REWARD_ACTION",
                    "FAUCET_V2_MINT",
                    "FAUCET_MINT",
                    "STAKE_ACTION",
                    "GOV_DELEGATION_ACTION",
                    "GOVERNANCE_ACTION",
                    "V3_MIGRATION_ACTION",
                  ].includes(tx.txType),
                ),
              )
              setMainTxState({
                txHash: undefined,
              })
              setTxError(undefined)
              let gasLimit = 0
              try {
                for (const tx of txs) {
                  if (protocolAction) {
                    gasLimit =
                      +gasLimitRecommendations[protocolAction]?.limit || 1000000
                  } else {
                    const txGas = await tx.gas()
                    // If permit is available, use regular action for estimation but exclude the approval tx
                    if (txGas && txGas.gasLimit) {
                      gasLimit = gasLimit + Number(txGas.gasLimit)
                    }
                  }
                }
              } catch (error) {
                if (!mounted.current) return
                const parsedError = getErrorTextFromError(
                  error as Error,
                  TxAction.GAS_ESTIMATION,
                  false,
                )
                setTxError(parsedError)
              }
              setGasLimit(gasLimit.toString() || "")
              setLoadingTxns(false)
            }
          })
          .catch((error) => {
            if (!mounted.current) return
            setMainTxState({
              txHash: undefined,
            })
            const parsedError = getErrorTextFromError(
              error,
              TxAction.GAS_ESTIMATION,
              false,
            )
            setTxError(parsedError)
            setLoadingTxns(false)
          })
      }, 1000)
      return () => clearTimeout(timeout)
    } else {
      setApprovalTxes(undefined)
      setActionTx(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps, tryPermit, walletApprovalMethodPreference])

  return {
    action,
    loadingTxns,
    setUsePermit,
    requiresApproval: !!approvalTxes || usePermit,
    approvalTxState,
    mainTxState,
    usePermit,
  }
}
