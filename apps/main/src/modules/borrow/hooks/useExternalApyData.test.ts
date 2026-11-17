import { millisecondsInSecond } from "date-fns/constants"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getRewardsProgram } from "@/api/rewardsDistributor"
import { latestFileSchema } from "@/api/rewardsDistributor.utils"
// run as a plain function, which the mock of useMemo below allows
import { useExternalApyData as readExternalApyData } from "@/modules/borrow/hooks/useExternalApyData"

const mocks = vi.hoisted(() => ({
  // an asset's ERC-20 address, as the chain derives it from the asset's id
  addressOf: (assetId: string) =>
    `0x${"0".repeat(31)}1${Number(assetId).toString(16).padStart(8, "0")}`,
  assetIdOf: (address: string) => String(parseInt(address.slice(-8), 16)),
  // what the hooks under test read, set by each test
  read: {
    program: {} as unknown,
    reserves: [] as unknown[],
    // the assets a pool share is made of, by the share's id
    pools: {} as Record<string, string[]>,
  },
}))

// The two hooks only memoize, so their own code runs here: from latest.json
// and the money market's reserves to the rates the money market is handed.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useMemo: (compute: () => unknown) => compute(),
}))
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQuery: () => ({ data: undefined, isLoading: false }),
}))
vi.mock("@galacticcouncil/utils", async () => ({
  ...(await import("@galacticcouncil/utils/src/constants/assets")),
  getAddressFromAssetId: mocks.addressOf,
  getAssetIdFromAddress: mocks.assetIdOf,
  useStableArray: (ids: string[]) => ids,
}))
vi.mock("@galacticcouncil/indexer/neckwork", () => ({
  stablepoolYieldMetricsQuery: () => ({}),
}))
vi.mock("@galacticcouncil/money-market/hooks", () => ({}))
vi.mock("@galacticcouncil/money-market/types", () => ({}))
vi.mock("@galacticcouncil/money-market/utils", () => ({}))
vi.mock("@galacticcouncil/web3-connect", () => ({}))
vi.mock("ethers", () => ({}))
vi.mock("polkadot-api", () => ({}))
vi.mock("@/api/aave", () => ({}))
vi.mock("@/api/borrow/contracts", () => ({}))
vi.mock("@/api/borrow/moneyMarketEvents", () => ({}))
vi.mock("@/api/borrow/queries", () => ({
  useBorrowReserves: () => ({
    data: { formattedReserves: mocks.read.reserves },
    isLoading: false,
  }),
  useExternalApys: () => ({ data: [], isLoading: false }),
}))
vi.mock("@/api/neckwork", () => ({ neckworkClient: {} }))
vi.mock("@/api/rewardsDistributor", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/rewardsDistributor")>()),
  useRewardsProgram: () => mocks.read.program,
}))
vi.mock("@/config/env", () => ({
  ENV: {
    VITE_REWARDS_DISTRIBUTOR_ADDRESS:
      "0x00000000000000000000000000000000000000d1",
    VITE_REWARDS_DISTRIBUTOR_URL: "https://rewards.test",
  },
}))
vi.mock("@/modules/liquidity/Liquidity.utils", () => ({
  useStablepoolsReserves: () => ({ data: [], isLoading: false }),
}))
vi.mock("@/modules/strategies/bil/hooks/useVaultReads", () => ({
  useVaultStats: () => ({ data: { apr: 0 } }),
}))
vi.mock("@/providers/assetsProvider", () => ({
  isStableSwap: (asset: { underlyingAssetId?: string[] }) =>
    !!asset.underlyingAssetId,
  useAssets: () => ({
    getAsset: (id: string) => ({ id, underlyingAssetId: mocks.read.pools[id] }),
    getErc20AToken: () => undefined,
    getRelatedAToken: () => undefined,
  }),
}))
vi.mock("@/providers/rpcProvider", () => ({}))

const HUSDC = "110"
const HUSDT = "111"
const VDOT = "15"
const PRIME = "43"
const USDC = "22"
const USDT = "10"
const HOLLAR = "222"

const EARNING = "0x03ec4ec5810c3dfe15b706dfd7639b9565f30414"
const BORROWER = "0x08668d9785b8ab9246b45cbf26998563eac007d2"

const HOUR = 1794902400
const ENDS_AT = HOUR + 3 * 3600
const READ_AT = (HOUR + 4200) * millisecondsInSecond

// what the money market's own controller streams on HUSDC: 1% a year
const STREAMED = {
  incentiveAPR: "0.01",
  rewardTokenAddress: mocks.addressOf("0"),
  rewardTokenSymbol: "HDX",
}

const reserve = (
  assetId: string,
  supplyAPY: string,
  aIncentivesData: unknown[] = [],
) => ({
  underlyingAsset: mocks.addressOf(assetId),
  supplyAPY,
  variableBorrowAPY: "0",
  priceInUSD: assetId === PRIME ? "2" : "1",
  aIncentivesData,
})

