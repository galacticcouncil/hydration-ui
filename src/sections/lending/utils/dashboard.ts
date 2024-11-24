import { InterestRate } from "@aave/contract-helpers"
import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import {
  ComputedReserveData,
  ComputedUserReserveData,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export type BorrowAssetsItem = {
  id: string
  symbol: string
  name: string
  iconSymbol: string
  underlyingAsset: string
  stableBorrowRate: number | string
  variableBorrowRate: number | string
  availableBorrows: number | string
  availableBorrowsInUSD: number | string
  stableBorrowRateEnabled?: boolean
  isFreezed?: boolean
  aIncentivesData?: ReserveIncentiveResponse[]
  vIncentivesData?: ReserveIncentiveResponse[]
  sIncentivesData?: ReserveIncentiveResponse[]
  borrowCap: string
  borrowableInIsolation: boolean
  totalBorrows: string
  totalLiquidityUSD: string
  borrowingEnabled: boolean
  isActive: boolean
  eModeCategoryId: number
}

export type SupplyAssetsItem = {
  underlyingAsset: string
  symbol: string
  iconSymbol: string
  name: string
  walletBalance: string
  walletBalanceUSD: string
  availableToDeposit: string
  availableToDepositUSD: string
  supplyAPY: number | string
  aIncentivesData?: ReserveIncentiveResponse[]
  isFreezed?: boolean
  isIsolated: boolean
  totalLiquidity: string
  supplyCap: string
  isActive?: boolean
  usageAsCollateralEnabledOnUser: boolean
  detailsAddress: string
}

// Helpers
export const DASHBOARD_LIST_COLUMN_WIDTHS = {
  ASSET: 130,
  BUTTONS: 160,
  CELL: 130,
}

// Note: Create a single type that works with all four dashboards list and all 8 list item components
// Each list item may need a combination of a few types but not all, i.e. positions vs assets and supplied vs borrowed
type DashboardReserveData = ComputedUserReserveData &
  ComputedReserveData &
  BorrowAssetsItem &
  SupplyAssetsItem

export type DashboardReserve = DashboardReserveData & {
  // Additions
  borrowRateMode: InterestRate // for the borrow positions list
  // Overrides
  reserve: ComputedReserveData
}
