import { isBinary } from "@galacticcouncil/utils"

import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"
import { AnyTransaction } from "@/states/transactions"

export const usePolkadotJSExtrinsicUrl = (tx: AnyTransaction): string => {
  const { papiCompatibilityToken } = useRpcProvider()
  const { rpcUrl } = useProviderRpcUrlStore()

  const callData = isPapiTransaction(tx)
    ? tx.getEncodedData(papiCompatibilityToken)
    : null

  if (!isBinary(callData)) return ""

  const url = encodeURIComponent(rpcUrl ?? import.meta.env.VITE_PROVIDER_URL)
  const hex = callData.asHex()
  return `https://polkadot.js.org/apps/?rpc=${url}#/extrinsics/decode/${hex}`
}
