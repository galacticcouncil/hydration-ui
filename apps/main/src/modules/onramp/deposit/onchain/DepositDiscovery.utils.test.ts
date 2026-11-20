import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import {
  type AssetAmount,
  Parachain,
  SubstrateBalanceType,
  SubstrateMinType,
} from "@galacticcouncil/xc-core"
import { describe, expect, it, vi } from "vitest"

import {
  DepositBalanceRow,
  filterDepositBalancesByProviders,
  getDepositSources,
  getDepositUnavailableReason,
  getDiscoveryProgress,
  groupDepositBalances,
  groupDepositHoldings,
  summarizeDepositBalances,
} from "@/modules/onramp/deposit/onchain/DepositDiscovery.utils"

vi.mock("@/modules/xcm/transfer/utils/chain", () => ({
  isAccountValidOnChain: (account: Account | null) => !!account,
}))
vi.mock("@galacticcouncil/ui/assets/icons", () => ({}))
vi.mock("@galacticcouncil/ui/components", () => ({}))
const makeAccount = (
  address: string,
  provider = WalletProviderType.ExternalWallet,
): Account => ({
  name: "Preview",
  address,
  rawAddress: address,
  displayAddress: address,
  publicKey: "",
  provider,
  canUseOnHydration: true,
})

const pairsFor = (...keys: string[]) =>
  keys.map((key) => ({
    chain: chainsMap.get(key)!,
    assets: [],
    routes: [],
    isTagSelect: false,
  }))

describe("deposit discovery", () => {
  it("pairs accounts only with chains whose address format they can use", () => {
    const evm = makeAccount(
      "0x0000000000000000000000000000000000000001",
      WalletProviderType.MetaMask,
    )
    const sources = getDepositSources(
      [evm],
      pairsFor("ethereum", "base", "solana"),
    )
    expect(sources.map((source) => source.chain.key)).toEqual([
      "ethereum",
      "base",
    ])
  })
  it("counts duplicate extension accounts once on each chain and keeps different accounts", () => {
    const first = makeAccount("0x0000000000000000000000000000000000000001")
    const duplicate = { ...first, provider: WalletProviderType.MetaMask }
    const second = makeAccount("0x0000000000000000000000000000000000000002")
    expect(
      getDepositSources(
        [first, duplicate, second],
        pairsFor("ethereum", "base"),
      ),
    ).toHaveLength(4)
  })
  it("sorts all accounts together by precise value and excludes unknown prices from totals", () => {
    const rows = [
      { key: "a", value: "0.1" },
      { key: "b", value: undefined },
      { key: "c", value: "10.2" },
      { key: "d", value: "0.2" },
    ] as DepositBalanceRow[]
    const summary = summarizeDepositBalances(rows)
    expect(summary.rows.map((row) => row.key)).toEqual(["c", "d", "a", "b"])
    expect(summary.total).toBe("10.5")
    expect(summary.unpriced).toBe(1)
  })
})

const balanceRow = (
  key: string,
  chainKey: string,
  amount: bigint,
  decimals: number,
  value?: string,
  assetKey = "usdc",
  symbol = "USDC",
): DepositBalanceRow => {
  const account = makeAccount(
    "0x0000000000000000000000000000000000000001",
    WalletProviderType.MetaMask,
  )
  const balance = {
    key: assetKey,
    originSymbol: symbol,
    amount,
    decimals,
  } as AssetAmount
  return {
    key,
    balance,
    value,
    source: {
      key: `${chainKey}:${account.address}`,
      chain: chainsMap.get(chainKey)!,
      assets: [balance],
      routes: [],
      isTagSelect: false,
      account,
      accounts: [account],
    },
  }
}