// The app takes an asset as a plain one or as a share of a pool, by the
// registry. Both shapes give HUSDC 3% and HUSDT 2% a year before incentives.
const SHAPES: {
  shape: string
  pools: Record<string, string[]>
  reserves: () => unknown[]
}[] = [
  {
    shape: "plain assets, each at its own reserve's rate",
    pools: {},
    reserves: () => [
      reserve(HUSDC, "0.03", [STREAMED]),
      reserve(HUSDT, "0.02"),
      reserve(VDOT, "0.05"),
      reserve(PRIME, "0"),
    ],
  },
  {
    shape: "shares of a pool, each at the rate of the two assets in it",
    pools: { [HUSDC]: [USDC, HOLLAR], [HUSDT]: [USDT, HOLLAR] },
    reserves: () => [
      // the share's reserve carries the incentives; its own rate is not read
      reserve(HUSDC, "0.5", [STREAMED]),
      reserve(HUSDT, "0.5"),
      reserve(USDC, "0.04"),
      reserve(USDT, "0.02"),
      reserve(HOLLAR, "0.02"),
      reserve(VDOT, "0.05"),
      reserve(PRIME, "0"),
    ],
  },
]

// With PRIME at $2 the program pays 10% a year on HUSDC and 5% on HUSDT.
const latest = (endsAt?: number) =>
  latestFileSchema.parse({
    format: "hydration-rewards-latest/1",
    asOf: { hour: HOUR, block: 4385, blockTime: HOUR + 156 },
    reward: { symbol: "PRIME", address: mocks.addressOf(PRIME), decimals: 6 },
    program: {
      name: "test",
      sha256: "0x00",
      maxHollarDebtUsd: "5.00",
      ...(endsAt !== undefined && { endsAt }),
    },
    assets: {
      HUSDC: { budgetPerDay: "100000000", eligibleUsd: "730000.00" },
      HUSDT: { budgetPerDay: "50000000", eligibleUsd: "730000.00" },
    },
    accounts: {
      [EARNING]: { earning: true, hollarDebtUsd: "0.00" },
      [BORROWER]: {
        earning: false,
        reason: "hollar_debt",
        hollarDebtUsd: "250944.35",
      },
    },
    latestTree: null,
  })

// the supply rate the money market is handed for each asset, as a fraction
const supplyRates = (
  account: string | undefined,
  file: ReturnType<typeof latest> | null,
  readAt = READ_AT,
) => {
  mocks.read.program = getRewardsProgram({ latest: file, account, readAt })
  const rates = readExternalApyData()

  return Object.fromEntries(
    [HUSDC, HUSDT, VDOT].map((assetId) => [
      assetId,
      Number(rates.get(assetId)?.supplyApy),
    ]),
  )
}

describe.each(SHAPES)(
  "the supply rates the money market is handed, which net APY weighs by the account's supply: $shape",
  ({ pools, reserves }) => {
    beforeEach(() => {
      mocks.read.pools = pools
      mocks.read.reserves = reserves()
    })

    it("without the program are each asset's rate and what the controller streams on it", () => {
      const rates = supplyRates(EARNING, null)

      expect(rates[HUSDC]).toBeCloseTo(0.03 + 0.01, 12)
      expect(rates[HUSDT]).toBeCloseTo(0.02, 12)
      expect(rates[VDOT]).toBeCloseTo(0.05, 12)
    })

    it("rise by the program's rate on HUSDC and HUSDT for an account that earns, once", () => {
      const rates = supplyRates(EARNING, latest())

      expect(rates[HUSDC]).toBeCloseTo(0.04 + 0.1, 12)
      expect(rates[HUSDT]).toBeCloseTo(0.02 + 0.05, 12)
      expect(rates[VDOT]).toBeCloseTo(0.05, 12)
    })

    it("leave the reserve's own incentives without the program's rate, which is counted in one place", () => {
      supplyRates(EARNING, latest())

      expect(mocks.read.reserves[0]).toMatchObject({
        aIncentivesData: [STREAMED],
      })
      expect(mocks.read.reserves[1]).toMatchObject({ aIncentivesData: [] })
    })

    it("do not rise for an account with HOLLAR debt, which the program does not pay", () => {
      expect(supplyRates(BORROWER, latest())).toEqual(
        supplyRates(EARNING, null),
      )
    })

    it("do not rise for anybody from the program's end on", () => {
      const without = supplyRates(EARNING, null)
      const ended = latest(ENDS_AT)
      const endsAt = ENDS_AT * millisecondsInSecond

      expect(supplyRates(EARNING, ended, endsAt)).toEqual(without)
      expect(supplyRates(undefined, ended, endsAt)).toEqual(without)
      // a millisecond before its end the program still pays
      expect(supplyRates(EARNING, ended, endsAt - 1)[HUSDC]).toBeCloseTo(
        0.14,
        12,
      )
    })
  },
)
