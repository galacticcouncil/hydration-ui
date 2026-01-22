import { HYDRATION_CHAIN_KEY, isParachain } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { AnyChain, ConfigBuilder } from "@galacticcouncil/xc-core"
import { Call, Transfer } from "@galacticcouncil/xc-sdk"
import { useMutation } from "@tanstack/react-query"
import { Binary } from "polkadot-api"
import { useTranslation } from "react-i18next"

import { useCrossChainConfigService } from "@/api/xcm"
import { AnyPapiTx } from "@/modules/transactions/types"
import { isEvmApproveCall } from "@/modules/transactions/utils/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionActions,
  TransactionType,
  useTransactionsStore,
  XcmTags,
} from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export const useSubmitXcmTransfer = (options: TransactionActions = {}) => {
  const { t } = useTranslation("xcm")
  const { createTransaction } = useTransactionsStore()
  const configService = useCrossChainConfigService()
  const { account } = useAccount()
  const { papi } = useRpcProvider()
  return useMutation({
    mutationFn: async ([values, transfer]: [XcmFormValues, Transfer]) => {
      const { srcAmount, srcChain, destChain, srcAsset, destAsset } = values

      if (!account) throw new Error("Account is required")
      if (!destChain) throw new Error("Destination chain is required")
      if (!srcChain) throw new Error("Source chain is required")
      if (!srcAsset) throw new Error("Source asset is required")
      if (!destAsset) throw new Error("Destination asset is required")

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

      const buildTransferTransaction = async () => {
        const call = await transfer.buildCall(srcAmount)
        const tx =
          srcChain.key === HYDRATION_CHAIN_KEY
            ? await papi.txFromCallData(Binary.fromHex(call.data))
            : await getExternalChainTx(srcChain, call)
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

      const isApprove = isEvmApproveCall(call)

      if (isApprove) {
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
              },
              {
                stepTitle: t("transfer"),
                tx: buildTransferTransaction,
              },
            ],
          },
          options,
        )
      }

      return createTransaction(await buildTransferTransaction(), options)
    },
  })
}

async function getExternalChainTx(
  chain: AnyChain,
  call: Call,
): Promise<AnyPapiTx | Call> {
  if (!isParachain(chain)) {
    return call
  }
  return chain.client.getUnsafeApi().txFromCallData(Binary.fromHex(call.data))
}