describe("deposit Holdings", () => {
  it("retains alternative signers without querying or counting the same address twice", () => {
    const first = makeAccount(
      "0x0000000000000000000000000000000000000001",
      WalletProviderType.MetaMask,
    )
    const alternative = { ...first, provider: WalletProviderType.RabbyWallet }
    const sources = getDepositSources(
      [first, alternative, alternative],
      pairsFor("ethereum"),
    )
    expect(sources).toHaveLength(1)
    expect(sources[0]?.accounts).toEqual([first, alternative])
  })

  it("uses a selected wallet's signer alias while preserving one shared funded row", () => {
    const row = balanceRow("funds", "ethereum", 100n, 2, "1")
    const alias = {
      ...row.source.account,
      provider: WalletProviderType.RabbyWallet,
    }
    row.source.accounts.push(alias)
    const filtered = filterDepositBalancesByProviders(
      [row],
      [WalletProviderType.RabbyWallet],
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.source.account).toEqual(alias)
    expect(groupDepositBalances(filtered).total).toBe("1")
    expect(row.source.account.provider).toBe(WalletProviderType.MetaMask)
    expect(
      filterDepositBalancesByProviders([row], [WalletProviderType.Phantom]),
    ).toEqual([])
    expect(filterDepositBalancesByProviders([row], null)).toEqual([row])
  })

  it("drops positive holdings without a route and excludes them from deposit totals", () => {
    const unsupported = balanceRow("blocked", "solana", 1000000000n, 6, "1000")
    unsupported.source.assets = []
    expect(getDepositUnavailableReason(unsupported)).toBe("noRoute")
    const result = groupDepositBalances([
      balanceRow("supported", "ethereum", 5n, 0, "5"),
      unsupported,
    ])
    expect(result.total).toBe("5")
    expect(result.rows.map((row) => row.key)).toEqual(["supported"])
  })

  it("hides the pendulum PEN route, which fails on Hydration, from Discovery", () => {
    const pen = balanceRow("pen", "pendulum", 10n ** 12n, 12, "1", "pen", "PEN")
    expect(getDepositUnavailableReason(pen)).toBe("noRoute")
    expect(groupDepositBalances([pen]).rows).toEqual([])
  })

  it("does not invent a dust cutoff and ignores zero balances or repeated snapshots", () => {
    const tiny = balanceRow("tiny", "ethereum", 1n, 18, "0.000000000000000001")
    const result = groupDepositBalances([
      tiny,
      tiny,
      balanceRow("zero", "base", 0n, 18, "0"),
    ])
    expect(result.rows).toHaveLength(1)
    expect(result.total).toBe("1e-18")
  })

  it("sorts priced Holdings by value with unpriced last", () => {
    const result = groupDepositBalances([
      balanceRow("unpriced", "base", 1n, 0, undefined),
      balanceRow("priced", "ethereum", 2n, 0, "2"),
      balanceRow("eth", "ethereum", 1n, 0, "3000", "eth", "ETH"),
    ])
    expect(result.rows.map((row) => row.key)).toEqual([
      "eth",
      "priced",
      "unpriced",
    ])
    expect(result.total).toBe("3002")
    expect(result.unpriced).toBe(1)
  })
})

const withSourceReserve = (row: DepositBalanceRow, dynamic = false) => ({
  ...row,
  source: {
    ...row.source,
    chain: new Parachain({
      key: "static-reserve",
      name: "Reserve chain",
      genesisHash: "0x" + "0".repeat(64),
      parachainId: 9999,
      ss58Format: 63,
      ws: [],
      assetsData: [
        { asset: row.balance, decimals: row.balance.decimals, min: 0.1 },
      ],
      balance: SubstrateBalanceType.Tokens,
      ...(dynamic ? { min: SubstrateMinType.Assets } : {}),
    }),
  },
})

describe("provably unspendable source reserves", () => {
  it("excludes positive balances at or below the SDK's configured static source reserve", () => {
    const below = withSourceReserve(
      balanceRow("below", "assethub", 99999n, 6, "0.099999"),
    )
    const equal = withSourceReserve(
      balanceRow("equal", "assethub", 100000n, 6, "0.1"),
    )
    const above = withSourceReserve(
      balanceRow("above", "assethub", 100001n, 6, "0.100001"),
    )
    expect(getDepositUnavailableReason(below)).toBe("tooSmall")
    expect(getDepositUnavailableReason(equal)).toBe("tooSmall")
    expect(getDepositUnavailableReason(above)).toBeUndefined()
    const result = groupDepositBalances([below, equal, above])
    expect(result.rows.map((row) => row.key)).toEqual(["above"])
    expect(result.total).toBe("0.100001")
  })

  it("does not infer route or dynamic minimums from a static fallback or small EVM balance", () => {
    const dynamic = withSourceReserve(
      balanceRow("dynamic", "assethub", 1n, 6, "0.000001"),
      true,
    )
    const evm = balanceRow("evm", "ethereum", 1n, 18, "0.000000000000000001")
    expect(getDepositUnavailableReason(dynamic)).toBeUndefined()
    expect(getDepositUnavailableReason(evm)).toBeUndefined()
    expect(groupDepositBalances([dynamic, evm]).rows).toHaveLength(2)
  })
})

