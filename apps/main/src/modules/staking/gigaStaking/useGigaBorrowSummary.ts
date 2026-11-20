import {
  assessBorrow,
  markets,
  summarizeAccount,
  summarizeReserves,
} from "@galacticcouncil/money-market/core"
import {
  useHollarFacilitator,
  useMarketPositions,
  useMarketReserves,
} from "@galacticcouncil/money-market/react"
import type {
  Account,
  PositionSummary,
  ReserveSummary,
} from "@galacticcouncil/money-market/types"
import { getAddressFromAssetId, STHDX_ASSET_ID } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useUserAddress } from "@/modules/money-market/hooks"

export const GIGA_MARKET = markets.gigahdx_v3

export type GigaBorrowSummary = {
  account: Account
  /** Hollar the account's collateral can still borrow, ignoring the facilitator bucket. */
  borrowableHollar: string
  /** What the user can borrow now: `borrowableHollar` capped by the facilitator bucket. */
  maxBorrowableHollar: string
  hdxReserve: ReserveSummary
  hollarReserve: ReserveSummary
  /** Absent until the user has interacted with the reserve. */
  hdxPosition: PositionSummary | undefined
  hollarPosition: PositionSummary | undefined
}

const isAddress = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/**
 * The connected user's GIGAHDX market standing: stHDX collateral, Hollar debt
 * and how much more Hollar they can borrow. Accrued once per read.
 */
export const useGigaBorrowSummary = () => {
  const user = useUserAddress()
  const reserves = useMarketReserves(GIGA_MARKET)
  const positions = useMarketPositions(user, GIGA_MARKET)
  const facilitator = useHollarFacilitator(GIGA_MARKET)

  const data = useMemo((): GigaBorrowSummary | undefined => {
    if (!reserves.data || !positions.data || !facilitator.data) return

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const request = {
      reserves: reserves.data,
      summaries: summarizeReserves({ ...reserves.data, currentTimestamp }),
      positions: positions.data,
      currentTimestamp,
    }
    const summary = summarizeAccount(request)

    const hdxAddress = getAddressFromAssetId(STHDX_ASSET_ID)
    const hollarAddress = GIGA_MARKET.addresses.HOLLAR_TOKEN
    const hdxReserve = request.summaries.find((reserve) =>
      isAddress(reserve.underlyingAsset, hdxAddress),
    )
    const hollarReserve = request.summaries.find((reserve) =>
      isAddress(reserve.underlyingAsset, hollarAddress),
    )

    if (!hdxReserve || !hollarReserve) return

    const hollarPrice = Big(hollarReserve.priceInUsd)
    const borrowableHollar = hollarPrice.gt(0)
      ? Big(summary.account.availableBorrowsUsd).div(hollarPrice).toString()
      : "0"

    const { max } = assessBorrow({
      ...request,
      asset: hollarAddress,
      amount: "0",
      hollarFacilitator: facilitator.data,
    })

    return {
      account: summary.account,
      borrowableHollar,
      maxBorrowableHollar: max,
      hdxReserve,
      hollarReserve,
      hdxPosition: summary.positions.find((position) =>
        isAddress(position.underlyingAsset, hdxAddress),
      ),
      hollarPosition: summary.positions.find((position) =>
        isAddress(position.underlyingAsset, hollarAddress),
      ),
    }
  }, [reserves.data, positions.data, facilitator.data])

  return {
    data,
    isLoading:
      !!user &&
      (reserves.isPending || positions.isPending || facilitator.isPending),
  }
}
