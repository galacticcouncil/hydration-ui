export const STABLE_BONDS_ASSET_ID = "222"

export const FAKE_POSITION = {
  initialPaidAmount: 1000,
  initialPaidSymbol: "USDC",
  initialPaidUsd: 1000,
  receiveAmount: 1017,
  receiveSymbol: "HOLLAR",
  receiveUsd: 1069,
  maturityDate: "04/01/2025",
  daysLeft: 45,
  netApr: 6.8,
} as const

export const FAKE_STRATEGY = {
  remainingCapacityUsdc: "222 222",
  remainingCapacityUsdt: "222 222",
  availableApr: 6.9,
  maturityPeriodDays: 90,
} as const
