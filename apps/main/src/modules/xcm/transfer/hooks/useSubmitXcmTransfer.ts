import { HexString, invariant, isAnyEvmChain } from "@galacticcouncil/utils"
import { useAccount, useAccountOverride } from "@galacticcouncil/web3-connect"
import { ConfigBuilder } from "@galacticcouncil/xc-core"
import { Call, Transfer } from "@galacticcouncil/xc-sdk"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { portfolioBalanceQueryKey } from "@/api/portfolio"
import { useCrossChainConfigService } from "@/api/xcm"
import { PendingApproval } from "@/components/PendingApproval"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useDepositRecoveryStore } from "@/modules/onramp/deposit/store/useDepositRecoveryStore"
import {
  isEvmApproveCall,
  isEvmCall,
  isSubstrateCall,
} from "@/modules/transactions/utils/xcm"
import { useApprovalTrackingStore } from "@/modules/xcm/transfer/hooks/useApprovalTrackingStore"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { resolveAutomaticBridgeRoute } from "@/modules/xcm/transfer/utils/automaticRoute"
import { resolveRouteBuilderArgs } from "@/modules/xcm/transfer/utils/bridge"
import {
  assertTransferValues,
  buildXcmTx,
} from "@/modules/xcm/transfer/utils/transfer"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionActions,
  TransactionType,
  useTransactionsStore,
  XcmTags,
} from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export type XcmTransferOptions = TransactionActions & {
  automaticBridgeSelection?: boolean
  recoverDeposit?: boolean
  depositRecoveryId?: string | null
  onTransferSubmitted?: (
    txHash: string,
    values: XcmFormValues,
    transfer: Transfer,
  ) => void
  onTransferSuccess?: (
    txHash: string,
    values: XcmFormValues,
    transfer: Transfer,
  ) => void
  onTransferError?: (
    txHash: string,
    values: XcmFormValues,
    transfer: Transfer,
  ) => void
}

