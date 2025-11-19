import { HYDRATION_CHAIN_KEY, isAnyParachain } from "@galacticcouncil/utils"
import { ConfigBuilder } from "@galacticcouncil/xcm-core"
import { Transfer } from "@galacticcouncil/xcm-sdk"
import { ApiPromise } from "@polkadot/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Binary, createClient, PolkadotClient, UnsafeApi } from "polkadot-api"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"
import { useTranslation } from "react-i18next"
import { isString } from "remeda"

import { useHydrationConfigService } from "@/api/xcm"
import { AnyPapiTx, AnyTransaction } from "@/modules/transactions/types"
import { isSubstrateCall } from "@/modules/transactions/utils/xcm"
import { useLegacyProvider } from "@/modules/xcm/legacy/LegacyProvider"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionType,
  useTransactionsStore,
  XcmTags,
} from "@/states/transactions"

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
  const { papi } = useRpcProvider()
  const { legacy_api } = useLegacyProvider()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  const configService = useHydrationConfigService()
  return useMutation({
    mutationFn: async ([values, transfer]: [XcmFormValues, Transfer]) => {
      const { srcAmount, srcChain, destChain, srcAsset, destAsset } = values

      if (!destChain) throw new Error("Destination chain is required")
      if (!srcChain) throw new Error("Source chain is required")
      if (!srcAsset) throw new Error("Source asset is required")
      if (!destAsset) throw new Error("Destination asset is required")
      const isHydration = srcChain.key === HYDRATION_CHAIN_KEY

      const { destination, source } = transfer

      const call = await transfer.buildCall(srcAmount)

      const i18nVars = {
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
        if (isAnyParachain(srcChain)) {
          const srcApi = await srcChain.api
          const srcPapiclient = await getWs(srcChain.ws)
          const srcPapi = srcPapiclient.getUnsafeApi()
          return transformPjsToPapiTx(srcApi, srcPapi, call)
        }

        return call
      }

      const { build } = ConfigBuilder(configService)
        .assets()
        .asset(srcAsset)
        .source(srcChain)
        .destination(destChain)

      const { origin } = build(destAsset)

      console.log({ call, origin })

      return createTransaction(
        {
          title: t("form.title"),
          description: t("tx.description", i18nVars),
          tx: await getTx(),
          toasts: {
            submitted: t("tx.toast.submitted", i18nVars),
            success: t("tx.toast.success", i18nVars),
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
            tags: (origin.route.tags as XcmTags) || [],
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["xcm", "transfer"] })
          },
        },
      )
    },
  })
}
