import { QueryClient } from "@tanstack/react-query"
import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { type Hex, zeroHash } from "viem"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getHollarDebtChangeNotice,
  getRewardsDistributorAccrued,
  getRewardsProgram,
  getRewardsProgramIncentives,
  rewardsDistributorAccountQuery,
  rewardsDistributorAccruedAccountQuery,
  rewardsDistributorAccruedTreeQuery,
  rewardsDistributorClaimsQuery,
  rewardsDistributorPendingRootQuery,
  rewardsDistributorRootQuery,
  rewardsDistributorTimelockQuery,
  type RewardsProgram,
  type RewardsProgramLive,
} from "@/api/rewardsDistributor"
import { latestFileSchema } from "@/api/rewardsDistributor.utils"
import { type TProviderContext } from "@/providers/rpcProvider"

vi.mock("@galacticcouncil/money-market/core", () => ({}))
vi.mock("@galacticcouncil/money-market/react", () => ({}))
vi.mock("@galacticcouncil/utils", () => ({}))
vi.mock("@galacticcouncil/web3-connect", () => ({}))
vi.mock("@/api/aave", () => ({}))
vi.mock("@/config/env", () => ({
  ENV: {
    VITE_REWARDS_DISTRIBUTOR_ADDRESS:
      "0x00000000000000000000000000000000000000d1",
    VITE_REWARDS_DISTRIBUTOR_URL: "https://rewards.test",
  },
}))
vi.mock("@/providers/assetsProvider", () => ({}))
vi.mock("@/providers/rpcProvider", () => ({}))
afterEach(() => vi.useRealTimers())

const ACCOUNT: Hex = "0x03ec4ec5810c3dfe15b706dfd7639b9565f30414"
const REWARD: Hex = "0x000000000000000000000000000000010000002b"
const ROOT_A: Hex = `0x${"a".repeat(64)}`
const ROOT_B: Hex = `0x${"b".repeat(64)}`
const VALID_AT = 1794906900

// a chain whose distributor holds these roots; zero is how it says "none"
const chain = ({
  live = zeroHash,
  pending = zeroHash,
  validAt = 0,
  isReady = true,
}: {
  live?: Hex
  pending?: Hex
  validAt?: number
  isReady?: boolean
} = {}) => {
  const reads: string[] = []
  const readContract = async ({ functionName }: { functionName: string }) => {
    reads.push(functionName)
    if (functionName === "pendingRoot") {
      return [pending, zeroHash, BigInt(validAt)]
    }
    if (functionName === "root") return live
    throw new Error(`Unexpected read of ${functionName}`)
  }
  const rpc = {
    isReady,
    genesisHash: "0xgenesis",
    evm: { readContract },
    queryClient: new QueryClient(),
  } as unknown as TProviderContext

  return { rpc, reads }
}

const readPendingRoot = (rpc: TProviderContext) => {
  const { queryFn } = rewardsDistributorPendingRootQuery(rpc, true, ACCOUNT)
  if (typeof queryFn !== "function") throw new Error("Expected query function")
  return queryFn({} as never)
}

// the live root as the claim hooks find it in their query
const cachedLiveRoot = (rpc: TProviderContext) =>
  rpc.queryClient.getQueryData(rewardsDistributorRootQuery(rpc, true).queryKey)

const intervalOf = (
  { refetchInterval }: { refetchInterval?: unknown },
  state: object,
) => {
  if (typeof refetchInterval !== "function") {
    throw new Error("Expected an interval function")
  }
  return refetchInterval({ state })
}

