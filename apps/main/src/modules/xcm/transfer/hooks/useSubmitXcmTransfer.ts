import { HexString, invariant, isEvmChain } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { ConfigBuilder } from "@galacticcouncil/xc-core"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useCrossChainConfigService } from "@/api/xcm"
import { isEvmApproveCall, isEvmCall } from "@/modules/transactions/utils/xcm"
import { useApprovalTrackingStore } from "@/modules/xcm/transfer/hooks/useApprovalTrackingStore"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
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

export const useSubmitXcmTransfer = (options: XcmTransferOptions = {}) => {
  const { t } = useTranslation(["xcm", "common"])
  const { createTransaction } = useTransactionsStore()
  const configService = useCrossChainConfigService()
  const { account } = useAccount()
  const { papi } = useRpcProvider()

  const { addPendingApproval } = useApprovalTrackingStore()

  return useMutation({
    mutationFn: async ([values, transfer]: [XcmFormValues, Transfer]) => {
      invariant(account, "Account is required")

      const { srcAmount, srcChain, destChain, srcAsset, destAsset } =
        assertTransferValues(values)

      const { destination, source } = transfer

      const i18nVars = {
        amount: srcAmount,
        symbol: source.balance.originSymbol,
        srcChain: srcChain.name,
        destChain: destChain.name,
      }

      const { build } = ConfigBuilder(configService)
        .assets()
        .asset(srcAsset)
        .source(srcChain)
        .destination(destChain)

      const { origin } = build(destAsset)

      const call = await transfer.buildCall(srcAmount)
      const isApprove = isEvmApproveCall(call)

      const buildTransferTransaction = async () => {
        const tx = await buildXcmTx(srcChain, transfer, srcAmount, papi)
        return {
          title: t("form.title"),
          description: t("tx.description", i18nVars),
          invalidateQueries: [["xcm", "transfer"]],
          tx,
          toasts: {
            submitted: t("tx.toast.submitted", i18nVars),
            success: t("tx.toast.success", i18nVars),
          },
          fee: {
            feeAmount: toDecimal(source.fee.amount, source.fee.decimals),
            feeSymbol: source.fee.symbol,
          },
          meta: {
            type: TransactionType.Xcm,
            srcChainKey: srcChain.key,
            srcChainFee: toDecimal(source.fee.amount, source.fee.decimals),
            srcChainFeeSymbol: source.fee.symbol,
            dstChainKey: destChain.key,
            dstChainFee: toDecimal(
              destination.fee.amount,
              destination.fee.decimals,
            ),
            dstChainFeeSymbol: destination.fee.symbol,
            tags: (origin.route.tags as XcmTags) || [],
          },
        }
      }

      if (isApprove) {
        let transferTxHash: string | null = null
        return createTransaction(
          {
            tx: [
              {
                tx: call,
                title: t("approve.title"),
                description: t("approve.description", i18nVars),
                stepTitle: t("approve"),
                toasts: {
                  submitted: t("approve.toast.submitted", i18nVars),
                  success: t("approve.toast.success", i18nVars),
                },
                meta: {
                  type: TransactionType.EvmApprove,
                  srcChainKey: srcChain.key,
                },
                onSubmitted: async (txHash) => {
                  const isEvmCallOnEvmChain =
                    !!srcChain && isEvmChain(srcChain) && isEvmCall(call)

                  if (!isEvmCallOnEvmChain) return

                  const provider = srcChain.evmClient.getProvider()
                  const nonce = await provider.getTransactionCount({
                    address: call.from as HexString,
                  })

                  addPendingApproval({
                    chainKey: srcChain.key,
                    to: call.to,
                    nonce,
                    txHash,
                  })
                },
              },
              {
                stepTitle: t("common:transfer"),
                tx: buildTransferTransaction,
                onSubmitted: (txHash: string) => {
                  transferTxHash = txHash
                  options.onTransferSubmitted?.(txHash, values, transfer)
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
          options.onTransferSubmitted?.(txHash, values, transfer)
          options.onSubmitted?.(txHash)
        },
        onSuccess: (event) => {
          if (submittedTxHash) {
            options.onTransferSuccess?.(submittedTxHash, values, transfer)
          }
          options.onSuccess?.(event)
        },
        onError: (message) => {
          if (submittedTxHash)
            options.onTransferError?.(submittedTxHash, values, transfer)
          options.onError?.(message)
        },
      })
    },
  })
}
