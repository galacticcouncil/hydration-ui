import { assetsMap, chainsConfigMap, chainsMap } from "@galacticcouncil/xcm-cfg"
import { ConfigService, SubstrateApis } from "@galacticcouncil/xcm-core"
import { Wallet } from "@galacticcouncil/xcm-sdk"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useStore } from "state/store"
import { isAnyParachain } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

type TransferProps = {
  asset: string
  srcAddr: string
  srcChain: string
  dstAddr: string
  dstChain: string
}

export const xcmConfigService = new ConfigService({
  assets: assetsMap,
  chains: chainsMap,
  chainsConfig: chainsConfigMap,
})

export const wallet = new Wallet({
  config: xcmConfigService,
})

export const useCrossChainTransfer = ({
  asset,
  srcAddr,
  srcChain,
  dstAddr,
  dstChain,
}: TransferProps) => {
  return useQuery(
    QUERY_KEYS.xcmTransfer(asset, srcAddr, srcChain, dstAddr, dstChain),
    async () =>
      await wallet.transfer(asset, srcAddr, srcChain, dstAddr, dstChain),
  )
}

export const useCrossChainTransaction = () => {
  const { createTransaction } = useStore()

  return useMutation(async (values: TransferProps & { amount: number }) => {
    const chain = chainsMap.get(values.srcChain)

    if (!chain) throw new Error("Invalid chain")
    if (!isAnyParachain(chain)) throw new Error("Chain is not a parachain")

    const apiPool = SubstrateApis.getInstance()
    const api = await apiPool.api(chain.ws)

    const xTransfer = await wallet.transfer(
      values.asset,
      values.srcAddr,
      values.srcChain,
      values.dstAddr,
      values.dstChain,
    )

    const { balance, srcFee, dstFee } = xTransfer

    const call = await xTransfer.buildCall(values.amount)

    return await createTransaction({
      tx: api.tx(call.data),
      xcallMeta: {
        srcChain: values.srcChain,
        srcChainFee: srcFee.toDecimal(dstFee.decimals),
        srcChainFeeBalance: balance.toDecimal(balance.decimals),
        srcChainFeeSymbol: srcFee.originSymbol,
        dstChain: values.dstChain,
        dstChainFee: dstFee.toDecimal(dstFee.decimals),
        dstChainFeeSymbol: dstFee.originSymbol,
      },
    })
  })
}
