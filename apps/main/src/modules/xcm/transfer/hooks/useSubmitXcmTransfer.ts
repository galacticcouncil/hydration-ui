import { isAnyParachain } from "@galacticcouncil/utils"
import { Transfer } from "@galacticcouncil/xcm-sdk"
import { ApiPromise } from "@polkadot/api"
import { useMutation } from "@tanstack/react-query"
import { Binary, createClient, PolkadotClient, UnsafeApi } from "polkadot-api"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"
import { useTranslation } from "react-i18next"
import { isString } from "remeda"

import { AnyPapiTx, AnyTransaction } from "@/modules/transactions/types"
import { isSubstrateCall } from "@/modules/transactions/utils/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { TransactionType, useTransactionsStore } from "@/states/transactions"
import { HYDRATION_CHAIN_KEY } from "@/utils/consts"

// TODO: remove after migrating to xcm-sdk-next
const transformPjsToPapiTx = async (
  api: ApiPromise,
  papi: Papi | UnsafeApi<unknown>,
  tx: AnyTransaction | string,
): Promise<AnyPapiTx> => {
  if (isString(tx) || isSubstrateCall(tx)) {
    const dataHex = isString(tx) ? tx : tx.data
    const submittableExtrinsic = api.tx(dataHex)
    const callData = Binary.fromHex(submittableExtrinsic.inner.toHex())
    return papi.txFromCallData(callData)
  }

  return tx
}

// TODO: remove after migrating to xcm-sdk-next
const getWs = async (wsUrl: string | string[]): Promise<PolkadotClient> => {
  const endpoints = typeof wsUrl === "string" ? wsUrl.split(",") : wsUrl
  const getWsProvider = (await import("polkadot-api/ws-provider/web"))
    .getWsProvider
  const wsProvider = getWsProvider(endpoints)
  return createClient(withPolkadotSdkCompat(wsProvider))
}

export const useSubmitXcmTransfer = () => {
  const { t } = useTranslation("xcm")
  const { papi, legacy_api } = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  return useMutation({
    mutationFn: async ([values, transfer]: [XcmFormValues, Transfer]) => {
      const { srcAmount, srcChain, destChain } = values

      if (!destChain) throw new Error("Destination chain is required")
      if (!srcChain || !isAnyParachain(srcChain))
        throw new Error("Source chain is required")

      const isHydration = srcChain.key === HYDRATION_CHAIN_KEY

      const { destination, source } = transfer

      const call = await transfer.buildCall(srcAmount)

      const i18nData = {
        amount: srcAmount,
        symbol: source.balance.originSymbol,
        srcChain: srcChain.name,
        destChain: destChain.name,
      }

      // TODO: Temporary solution to handle transactions on source chain via ApiPromise,
      // remove after migrating to xcm-sdk-next
      const getTx = async () => {
        if (isHydration) {
          return transformPjsToPapiTx(legacy_api, papi, call)
        }
        const srcApi = await srcChain.api
        const srcPapiclient = await getWs(srcChain.ws)
        const srcPapi = srcPapiclient.getUnsafeApi()
        return transformPjsToPapiTx(srcApi, srcPapi, call)
      }

      return createTransaction({
        title: t("form.title"),
        description: t("tx.description", i18nData),
        tx: await getTx(),
        toasts: {
          submitted: t("tx.toast.submitted", i18nData),
          success: t("tx.toast.success", i18nData),
        },
        fee: {
          feeAmount: source.fee.toDecimal(source.fee.decimals),
          feeSymbol: source.fee.symbol,
        },
        meta: {
          type: TransactionType.Xcm,
          srcChainKey: srcChain.key,
          dstChainKey: destChain.key,
          dstChainFee: destination.fee.toDecimal(destination.fee.decimals),
          dstChainFeeSymbol: destination.fee.symbol,
        },
      })
    },
  })
}
