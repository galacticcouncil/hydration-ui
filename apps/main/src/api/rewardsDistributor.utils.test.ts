import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { type Hex } from "viem"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  claimsFileSchema,
  getAccruedRewards,
  getHollarDebtUsd,
  getOwedReward,
  getRewardsProgramApr,
  getRewardsReadTime,
  getRewardsRetryInterval,
  getRewardsRootsRefetchInterval,
  getRewardsTokenAddress,
  hasRewardsProgramEnded,
  type HollarDebtMarket,
  latestFileSchema,
  mergeRewardsIncentive,
  type RewardsClaimsFile,
  type RewardsLatestFile,
  suppliesRewardsProgramAsset,
} from "@/api/rewardsDistributor.utils"

const ACCOUNT = "0x03ec4ec5810c3dfe15b706dfd7639b9565f30414"
const OTHER_ACCOUNT = "0x0468ae64c87bbe7b2cef012bdf51bd8e544df5f5"

// latest.json as the test network served it before "openEpoch" was added,
// cut down to three accounts
const LATEST_SAMPLE = {
  format: "hydration-rewards-latest/1",
  asOf: { hour: 1794902400, block: 4385, blockTime: 1794902556 },
  reward: {
    symbol: "PRIME",
    address: "0x000000000000000000000000000000010000002b",
    decimals: 6,
  },
  program: {
    name: "Lark 0 test, three-hour epochs - HUSDC, HUSDT and HEURC, no HOLLAR borrowers",
    sha256:
      "0xf2ca977651fe5d6ff420ea3575dca640248a07dd8d333de85cfdb342e4825ce3",
    maxHollarDebtUsd: "5.00",
  },
  assets: {
    HUSDC: { budgetPerDay: "275616000", eligibleUsd: "836117.05" },
    HUSDT: { budgetPerDay: "275616000", eligibleUsd: "766659.75" },
    HEURC: { budgetPerDay: "80000000", eligibleUsd: "8126.16" },
  },
  accounts: {
    [ACCOUNT]: { earning: true, hollarDebtUsd: "0.00" },
    [OTHER_ACCOUNT]: { earning: true, hollarDebtUsd: "0.00" },
    "0x08668d9785b8ab9246b45cbf26998563eac007d2": {
      earning: false,
      reason: "hollar_debt",
      hollarDebtUsd: "250944.35",
    },
  },
  latestTree: {
    epoch: "2026-11-17T05",
    root: "0x4a12aa2ac5e834a391d2eda32e5333100d961e0b1bfbe8572247f21bfd39d7a0",
  },
}

// that file's tree, cut down to two accounts and two proof nodes each
const TREE_SAMPLE = {
  format: "hydration-rewards-claims/1",
  reward: "0x000000000000000000000000000000010000002b",
  root: "0x4a12aa2ac5e834a391d2eda32e5333100d961e0b1bfbe8572247f21bfd39d7a0",
  leafEncoding: ["address", "address", "uint256"],
  claims: {
    [ACCOUNT]: {
      claimable: "4690911",
      proof: [
        "0x0f3318f163071c1ae60c40ea3299eaa9f79826b1014140bdd48f8226d302cd4d",
        "0xe41147da96382e1b46003ef86f4a8f3980f574d067778f090294264d9b44003a",
      ],
    },
    [OTHER_ACCOUNT]: {
      claimable: "134133",
      proof: [
        "0xc6c2f0350efcb7825ff9d5d87453463794cf8b3f310dbe2027390f649b3c76fa",
        "0x425ef844d215a16dca84feadc42bf60ec120939d6f3c96b57bf4cf03edd2bb2b",
      ],
    },
  },
}

// the epoch after the sample's latestTree: three hours, one snapshot in
const EPOCH_END = 1794913200
const OPEN_EPOCH = {
  id: "2026-11-17T08",
  start: 1794902400,
  end: EPOCH_END,
  snapshots: 1,
  expectedSnapshots: 3,
}

