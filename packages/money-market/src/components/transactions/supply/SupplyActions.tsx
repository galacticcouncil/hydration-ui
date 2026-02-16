import { gasLimitRecommendations, ProtocolAction } from "@aave/contract-helpers"
import { h160 } from "@galacticcouncil/common"
import { useAccount } from "@galacticcouncil/web3-connect"
import { PopulatedTransaction } from "ethers"
import { parseUnits } from "ethers/lib/utils"
import { memo, useEffect } from "react"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { ComputedUserReserveData, useProtocolActionToasts } from "@/hooks"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { usePoolApprovedAmount } from "@/hooks/useApprovedAmount"
import { useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { getErrorTextFromError, TxAction } from "@/ui-config/errorMapping"
import { CustomToastAction } from "@/ui-config/toasts"

export interface SupplyActionProps {
  amountToSupply: string
  customGasPrice?: string
  poolAddress: string
  symbol: string
  blocked: boolean
  decimals: number
  isWrappedBaseAsset: boolean
  className?: string
  isJoiningIsolatedMode: boolean
  activeCollaterals: ComputedUserReserveData[]
}

const { isEvmAccount } = h160

export const SupplyActions = memo(
  ({
    amountToSupply,
    poolAddress,
    symbol,
    blocked,
    decimals,
    className,
    isJoiningIsolatedMode,
    activeCollaterals,
  }: SupplyActionProps) => {
    const { formatCurrency } = useAppFormatters()
    const { account } = useAccount()
    const [
      supply,
      estimateGasLimit,
      setUsageAsCollateral,
      setUsageAsCollateralTx,
      currentMarketData,
    ] = useRootStore((state) => [
      state.supply,
      state.estimateGasLimit,
      state.setUsageAsCollateral,
      state.setUsageAsCollateralTx,
      state.currentMarketData,
    ])
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

    const { sendTx, sendTxs } = useWeb3Context()

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

    const protocolAction = ProtocolAction.supply
    const toasts = useProtocolActionToasts(
      isJoiningIsolatedMode ? CustomToastAction.supplyIsolated : protocolAction,
      {
        value: formatCurrency(amountToSupply || "0", { symbol }),
      },
    )

    const compoundCollateralTx = async (
      collateral: ComputedUserReserveData[],
    ) => {
      return await Promise.all(
        collateral.map(async (collateral) => {
          const collateralTxs = await setUsageAsCollateral({
            reserve: collateral.underlyingAsset,
            usageAsCollateral: false,
          })

          const txRaw = (await collateralTxs
            .find((tx) => "DLP_ACTION" === tx.txType)
            ?.tx()) as PopulatedTransaction

          if (!txRaw)
            throw new Error(
              `Disable collateral transaction not found for ${collateral.underlyingAsset}`,
            )

          const tx = await estimateGasLimit(
            txRaw,
            ProtocolAction.setUsageAsCollateral,
          )

          return { txData: tx, action: ProtocolAction.setUsageAsCollateral }
        }),
      )
    }

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true })

        // determine if approval is signature or transaction
        // checking user preference is not sufficient because permit may be available but the user has an existing approval

        let supplyTxData = supply({
          amount: parseUnits(amountToSupply, decimals).toString(),
          reserve: poolAddress,
        })
        supplyTxData = await estimateGasLimit(supplyTxData, protocolAction)

        if (isJoiningIsolatedMode) {
          const isEvm = isEvmAccount(account?.address ?? "")

          const disableCollateralsTxs =
            await compoundCollateralTx(activeCollaterals)

          const enableCollateralTxRaw = (await setUsageAsCollateralTx({
            reserve: poolAddress,
            usageAsCollateral: true,
          })) as PopulatedTransaction

          const enableCollateralTx = await estimateGasLimit(
            enableCollateralTxRaw,
            ProtocolAction.setUsageAsCollateral,
          )

          await sendTxs(
            [
              ...disableCollateralsTxs,
              { txData: supplyTxData, action: protocolAction },
              {
                txData: enableCollateralTx,
                action: ProtocolAction.setUsageAsCollateral,
              },
            ],
            toasts,
            isEvm,
          )
        } else {
          await sendTx(supplyTxData, toasts, protocolAction)
        }
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
