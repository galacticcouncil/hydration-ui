import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { SuiChain } from "@galacticcouncil/xcm-core"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

const fetchSuiAccountBalance = async (address: string) => {
  const sui = chainsMap.get("sui") as SuiChain
  const suiNativeToken = sui.assetsData.get("sui")

  if (!sui.client) throw new Error("Sui is not connected")
  if (!suiNativeToken) throw new Error("Sui native token not found")

  const { totalBalance } = await sui.client.getBalance({
    owner: address,
  })

  return {
    amount: totalBalance,
    decimals: suiNativeToken.decimals,
    symbol: suiNativeToken.asset.originSymbol,
  }
}

export const useSuiAccountBalance = (address: string) => {
  return useQuery(
    QUERY_KEYS.suiAccountBalance(address),
    async () => fetchSuiAccountBalance(address),
    {
      enabled: !!address,
    },
  )
}