describe("latestFileSchema", () => {
  // a dropped openEpoch is reported on the console
  const spyOnWarn = () => vi.spyOn(console, "warn").mockImplementation(() => {})
  afterEach(() => vi.restoreAllMocks())

  it("parses a file written before openEpoch was added", () => {
    const warn = spyOnWarn()
    const file = latestFileSchema.parse(LATEST_SAMPLE)

    expect(file).toEqual(LATEST_SAMPLE)
    expect(file.openEpoch).toBeUndefined()
    expect(warn).not.toHaveBeenCalled()
  })

  it.each([
    ["a map of accounts", { [ACCOUNT]: "123456", [OTHER_ACCOUNT]: "7" }],
    ["no account yet", {}],
    ["no estimate", null],
  ])("parses openEpoch with accruing as %s", (_, accruing) => {
    const warn = spyOnWarn()
    const openEpoch = { ...OPEN_EPOCH, accruing }
    const file = latestFileSchema.parse({ ...LATEST_SAMPLE, openEpoch })

    expect(file.openEpoch).toEqual(openEpoch)
    expect(file).toEqual({ ...LATEST_SAMPLE, openEpoch })
    expect(warn).not.toHaveBeenCalled()
  })

  it("reads no end from a file whose program has none", () => {
    expect(latestFileSchema.parse(LATEST_SAMPLE).program).not.toHaveProperty(
      "endsAt",
    )
  })

  it("parses the file of a program with an end ahead: an end time beside the open epoch", () => {
    const warn = spyOnWarn()
    const ending = {
      ...LATEST_SAMPLE,
      program: { ...LATEST_SAMPLE.program, endsAt: EPOCH_END },
      openEpoch: { ...OPEN_EPOCH, accruing: { [ACCOUNT]: "123456" } },
    }
    const file = latestFileSchema.parse(ending)

    expect(file).toEqual(ending)
    expect(file.program.endsAt).toBe(EPOCH_END)
    expect(warn).not.toHaveBeenCalled()
  })

  it("parses the file of a program that has ended: an end time and a null openEpoch", () => {
    const warn = spyOnWarn()
    const program = { ...LATEST_SAMPLE.program, endsAt: EPOCH_END }
    const file = latestFileSchema.parse({
      ...LATEST_SAMPLE,
      program,
      openEpoch: null,
    })

    expect(file).toEqual({ ...LATEST_SAMPLE, program })
    expect(file.openEpoch).toBeUndefined()
    expect(warn).not.toHaveBeenCalled()
  })

  // An end that cannot be read is not left out as openEpoch is: the program
  // would then count as one without an end, and its rate show past it.
  it.each([
    ["a string", String(EPOCH_END)],
    ["in milliseconds", EPOCH_END * 1000],
    ["not whole seconds", EPOCH_END + 0.5],
    ["zero", 0],
    ["null", null],
  ])("rejects a file whose program end is %s", (_, endsAt) => {
    const result = latestFileSchema.safeParse({
      ...LATEST_SAMPLE,
      program: { ...LATEST_SAMPLE.program, endsAt },
    })

    expect(result.success).toBe(false)
  })

  it.each([
    ["an amount that is not raw units", { accruing: { [ACCOUNT]: "1.5" } }],
    ["no accruing key", { accruing: undefined }],
    ["no end", { end: undefined }],
    ["an end that is a string", { end: String(EPOCH_END) }],
    ["an end in milliseconds", { end: EPOCH_END * 1000 }],
    ["an end that is not whole seconds", { end: EPOCH_END + 0.5 }],
    ["an end of zero", { end: 0 }],
    ["no start", { start: undefined }],
    ["a start that is a string", { start: String(OPEN_EPOCH.start) }],
    ["a start in milliseconds", { start: OPEN_EPOCH.start * 1000 }],
    ["a start that is not whole seconds", { start: OPEN_EPOCH.start + 0.5 }],
    ["a negative start", { start: -OPEN_EPOCH.start }],
    ["an id that is not a string", { id: 1 }],
    ["a snapshot count that is not a number", { snapshots: "1" }],
    ["an expected count that is not a number", { expectedSnapshots: "3" }],
  ])(
    "drops an openEpoch with %s, keeps the file and warns once",
    (_, change) => {
      const warn = spyOnWarn()
      const file = latestFileSchema.parse({
        ...LATEST_SAMPLE,
        openEpoch: { ...OPEN_EPOCH, accruing: {}, ...change },
      })

      expect(file.openEpoch).toBeUndefined()
      expect(file).toEqual(LATEST_SAMPLE)
      expect(warn).toHaveBeenCalledTimes(1)
    },
  )

  it("still rejects a file whose other parts are malformed", () => {
    const result = latestFileSchema.safeParse({
      ...LATEST_SAMPLE,
      latestTree: { epoch: "2026-11-17T05", root: "0x4a12" },
      openEpoch: { ...OPEN_EPOCH, accruing: {} },
    })

    expect(result.success).toBe(false)
  })
})

describe("getRewardsRootsRefetchInterval", () => {
  const VALID_AT = 1794906900
  const VALID_AT_MS = VALID_AT * millisecondsInSecond
  // when the runner should have accepted the root
  const DUE = VALID_AT_MS + 75 * millisecondsInSecond

  it.each([
    ["nothing pending", undefined, VALID_AT_MS, 5 * millisecondsInMinute],
    [
      "hours before validAt",
      VALID_AT,
      VALID_AT_MS - 600 * millisecondsInMinute,
      5 * millisecondsInMinute,
    ],
    [
      "two minutes before validAt",
      VALID_AT,
      VALID_AT_MS - 2 * millisecondsInMinute,
      195 * millisecondsInSecond,
    ],
    ["at validAt", VALID_AT, VALID_AT_MS, 75 * millisecondsInSecond],
    ["a second before it is due", VALID_AT, DUE - 1000, 5000],
    ["when it is due", VALID_AT, DUE, 30 * millisecondsInSecond],
    [
      "ten minutes overdue",
      VALID_AT,
      DUE + 10 * millisecondsInMinute,
      30 * millisecondsInSecond,
    ],
    [
      "a quarter of an hour overdue",
      VALID_AT,
      DUE + 15 * millisecondsInMinute,
      5 * millisecondsInMinute,
    ],
  ])("%s", (_, validAt, readAt, interval) => {
    expect(getRewardsRootsRefetchInterval(validAt, readAt)).toBe(interval)
  })
})

