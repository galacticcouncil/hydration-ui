import {
  HYDRATION_CHAIN_KEY,
  isAnyParachain,
  safeStringify,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useQuery } from "@tanstack/react-query"
import { first } from "remeda"

import { AnyTransaction } from "@/modules/transactions/types"
import { getPapiTransactionCallData } from "@/modules/transactions/utils/tx"
import { useProviderRpcUrlStore } from "@/states/provider"

export const usePolkadotJSExtrinsicUrl = (
  tx: AnyTransaction,
  srcChainKey: string = HYDRATION_CHAIN_KEY,
): string => {
  const { rpcUrl } = useProviderRpcUrlStore()

  const { data: callData } = useQuery({
    queryKey: ["papiCallData", safeStringify(tx)],
    queryFn: () => getPapiTransactionCallData(tx),
    staleTime: Infinity,
  })

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
