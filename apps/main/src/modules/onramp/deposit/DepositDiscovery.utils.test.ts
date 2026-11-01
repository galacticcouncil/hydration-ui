import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap, tags } from "@galacticcouncil/xc-cfg"
import {
  type AssetAmount,
  type AssetRoute,
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
  groupDepositBalances,
  summarizeDepositBalances,
} from "@/modules/onramp/deposit/DepositDiscovery.utils"

vi.mock("@/modules/xcm/transfer/utils/chain", () => ({
  isAccountValidOnChain: (account: Account | null) => !!account,
}))
vi.mock("@galacticcouncil/ui/assets/icons", () => ({}))
vi.mock("@galacticcouncil/ui/components", () => ({}))
vi.mock("@galacticcouncil/money-market/ui-config", () => ({
  AaveV3HydrationMainnet: {
    GHO_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
  },
}))
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

describe("deposit discovery", () => {
  it("counts duplicate extension accounts once on each chain and keeps different accounts", () => {
    const first = makeAccount("0x0000000000000000000000000000000000000001")
    const duplicate = { ...first, provider: WalletProviderType.MetaMask }
    const second = makeAccount("0x0000000000000000000000000000000000000002")
    const pairs = ["ethereum", "base"].map((key) => ({
      chain: chainsMap.get(key)!,
      assets: [],
      routes: [],
      isTagSelect: false,
    }))
    expect(getDepositSources([first, duplicate, second], pairs)).toHaveLength(4)
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

const route = (
  assetKey: string,
  destinationKey: string,
  routeTags: string[],
): AssetRoute =>
  ({
    source: { asset: { key: assetKey } },
    destination: { asset: { key: destinationKey } },
    tags: routeTags,
  }) as AssetRoute

describe("grouped deposit discovery", () => {
  it("retains alternative signers without querying or counting the same address twice", () => {
    const first = makeAccount(
      "0x0000000000000000000000000000000000000001",
      WalletProviderType.MetaMask,
    )
    const alternative = { ...first, provider: WalletProviderType.RabbyWallet }
    const sources = getDepositSources(
      [first, alternative, alternative],
      [
        {
          chain: chainsMap.get("ethereum")!,
          assets: [],
          routes: [],
          isTagSelect: false,
        },
      ],
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
  })

  it("aggregates the same global asset across chains with differing decimals", () => {
    const result = groupDepositBalances([
      balanceRow("eth", "ethereum", 500000000n, 6, "500"),
      balanceRow("hub", "assethub", 4000000000n, 8, "40"),
    ])
    expect(result.groups).toHaveLength(1)
    expect(result.groups[0]).toMatchObject({
      assetKey: "usdc",
      amount: "540",
      value: "540",
    })
    expect(result.groups[0]?.rows.map((row) => row.key)).toEqual(["eth", "hub"])
  })

  it("defaults to the largest supported source even before prices arrive", () => {
    const result = groupDepositBalances([
      balanceRow("a-small", "assethub", 40000000n, 6),
      balanceRow("z-large", "ethereum", 50000000000n, 8),
    ])
    expect(result.groups[0]?.rows.map((row) => row.key)).toEqual([
      "z-large",
      "a-small",
    ])
  })

  it("preserves units beyond floating point and twenty decimal places", () => {
    const result = groupDepositBalances([
      balanceRow(
        "large",
        "ethereum",
        9007199254740993000000000000000000000001n,
        24,
        "1",
      ),
      balanceRow("tiny", "base", 1n, 24, "0"),
    ])
    expect(result.groups[0]?.amount).toBe(
      "9007199254740993.000000000000000000000002",
    )
  })

  it("does not merge different asset identities with the same symbol", () => {
    const result = groupDepositBalances([
      balanceRow("one", "ethereum", 1n, 0, "1", "usdc"),
      balanceRow("two", "base", 2n, 0, "2", "usdc_distinct"),
    ])
    expect(result.groups.map((group) => group.assetKey)).toEqual([
      "usdc_distinct",
      "usdc",
    ])
  })

  it("retains unsupported positive holdings separately and excludes them from deposit totals", () => {
    const unsupported = balanceRow("blocked", "solana", 1000000000n, 6, "1000")
    unsupported.source.assets = []
    const result = groupDepositBalances([
      balanceRow("supported", "ethereum", 5n, 0, "5"),
      unsupported,
    ])
    expect(result.total).toBe("5")
    expect(result.groups[0]?.amount).toBe("5")
    expect(result.unsupported).toEqual([{ ...unsupported, reason: "noRoute" }])
  })

  it("does not invent a dust cutoff and ignores zero balances or repeated snapshots", () => {
    const tiny = balanceRow("tiny", "ethereum", 1n, 18, "0.000000000000000001")
    const result = groupDepositBalances([
      tiny,
      tiny,
      balanceRow("zero", "base", 0n, 18, "0"),
    ])
    expect(result.rows).toHaveLength(1)
    expect(result.groups[0]?.amount).toBe("1e-18")
    expect(result.total).toBe("1e-18")
  })

  it("sorts complete USD groups first and does not pretend partial prices are a full group valuation", () => {
    const result = groupDepositBalances([
      balanceRow("unpriced", "base", 1n, 0, undefined),
      balanceRow("priced", "ethereum", 2n, 0, "2"),
      balanceRow("eth", "ethereum", 1n, 0, "3000", "eth", "ETH"),
    ])
    expect(result.groups.map((group) => group.assetKey)).toEqual([
      "eth",
      "usdc",
    ])
    expect(result.groups[1]).toMatchObject({
      amount: "3",
      value: undefined,
      unpriced: 1,
    })
    expect(result.total).toBe("3002")
  })

  it("counts actual route choices once across accounts and distinguishes manual claim alternatives", () => {
    const first = balanceRow("one", "ethereum", 1n, 0, "1")
    first.source.routes = [
      route("usdc", "usdc_wh", [tags.Tag.Wormhole]),
      route("usdc", "usdc_sb", [tags.Tag.Snowbridge]),
    ]
    const second = { ...first, key: "two" }
    const result = groupDepositBalances([first, second])
    expect(result.groups[0]).toMatchObject({
      routeCount: 2,
      claimRequired: false,
      claimPossible: true,
    })
    first.source.routes = [route("usdc", "usdc_wh", [tags.Tag.Wormhole])]
    expect(groupDepositBalances([first]).groups[0]).toMatchObject({
      claimRequired: true,
    })
    first.source.routes = [
      route("usdc", "usdc_wh", [tags.Tag.Wormhole, tags.Tag.NttExecutor]),
    ]
    expect(groupDepositBalances([first]).groups[0]).toMatchObject({
      claimRequired: false,
      claimPossible: false,
    })
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
    expect(result.unsupported.map((row) => [row.key, row.reason])).toEqual([
      ["below", "tooSmall"],
      ["equal", "tooSmall"],
    ])
    expect(result.total).toBe("0.100001")
    expect(result.groups[0]?.amount).toBe("0.100001")
  })

  it("does not infer route or dynamic minimums from a static fallback or small EVM balance", () => {
    const dynamic = withSourceReserve(
      balanceRow("dynamic", "assethub", 1n, 6, "0.000001"),
      true,
    )
    const evm = balanceRow("evm", "ethereum", 1n, 18, "0.000000000000000001")
    expect(getDepositUnavailableReason(dynamic)).toBeUndefined()
    expect(getDepositUnavailableReason(evm)).toBeUndefined()
    expect(groupDepositBalances([dynamic, evm]).unsupported).toEqual([])
  })
})