describe("getRewardsRetryInterval", () => {
  const state = (data: unknown, reads = 0, failures = 0) => ({
    data,
    dataUpdateCount: reads,
    errorUpdateCount: failures,
  })

  it.each([
    ["a read that has not come back", state(undefined)],
    ["a read that failed", state(undefined, 0, 1)],
    ["a tree that is not served yet", state(null, 1)],
    ["four reads that gave nothing", state(null, 2, 2)],
  ])("%s: again in a minute", (_, empty) => {
    expect(getRewardsRetryInterval(empty)).toBe(millisecondsInMinute)
  })

  it.each([
    ["five failed reads", state(undefined, 0, 5)],
    ["a tree asked for five times and never served", state(null, 5)],
    ["failed and unserved reads, five together", state(null, 3, 2)],
  ])("%s: every five minutes from then on", (_, empty) => {
    expect(getRewardsRetryInterval(empty)).toBe(5 * millisecondsInMinute)
  })

  it.each([
    ["a tree", state(TREE_SAMPLE, 1)],
    ["a claimed amount", state({ claimed: 0n }, 1)],
    ["data kept through later failures", state(TREE_SAMPLE, 1, 9)],
  ])("%s: not again", (_, read) => {
    expect(getRewardsRetryInterval(read)).toBe(false)
  })
})

describe("getRewardsReadTime", () => {
  it.each([
    ["the roots were read last", 2000, 1000],
    ["latest.json was read last", 1000, 2000],
  ])("is the newer read when %s", (_, rootsReadAt, latestReadAt) => {
    expect(getRewardsReadTime(rootsReadAt, latestReadAt)).toBe(2000)
  })
})

describe("hasRewardsProgramEnded", () => {
  const ENDS_AT_MS = EPOCH_END * millisecondsInSecond

  it.each([
    ["an hour before its end", ENDS_AT_MS - 3600_000, false],
    ["a millisecond before its end", ENDS_AT_MS - 1, false],
    ["at its end", ENDS_AT_MS, true],
    ["a month after its end", ENDS_AT_MS + 30 * 24 * 3600_000, true],
  ])("%s: %s", (_, now, ended) => {
    expect(hasRewardsProgramEnded({ endsAt: EPOCH_END }, now)).toBe(ended)
  })

  it("has not for a program without an end, however late", () => {
    expect(hasRewardsProgramEnded({}, Number.MAX_SAFE_INTEGER)).toBe(false)
    expect(
      hasRewardsProgramEnded(
        latestFileSchema.parse(LATEST_SAMPLE).program,
        Number.MAX_SAFE_INTEGER,
      ),
    ).toBe(false)
  })
})

describe("getRewardsTokenAddress", () => {
  const token = (last: string): Hex => `0x${"0".repeat(39)}${last}`
  const liveTree = {
    ...claimsFileSchema.parse(TREE_SAMPLE),
    reward: token("a"),
  }
  const pendingTree = { ...liveTree, reward: token("b") }
  const latest = latestFileSchema.parse({
    ...LATEST_SAMPLE,
    reward: { ...LATEST_SAMPLE.reward, address: token("c") },
  })

  it("is the live tree's", () => {
    expect(getRewardsTokenAddress({ liveTree, pendingTree, latest })).toBe(
      token("a"),
    )
  })

  it.each([
    ["not served", null],
    ["not read", undefined],
  ])("is the pending tree's while the live tree is %s", (_, liveTree) => {
    expect(getRewardsTokenAddress({ liveTree, pendingTree, latest })).toBe(
      token("b"),
    )
  })

  it("is latest.json's before the first root, an account's first epoch", () => {
    expect(
      getRewardsTokenAddress({
        liveTree: undefined,
        pendingTree: undefined,
        latest,
      }),
    ).toBe(token("c"))
  })

  it("is unknown while nothing names it", () => {
    expect(
      getRewardsTokenAddress({
        liveTree: undefined,
        pendingTree: null,
        latest: null,
      }),
    ).toBeUndefined()
  })
})