describe("rewardsDistributorPendingRootQuery", () => {
  it("returns the pending root and the time it may be accepted from", async () => {
    const { rpc } = chain({ live: ROOT_A, pending: ROOT_B, validAt: VALID_AT })

    expect(await readPendingRoot(rpc)).toEqual({
      root: ROOT_B,
      validAt: VALID_AT,
    })
  })

  it("returns nothing when no root is pending", async () => {
    const { rpc } = chain({ live: ROOT_A })

    expect(await readPendingRoot(rpc)).toBeNull()
  })

  it("returns a pending zero hash as no root, which has no tree to fetch", async () => {
    const { rpc } = chain({ live: ROOT_A, validAt: VALID_AT })

    expect(await readPendingRoot(rpc)).toEqual({
      root: null,
      validAt: VALID_AT,
    })
  })

  it("reads the pending root before the live one", async () => {
    const { rpc, reads } = chain({ live: ROOT_A, pending: ROOT_B })
    await readPendingRoot(rpc)

    expect(reads).toEqual(["pendingRoot", "root"])
  })

  it("replaces a live root cached before the pending one was accepted", async () => {
    const { rpc } = chain({ live: ROOT_B })
    rpc.queryClient.setQueryData(
      rewardsDistributorRootQuery(rpc, true).queryKey,
      ROOT_A,
    )

    expect(await readPendingRoot(rpc)).toBeNull()
    expect(cachedLiveRoot(rpc)).toBe(ROOT_B)
  })

  it("caches no live root as null, as the root's own read does", async () => {
    const { rpc } = chain({ pending: ROOT_A, validAt: VALID_AT })
    await readPendingRoot(rpc)

    expect(cachedLiveRoot(rpc)).toBeNull()
  })

  it.each([
    [
      "a connected account on a chain with the distributor",
      true,
      ACCOUNT,
      true,
    ],
    ["no connected account", true, undefined, false],
    ["a chain without the distributor", false, ACCOUNT, false],
  ])("%s: enabled is %s", (_, isDeployed, account, enabled) => {
    const { rpc } = chain()

    expect(
      rewardsDistributorPendingRootQuery(rpc, isDeployed, account).enabled,
    ).toBe(enabled)
    expect(
      rewardsDistributorTimelockQuery(rpc, isDeployed, account).enabled,
    ).toBe(enabled)
  })

  it("is not read before the chain is ready", () => {
    const { rpc } = chain({ isReady: false })

    expect(rewardsDistributorPendingRootQuery(rpc, true, ACCOUNT).enabled).toBe(
      false,
    )
    expect(rewardsDistributorTimelockQuery(rpc, true, ACCOUNT).enabled).toBe(
      false,
    )
  })

  it("counts its interval from the last read, so it is the same however late it is asked", () => {
    const query = rewardsDistributorPendingRootQuery(chain().rpc, true, ACCOUNT)
    const readAt = (VALID_AT - 200) * millisecondsInSecond
    const state = {
      data: { root: ROOT_B, validAt: VALID_AT },
      dataUpdatedAt: readAt,
    }

    vi.useFakeTimers()
    vi.setSystemTime(readAt)
    // until the root should have been accepted, 75 seconds after validAt
    expect(intervalOf(query, state)).toBe(275 * millisecondsInSecond)

    vi.setSystemTime(readAt + millisecondsInMinute)
    expect(intervalOf(query, state)).toBe(275 * millisecondsInSecond)
  })

  it("is read every five minutes while nothing is pending", () => {
    const query = rewardsDistributorPendingRootQuery(chain().rpc, true, ACCOUNT)

    expect(intervalOf(query, { data: null, dataUpdatedAt: 1 })).toBe(
      5 * millisecondsInMinute,
    )
  })
})

