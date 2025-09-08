import { Big } from "big.js"
import { createContext, ReactNode, useContext, useMemo } from "react"

import { BorrowCapMaxedTooltip } from "@/components/tooltips/BorrowCapMaxedTooltip"
import { DebtCeilingMaxedTooltip } from "@/components/tooltips/DebtCeilingMaxedTooltip"
import { SupplyCapMaxedTooltip } from "@/components/tooltips/SupplyCapMaxedTooltip"
import { BorrowCapWarning } from "@/components/warnings/BorrowCapWarning"
import { DebtCeilingWarning } from "@/components/warnings/DebtCeilingWarning"
import { SupplyCapWarning } from "@/components/warnings/SupplyCapWarning"
import { AssetCapData, ComputedReserveData } from "@/hooks/commonTypes"

const CAP_WARNING_PERCENT = 98

type WarningDisplayProps = {
  supplyCap?: AssetCapData
  borrowCap?: AssetCapData
  debtCeiling?: AssetCapData
  icon?: boolean
}

export type AssetCapHookData = AssetCapData & {
  determineWarningDisplay: (
    props: WarningDisplayProps,
  ) => React.JSX.Element | null
  displayMaxedTooltip: (props: WarningDisplayProps) => React.JSX.Element | null
}

export type AssetCapUsageData = {
  reserve: ComputedReserveData
  supplyCap: AssetCapHookData
  borrowCap: AssetCapHookData
  debtCeiling: AssetCapHookData
}

export const getAssetCapData = (
  asset: ComputedReserveData,
): AssetCapUsageData => {
  const { supplyCapUsage, supplyCapReached } = getSupplyCapData(asset)
  const { borrowCapUsage, borrowCapReached } = getBorrowCapData(asset)
  const { debtCeilingUsage, debtCeilingReached } = getDebtCeilingData(asset)
  /*
    Aggregated Data
  */
  const assetCapUsageData: AssetCapUsageData = {
    reserve: asset,
    supplyCap: {
      percentUsed: supplyCapUsage,
      isMaxed: supplyCapReached,
      // percentUsed: 99.9,
      // isMaxed: true,
      determineWarningDisplay: ({ supplyCap, ...rest }) =>
        supplyCap && supplyCap.percentUsed >= CAP_WARNING_PERCENT ? (
          <SupplyCapWarning supplyCap={supplyCap} {...rest} />
        ) : null,
      displayMaxedTooltip: ({ supplyCap }) =>
        supplyCap && supplyCap.isMaxed ? (
          <SupplyCapMaxedTooltip supplyCap={supplyCap} />
        ) : null,
    },
    borrowCap: {
      percentUsed: borrowCapUsage,
      isMaxed: borrowCapReached,
      // percentUsed: 98.5,
      // isMaxed: false,
      determineWarningDisplay: ({ borrowCap, ...rest }) =>
        borrowCap && borrowCap.percentUsed >= CAP_WARNING_PERCENT ? (
          <BorrowCapWarning borrowCap={borrowCap} {...rest} />
        ) : null,
      displayMaxedTooltip: ({ borrowCap }) =>
        borrowCap && borrowCap.isMaxed ? (
          <BorrowCapMaxedTooltip borrowCap={borrowCap} />
        ) : null,
    },
    debtCeiling: {
      percentUsed: debtCeilingUsage,
      isMaxed: debtCeilingReached,
      // percentUsed: 99.994,
      // isMaxed: true,
      determineWarningDisplay: ({ debtCeiling, ...rest }) =>
        debtCeiling && debtCeiling.percentUsed >= CAP_WARNING_PERCENT ? (
          <DebtCeilingWarning debtCeiling={debtCeiling} {...rest} />
        ) : null,
      displayMaxedTooltip: ({ debtCeiling }) =>
        debtCeiling && debtCeiling.isMaxed ? (
          <DebtCeilingMaxedTooltip debtCeiling={debtCeiling} />
        ) : null,
    },
  }

  return assetCapUsageData
}

export const useAssetCap = (asset: ComputedReserveData): AssetCapUsageData => {
  return useMemo(() => getAssetCapData(asset), [asset])
}

/*
  Asset Caps Context
*/
const AssetCapsContext = createContext({} as AssetCapUsageData)

/*
  Asset Caps Provider Component
*/
export const AssetCapsProvider = ({
  children,
  asset,
}: {
  children: ReactNode
  asset: ComputedReserveData
}): React.JSX.Element | null => {
  // Return if no reserve is provided
  if (!asset) {
    console.warn(
      "<AssetCapsProvider /> was not given a valid reserve asset to parse",
    )
    return null
  }

  const providerValue = getAssetCapData(asset)

  return (
    <AssetCapsContext.Provider value={providerValue}>
      {children}
    </AssetCapsContext.Provider>
  )
}

/*
  useAssetCaspsContext hook
*/
export const useAssetCaps = () => {
  const context = useContext(AssetCapsContext)

  if (context === undefined) {
    throw new Error(
      "useAssetCaps() can only be used inside of <AssetCapsProvider />, " +
        "please declare it at a higher level.",
    )
  }

  return context
}

/**
 * Calculates supply cap usage and % of totalLiquidity / supplyCap.
 * @param asset ComputedReserveData
 * @returns { supplyCapUsage: number, supplyCapReached: boolean }
 */
export const getSupplyCapData = (asset: ComputedReserveData) => {
  let supplyCapUsage: number =
    asset && asset.supplyCap !== "0"
      ? Big(asset.totalLiquidity).div(asset.supplyCap).toNumber() * 100
      : 0
  supplyCapUsage = supplyCapUsage === Infinity ? 0 : supplyCapUsage
  const supplyCapReached = supplyCapUsage >= 99.99
  return { supplyCapUsage, supplyCapReached }
}

/**
 * Calculates borrow cap usage and % of totalDebt / borrowCap.
 * @param asset ComputedReserveData
 * @returns { borrowCapUsage: number, borrowCapReached: boolean }
 */
export const getBorrowCapData = (asset: ComputedReserveData) => {
  let borrowCapUsage: number =
    asset && asset.borrowCap !== "0"
      ? Big(asset.totalDebt).div(asset.borrowCap).toNumber() * 100
      : 0
  borrowCapUsage = borrowCapUsage === Infinity ? 0 : borrowCapUsage
  const borrowCapReached = borrowCapUsage >= 99.99
  return { borrowCapUsage, borrowCapReached }
}

/**
 * Calculates debt ceiling usage and % of isolationModeTotalDebt / debtCeiling.
 * @param asset
 * @returns {debtCeilingUsage: number, debtCeilingReached: boolean}
 */
export const getDebtCeilingData = (asset: ComputedReserveData) => {
  let debtCeilingUsage: number =
    asset && asset.debtCeiling !== "0"
      ? Big(asset.isolationModeTotalDebt).div(asset.debtCeiling).toNumber() *
        100
      : 0
  debtCeilingUsage = debtCeilingUsage === Infinity ? 0 : debtCeilingUsage
  const debtCeilingReached = debtCeilingUsage >= 99.99
  return { debtCeilingUsage, debtCeilingReached }
}
