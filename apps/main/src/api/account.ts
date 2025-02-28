import { isSS58Address } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

type UseNonceProps = {
  address?: string
}

export const useNonce = ({ address }: UseNonceProps) => {
  const { papi } = useRpcProvider()
  return useQuery({
    enabled: isSS58Address(address),
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "nonce", address],
    queryFn: async () => {
      if (!isSS58Address(address)) throw new Error("Invalid address format")
      const res = await papi.query.System.Account.getValue(address)
      return res.nonce
    },
  })
}
