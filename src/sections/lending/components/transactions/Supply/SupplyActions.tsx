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

import { useTransformEvmTxToExtrinsic } from "api/evm"
import { BigNumber as ethersBN, PopulatedTransaction } from "ethers"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAccount } from "utils/evm"
import { ComputedUserReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { createToastMessages } from "state/toasts"
import { useCreateBatchTx } from "sections/transaction/ReviewTransaction.utils"
import { useTranslation } from "react-i18next"

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
  isIsolated: boolean
  activeCollaterals: ComputedUserReserveData[]
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
    isIsolated,
    activeCollaterals,
  }: SupplyActionProps) => {
    const { t } = useTranslation()
    const { account } = useAccount()
    const { createBatch } = useCreateBatchTx()

    const queryClient = useQueryClient()
    const [
      tryPermit,
      supply,
      supplyWithPermit,
      estimateGasLimit,
      addTransaction,
      setUsageAsCollateral,
      setUsageAsCollateralTx,
      currentMarketData,
    ] = useRootStore(
      useShallow((state) => [
        state.tryPermit,
        state.supply,
        state.supplyWithPermit,
        state.estimateGasLimit,
        state.addTransaction,
        state.setUsageAsCollateral,
        state.setUsageAsCollateralTx,
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
    const transformTx = useTransformEvmTxToExtrinsic()

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

    const compoundCollateralTx = async (
      collateral: ComputedUserReserveData[],
    ) => {
      return await Promise.all(
        collateral.map(async (collateral) => {
          const collateralTxs = await setUsageAsCollateral({
            reserve: collateral.underlyingAsset,
            usageAsCollateral: false,
          })

          const txRaw = await collateralTxs
            .find((tx) => "DLP_ACTION" === tx.txType)
            ?.tx()

          if (!txRaw)
            throw new Error(
              `Disable collateral transaction not found for ${collateral.underlyingAsset}`,
            )

          const tx = await estimateGasLimit(
            {
              ...txRaw,
              value: ethersBN.from("0"),
            },
            ProtocolAction.setUsageAsCollateral,
          )
          return transformTx(tx)
        }),
      )
    }

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true })

        let response: TransactionResponse
        let action = ProtocolAction.default
        let supplyTx: PopulatedTransaction

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

          supplyTx = await estimateGasLimit(signedSupplyWithPermitTxData)
        } else {
          action = ProtocolAction.supply
          let supplyTxData = supply({
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
          })
          supplyTx = await estimateGasLimit(supplyTxData, action)
        }

        if (
          isIsolated &&
          !activeCollaterals.some(
            (collateral) => collateral.underlyingAsset === poolAddress,
          )
        ) {
          const isEvm = isEvmAccount(account?.address)
          const disableCollateralsTxs =
            await compoundCollateralTx(activeCollaterals)

          const enableCollateralTxRaw = await setUsageAsCollateralTx({
            reserve: poolAddress,
            usageAsCollateral: true,
          })
          const enableCollateralTx = await estimateGasLimit(
            {
              ...enableCollateralTxRaw,
              value: ethersBN.from("0"),
            },
            ProtocolAction.setUsageAsCollateral,
          )

          const toast = createToastMessages(
            "lending.supplyAndEnableCollateral.toast",
            {
              t,
              tOptions: {
                value: amountToSupply,
                symbol,
              },
              components: ["span.highlight"],
            },
          )

          await createBatch(
            [
              ...disableCollateralsTxs,
              transformTx(supplyTx),
              transformTx(enableCollateralTx),
            ],
            {},
            {
              toast,
            },
            isEvm,
          )

          response = {} as TransactionResponse
        } else {
          response = await sendTx(supplyTx, action)
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
