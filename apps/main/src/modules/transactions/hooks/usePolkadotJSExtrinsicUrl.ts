import { HYDRATION_CHAIN_KEY, isAnyParachain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { first } from "remeda"

import { AnyTransaction } from "@/modules/transactions/types"
import { getPapiTransactionCallData } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"

export const usePolkadotJSExtrinsicUrl = (
  tx: AnyTransaction,
  srcChainKey: string = HYDRATION_CHAIN_KEY,
): string => {
  const { papiCompatibilityToken } = useRpcProvider()
  const { rpcUrl } = useProviderRpcUrlStore()

  const callData = getPapiTransactionCallData(tx, papiCompatibilityToken)

  if (!callData) return ""

  const ws =
    srcChainKey === HYDRATION_CHAIN_KEY
      ? rpcUrl
      : getParachainWsUrl(srcChainKey)

  if (!ws) return ""

  return `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(ws)}#/extrinsics/decode/${callData}`
}

function getParachainWsUrl(srcChainKey: string) {
  const chain = chainsMap.get(srcChainKey)
  if (chain && isAnyParachain(chain)) {
    return Array.isArray(chain.ws) ? first(chain.ws) : chain.ws
  }
}
