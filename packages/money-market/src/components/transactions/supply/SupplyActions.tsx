import { gasLimitRecommendations, ProtocolAction } from "@aave/contract-helpers"
import { useQueryClient } from "@tanstack/react-query"
import { parseUnits } from "ethers/lib/utils"
import { memo, useEffect } from "react"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { usePoolApprovedAmount } from "@/hooks/useApprovedAmount"
import { useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { getErrorTextFromError, TxAction } from "@/ui-config/errorMapping"
import { queryKeysFactory } from "@/ui-config/queries"

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

export const SupplyActions = memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    symbol,
    blocked,
    decimals,
    className,
  }: SupplyActionProps) => {
    const queryClient = useQueryClient()
    const [supply, estimateGasLimit, currentMarketData] = useRootStore(
      (state) => [
        state.supply,
        state.estimateGasLimit,
        state.currentMarketData,
      ],
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

    const { sendTx } = useWeb3Context()

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isRefetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = usePoolApprovedAmount(currentMarketData, poolAddress)

    useEffect(() => {
      setLoadingTxns(fetchingApprovedAmount)
    }, [fetchingApprovedAmount, setLoadingTxns])

    const requiresApproval = false

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({})
    }

    const usePermit = false
    /*     permitAvailable &&
      walletApprovalMethodPreference === ApprovalMethod.PERMIT */

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
      }
      setGasLimit(supplyGasLimit.toString())
    }, [approvalTxState, usePermit, setGasLimit])

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true })

        // determine if approval is signature or transaction
        // checking user preference is not sufficient because permit may be available but the user has an existing approval
        const action = ProtocolAction.supply
        let supplyTxData = supply({
          amount: parseUnits(amountToSupply, decimals).toString(),
          reserve: poolAddress,
        })
        supplyTxData = await estimateGasLimit(supplyTxData)

        await sendTx(supplyTxData, action)

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
        preparingTransactions={loadingTxns || !approvedAmount}
        actionText={<span>Supply {symbol}</span>}
        actionInProgressText={<span>Supplying {symbol}</span>}
        handleAction={action}
        requiresApproval={requiresApproval}
        className={className}
      />
    )
  },
)

SupplyActions.displayName = "SupplyActions"