describe("the accrued hook's reads of a tree and of the claimed amount", () => {
  const { rpc } = chain()
  const tree = () => rewardsDistributorAccruedTreeQuery(rpc, ROOT_A, ACCOUNT)
  const claimed = () =>
    rewardsDistributorAccruedAccountQuery(rpc, REWARD, ACCOUNT)

  const empty = { data: undefined, dataUpdateCount: 0, errorUpdateCount: 1 }
  const unserved = { data: null, dataUpdateCount: 1, errorUpdateCount: 0 }
  const read = { data: {}, dataUpdateCount: 1, errorUpdateCount: 0 }

  it("share the queries the claim reads", () => {
    expect(tree().queryKey).toEqual(
      rewardsDistributorClaimsQuery(rpc, ROOT_A).queryKey,
    )
    expect(claimed().queryKey).toEqual(
      rewardsDistributorAccountQuery(rpc, REWARD, ACCOUNT).queryKey,
    )
  })

  it("are made again after a read that failed", () => {
    expect(intervalOf(tree(), empty)).toBe(millisecondsInMinute)
    expect(intervalOf(claimed(), empty)).toBe(millisecondsInMinute)
  })

  it("ask again for a tree that is not served yet", () => {
    expect(intervalOf(tree(), unserved)).toBe(millisecondsInMinute)
  })

  it("stop once there is data", () => {
    expect(intervalOf(tree(), read)).toBe(false)
    expect(intervalOf(claimed(), read)).toBe(false)
  })

  it("are not made without an account", () => {
    expect(
      rewardsDistributorAccruedTreeQuery(rpc, ROOT_A, undefined).enabled,
    ).toBe(false)
    expect(
      rewardsDistributorAccruedAccountQuery(rpc, REWARD, undefined).enabled,
    ).toBe(false)
  })

  it("leave the claim's own reads without an interval", () => {
    expect(rewardsDistributorClaimsQuery(rpc, ROOT_A)).not.toHaveProperty(
      "refetchInterval",
    )
    expect(
      rewardsDistributorAccountQuery(rpc, REWARD, ACCOUNT),
    ).not.toHaveProperty("refetchInterval")
    expect(rewardsDistributorRootQuery(rpc, true)).not.toHaveProperty(
      "refetchInterval",
    )
  })
})

describe("getRewardsDistributorAccrued", () => {
  const EPOCH_END = 1794913200
  const TIMELOCK = 600

  // an account's first epoch: no root anywhere, and an estimate of 3.2
  const reads = {
    claimed: 0n,
    timelock: TIMELOCK,
    now: (EPOCH_END - 3600) * millisecondsInSecond,
    liveRoot: null,
    liveTree: undefined,
    pending: null,
    pendingTree: undefined,
    latest: latestFileSchema.parse({
      format: "hydration-rewards-latest/1",
      asOf: {
        hour: EPOCH_END - 7200,
        block: 4385,
        blockTime: EPOCH_END - 7000,
      },
      reward: { symbol: "PRIME", address: REWARD, decimals: 6 },
      program: { name: "test", sha256: "0x00", maxHollarDebtUsd: "5.00" },
      assets: {},
      accounts: {},
      latestTree: null,
      openEpoch: {
        id: "2026-11-17T08",
        start: EPOCH_END - 10800,
        end: EPOCH_END,
        snapshots: 1,
        expectedSnapshots: 3,
        accruing: { [ACCOUNT]: "3200000" },
      },
    }),
    closedTree: undefined,
  }
  const asset = { id: "43", symbol: "PRIME", decimals: 6 }

  it("gives the estimate in the token's own units, under the registry's symbol", () => {
    expect(
      getRewardsDistributorAccrued({ account: ACCOUNT, asset, ...reads }),
    ).toEqual({
      assetId: "43",
      symbol: "PRIME",
      stages: [
        {
          stage: "accruing",
          amount: "3.2",
          claimableAt: new Date((EPOCH_END + TIMELOCK) * millisecondsInSecond),
        },
      ],
    })
  })

  it("has nothing while the registry does not know the reward token, as the claim has", () => {
    expect(
      getRewardsDistributorAccrued({
        account: ACCOUNT,
        asset: undefined,
        ...reads,
      }),
    ).toEqual({ assetId: "", symbol: "", stages: [] })
  })

  it("has nothing without an account", () => {
    expect(
      getRewardsDistributorAccrued({ account: undefined, asset, ...reads }),
    ).toEqual({ assetId: "", symbol: "", stages: [] })
  })
})

