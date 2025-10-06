import { gasLimitRecommendations, ProtocolAction } from "@aave/contract-helpers"
import { TransactionResponse } from "@ethersproject/providers"
import { parseUnits } from "ethers/lib/utils"
import React, { useEffect, useState } from "react"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import {
  SignedParams,
  useApprovalTx,
} from "sections/lending/hooks/useApprovalTx"
import { usePoolApprovedAmount } from "sections/lending/hooks/useApprovedAmount"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"
import {
  getErrorTextFromError,
  TxAction,
} from "sections/lending/ui-config/errorMapping"
import { queryKeysFactory } from "sections/lending/ui-config/queries"
import { useQueryClient } from "@tanstack/react-query"
import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"
import {
  APPROVAL_GAS_LIMIT,
  checkRequiresApproval,
} from "sections/lending/components/transactions/utils"
import { useShallow } from "hooks/useShallow"

export interface SupplyActionProps {
  amountToSupply: string
  isWrongNetwork: boolean
  customGasPrice?: string
  poolAddress: string
  symbol: string
  blocked: boolean
  decimals: number
  isWrappedBaseAsset: boolean
  className?: string
}

export const SupplyActions = React.memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    symbol,
    blocked,
    decimals,
    isWrappedBaseAsset,
    className,
  }: SupplyActionProps) => {
    const queryClient = useQueryClient()
    const [
      tryPermit,
      supply,
      supplyWithPermit,
      estimateGasLimit,
      addTransaction,
      currentMarketData,
    ] = useRootStore(
      useShallow((state) => [
        state.tryPermit,
        state.supply,
        state.supplyWithPermit,
        state.estimateGasLimit,
        state.addTransaction,
        state.currentMarketData,
      ]),
    )
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setApprovalTxState,
      setMainTxState,
      setGasLimit,
      setTxError,
      close,
    } = useModalContext()
    const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
      useBackgroundDataProvider()
    const permitAvailable = tryPermit({
      reserveAddress: poolAddress,
      isWrappedBaseAsset: isWrappedBaseAsset,
    })
    const { sendTx } = useWeb3Context()

    const [signatureParams, setSignatureParams] = useState<
      SignedParams | undefined
    >()

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isRefetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = usePoolApprovedAmount(currentMarketData, poolAddress)

    useEffect(() => {
      setLoadingTxns(fetchingApprovedAmount)
    }, [fetchingApprovedAmount, setLoadingTxns])

    const requiresApproval =
      Number(amountToSupply) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount?.amount || "0",
        amount: amountToSupply,
        signedAmount: signatureParams ? signatureParams.amount : "0",
      })

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({})
    }

    const usePermit = false
    /*     permitAvailable &&
      walletApprovalMethodPreference === ApprovalMethod.PERMIT */

    const { approval } = useApprovalTx({
      usePermit,
      approvedAmount,
      requiresApproval,
      assetAddress: poolAddress,
      symbol,
      decimals,
      signatureAmount: amountToSupply,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
    })

    useEffect(() => {
      if (!isFetchedAfterMount) {
        fetchApprovedAmount()
      }
    }, [fetchApprovedAmount, isFetchedAfterMount])

    // Update gas estimation
    useEffect(() => {
      let supplyGasLimit = 0
      if (usePermit) {
        supplyGasLimit = Number(
          gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended,
        )
      } else {
        supplyGasLimit = Number(
          gasLimitRecommendations[ProtocolAction.supply].recommended,
        )
        if (requiresApproval && !approvalTxState.success) {
          supplyGasLimit += Number(APPROVAL_GAS_LIMIT)
        }
      }
      setGasLimit(supplyGasLimit.toString())
    }, [requiresApproval, approvalTxState, usePermit, setGasLimit])

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true })

        let response: TransactionResponse
        let action = ProtocolAction.default

        // determine if approval is signature or transaction
        // checking user preference is not sufficient because permit may be available but the user has an existing approval
        if (usePermit && signatureParams) {
          action = ProtocolAction.supplyWithPermit
          let signedSupplyWithPermitTxData = supplyWithPermit({
            signature: signatureParams.signature,
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
            deadline: signatureParams.deadline,
          })

          signedSupplyWithPermitTxData = await estimateGasLimit(
            signedSupplyWithPermitTxData,
          )
          response = await sendTx(signedSupplyWithPermitTxData, action)
        } else {
          action = ProtocolAction.supply
          let supplyTxData = supply({
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
          })
          supplyTxData = await estimateGasLimit(supplyTxData, action)

          response = await sendTx(supplyTxData, action)
        }

        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        })

        addTransaction(response.hash, {
          action,
          txState: "success",
          asset: poolAddress,
          amount: amountToSupply,
          assetName: symbol,
        })

        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
        refetchPoolData && refetchPoolData()
        refetchIncentiveData && refetchIncentiveData()
        refetchGhoData && refetchGhoData()
      } catch (error) {
        console.log(error)
        const parsedError = getErrorTextFromError(
          error as Error,
          TxAction.GAS_ESTIMATION,
          false,
        )
        setTxError(parsedError)
        setMainTxState({
          txHash: undefined,
          loading: false,
        })
      } finally {
        close()
      }
    }

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToSupply}
        symbol={symbol}
        preparingTransactions={loadingTxns || !approvedAmount}
        actionText={<span>Supply {symbol}</span>}
        actionInProgressText={<span>Supplying {symbol}</span>}
        handleApproval={approval}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={permitAvailable}
        className={className}
      />
    )
  },
)
