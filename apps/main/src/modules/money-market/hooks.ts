import {
  summarizeAccount,
  summarizeReserves,
} from "@galacticcouncil/money-market/core"
import {
  useMarketPositions,
  useMarketReserves,
} from "@galacticcouncil/money-market/react"
import type { MarketDescriptor } from "@galacticcouncil/money-market/types"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"
import { Address, isAddress } from "viem"

export const DEFAULT_MARKET = "hydration_v3"

/** The connected EVM account, if there is one the package can read positions for. */
export const useUserAddress = (): Address | undefined => {
  const evmAddress = useEvmAddress()
  return isAddress(evmAddress ?? "") ? (evmAddress as Address) : undefined
}

/**
 * The user's account in `market`, whichever market the provider is set to.
 * Accrued once per read rather than on a tick: for totals shown outside the
 * borrow pages.
 */
export const useMarketAccount = (
  user: Address | undefined,
  market: MarketDescriptor,
) => {
  const reserves = useMarketReserves(market)
  const positions = useMarketPositions(user, market)

  const data = useMemo(() => {
    if (!reserves.data || !positions.data) return undefined

    const currentTimestamp = Math.floor(Date.now() / 1000)

    return summarizeAccount({
      reserves: reserves.data,
      summaries: summarizeReserves({ ...reserves.data, currentTimestamp }),
      positions: positions.data,
      currentTimestamp,
    }).account
  }, [reserves.data, positions.data])

  return {
    data,
    isLoading: !!user && (reserves.isPending || positions.isPending),
  }
}

/** Opens a reserve's detail in the market currently selected. */
export const useNavigateToReserve = () => {
  const { market } = useSearch({ from: "/borrow" })
  const navigate = useNavigate()

  return (address: string) =>
    navigate({
      to: "/borrow/markets/$address",
      params: { address },
      search: { market },
    })
}
