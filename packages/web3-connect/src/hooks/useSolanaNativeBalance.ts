import { isSolanaChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { PublicKey } from "@solana/web3.js"
import { queryOptions, useQuery } from "@tanstack/react-query"

const fetchSolanaNativeBalance = async (
  address: string,
): Promise<AssetAmount> => {
  const solana = chainsMap.get("solana")

  if (!solana || !isSolanaChain(solana) || !solana.connection) {
    throw new Error("Solana is not connected")
  }

  const nativeAsset = solana.assetsData.get("sol")

  if (!nativeAsset || !nativeAsset.decimals) {
    throw new Error("Invalid Solana native asset")
  }

  const balance = await solana.connection.getBalance(new PublicKey(address))

  return AssetAmount.fromAsset(nativeAsset.asset, {
    amount: BigInt(balance),
    decimals: nativeAsset.decimals,
  })
}

export const solanaNativeBalanceQueryOptions = (address: string) =>
  queryOptions({
    queryKey: ["solana", "native", "balance", address],
    queryFn: () => fetchSolanaNativeBalance(address),
    enabled: !!address,
  })

export const useSolanaNativeBalance = (address: string) =>
  useQuery(solanaNativeBalanceQueryOptions(address))