describe("getAccruedRewards", () => {
  const TREE = claimsFileSchema.parse(TREE_SAMPLE)
  const LATEST = latestFileSchema.parse(LATEST_SAMPLE)

  // seventy minutes into the hour after the sample's snapshot
  const NOW = (LATEST.asOf.hour + 4200) * millisecondsInSecond
  const TIMELOCK = 600
  const VALID_AT = LATEST.asOf.hour + 4500
  const VALID_AT_MS = VALID_AT * millisecondsInSecond
  const EXPECTED_AT_MS = (EPOCH_END + TIMELOCK) * millisecondsInSecond

  // three roots in the order they were built
  const ROOT_A: Hex = `0x${"a".repeat(64)}`
  const ROOT_B: Hex = `0x${"b".repeat(64)}`
  const ROOT_C: Hex = `0x${"c".repeat(64)}`

  // every epoch pays the other account, so a later root holds more in total
  const OTHER_AMOUNT: Record<string, string> = {
    [ROOT_A]: "1000",
    [ROOT_B]: "2000",
    [ROOT_C]: "3000",
  }

  // a root's tree holding the account's cumulative amount, or without the account
  const tree = (root: Hex, amount?: bigint): RewardsClaimsFile => ({
    ...TREE,
    root,
    claims: {
      [OTHER_ACCOUNT]: { claimable: OTHER_AMOUNT[root] ?? "0", proof: [] },
      ...(amount !== undefined && {
        [ACCOUNT]: { claimable: amount.toString(), proof: [] },
      }),
    },
  })

  const live = (root: Hex, amount?: bigint) => ({
    liveRoot: root,
    liveTree: tree(root, amount),
  })

  const pending = (root: Hex, amount?: bigint, validAt = VALID_AT) => ({
    pending: { root, validAt },
    pendingTree: tree(root, amount),
  })

  // latest.json naming the root as its newest closed epoch's
  const file = (
    root: Hex | null,
    amount?: bigint,
    accruing?: Record<string, string> | null,
    openEpoch = OPEN_EPOCH,
  ): {
    latest: RewardsLatestFile
    closedTree: RewardsClaimsFile | undefined
  } => ({
    latest: {
      ...LATEST,
      latestTree: root ? { epoch: "2026-11-17T05", root } : null,
      openEpoch:
        accruing === undefined ? undefined : { ...openEpoch, accruing },
    },
    closedTree: root ? tree(root, amount) : undefined,
  })

  const accrued = (args: Partial<Parameters<typeof getAccruedRewards>[0]>) =>
    getAccruedRewards({
      account: ACCOUNT,
      claimed: 0n,
      timelock: TIMELOCK,
      now: NOW,
      liveRoot: null,
      liveTree: undefined,
      pending: null,
      pendingTree: undefined,
      latest: null,
      closedTree: undefined,
      ...args,
    })

  const pendingStage = (amount: bigint, claimableAt?: number) => ({
    stage: "pending",
    amount,
    claimableAt,
  })
  const closedStage = (amount: bigint) => ({
    stage: "closed",
    amount,
    claimableAt: undefined,
  })
  const accruingStage = (amount: bigint, claimableAt?: number) => ({
    stage: "accruing",
    amount,
    claimableAt,
  })

  describe("the three stages", () => {
    it("has none when the live root holds all the account earned", () => {
      expect(
        accrued({ ...live(ROOT_A, 100n), ...file(ROOT_A, 100n, {}) }),
      ).toEqual([])
    })

    it("reads the sample files: its root live and nothing claimed leaves only the estimate", () => {
      expect(
        accrued({
          liveRoot: TREE.root,
          liveTree: TREE,
          latest: {
            ...LATEST,
            openEpoch: { ...OPEN_EPOCH, accruing: { [ACCOUNT]: "123456" } },
          },
          closedTree: TREE,
        }),
      ).toEqual([accruingStage(123456n, EXPECTED_AT_MS)])
    })

    it("lists what each root adds, then the estimate, in the order they become claimable", () => {
      expect(
        accrued({
          claimed: 40n,
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B, 160n),
          ...file(ROOT_C, 210n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([
        pendingStage(60n, VALID_AT_MS),
        closedStage(50n),
        accruingStage(30n, EXPECTED_AT_MS),
      ])
    })

    it("has the pending stage alone when the file is not there", () => {
      expect(
        accrued({ ...live(ROOT_A, 100n), ...pending(ROOT_B, 160n) }),
      ).toEqual([pendingStage(60n, VALID_AT_MS)])
    })

    it("has the closed stage alone when its root is not posted yet", () => {
      expect(
        accrued({ ...live(ROOT_A, 100n), ...file(ROOT_C, 150n, {}) }),
      ).toEqual([closedStage(50n)])
    })
  })

  describe("the pending root's time", () => {
    it("is validAt in milliseconds while that is ahead", () => {
      expect(
        accrued({ ...pending(ROOT_B, 160n, NOW / 1000 + 1) })[0]?.claimableAt,
      ).toBe(NOW + 1000)
    })

    it.each([
      ["at validAt", NOW / 1000],
      ["after validAt", NOW / 1000 - 3600],
    ])("is left out %s, when the root only needs accepting", (_, validAt) => {
      expect(accrued({ ...pending(ROOT_B, 160n, validAt) })).toEqual([
        pendingStage(160n, undefined),
      ])
    })
  })

  describe("roots that coincide or are out of order", () => {
    it("pending root equal to the live one (a stale read): no pending stage", () => {
      expect(
        accrued({
          ...live(ROOT_B, 160n),
          ...pending(ROOT_B, 160n),
          ...file(ROOT_C, 210n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([closedStage(50n), accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("latestTree equal to the live root: no closed stage, the estimate stays", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("latestTree equal to the pending root: no closed stage, the estimate stays", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B, 160n),
          ...file(ROOT_B, 160n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([
        pendingStage(60n, VALID_AT_MS),
        accruingStage(30n, EXPECTED_AT_MS),
      ])
    })

    it("all three the same root: only the estimate", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...pending(ROOT_A, 100n),
          ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("latestTree older than the live root (a stale file): neither closed nor the estimate", () => {
      expect(
        accrued({
          ...live(ROOT_B, 160n),
          ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([])
    })

    it("latestTree older than the pending root (a stale file): the pending stage alone", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B, 160n),
          ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([pendingStage(60n, VALID_AT_MS)])
    })

    it("pending root older than the live one (a stale read): the file is judged against the live root", () => {
      const stale = { ...live(ROOT_B, 160n), ...pending(ROOT_A, 100n) }

      expect(
        accrued({ ...stale, ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }) }),
      ).toEqual([])
      expect(
        accrued({ ...stale, ...file(ROOT_B, 160n, { [ACCOUNT]: "30" }) }),
      ).toEqual([accruingStage(30n, EXPECTED_AT_MS)])
    })
  })

  describe("no root yet", () => {
    it("no live root: the pending root's whole amount is pending", () => {
      expect(accrued({ liveRoot: null, ...pending(ROOT_A, 100n) })).toEqual([
        pendingStage(100n, VALID_AT_MS),
      ])
    })

    it("no root anywhere, the account's first epoch: the estimate alone", () => {
      expect(
        accrued({
          liveRoot: null,
          pending: null,
          ...file(null, undefined, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([accruingStage(30n, EXPECTED_AT_MS)])
    })

    it.each([
      ["without the account", undefined],
      ["with the account", 100n],
    ])("no latestTree, a live root %s (a stale file): nothing", (_, amount) => {
      expect(
        accrued({
          ...live(ROOT_A, amount),
          ...file(null, undefined, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([])
    })

    it("a pending zero hash holds nothing and has no tree to wait for", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          pending: { root: null, validAt: VALID_AT },
          ...file(ROOT_B, 160n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([closedStage(60n), accruingStage(30n, EXPECTED_AT_MS)])
    })
  })

  describe("an epoch that paid the account nothing", () => {
    // its amount is the same under two roots, which only their totals tell apart
    const estimate = { [ACCOUNT]: "30" }

    it("latestTree older than the pending root: no estimate for an epoch the chain has closed", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B, 100n),
          ...file(ROOT_A, 100n, estimate),
        }),
      ).toEqual([])
    })

    it("latestTree older than the live root: no estimate", () => {
      expect(
        accrued({ ...live(ROOT_B, 100n), ...file(ROOT_A, 100n, estimate) }),
      ).toEqual([])
    })

    it("pending root older than the live one (a stale read): the file is judged against the live root", () => {
      const stale = { ...live(ROOT_B, 100n), ...pending(ROOT_A, 100n) }

      expect(accrued({ ...stale, ...file(ROOT_A, 100n, estimate) })).toEqual([])
      expect(accrued({ ...stale, ...file(ROOT_B, 100n, estimate) })).toEqual([
        accruingStage(30n, EXPECTED_AT_MS),
      ])
    })

    it("an account in no tree, latestTree older than the live root: no estimate", () => {
      expect(
        accrued({ ...live(ROOT_B), ...file(ROOT_A, undefined, estimate) }),
      ).toEqual([])
    })

    it("latestTree newer than the chain's roots: no closed stage, the estimate stays", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B, 100n),
          ...file(ROOT_C, 100n, estimate),
        }),
      ).toEqual([accruingStage(30n, EXPECTED_AT_MS)])
    })
  })

  describe("every ordering and coincidence of the three roots", () => {
    const ROOTS = [null, ROOT_A, ROOT_B, ROOT_C]

    // the account's cumulative amount under each root, in the order of ROOTS
    it.each([
      ["paid by every epoch", [0n, 100n, 160n, 210n]],
      ["paid nothing by the second epoch", [0n, 100n, 100n, 210n]],
      ["paid nothing by the third epoch", [0n, 100n, 160n, 160n]],
      ["paid by the first epoch only", [0n, 100n, 100n, 100n]],
      ["first paid by the third epoch", [0n, 0n, 0n, 50n]],
    ])(
      "an account %s: nothing counted twice, the estimate only when the file is not behind",
      (_, amounts) => {
        const rootAt = (at: number) => ROOTS[at] ?? null
        // the root's tree, without the account while it has earned nothing
        const treeOf = (at: number) => {
          const root = rootAt(at)
          return root ? tree(root, amounts[at] || undefined) : undefined
        }

        for (const liveAt of ROOTS.keys()) {
          for (const pendingAt of ROOTS.keys()) {
            for (const fileAt of ROOTS.keys()) {
              for (const claimed of [0n, 100n, 130n, 160n, 250n]) {
                const pendingRoot = rootAt(pendingAt)
                const fileRoot = rootAt(fileAt)
                const stages = accrued({
                  claimed,
                  liveRoot: rootAt(liveAt),
                  liveTree: treeOf(liveAt),
                  pending: pendingRoot
                    ? { root: pendingRoot, validAt: VALID_AT }
                    : null,
                  pendingTree: treeOf(pendingAt),
                  ...file(fileRoot, amounts[fileAt] || undefined, {
                    [ACCOUNT]: "30",
                  }),
                })

                const waiting = stages
                  .filter(({ stage }) => stage !== "accruing")
                  .reduce((sum, { amount }) => sum + amount, 0n)
                const owed = getOwedReward(amounts[liveAt] ?? 0n, claimed)
                const earned = [liveAt, pendingAt, fileAt]
                  .map((at) => amounts[at] ?? 0n)
                  .reduce((max, amount) => (amount > max ? amount : max), 0n)
                const isBehind = fileAt < liveAt || fileAt < pendingAt
                const at = `live ${liveAt}, pending ${pendingAt}, file ${fileAt}, claimed ${claimed}`

                // what was claimed, is claimable and is waiting: all it earned, once
                expect(claimed + owed + waiting, at).toBe(
                  earned > claimed ? earned : claimed,
                )
                expect(
                  stages.some(({ stage }) => stage === "accruing"),
                  at,
                ).toBe(!isBehind && claimed <= (amounts[fileAt] ?? 0n))
              }
            }
          }
        }
      },
    )
  })

  describe("an account missing from a tree counts as zero there", () => {
    it("missing from the live tree: all of the pending amount is pending", () => {
      expect(accrued({ ...live(ROOT_A), ...pending(ROOT_B, 60n) })).toEqual([
        pendingStage(60n, VALID_AT_MS),
      ])
    })

    it("missing from the pending tree: no pending stage, the closed one is unchanged", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B),
          ...file(ROOT_C, 150n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([closedStage(50n), accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("missing from every tree: the estimate alone", () => {
      expect(
        accrued({
          ...live(ROOT_A),
          ...pending(ROOT_B),
          ...file(ROOT_B, undefined, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("missing from the closed tree but not the live one: the file counts as behind", () => {
      expect(
        accrued({
          ...live(ROOT_A, 100n),
          ...file(ROOT_C, undefined, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([])
    })
  })

  describe("claimed above the live amount", () => {
    it("stages start from what was claimed", () => {
      expect(
        accrued({
          claimed: 130n,
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B, 160n),
          ...file(ROOT_C, 210n, {}),
        }),
      ).toEqual([pendingStage(30n, VALID_AT_MS), closedStage(50n)])
    })

    it("claimed above the pending amount too: only the closed root adds", () => {
      expect(
        accrued({
          claimed: 200n,
          ...live(ROOT_A, 100n),
          ...pending(ROOT_B, 160n),
          ...file(ROOT_C, 210n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([closedStage(10n), accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("claimed above the closed amount: the file is behind, so no estimate", () => {
      expect(
        accrued({
          claimed: 250n,
          ...live(ROOT_A, 100n),
          ...file(ROOT_C, 210n, { [ACCOUNT]: "30" }),
        }),
      ).toEqual([])
    })
  })

  describe("what has not been read ends the list", () => {
    const all = {
      ...live(ROOT_A, 100n),
      ...pending(ROOT_B, 160n),
      ...file(ROOT_C, 210n, { [ACCOUNT]: "30" }),
    }

    it.each([
      ["the live root", { liveRoot: undefined }],
      ["the live tree, loading", { liveTree: undefined }],
      ["the live tree, missing", { liveTree: null }],
      ["the claimed amount", { claimed: undefined }],
      ["the pending root", { pending: undefined }],
      ["the pending tree, loading", { pendingTree: undefined }],
      ["the pending tree, missing", { pendingTree: null }],
    ])("%s: nothing", (_, unread) => {
      expect(accrued({ ...all, ...unread })).toEqual([])
    })

    it.each([
      ["latest.json, loading", { latest: undefined }],
      ["latest.json, not written", { latest: null }],
      ["the closed tree, loading", { closedTree: undefined }],
      ["the closed tree, missing", { closedTree: null }],
    ])("%s: the pending stage alone", (_, unread) => {
      expect(accrued({ ...all, ...unread })).toEqual([
        pendingStage(60n, VALID_AT_MS),
      ])
    })

    it("a stale latest.json: neither the closed stage nor the estimate", () => {
      const sixHours = LATEST.asOf.hour * millisecondsInSecond + 6 * 3600_000

      expect(accrued({ ...all, now: sixHours + 1 })).toEqual([
        pendingStage(60n, undefined),
      ])
      // not stale yet: the time is past the epoch's, so only the amounts show
      expect(accrued({ ...all, now: sixHours })).toEqual([
        pendingStage(60n, undefined),
        closedStage(50n),
        accruingStage(30n, undefined),
      ])
    })

    it("a latest.json that stopped arriving grows stale by the reads of the roots", () => {
      const lastArrived = NOW
      const rootsReadAt = LATEST.asOf.hour * millisecondsInSecond + 7 * 3600_000

      expect(
        accrued({ ...all, now: getRewardsReadTime(rootsReadAt, lastArrived) }),
      ).toEqual([pendingStage(60n, undefined)])
    })
  })

  describe("a program with an end", () => {
    // the sample's open epoch is the program's last: both end at one time
    const ENDS_AT_MS = EPOCH_END * millisecondsInSecond
    const HOUR = 3600
    const estimate = { [ACCOUNT]: "30" }
    const upToDate = { ...live(ROOT_A, 100n) }

    // the file as a program with an end writes it
    const ending = (
      { latest, closedTree }: ReturnType<typeof file>,
      endsAt = EPOCH_END,
    ) => ({
      latest: { ...latest, program: { ...latest.program, endsAt } },
      closedTree,
    })

    it("before the end the open epoch's estimate shows, as it does without an end", () => {
      expect(
        accrued({
          ...upToDate,
          ...ending(file(ROOT_B, 160n, estimate)),
          now: ENDS_AT_MS - 1,
        }),
      ).toEqual([closedStage(60n), accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("from the end on there is no estimate, though the file still names the last epoch as open", () => {
      expect(
        accrued({
          ...upToDate,
          ...ending(file(ROOT_B, 160n, estimate)),
          now: ENDS_AT_MS,
        }),
      ).toEqual([closedStage(60n)])
    })

    it("what the roots hold stays listed after the end: the pending and the closed stage", () => {
      const validAt = EPOCH_END + HOUR

      expect(
        accrued({
          ...upToDate,
          ...pending(ROOT_B, 160n, validAt),
          ...ending(file(ROOT_C, 210n)),
          now: ENDS_AT_MS + 1,
        }),
      ).toEqual([
        pendingStage(60n, validAt * millisecondsInSecond),
        closedStage(50n),
      ])
    })

    it("the file stands still after the end and does not go stale for it: a closed epoch shows until its root is posted", () => {
      const monthLater = ENDS_AT_MS + 30 * 24 * HOUR * millisecondsInSecond

      expect(
        accrued({
          ...upToDate,
          ...ending(file(ROOT_B, 160n)),
          now: monthLater,
        }),
      ).toEqual([closedStage(60n)])
      // the same file of a program without an end is stale by then
      expect(
        accrued({ ...upToDate, ...file(ROOT_B, 160n), now: monthLater }),
      ).toEqual([])
    })

    it("a file that was more than six hours old when the program ended stays left out", () => {
      const sixHoursOn = LATEST.asOf.hour + 6 * HOUR
      const dayLater = (LATEST.asOf.hour + 24 * HOUR) * millisecondsInSecond

      expect(
        accrued({
          ...upToDate,
          ...ending(file(ROOT_B, 160n), sixHoursOn + 1),
          now: dayLater,
        }),
      ).toEqual([])
      // six hours old at the end, to the second: not stale
      expect(
        accrued({
          ...upToDate,
          ...ending(file(ROOT_B, 160n), sixHoursOn),
          now: dayLater,
        }),
      ).toEqual([closedStage(60n)])
    })

    it("an end that is still ahead keeps no old file: it is stale after six hours as any other", () => {
      const endsNextMonth = ending(
        file(ROOT_B, 160n, estimate),
        LATEST.asOf.hour + 30 * 24 * HOUR,
      )
      const sixHours = (LATEST.asOf.hour + 6 * HOUR) * millisecondsInSecond

      expect(
        accrued({ ...upToDate, ...endsNextMonth, now: sixHours + 1 }),
      ).toEqual([])
      expect(accrued({ ...upToDate, ...endsNextMonth, now: sixHours })).toEqual(
        [closedStage(60n), accruingStage(30n, undefined)],
      )
    })
  })

  describe("the estimate", () => {
    const upToDate = { ...live(ROOT_A, 100n) }

    it.each([
      ["a file without openEpoch", undefined],
      ["no estimate could be made", null],
      ["an epoch without a snapshot", {}],
      ["another account's estimate", { [OTHER_ACCOUNT]: "30" }],
      ["an estimate of zero", { [ACCOUNT]: "0" }],
    ])("%s: no stage", (_, accruing) => {
      expect(accrued({ ...upToDate, ...file(ROOT_A, 100n, accruing) })).toEqual(
        [],
      )
    })

    it("is expected from the epoch's end plus the timelock, in milliseconds", () => {
      expect(
        accrued({ ...upToDate, ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }) }),
      ).toEqual([accruingStage(30n, 1794913800000)])
    })

    it("has no time without the timelock", () => {
      expect(
        accrued({
          ...upToDate,
          ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }),
          timelock: undefined,
        }),
      ).toEqual([accruingStage(30n, undefined)])
    })

    it.each([
      ["at", EXPECTED_AT_MS],
      ["after", EXPECTED_AT_MS + 1],
    ])("has no time %s the expected one", (_, now) => {
      expect(
        accrued({
          ...upToDate,
          ...file(ROOT_A, 100n, { [ACCOUNT]: "30" }),
          now,
        }),
      ).toEqual([accruingStage(30n, undefined)])
    })

    it.each([
      ["before the epoch's first snapshot is counted", 0],
      ["once every snapshot of the epoch is taken", 3],
    ])("does not depend on the snapshot counts: %s", (_, snapshots) => {
      expect(
        accrued({
          ...upToDate,
          ...file(
            ROOT_A,
            100n,
            { [ACCOUNT]: "30" },
            { ...OPEN_EPOCH, snapshots },
          ),
        }),
      ).toEqual([accruingStage(30n, EXPECTED_AT_MS)])
    })

    it("is another account's when asked for that account", () => {
      expect(
        accrued({
          account: OTHER_ACCOUNT,
          ...file(null, undefined, { [OTHER_ACCOUNT]: "7" }),
        }),
      ).toEqual([accruingStage(7n, EXPECTED_AT_MS)])
    })
  })
})

describe("getRewardsProgramApr", () => {
  // 100 tokens of 6 decimals a day, worth $2 each, shared over $730,000
  const budget = {
    budgetPerDay: "100000000",
    eligibleUsd: "730000.00",
    rewardDecimals: 6,
    rewardPriceUsd: "2",
  }

  it("is a year of the budget's value over the eligible value, as a fraction", () => {
    expect(getRewardsProgramApr(budget)).toBe("0.1")
  })

  it.each([
    ["an undecided budget", { budgetPerDay: null }],
    ["a budget of zero", { budgetPerDay: "0" }],
    ["nothing eligible", { eligibleUsd: "0.00" }],
    ["no price", { rewardPriceUsd: "" }],
    ["a price of zero", { rewardPriceUsd: "0" }],
  ])("has no rate with %s", (_, change) => {
    expect(getRewardsProgramApr({ ...budget, ...change })).toBeNull()
  })
})

describe("mergeRewardsIncentive", () => {
  const PRIME = "0x000000000000000000000000000000010000002b"
  // what the money market's own controller streams on the reserve
  const streamed = {
    incentiveAPR: "0.01",
    rewardTokenAddress: "0x0000000000000000000000000000000100000000",
    rewardTokenSymbol: "HDX",
  }
  const program = {
    incentiveAPR: "0.1",
    rewardTokenAddress: PRIME,
    rewardTokenSymbol: "PRIME",
  }

  it("lists the program's rate beside the controller's incentives", () => {
    expect(mergeRewardsIncentive([streamed], program)).toEqual([
      streamed,
      program,
    ])
  })

  it("adds it into the row of the same reward token, in any letter case", () => {
    const streamedPrime = {
      ...program,
      incentiveAPR: "0.02",
      rewardTokenAddress: PRIME.replace("b", "B"),
    }

    expect(mergeRewardsIncentive([streamed, streamedPrime], program)).toEqual([
      streamed,
      { ...streamedPrime, incentiveAPR: "0.12" },
    ])
  })

  it("leaves a rate that is not finite as it is", () => {
    const endless = { ...program, incentiveAPR: "Infinity" }

    expect(mergeRewardsIncentive([endless], program)).toEqual([endless])
  })

  it.each([
    ["without a row of the reward token", [streamed]],
    [
      "with a row of the reward token",
      [streamed, { ...program, incentiveAPR: "0.02" }],
    ],
  ])(
    "leaves the reserve's own list %s as it was, so the rate is only in the list returned",
    (_, own) => {
      const before = structuredClone(own)

      expect(mergeRewardsIncentive(own, program)).not.toBe(own)
      expect(own).toEqual(before)
    },
  )

  it("is the reserve's own list when the program pays nothing on it", () => {
    const own = [streamed]

    expect(mergeRewardsIncentive(own, undefined)).toBe(own)
  })
})

describe("suppliesRewardsProgramAsset", () => {
  const HUSDC: Hex = "0x000000000000000000000000000000010000006e"
  const HUSDT: Hex = "0x000000000000000000000000000000010000006F"
  const position = (underlyingAsset: Hex, scaledATokenBalance: string) => ({
    underlyingAsset,
    scaledATokenBalance,
  })

  it("finds a supply of any earning asset, in any letter case", () => {
    expect(
      suppliesRewardsProgramAsset(
        [position(HUSDC, "0"), position(HUSDT, "1")],
        [HUSDC, HUSDT.toLowerCase()],
      ),
    ).toBe(true)
  })

  it("does not count an empty position or another asset", () => {
    expect(
      suppliesRewardsProgramAsset(
        [position(HUSDC, "0"), position(`0x${"1".repeat(40)}`, "5")],
        [HUSDC, HUSDT],
      ),
    ).toBe(false)
  })
})

describe("getHollarDebtUsd", () => {
  // matched in any letter case
  const HOLLAR: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"
  const HOLLAR_LOWERCASE: Hex = "0x531a654d1696ed52e7275a8cede955e82620f99a"
  const NOW = 1794902400
  const RAY = 10n ** 27n
  const ONE = 10n ** 18n

  // a market whose HOLLAR debt index is `index` (a ray), at `price` dollars
  // with 8 decimals, accruing at `rate` (a ray) since `lastUpdateTimestamp`
  const market = ({
    scaledDebt,
    index = RAY,
    rate = 0n,
    price = "100000000",
    lastUpdateTimestamp = NOW,
  }: {
    scaledDebt: bigint
    index?: bigint
    rate?: bigint
    price?: string
    lastUpdateTimestamp?: number
  }): HollarDebtMarket => ({
    hollar: HOLLAR,
    positions: [
      {
        underlyingAsset: HOLLAR_LOWERCASE,
        scaledVariableDebt: scaledDebt.toString(),
      },
    ],
    reserves: {
      reserves: [
        {
          underlyingAsset: HOLLAR,
          decimals: 18,
          variableBorrowIndex: index.toString(),
          variableBorrowRate: rate.toString(),
          lastUpdateTimestamp,
          priceInMarketReferenceCurrency: price,
        },
      ],
      baseCurrency: {
        marketReferenceCurrencyDecimals: 8,
        marketReferenceCurrencyPriceInUsd: "100000000",
      },
    },
  })

  it("values each market's debt at its index and price, and adds them up", () => {
    expect(
      getHollarDebtUsd(
        [
          market({ scaledDebt: 100n * ONE, index: (RAY * 11n) / 10n }),
          market({ scaledDebt: 10n * ONE, price: "99000000" }),
        ],
        NOW,
      ),
    ).toBe("119.9")
  })

  it("accrues the debt up to now", () => {
    const debt = (now: number) =>
      getHollarDebtUsd(
        [
          market({
            scaledDebt: 100n * ONE,
            rate: RAY / 10n,
            lastUpdateTimestamp: NOW - 86400,
          }),
        ],
        now,
      )

    expect(debt(NOW - 86400)).toBe("100")
    expect(Number(debt(NOW))).toBeGreaterThan(100)
  })

  it("is zero without HOLLAR debt, whatever the reserves", () => {
    expect(
      getHollarDebtUsd(
        [
          { ...market({ scaledDebt: 0n }), reserves: undefined },
          { hollar: HOLLAR, positions: [], reserves: undefined },
        ],
        NOW,
      ),
    ).toBe("0")
  })

  it("is not known while a market holding the debt has no reserves read", () => {
    expect(
      getHollarDebtUsd(
        [
          market({ scaledDebt: ONE }),
          { ...market({ scaledDebt: ONE }), reserves: undefined },
        ],
        NOW,
      ),
    ).toBeUndefined()
  })
})