describe("discovery progress", () => {
  it("counts a failed fetch as settled", () => {
    expect(getDiscoveryProgress([], [{ status: "error" }])).toEqual({
      settled: 1,
      total: 1,
      isSettled: true,
    })
  })
  it("grows the total as wallets connect and add Deposit sources", () => {
    const connecting = getDiscoveryProgress(
      ["connected", "pending"],
      [{ status: "success" }],
    )
    const connected = getDiscoveryProgress(
      ["connected", "connected"],
      [{ status: "success" }, { status: "pending" }, { status: "pending" }],
    )
    expect(connecting).toEqual({ settled: 2, total: 3, isSettled: false })
    expect(connected).toEqual({ settled: 3, total: 5, isSettled: false })
  })
  it("settles only once both wallet connections and balance fetches finish", () => {
    expect(
      getDiscoveryProgress(["waiting"], [{ status: "success" }]).isSettled,
    ).toBe(false)
    expect(
      getDiscoveryProgress(["skipped"], [{ status: "pending" }]).isSettled,
    ).toBe(false)
    expect(
      getDiscoveryProgress(
        ["rejected", "skipped"],
        [{ status: "success" }, { status: "error" }],
      ).isSettled,
    ).toBe(true)
  })
  it("stays settled while an already-settled source refetches in the background", () => {
    // A refetching query keeps its success/error status; only fetchStatus changes.
    expect(
      getDiscoveryProgress(["connected"], [{ status: "success" }]).isSettled,
    ).toBe(true)
  })
  it("un-settles when a newly connected wallet adds a Deposit source", () => {
    expect(
      getDiscoveryProgress(
        ["connected", "connected"],
        [{ status: "success" }, { status: "pending" }],
      ),
    ).toEqual({ settled: 3, total: 4, isSettled: false })
  })
})

describe("grouping Holdings", () => {
  it("sums one asset across chains with different decimals, keyed by the Hydration asset", () => {
    const assethub = {
      ...balanceRow("ah", "assethub", 1_500000n, 6, "1.5"),
      destAssetId: "10",
    }
    const moonbeam = {
      ...balanceRow("mb", "moonbeam", 2n * 10n ** 18n, 18, "2"),
      destAssetId: "10",
    }
    const [group, ...rest] = groupDepositHoldings([moonbeam, assethub], "asset")
    expect(rest).toEqual([])
    expect(group?.rows.map((row) => row.key)).toEqual(["mb", "ah"])
    expect(group?.decimals).toBe(18)
    expect(group?.amount).toBe(35n * 10n ** 17n)
    expect(group?.value).toBe("3.5")
  })

  it("falls back to the source asset key without a Hydration asset", () => {
    const groups = groupDepositHoldings(
      [
        balanceRow("a", "ethereum", 1n, 0, "1"),
        balanceRow("b", "base", 1n, 0, "1"),
        { ...balanceRow("c", "base", 1n, 0, "1"), destAssetId: "10" },
      ],
      "asset",
    )
    expect(groups.map((group) => group.rows.length)).toEqual([2, 1])
  })

  it("sorts groups by summed value with unpriced last, keeping row order inside", () => {
    const rows = [
      balanceRow("eth-big", "ethereum", 1n, 0, "5"),
      balanceRow("base-a", "base", 1n, 0, "4"),
      balanceRow("base-b", "base", 1n, 0, "3"),
      balanceRow("eth-unpriced", "ethereum", 1n, 0, undefined),
      balanceRow("solo-unpriced", "assethub", 1n, 0, undefined),
    ]
    const groups = groupDepositHoldings(rows, "chain")
    expect(groups.map((group) => [group.key, group.value])).toEqual([
      ["base", "7"],
      ["ethereum", "5"],
      ["assethub", undefined],
    ])
    expect(groups[1]?.rows.map((row) => row.key)).toEqual([
      "eth-big",
      "eth-unpriced",
    ])
  })
})
