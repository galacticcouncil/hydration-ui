import { isSuiChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { queryOptions, useQuery } from "@tanstack/react-query"

const fetchSuiNativeBalance = async (address: string): Promise<AssetAmount> => {
  const sui = chainsMap.get("sui")

  if (!sui || !isSuiChain(sui) || !sui.client) {
    throw new Error("Sui is not connected")
  }

  const suiNativeToken = sui.assetsData.get("sui")

  if (!suiNativeToken || !suiNativeToken.decimals) {
    throw new Error("Sui native token not found")
  }

  const { totalBalance } = await sui.client.getBalance({
    owner: address,
  })

  return AssetAmount.fromAsset(suiNativeToken.asset, {
    amount: BigInt(totalBalance),
    decimals: suiNativeToken.decimals,
  })
}

export const suiNativeBalanceQueryOptions = (address: string) =>
  queryOptions({
    queryKey: ["sui", "native", "balance", address],
    queryFn: () => fetchSuiNativeBalance(address),
    enabled: !!address,
  })

export const useSuiNativeBalance = (address: string) =>
  useQuery(suiNativeBalanceQueryOptions(address))
