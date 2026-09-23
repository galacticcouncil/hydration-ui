import { useEvmAddress } from "@galacticcouncil/web3-connect"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Address, isAddress } from "viem"

export const DEFAULT_MARKET = "hydration_v3"

/** The connected EVM account, if there is one v2 can read positions for. */
export const useUserAddress = (): Address | undefined => {
  const evmAddress = useEvmAddress()
  return isAddress(evmAddress ?? "") ? (evmAddress as Address) : undefined
}

/** Opens a reserve's detail in the market currently selected. */
export const useNavigateToReserve = () => {
  const { market } = useSearch({ from: "/money-market" })
  const navigate = useNavigate()

  return (address: string) =>
    navigate({
      to: "/money-market/$address",
      params: { address },
      search: { market },
    })
}
