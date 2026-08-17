import { Balance as SdkBalance } from "@galacticcouncil/sdk-next"

export enum TokenLockType {
  Vesting = "ormlvest",
  Democracy = "democrac",
  OpenGov = "pyconvot",
  Staking = "stk_stks",
  GigaStaking = "ghdxlock",
}

export enum TokenReserveType {
  DCA = "dcaorder",
  XCM = "depositc",
  OTC = "otcorder",
}

export type BalanceData = {
  readonly accountId: string
  readonly assetId: string
  readonly balance: string
  readonly total: string
  readonly freeBalance: string
  readonly reservedBalance: string
}

export type Balance = SdkBalance & {
  assetId: string
}

export type AccountBalanceFilter = {
  followedTokenIds: readonly number[]
  erc20AssetIds: readonly number[]
}

export type BalanceRecord = Record<string, Balance>

export const EMPTY_BALANCES: BalanceRecord = {}
