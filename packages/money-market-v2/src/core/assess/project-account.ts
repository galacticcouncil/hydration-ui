import type { Address } from "viem"

import { findByAsset, isAsset } from "@/core/assets"
import type {
  AccountSummary,
  SummarizeAccountRequest,
} from "@/core/derive/account"
import { summarizeAccount } from "@/core/derive/account"
import {
  getReserveNormalizedIncome,
  getReserveNormalizedVariableDebt,
} from "@/core/derive/pool-math"
import { rayDiv } from "@/core/derive/ray-math"
import type {
  MarketPositions,
  MarketReserves,
  Position,
  Reserve,
} from "@/types"

/**
 * What an action does to a user's positions. Amounts are raw base units of the
 * reserve's underlying asset.
 *
 * `isolationJoin` is a supply that also leaves the supplied asset as the only
 * collateral — every other collateral flag off, its own on.
 */
export type PositionChange =
  | {
      kind: "supply" | "withdraw" | "borrow" | "repay" | "isolationJoin"
      asset: Address
      amountRaw: bigint
    }
  | { kind: "setUsageAsCollateral"; asset: Address; enabled: boolean }
  | { kind: "setEMode"; categoryId: number }

export type ProjectAccountRequest = SummarizeAccountRequest & {
  change: PositionChange
}

/**
 * The account an action would leave behind, computed by `summarizeAccount`
 * itself on the changed positions, so a projection can never disagree with the
 * displayed account (ADR-0011).
 */
export function projectAccount(request: ProjectAccountRequest): AccountSummary {
  return summarizeAccount({ ...request, positions: projectPositions(request) })
}

type ProjectPositionsRequest = Pick<
  ProjectAccountRequest,
  "reserves" | "positions" | "change" | "currentTimestamp"
>

/**
 * The positions after the change, adjusted the way the pool adjusts them:
 * scaled balances move by `rayDiv(amount, index)` at `currentTimestamp`, and
 * never below zero.
 */
export function projectPositions({
  reserves,
  positions,
  change,
  currentTimestamp,
}: ProjectPositionsRequest): MarketPositions {
  switch (change.kind) {
    case "setEMode":
      return { ...positions, eModeCategoryId: change.categoryId }

    case "setUsageAsCollateral":
      return updatePosition(positions, change.asset, (position) => ({
        ...position,
        usageAsCollateralEnabledOnUser: change.enabled,
      }))

    case "isolationJoin": {
      const supplied = supply(reserves, positions, change, currentTimestamp)
      const isolated = {
        ...supplied,
        positions: supplied.positions.map((position) => ({
          ...position,
          usageAsCollateralEnabledOnUser: false,
        })),
      }

      return updatePosition(isolated, change.asset, (position) => ({
        ...position,
        usageAsCollateralEnabledOnUser: true,
      }))
    }

    case "supply":
      return supply(reserves, positions, change, currentTimestamp)

    case "withdraw": {
      if (change.amountRaw === 0n) return positions

      const burned = rayDiv(
        change.amountRaw,
        normalizedIncome(
          findByAsset(reserves.reserves, change.asset),
          currentTimestamp,
        ),
      )

      return updatePosition(positions, change.asset, (position) => {
        const scaledATokenBalance = subtract(
          position.scaledATokenBalance,
          burned,
        )

        // The pool clears the collateral flag of a position withdrawn to zero.
        return {
          ...position,
          scaledATokenBalance,
          usageAsCollateralEnabledOnUser:
            scaledATokenBalance !== "0" &&
            position.usageAsCollateralEnabledOnUser,
        }
      })
    }

    case "borrow":
    case "repay": {
      if (change.amountRaw === 0n) return positions

      const scaled = rayDiv(
        change.amountRaw,
        normalizedVariableDebt(
          findByAsset(reserves.reserves, change.asset),
          currentTimestamp,
        ),
      )

      return updatePosition(positions, change.asset, (position) => ({
        ...position,
        scaledVariableDebt:
          change.kind === "borrow"
            ? (BigInt(position.scaledVariableDebt) + scaled).toString()
            : subtract(position.scaledVariableDebt, scaled),
      }))
    }
  }
}

/* -------------------------------------------------------------------------- */

function supply(
  reserves: MarketReserves,
  positions: MarketPositions,
  { asset, amountRaw }: { asset: Address; amountRaw: bigint },
  currentTimestamp: number,
): MarketPositions {
  if (amountRaw === 0n) return positions

  const reserve = findByAsset(reserves.reserves, asset)
  const minted = rayDiv(amountRaw, normalizedIncome(reserve, currentTimestamp))

  return updatePosition(positions, asset, (position) => ({
    ...position,
    scaledATokenBalance: (
      BigInt(position.scaledATokenBalance) + minted
    ).toString(),
    usageAsCollateralEnabledOnUser:
      position.usageAsCollateralEnabledOnUser ||
      (BigInt(position.scaledATokenBalance) === 0n &&
        enablesAsCollateralOnFirstSupply(reserves, positions, reserve)),
  }))
}

/**
 * `ValidationLogic.validateUseAsCollateral`, which the pool runs on a first
 * supply: a reserve with LTV 0 never becomes collateral; one does when the
 * user has no collateral yet; otherwise only if the user is not in isolation
 * mode and the reserve is not isolated itself.
 */
function enablesAsCollateralOnFirstSupply(
  reserves: MarketReserves,
  positions: MarketPositions,
  reserve: Reserve,
): boolean {
  if (reserve.baseLTVasCollateral === "0") return false

  const collateral = positions.positions.filter(
    (position) => position.usageAsCollateralEnabledOnUser,
  )
  const [only] = collateral
  if (!only) return true

  const isolationModeActive =
    collateral.length === 1 &&
    findByAsset(reserves.reserves, only.underlyingAsset).debtCeiling !== "0"

  return !isolationModeActive && reserve.debtCeiling === "0"
}

/** Applies `update` to the asset's position, creating an empty one if absent. */
function updatePosition(
  positions: MarketPositions,
  asset: Address,
  update: (position: Position) => Position,
): MarketPositions {
  const exists = positions.positions.some((position) =>
    isAsset(position.underlyingAsset, asset),
  )
  const list = exists
    ? positions.positions
    : [
        ...positions.positions,
        {
          underlyingAsset: asset.toLowerCase() as Address,
          scaledATokenBalance: "0",
          scaledVariableDebt: "0",
          usageAsCollateralEnabledOnUser: false,
        },
      ]

  return {
    ...positions,
    positions: list.map((position) =>
      isAsset(position.underlyingAsset, asset) ? update(position) : position,
    ),
  }
}

function subtract(balance: string, amount: bigint): string {
  const remaining = BigInt(balance) - amount
  return (remaining > 0n ? remaining : 0n).toString()
}

function normalizedIncome(reserve: Reserve, currentTimestamp: number): bigint {
  return getReserveNormalizedIncome({
    rate: BigInt(reserve.liquidityRate),
    index: BigInt(reserve.liquidityIndex),
    lastUpdateTimestamp: reserve.lastUpdateTimestamp,
    currentTimestamp,
  })
}

function normalizedVariableDebt(
  reserve: Reserve,
  currentTimestamp: number,
): bigint {
  return getReserveNormalizedVariableDebt({
    rate: BigInt(reserve.variableBorrowRate),
    index: BigInt(reserve.variableBorrowIndex),
    lastUpdateTimestamp: reserve.lastUpdateTimestamp,
    currentTimestamp,
  })
}
