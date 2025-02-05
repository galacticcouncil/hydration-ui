import {
  assetsMap,
  chainsMap,
  routesMap,
  validations,
  dex,
  HydrationConfigService,
} from "@galacticcouncil/xcm-cfg"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { Wallet } from "@galacticcouncil/xcm-sdk"
import { useMutation } from "@tanstack/react-query"
import { Transaction, useStore } from "state/store"
import { isAnyParachain } from "utils/helpers"
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

export const createXcmAssetKey = (
  id: string,
  symbol: string,
  parachainId: number,
) => {
  return [symbol.toLowerCase(), parachainId, id].join("_")
}

export const syncAssethubXcmConfig = (
  asset: TRegisteredAsset,
  config: HydrationConfigService,
) => {
  config.registerExternal([asset])
}

export const useCrossChainWallet = () => {
  const { poolService } = useRpcProvider()

  return useMemo(() => {
    const configService = new HydrationConfigService({
      assets: assetsMap,
      chains: chainsMap,
      routes: routesMap,
    })

    const wallet = new Wallet({
      configService: configService,
      transferValidations: validations,
    })

    // Register chain swaps
    const hydration = configService.getChain("hydration")
    const assethub = configService.getChain("assethub")
    const assethubCex = configService.getChain("assethub_cex")

    wallet.registerDex(
      new dex.HydrationDex(hydration, poolService),
      new dex.AssethubDex(assethub),
      new dex.AssethubDex(assethubCex),
    )

    return wallet
  }, [poolService])
}

export const useCrossChainTransaction = ({
  steps,
}: {
  steps?: Transaction["steps"]
} = {}) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()

  return useMutation(
    async (
      values: TransferProps & { amount: number | string; wallet: Wallet },
    ) => {
      const srcChain = chainsMap.get(values.srcChain)
      const dstChain = chainsMap.get(values.dstChain)

      if (!srcChain) throw new Error(`Chain ${values.srcChain} not found`)
      if (!dstChain) throw new Error(`Chain ${values.dstChain} not found`)
      if (!isAnyParachain(srcChain))
        throw new Error(`Chain ${values.srcChain} is not a parachain`)

      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(srcChain.ws)

      const xTransfer = await values.wallet.transfer(
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