describe("the reward program as an account meets it", () => {
  const HOUR = 1794902400
  const ENDS_AT = HOUR + 3 * 3600
  const ENDS_AT_MS = ENDS_AT * millisecondsInSecond
  // seventy minutes into the hour after the snapshot's
  const READ_AT = (HOUR + 4200) * millisecondsInSecond
  const BORROWER = "0x08668d9785b8ab9246b45cbf26998563eac007d2"
  // not in the file: it supplied none of the assets at the snapshot
  const NEWCOMER = "0x0468ae64c87bbe7b2cef012bdf51bd8e544df5f5"
  const EXCLUDED = "0x00000000000000000000000000000000000000e1"
  const HUSDC = "0x000000000000000000000000000000010000006e"
  const HUSDT = "0x000000000000000000000000000000010000006f"
  const PRICE = "2"

  // 100 PRIME a day on HUSDC and 50 on HUSDT, each shared over $730,000
  const file = (endsAt?: number) =>
    latestFileSchema.parse({
      format: "hydration-rewards-latest/1",
      asOf: { hour: HOUR, block: 4385, blockTime: HOUR + 156 },
      reward: { symbol: "PRIME", address: REWARD, decimals: 6 },
      program: {
        name: "test",
        sha256: "0x00",
        maxHollarDebtUsd: "5.00",
        ...(endsAt !== undefined && { endsAt }),
      },
      assets: {
        HUSDC: { budgetPerDay: "100000000", eligibleUsd: "730000.00" },
        HUSDT: { budgetPerDay: "50000000", eligibleUsd: "730000.00" },
        HEURC: { budgetPerDay: null, eligibleUsd: "8126.16" },
      },
      accounts: {
        [ACCOUNT]: { earning: true, hollarDebtUsd: "0.00" },
        [BORROWER]: {
          earning: false,
          reason: "hollar_debt",
          hollarDebtUsd: "250944.35",
        },
        [EXCLUDED]: { earning: false, reason: "excluded" },
      },
      latestTree: null,
    })

  const NO_PROGRAM = {
    notEarningReason: undefined,
    earningResumes: false,
    suppliesEarningAsset: undefined,
    hollarDebtUsd: undefined,
    maxHollarDebtUsd: "0",
    latest: undefined,
  }

  // each reserve's yearly rate, by its underlying token
  const rates = (program: RewardsProgram) =>
    Object.fromEntries(
      [...getRewardsProgramIncentives(program, PRICE)].map(
        ([reserve, { incentiveAPR }]) => [reserve, incentiveAPR],
      ),
    )

  it("gives an account that earns the rate of every asset with a budget, as a fraction", () => {
    const latest = file()
    const program = getRewardsProgram({
      latest,
      account: ACCOUNT,
      readAt: READ_AT,
    })

    expect(program).toEqual({
      notEarningReason: undefined,
      earningResumes: false,
      suppliesEarningAsset: undefined,
      hollarDebtUsd: undefined,
      maxHollarDebtUsd: "5.00",
      latest,
    })
    expect(getRewardsProgramIncentives(program, PRICE)).toEqual(
      new Map([
        [
          HUSDC,
          {
            incentiveAPR: "0.1",
            rewardTokenAddress: REWARD,
            rewardTokenSymbol: "PRIME",
          },
        ],
        [
          HUSDT,
          {
            incentiveAPR: "0.05",
            rewardTokenAddress: REWARD,
            rewardTokenSymbol: "PRIME",
          },
        ],
      ]),
    )
  })

  it("gives the rate of the Wormhole H-tokens on their own reserves", () => {
    const latest = {
      ...file(),
      assets: {
        "HUSDC.wh": { budgetPerDay: "100000000", eligibleUsd: "730000.00" },
        "HUSDT.wh": { budgetPerDay: "50000000", eligibleUsd: "730000.00" },
      },
    }
    const program = getRewardsProgram({
      latest,
      account: ACCOUNT,
      readAt: READ_AT,
    })

    expect(rates(program)).toEqual({
      "0x0000000000000000000000000000000100000072": "0.1",
      "0x0000000000000000000000000000000100000073": "0.05",
    })
  })

  it.each([
    ["nobody is connected", undefined],
    ["the account supplies none of the assets", NEWCOMER],
  ])("shows the rate while %s", (_, account) => {
    const program = getRewardsProgram({
      latest: file(),
      account,
      readAt: READ_AT,
    })

    expect(program.notEarningReason).toBeUndefined()
    expect(rates(program)).toEqual({ [HUSDC]: "0.1", [HUSDT]: "0.05" })
  })

  it("gives an account with HOLLAR debt no rate, and the reason to tell it", () => {
    const program = getRewardsProgram({
      latest: file(),
      account: BORROWER,
      readAt: READ_AT,
    })

    expect(program.notEarningReason).toBe("hollar_debt")
    expect(program.maxHollarDebtUsd).toBe("5.00")
    expect(rates(program)).toEqual({})
  })

  it.each([
    ["an account that earned", ACCOUNT],
    ["an account with HOLLAR debt", BORROWER],
    ["nobody connected", undefined],
  ])(
    "from the program's end on, %s gets no rate and no notice",
    (_, account) => {
      const latest = file(ENDS_AT)

      for (const readAt of [ENDS_AT_MS, ENDS_AT_MS + millisecondsInMinute]) {
        const program = getRewardsProgram({ latest, account, readAt })

        expect(program).toEqual(NO_PROGRAM)
        expect(rates(program)).toEqual({})
      }
    },
  )

  it("until its end a program with one is met as one without", () => {
    const latest = file(ENDS_AT)
    const readAt = ENDS_AT_MS - 1

    expect(
      rates(getRewardsProgram({ latest, account: ACCOUNT, readAt })),
    ).toEqual({ [HUSDC]: "0.1", [HUSDT]: "0.05" })
    expect(
      getRewardsProgram({ latest, account: BORROWER, readAt }).notEarningReason,
    ).toBe("hollar_debt")
  })

  it("gives neither once the file is stale, nor without a file", () => {
    const sixHours = (HOUR + 6 * 3600) * millisecondsInSecond
    const meet = (latest: ReturnType<typeof file> | null | undefined) =>
      getRewardsProgram({ latest, account: BORROWER, readAt: sixHours + 1 })

    expect(meet(file())).toEqual(NO_PROGRAM)
    expect(meet(null)).toEqual(NO_PROGRAM)
    expect(meet(undefined)).toEqual(NO_PROGRAM)
    expect(
      getRewardsProgram({
        latest: file(),
        account: BORROWER,
        readAt: sixHours,
      }).notEarningReason,
    ).toBe("hollar_debt")
  })

  it("has no rate without the reward token's price", () => {
    const program = getRewardsProgram({
      latest: file(),
      account: ACCOUNT,
      readAt: READ_AT,
    })

    expect(getRewardsProgramIncentives(program, undefined).size).toBe(0)
  })

  describe("with the account's positions now", () => {
    const supplying = (hollarDebtUsd: string) =>
      ({ supplies: true, hollarDebtUsd }) as const
    const meet = (account: string, live: RewardsProgramLive) =>
      getRewardsProgram({ latest: file(), account, readAt: READ_AT, live })

    it("pays an account that has repaid its HOLLAR debt since the snapshot, and says so", () => {
      const program = meet(BORROWER, supplying("0.42"))

      expect(program.notEarningReason).toBeUndefined()
      expect(program.earningResumes).toBe(true)
      expect(program.suppliesEarningAsset).toBe(true)
      expect(program.hollarDebtUsd).toBe("0.42")
      expect(rates(program)).toEqual({ [HUSDC]: "0.1", [HUSDT]: "0.05" })
    })

    it.each([
      ["an account that earned", ACCOUNT],
      ["an account the file does not list", NEWCOMER],
    ])("stops paying %s once it has borrowed HOLLAR", (_, account) => {
      const program = meet(account, supplying("5.01"))

      expect(program.notEarningReason).toBe("hollar_debt")
      expect(program.earningResumes).toBe(false)
      expect(rates(program)).toEqual({})
    })

    it("lets the allowance itself through, as the runner does", () => {
      const program = meet(BORROWER, supplying("5"))

      expect(program.notEarningReason).toBeUndefined()
      expect(program.earningResumes).toBe(true)
    })

    it("tells an account that no longer supplies an earning asset nothing", () => {
      const program = meet(BORROWER, { supplies: false })

      expect(program.notEarningReason).toBeUndefined()
      expect(program.earningResumes).toBe(false)
      expect(program.suppliesEarningAsset).toBe(false)
    })

    it("says nothing yet, until the positions are read", () => {
      const program = getRewardsProgram({
        latest: file(),
        account: BORROWER,
        readAt: READ_AT,
      })

      // the file's verdict still keeps the rate away
      expect(program.notEarningReason).toBe("hollar_debt")
      expect(program.suppliesEarningAsset).toBeUndefined()
      expect(rates(program)).toEqual({})
    })

    it("keeps an exclusion, which only the file knows", () => {
      const program = meet(EXCLUDED, supplying("0"))

      expect(program.notEarningReason).toBe("excluded")
      expect(program.earningResumes).toBe(false)
      expect(program.suppliesEarningAsset).toBe(true)
      expect(rates(program)).toEqual({})
    })

    it("tells an excluded account that holds none of the assets nothing", () => {
      const program = meet(EXCLUDED, { supplies: false })

      expect(program.notEarningReason).toBe("excluded")
      expect(program.suppliesEarningAsset).toBe(false)
    })

    describe("on a HOLLAR borrow or repay", () => {
      const notice = (
        account: string,
        live: RewardsProgramLive,
        changeUsd: string,
      ) => getHollarDebtChangeNotice(meet(account, live), changeUsd)

      it("warns an earning account whose borrow takes its debt over the allowance", () => {
        expect(notice(ACCOUNT, supplying("2"), "3.01")).toBe("notEarning")
        expect(notice(NEWCOMER, supplying("0"), "100")).toBe("notEarning")
      })

      it("says nothing to one that stays within it, the allowance itself included", () => {
        expect(notice(ACCOUNT, supplying("2"), "3")).toBeUndefined()
        expect(notice(ACCOUNT, supplying("0"), "0")).toBeUndefined()
      })

      it("keeps the warning for an account over it until a repay brings it back within", () => {
        expect(notice(BORROWER, supplying("20"), "0")).toBe("notEarning")
        expect(notice(BORROWER, supplying("20"), "-14.99")).toBe("notEarning")
        expect(notice(BORROWER, supplying("20"), "-15")).toBe("earningResumes")
        expect(notice(NEWCOMER, supplying("20"), "-20")).toBe("earningResumes")
      })

      it("tells an account that has repaid since the snapshot it earns again, unless it borrows back over", () => {
        expect(notice(BORROWER, supplying("1"), "0")).toBe("earningResumes")
        expect(notice(BORROWER, supplying("1"), "4.01")).toBe("notEarning")
      })

      it("says nothing to an account that supplies none of the assets, or is excluded", () => {
        expect(notice(BORROWER, { supplies: false }, "100")).toBeUndefined()
        expect(notice(EXCLUDED, supplying("0"), "100")).toBeUndefined()
        expect(notice(EXCLUDED, supplying("20"), "-20")).toBeUndefined()
      })

      it("says nothing before the positions are read, nor without a program", () => {
        const fromFile = (latest: ReturnType<typeof file> | undefined) =>
          getRewardsProgram({ latest, account: BORROWER, readAt: READ_AT })

        expect(
          getHollarDebtChangeNotice(fromFile(file()), "100"),
        ).toBeUndefined()
        expect(
          getHollarDebtChangeNotice(fromFile(undefined), "100"),
        ).toBeUndefined()
      })
    })

    it("does not bring back a stale file", () => {
      const sixHours = (HOUR + 6 * 3600) * millisecondsInSecond

      expect(
        getRewardsProgram({
          latest: file(),
          account: BORROWER,
          readAt: sixHours + 1,
          live: supplying("0"),
        }),
      ).toEqual(NO_PROGRAM)
    })
  })
})
