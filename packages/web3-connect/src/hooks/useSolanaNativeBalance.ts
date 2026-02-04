import { isSolanaChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { PublicKey } from "@solana/web3.js"
import { useQuery } from "@tanstack/react-query"

const fetchSolanaAccountBalance = async (address: string) => {
  const solana = chainsMap.get("solana")

  if (!solana || !isSolanaChain(solana) || !solana.connection) {
    throw new Error("Solana is not connected")
  }

  const nativeAsset = solana.assetsData.get("sol")

  if (!nativeAsset || !nativeAsset.decimals) {
    throw new Error("Invalid Solana native asset")
  }

  const balance = await solana.connection.getBalance(new PublicKey(address))

  return {
    amount: balance.toString(),
    decimals: nativeAsset.decimals,
    symbol: nativeAsset.asset.originSymbol,
  }
}

export const useSolanaNativeBalance = (address: string) => {
  return useQuery({
    queryKey: ["solana", "native", "balance", address],
    queryFn: () => fetchSolanaAccountBalance(address),
    enabled: !!address,
  })
}
