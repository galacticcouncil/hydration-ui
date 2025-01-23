import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { SolanaChain } from "@galacticcouncil/xcm-core"
import { PublicKey } from "@solana/web3.js"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

export const solana = chainsMap.get("solana") as SolanaChain
export const solanaNativeToken = solana.assetsData.get("sol")!

type TAccountBalance = Awaited<ReturnType<typeof fetchSolanaAccountBalance>>

const fetchSolanaAccountBalance = async (address: string) => {
  if (!solana.connection) throw new Error("Solana is not connected")

  const balance = await solana.connection.getBalance(new PublicKey(address))

  return {
    amount: balance.toString(),
    decimals: solanaNativeToken.decimals,
    symbol: solanaNativeToken.asset.originSymbol,
  }
}

export const useSolanaAccountBalance = (
  address: string,
  options: UseQueryOptions<TAccountBalance> = {},
) => {
  return useQuery<TAccountBalance>(
    QUERY_KEYS.solanaAccountBalance(address),
    async () => fetchSolanaAccountBalance(address),
    {
      enabled: !!address,
      ...options,
    },
  )
}