export const useSubmitXcmTransfer = ({
  automaticBridgeSelection = false,
  recoverDeposit = false,
  depositRecoveryId,
  ...options
}: XcmTransferOptions = {}) => {
  const { t } = useTranslation(["xcm", "common"])
  const { createTransaction } = useTransactionsStore()
  const configService = useCrossChainConfigService()
  const { account } = useAccount()
  const accountOverride = useAccountOverride()
  const { papi } = useRpcProvider()

  const { addPendingApproval } = useApprovalTrackingStore()

  return useMutation({
    mutationFn: async ([values, transfer]: [XcmFormValues, Transfer]) => {
      invariant(account, "Account is required")

      const {
        srcAmount,
        srcChain,
        destChain,
        srcAsset,
        destAsset,
        destAddress,
        bridgeProvider,
      } = assertTransferValues(values)

      const { source } = transfer

      const i18nVars = {
        amount: srcAmount,
        symbol: source.balance.originSymbol,
        srcChain: srcChain.name,
        destChain: destChain.name,
      }

      const destPair = ConfigBuilder(configService)
        .assets()
        .asset(srcAsset)
        .source(srcChain)
        .destination(destChain)

      const { tag, destAsset: validDstAsset } = resolveRouteBuilderArgs(
        destPair.routes,
        destAsset,
        bridgeProvider ?? undefined,
      )

      const route = automaticBridgeSelection
        ? resolveAutomaticBridgeRoute(destPair.routes, destAsset)
        : destPair.build(validDstAsset, tag).origin.route
      invariant(route, "Transfer route is required")

      const calls = await transfer.buildCalls(srcAmount)
      const transferCall = calls.at(-1)

      invariant(transferCall, "Transfer call is required")

      // Prerequisites (native wrap, erc20 approve) the sender signs before the
      // transfer itself, each dropping off the sequence once executed.
      const prerequisites = calls.slice(0, -1)
      const recoveryId = recoverDeposit
        ? (depositRecoveryId ?? crypto.randomUUID())
        : null
      const recovery = useDepositRecoveryStore.getState()
      invariant(
        !recoveryId ||
          !recovery.deposits.some(
            (item) => item.id === recoveryId && item.stage !== "setup",
          ),
        "Check the existing deposit transaction before continuing",
      )
      if (recoveryId)
        recovery.save({
          id: recoveryId,
          source: account,
          destination: values.destAccount,
          destinationAddress: destAddress,
          chainKey: srcChain.key,
          assetKey: srcAsset.key,
          symbol: srcAsset.originSymbol,
          amount: srcAmount,
          stage: "setup",
        })
      const submitted = (txHash: string) => {
        if (recoveryId) {
          recovery.update(recoveryId, { stage: "transfer", txHash })
          useDepositJourneyStore.getState().setSubmitted({
            txHash,
            sourceAddress: account.address,
            sourceProvider: account.provider,
            destinationAddress: destAddress,
            destinationName: values.destAccount?.name,
            destinationProvider: values.destAccount?.provider,
            sourceChainKey: srcChain.key,
            symbol: srcAsset.originSymbol,
            amount: srcAmount,
            receivedAmount: values.destAmount,
            receivedSymbol: destAsset.originSymbol,
            receivedAssetKey: destAsset.key,
            bridgeTag: values.bridgeProvider,
            sentAt: Date.now(),
            settled: false,
          })
        }
        options.onTransferSubmitted?.(txHash, values, transfer)
      }

      // Approve is the only erc20-specific prerequisite. Every other one the
      // platforms emit is a native wrap — WETH.deposit on evm, wSOL on
      // solana — so keying off approve keeps the labels right per platform.
      const prerequisiteStepLabels = (call: Call) =>
        isEvmApproveCall(call)
          ? {
              title: t("approve.title"),
              description: t("approve.description", i18nVars),
              stepTitle: t("approve"),
              toasts: {
                submitted: t("approve.toast.submitted", i18nVars),
                success: t("approve.toast.success", i18nVars),
              },
            }
          : {
              title: t("wrap.title", i18nVars),
              description: t("wrap.description", i18nVars),
              stepTitle: t("wrap"),
              toasts: {
                submitted: t("wrap.toast.submitted", i18nVars),
                success: t("wrap.toast.success", i18nVars),
              },
            }

      const buildTransferTransaction = async () => {
        if (recoveryId)
          recovery.update(recoveryId, { stage: "transfer", txHash: undefined })
        const tx = await buildXcmTx(srcChain, transfer, srcAmount, papi)
        const sourceFee = await transfer.estimateFee(srcAmount)

        const sourceFeeValue = (() => {
          if (sourceFee.amount === 0n)
            return t("xcm:summary.feeEstimationNotAvailable")
          return t("common:currency", {
            value: toDecimal(sourceFee.amount, sourceFee.decimals),
            symbol: sourceFee.originSymbol,
          })
        })()

        const destFee = await transfer.estimateDestinationFee(srcAmount)

        const signerFeeAsset =
          isSubstrateCall(transferCall) && transferCall?.txOptions?.asset
            ? transferCall.txOptions.asset
            : undefined

        return {
          signingAccount: accountOverride ? account : undefined,
          title: t("form.title"),
          description: t("tx.description", i18nVars),
          invalidateQueries: [
            ["xcm", "transfer"],
            // The picker's snapshot is stale the moment a transfer lands.
            ["xcm", "balanceSnapshot"],
            [...portfolioBalanceQueryKey(account.rawAddress, srcChain.key)],
            [...portfolioBalanceQueryKey(destAddress, destChain.key)],
          ],
          tx,
          signerFeeAsset,
          toasts: {
            submitted: t("tx.toast.submitted", i18nVars),
            success: t("tx.toast.success", i18nVars),
          },
          fee: {
            feeAmount: toDecimal(sourceFee.amount, sourceFee.decimals),
            feeSymbol: sourceFee.symbol,
          },
          meta: {
            type: TransactionType.Xcm as const,
            srcChainKey: srcChain.key,
            srcChainFee: sourceFeeValue,
            srcChainFeeSymbol: sourceFee.symbol,
            dstChainKey: destChain.key,
            dstChainFee: destFee.toDecimal(),
            dstChainFeeSymbol: destFee.symbol,
            tags: (route.tags as XcmTags) || [],
          },
        }
      }

      if (prerequisites.length > 0) {
        let transferTxHash: string | null = null
        return createTransaction(
          {
            signingAccount: accountOverride ? account : undefined,
            tx: [
              ...prerequisites.map((prerequisite) => ({
                tx: prerequisite,
                ...prerequisiteStepLabels(prerequisite),
                // Only drives the explorer link (etherscan over subscan),
                // which holds for any evm prerequisite, wrap included.
                meta: {
                  type: TransactionType.EvmApprove as const,
                  srcChainKey: srcChain.key,
                },
                beforeNext: async () => {
                  if (recoveryId)
                    recovery.update(recoveryId, {
                      stage: "setup",
                      txHash: undefined,
                    })
                },
                onSubmitted: async (txHash: string) => {
                  if (recoveryId)
                    recovery.update(recoveryId, { stage: "pending", txHash })
                  const isEvmCallOnEvmChain =
                    !!srcChain &&
                    isAnyEvmChain(srcChain) &&
                    isEvmCall(prerequisite)

                  if (!isEvmCallOnEvmChain) return

                  const provider = srcChain.evmClient.getProvider()
                  const nonce = await provider.getTransactionCount({
                    address: prerequisite.from as HexString,
                  })

                  addPendingApproval({
                    chainKey: srcChain.key,
                    to: prerequisite.to,
                    nonce,
                    txHash,
                  })
                },
              })),
              {
                stepTitle: t("common:transfer"),
                pendingComponent: PendingApproval,
                tx: buildTransferTransaction,
                onSubmitted: (txHash: string) => {
                  transferTxHash = txHash
                  submitted(txHash)
                },
              },
            ],
          },
          {
            ...options,
            onSuccess: (event) => {
              if (transferTxHash) {
                options.onTransferSuccess?.(transferTxHash, values, transfer)
              }
              options.onSuccess?.(event)
            },
            onError: (message) => {
              if (transferTxHash) {
                useDepositJourneyStore
                  .getState()
                  .updateSubmitted({ error: message }, transferTxHash)
                if (recoveryId) recovery.update(recoveryId, { error: message })
                options.onTransferError?.(transferTxHash, values, transfer)
              }
              options.onError?.(message)
            },
          },
        )
      }

      let submittedTxHash: string | null = null
      return createTransaction(await buildTransferTransaction(), {
        ...options,
        onSubmitted: (txHash) => {
          submittedTxHash = txHash
          submitted(txHash)
          options.onSubmitted?.(txHash)
        },
        onSuccess: (event) => {
          if (submittedTxHash) {
            options.onTransferSuccess?.(submittedTxHash, values, transfer)
          }
          options.onSuccess?.(event)
        },
        onError: (message) => {
          if (submittedTxHash) {
            if (recoveryId) {
              recovery.update(recoveryId, { error: message })
              useDepositJourneyStore
                .getState()
                .updateSubmitted({ error: message }, submittedTxHash)
            }
            options.onTransferError?.(submittedTxHash, values, transfer)
          }
          options.onError?.(message)
        },
      })
    },
  })
}
