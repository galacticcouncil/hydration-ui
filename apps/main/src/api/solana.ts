import { isSolanaChain, SolanaAddr } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { PublicKey } from "@solana/web3.js"
import { useQuery } from "@tanstack/react-query"

/**
 * Resolves the owner wallet of a Solana SPL token account (e.g. an
 * associated token account). Returns `null` when the address is not
 * a token account.
 */
export const useSolanaTokenAccountOwner = (address: string, enabled = true) => {
  return useQuery({
    queryKey: ["solana", "tokenAccountOwner", address],
    enabled: enabled && SolanaAddr.isValid(address),
    staleTime: Infinity,
    queryFn: async (): Promise<string | null> => {
      const solana = chainsMap.get("solana")
      if (!solana || !isSolanaChain(solana)) return null

      const { value } = await solana.connection.getParsedAccountInfo(
        new PublicKey(address),
      )

      const data = value?.data
      if (data && "parsed" in data && data.parsed.type === "account") {
        return data.parsed.info?.owner ?? null
      }

      return null
    },
  })
}
