import {
  assetsMap,
  chainsMap,
  routesMap,
  validations,
  HydrationConfigService,
} from "@galacticcouncil/xcm-cfg"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { Wallet } from "@galacticcouncil/xcm-sdk"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Transaction, useStore } from "state/store"
import { isAnyParachain } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { external } from "@galacticcouncil/apps"
import { ASSETHUB_XCM_ASSET_SUFFIX } from "./external/assethub"
import { TRegisteredAsset } from "sections/wallet/addToken/AddToken.utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { createToastMessages } from "state/toasts"
import { useRpcProvider } from "providers/rpcProvider"

type TransferProps = {
  asset: string
  srcAddr: string
  srcChain: string
  dstAddr: string
  dstChain: string
}

export const createXcmAssetKey = (id: string, symbol: string) => {
  return `${symbol.toLowerCase()}${ASSETHUB_XCM_ASSET_SUFFIX}${id}`
}

export const syncAssethubXcmConfig = (
  asset: TRegisteredAsset,
  config: HydrationConfigService,
) => {
  const assetData = external.buildAssetData(asset)
  config.addExternalHubRoute(assetData)
}

export const useCrossChainWallet = () => {
  const { poolService } = useRpcProvider()

  return useMemo(() => {
    const configService = new HydrationConfigService({
      assets: assetsMap,
      chains: chainsMap,
      routes: routesMap,
    })

    return new Wallet({
      configService: configService,
      poolService: poolService,
      transferValidations: validations,
    })
  }, [poolService])
}

export const useCrossChainTransfer = ({
  asset,
  srcAddr,
  srcChain,
  dstAddr,
  dstChain,
}: TransferProps) => {
  const wallet = useCrossChainWallet()
  return useQuery(
    QUERY_KEYS.xcmTransfer(asset, srcAddr, srcChain, dstAddr, dstChain),
    async () =>
      await wallet.transfer(asset, srcAddr, srcChain, dstAddr, dstChain),
  )
}

export const useCrossChainTransaction = ({
  steps,
}: {
  steps?: Transaction["steps"]
} = {}) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const wallet = useCrossChainWallet()

  return useMutation(
    async (values: TransferProps & { amount: number | string }) => {
      const srcChain = chainsMap.get(values.srcChain)
      const dstChain = chainsMap.get(values.dstChain)

      if (!srcChain) throw new Error(`Chain ${values.srcChain} not found`)
      if (!dstChain) throw new Error(`Chain ${values.dstChain} not found`)
      if (!isAnyParachain(srcChain))
        throw new Error(`Chain ${values.srcChain} is not a parachain`)

      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(srcChain.ws)

      const xTransfer = await wallet.transfer(
        values.asset,
        values.srcAddr,
        values.srcChain,
        values.dstAddr,
        values.dstChain,
      )

      const { source } = xTransfer
      const { balance, fee, feeBalance, destinationFee } = source

      const call = await xTransfer.buildCall(values.amount)

      return await createTransaction(
        {
          title: t("xcm.transfer.reviewTransaction.modal.title"),
          description: t("xcm.transfer.reviewTransaction.modal.description", {
            amount: values.amount,
            symbol: balance.symbol,
            srcChain: srcChain.name,
            dstChain: dstChain.name,
          }),
          tx: api.tx(call.data),
          xcallMeta: {
            srcChain: values.srcChain,
            srcChainFee: fee.toDecimal(fee.decimals),
            srcChainFeeBalance: feeBalance.toDecimal(feeBalance.decimals),
            srcChainFeeSymbol: fee.originSymbol,
            dstChain: values.dstChain,
            dstChainFee: destinationFee.toDecimal(destinationFee.decimals),
            dstChainFeeSymbol: destinationFee.originSymbol,
          },
        },
        {
          steps,
          toast: createToastMessages("xcm.transfer.toast", {
            t,
            tOptions: {
              amount: values.amount,
              symbol: balance.symbol,
              srcChain: srcChain.name,
              dstChain: dstChain.name,
            },
            components: ["span.highlight"],
          }),
        },
      )
    },
  )
}