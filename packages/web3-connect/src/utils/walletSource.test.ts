import { describe, expect, it } from "vitest"

import {
  NEAR_PROVIDERS,
  SOLANA_PROVIDERS,
  SUBSTRATE_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import { WalletMode } from "@/config/wallet"
import {
  getConflictingWalletProviders,
  getConnectAllGroups,
  getConnectedWalletSourceGroups,
  getExclusiveWalletProviderTypes,
  getSelectableWallets,
  getWalletGroupSourceModes,
  getWalletSourceAction,
  getWalletSourceGroupAction,
  getWalletSourceModeLabel,
  getWalletSourceModes,
  groupWalletsBySource,
  isWalletSourceGroupId,
  selectWalletSources,
  WalletSourceLike,
} from "@/utils/walletSource"

const wallet = (
  provider: WalletProviderType,
  title: string,
  installed = true,
): WalletSourceLike => ({ provider, title, logo: "", installed })

const TALISMAN = wallet(WalletProviderType.Talisman, "Talisman")
const TALISMAN_EVM = wallet(WalletProviderType.TalismanEvm, "Talisman")
const TALISMAN_SOL = wallet(WalletProviderType.TalismanSol, "Talisman")
const TALISMAN_H160 = wallet(WalletProviderType.TalismanH160, "Talisman")
const POLKADOT_JS = wallet(WalletProviderType.PolkadotJS, "Polkadot.js")
const PHANTOM = wallet(WalletProviderType.Phantom, "Phantom")
const SUBWALLET = wallet(WalletProviderType.Subwallet, "SubWallet")
const SUBWALLET_EVM = wallet(WalletProviderType.SubwalletEvm, "SubWallet")
const SUBWALLET_H160 = wallet(WalletProviderType.SubwalletH160, "SubWallet")
const NOVA = wallet(WalletProviderType.NovaWallet, "Nova Wallet")
const RABBY = wallet(WalletProviderType.RabbyWallet, "Rabby")
const NOT_INSTALLED = wallet(WalletProviderType.Enkrypt, "Enkrypt", false)
const METEOR = wallet(WalletProviderType.MeteorWallet, "Meteor Wallet")

const titles = (groups: { title: string }[]) => groups.map((g) => g.title)

describe("groupWalletsBySource", () => {
  it("folds one brand's providers into a single source", () => {
    const [group, ...rest] = groupWalletsBySource([
      TALISMAN,
      POLKADOT_JS,
      TALISMAN_EVM,
    ])

    expect(group?.title).toBe("Talisman")
    expect(group?.providers).toEqual([
      WalletProviderType.Talisman,
      WalletProviderType.TalismanEvm,
    ])
    expect(rest.map((g) => g.title)).toEqual(["Polkadot.js"])
  })

  it("produces ids that isWalletSourceGroupId recognises", () => {
    const [group] = groupWalletsBySource([TALISMAN])
    expect(group && isWalletSourceGroupId(group.id)).toBe(true)
    expect(isWalletSourceGroupId(WalletProviderType.Talisman)).toBe(false)
    expect(isWalletSourceGroupId("all")).toBe(false)
  })
})

describe("getConflictingWalletProviders", () => {
  const all = [
    SUBWALLET,
    SUBWALLET_EVM,
    SUBWALLET_H160,
    TALISMAN,
    TALISMAN_EVM,
    TALISMAN_H160,
    TALISMAN_SOL,
    POLKADOT_JS,
  ]

  it("treats SubWallet's Polkadot, EVM and H160 connections as alternatives", () => {
    expect(
      getConflictingWalletProviders(all, WalletProviderType.SubwalletEvm),
    ).toEqual([WalletProviderType.Subwallet, WalletProviderType.SubwalletH160])
    expect(
      getConflictingWalletProviders(all, WalletProviderType.Subwallet),
    ).toEqual([
      WalletProviderType.SubwalletEvm,
      WalletProviderType.SubwalletH160,
    ])
  })

  it("includes other chains from the same brand without affecting other wallets", () => {
    expect(
      getConflictingWalletProviders(all, WalletProviderType.Talisman),
    ).toEqual([
      WalletProviderType.TalismanEvm,
      WalletProviderType.TalismanH160,
      WalletProviderType.TalismanSol,
    ])
    expect(
      getConflictingWalletProviders(all, WalletProviderType.PolkadotJS),
    ).toEqual([])
  })

  it("never groups unknown providers or multisig with a wallet brand", () => {
    const sameTitle = [
      TALISMAN,
      wallet(WalletProviderType.Multisig, "Talisman"),
    ]

    expect(
      getConflictingWalletProviders(sameTitle, WalletProviderType.Multisig),
    ).toEqual([])
    expect(
      getConflictingWalletProviders(sameTitle, WalletProviderType.Talisman),
    ).toEqual([])
    expect(
      getConflictingWalletProviders(sameTitle, WalletProviderType.MetaMask),
    ).toEqual([])
  })
})

describe("getExclusiveWalletProviderTypes", () => {
  const all = [
    TALISMAN,
    TALISMAN_EVM,
    TALISMAN_SOL,
    SUBWALLET,
    SUBWALLET_EVM,
    SUBWALLET_H160,
    POLKADOT_JS,
  ]

  it("keeps the first legacy connection of each brand without preferences", () => {
    expect(
      getExclusiveWalletProviderTypes(all, [
        WalletProviderType.SubwalletH160,
        WalletProviderType.TalismanSol,
        WalletProviderType.Subwallet,
        WalletProviderType.TalismanEvm,
        WalletProviderType.PolkadotJS,
      ]),
    ).toEqual([
      WalletProviderType.SubwalletH160,
      WalletProviderType.TalismanSol,
      WalletProviderType.PolkadotJS,
    ])
  })

  it("prefers the active account type before recent types and preserves retained order", () => {
    expect(
      getExclusiveWalletProviderTypes(
        all,
        [
          WalletProviderType.Talisman,
          WalletProviderType.SubwalletEvm,
          WalletProviderType.Subwallet,
          WalletProviderType.TalismanEvm,
          WalletProviderType.PolkadotJS,
        ],
        [
          WalletProviderType.TalismanEvm,
          WalletProviderType.Subwallet,
          WalletProviderType.Talisman,
        ],
      ),
    ).toEqual([
      WalletProviderType.Subwallet,
      WalletProviderType.TalismanEvm,
      WalletProviderType.PolkadotJS,
    ])
  })

  it("ignores preferences that are not connected and keeps unrelated sources", () => {
    expect(
      getExclusiveWalletProviderTypes(
        [...all, wallet(WalletProviderType.Multisig, "Talisman")],
        [
          WalletProviderType.Talisman,
          WalletProviderType.Multisig,
          WalletProviderType.MetaMask,
          WalletProviderType.Phantom,
          WalletProviderType.MetaMask,
        ],
        [WalletProviderType.TalismanEvm],
      ),
    ).toEqual([
      WalletProviderType.Talisman,
      WalletProviderType.Multisig,
      WalletProviderType.MetaMask,
      WalletProviderType.Phantom,
    ])
  })
})

describe("selectWalletSources", () => {
  const all = [TALISMAN, TALISMAN_EVM, TALISMAN_SOL, POLKADOT_JS, PHANTOM]

  it("offers every wallet when no mode is forced", () => {
    const { available } = selectWalletSources(all, null, [])
    expect(available).toHaveLength(all.length)
  })

  it("narrows to the forced mode's providers", () => {
    const { available } = selectWalletSources(all, SOLANA_PROVIDERS, [])

    expect(available.map((w) => w.provider)).toEqual([
      WalletProviderType.TalismanSol,
      WalletProviderType.Phantom,
    ])
  })

  it("never advertises an H160 provider when no mode is forced", () => {
    const { available } = selectWalletSources(
      [TALISMAN, TALISMAN_H160],
      null,
      [],
    )

    expect(available).toEqual([TALISMAN])
  })

  it("keeps a connected H160 provider reachable", () => {
    const { available } = selectWalletSources([TALISMAN, TALISMAN_H160], null, [
      WalletProviderType.TalismanH160,
    ])

    expect(available).toHaveLength(2)
  })

  it("never advertises a NEAR web wallet when no mode is forced", () => {
    const { available } = selectWalletSources([TALISMAN, METEOR], null, [])

    expect(available).toEqual([TALISMAN])
  })

  it("keeps a connected NEAR web wallet reachable", () => {
    const { recentGroups } = selectWalletSources([METEOR], null, [
      WalletProviderType.MeteorWallet,
    ])

    expect(titles(recentGroups)).toEqual(["Meteor Wallet"])
  })

  it("lists a NEAR wallet whose extension is installed", () => {
    const { installedGroups } = selectWalletSources(
      [{ ...METEOR, hasExtension: true }],
      null,
      [],
    )

    expect(titles(installedGroups)).toEqual(["Meteor Wallet"])
  })

  it("offers NEAR web wallets once NEAR is forced", () => {
    const { available } = selectWalletSources([METEOR], NEAR_PROVIDERS, [])

    expect(available).toEqual([METEOR])
  })

  it("drops ExternalWallet, which renders in its own slot", () => {
    const external = wallet(WalletProviderType.ExternalWallet, "External")
    const { available } = selectWalletSources([TALISMAN, external], null, [])

    expect(available).toEqual([TALISMAN])
  })

  it("keeps WalletConnect out of recent and installed", () => {
    const walletConnect = wallet(
      WalletProviderType.WalletConnect,
      "WalletConnect",
    )
    const { recentGroups, installedGroups, walletConnectGroups } =
      selectWalletSources(
        [TALISMAN, walletConnect],
        null,
        [WalletProviderType.WalletConnect],
        [WalletProviderType.WalletConnect],
      )

    expect(titles(recentGroups)).toEqual([])
    expect(titles(installedGroups)).toEqual(["Talisman"])
    expect(titles(walletConnectGroups)).toEqual(["WalletConnect"])
  })

  it("holds back sources that are neither installed nor connected", () => {
    const { installedGroups, moreGroups } = selectWalletSources(
      [TALISMAN, NOT_INSTALLED],
      null,
      [],
    )

    expect(titles(installedGroups)).toEqual(["Talisman"])
    expect(titles(moreGroups)).toEqual(["Enkrypt"])
  })

  it("moves uninstalled sources with a deeplink out of more wallets", () => {
    const { moreGroups, deeplinkedGroups } = selectWalletSources(
      [
        TALISMAN,
        NOT_INSTALLED,
        wallet(WalletProviderType.Phantom, "Phantom", false),
      ],
      null,
      [],
      [],
      [WalletProviderType.Phantom, WalletProviderType.Talisman],
    )

    expect(titles(deeplinkedGroups)).toEqual(["Phantom"])
    expect(titles(moreGroups)).toEqual(["Enkrypt"])
  })

  it("promotes an uninstalled source once it is connected", () => {
    const { recentGroups, moreGroups } = selectWalletSources(
      [NOT_INSTALLED],
      null,
      [WalletProviderType.Enkrypt],
    )

    expect(titles(recentGroups)).toEqual(["Enkrypt"])
    expect(moreGroups).toEqual([])
  })

  it("sorts recents by last use, installed by title", () => {
    const { recentGroups, installedGroups } = selectWalletSources(
      [PHANTOM, POLKADOT_JS, TALISMAN, SUBWALLET],
      null,
      [],
      [WalletProviderType.Subwallet, WalletProviderType.Talisman],
    )

    expect(titles(recentGroups)).toEqual(["SubWallet", "Talisman"])
    expect(titles(installedGroups)).toEqual(["Phantom", "Polkadot.js"])
  })

  it("ranks a brand by its newest provider", () => {
    const { recentGroups } = selectWalletSources(
      [TALISMAN, TALISMAN_EVM, TALISMAN_SOL, PHANTOM],
      null,
      [],
      [WalletProviderType.Phantom, WalletProviderType.TalismanEvm],
    )

    expect(titles(recentGroups)).toEqual(["Phantom", "Talisman"])
  })

  it("sorts recents by last use regardless of connection status", () => {
    const { recentGroups } = selectWalletSources(
      [PHANTOM, TALISMAN],
      null,
      [WalletProviderType.Talisman],
      [WalletProviderType.Phantom, WalletProviderType.Talisman],
    )

    expect(titles(recentGroups)).toEqual(["Phantom", "Talisman"])
  })

  it("caps recents at five; overflow goes to installed", () => {
    const { recentGroups, installedGroups } = selectWalletSources(
      [PHANTOM, POLKADOT_JS, TALISMAN, SUBWALLET, NOVA, RABBY],
      null,
      [],
      [
        WalletProviderType.Phantom,
        WalletProviderType.PolkadotJS,
        WalletProviderType.Subwallet,
        WalletProviderType.NovaWallet,
        WalletProviderType.RabbyWallet,
        WalletProviderType.Talisman,
      ],
    )

    expect(titles(recentGroups)).toEqual([
      "Phantom",
      "Polkadot.js",
      "SubWallet",
      "Nova Wallet",
      "Rabby",
    ])
    expect(titles(installedGroups)).toEqual(["Talisman"])
  })

  it("moves uninstalled remembered wallets to more", () => {
    const { recentGroups, moreGroups } = selectWalletSources(
      [TALISMAN, NOT_INSTALLED],
      null,
      [],
      [WalletProviderType.Enkrypt, WalletProviderType.Talisman],
    )

    expect(titles(recentGroups)).toEqual(["Talisman"])
    expect(titles(moreGroups)).toEqual(["Enkrypt"])
  })
})

describe("getConnectedWalletSourceGroups", () => {
  const allGroups = (sources: ReturnType<typeof selectWalletSources>) => [
    ...sources.recentGroups,
    ...sources.installedGroups,
    ...sources.deeplinkedGroups,
    ...sources.walletConnectGroups,
    ...sources.moreGroups,
  ]

  it("includes connected brands beyond the recent-wallet limit", () => {
    const wallets = [PHANTOM, POLKADOT_JS, TALISMAN, SUBWALLET, NOVA, RABBY]
    const connectedProviders = wallets.map((wallet) => wallet.provider)
    const sources = selectWalletSources(
      wallets,
      null,
      connectedProviders,
      connectedProviders,
    )

    expect(sources.recentGroups).toHaveLength(5)
    expect(
      titles(
        getConnectedWalletSourceGroups(allGroups(sources), connectedProviders),
      ),
    ).toEqual([
      "Phantom",
      "Polkadot.js",
      "Talisman",
      "SubWallet",
      "Nova Wallet",
      "Rabby",
    ])
  })

  it("excludes disconnected recent wallets rather than inferring a connection from recency", () => {
    const connectedProviders = [WalletProviderType.Talisman]
    const sources = selectWalletSources(
      [PHANTOM, TALISMAN],
      null,
      connectedProviders,
      [WalletProviderType.Phantom, WalletProviderType.Talisman],
    )

    expect(titles(sources.recentGroups)).toEqual(["Phantom", "Talisman"])
    expect(
      titles(
        getConnectedWalletSourceGroups(allGroups(sources), connectedProviders),
      ),
    ).toEqual(["Talisman"])
  })

  it("renders each connected brand once when category inputs overlap", () => {
    const groups = groupWalletsBySource([TALISMAN, TALISMAN_EVM, PHANTOM])
    const connectedProviders = [
      WalletProviderType.TalismanEvm,
      WalletProviderType.Phantom,
    ]

    expect(
      getConnectedWalletSourceGroups(
        [...groups, ...groups],
        connectedProviders,
      ),
    ).toEqual(groups)
  })

  it("includes a connected WalletConnect session from its separate category", () => {
    const connectedProviders = [WalletProviderType.WalletConnect]
    const sources = selectWalletSources(
      [
        TALISMAN,
        wallet(WalletProviderType.WalletConnect, "WalletConnect", false),
      ],
      null,
      connectedProviders,
    )

    expect(sources.recentGroups).toEqual([])
    expect(
      titles(
        getConnectedWalletSourceGroups(allGroups(sources), connectedProviders),
      ),
    ).toEqual(["WalletConnect"])
  })

  it("does not reintroduce a connected provider outside the selected mode", () => {
    const connectedProviders = [
      WalletProviderType.Talisman,
      WalletProviderType.Phantom,
    ]
    const sources = selectWalletSources(
      [TALISMAN, TALISMAN_SOL, PHANTOM],
      SOLANA_PROVIDERS,
      connectedProviders,
    )

    expect(
      titles(
        getConnectedWalletSourceGroups(allGroups(sources), connectedProviders),
      ),
    ).toEqual(["Phantom"])
  })
})

describe("getSelectableWallets", () => {
  it("keeps only wallets the user can act on", () => {
    const [group] = groupWalletsBySource([TALISMAN, NOT_INSTALLED])
    if (!group) throw new Error("expected a group")

    expect(getSelectableWallets(group, []).map((w) => w.provider)).toEqual([
      WalletProviderType.Talisman,
    ])
  })
})

describe("getWalletSourceModes", () => {
  it.each([WalletMode.EVM, WalletMode.Substrate])(
    "shows only %s for WalletConnect when a route is selected",
    (mode) => {
      expect(
        getWalletSourceModes(WalletProviderType.WalletConnect, mode),
      ).toEqual([mode])
    },
  )

  it("does not advertise an incompatible wallet account type", () => {
    expect(
      getWalletSourceModes(WalletProviderType.Phantom, WalletMode.EVM),
    ).toEqual([])
  })

  it("keeps WalletConnect capabilities visible in the general wallet manager", () => {
    expect(getWalletSourceModes(WalletProviderType.WalletConnect)).toEqual([
      WalletMode.Substrate,
      WalletMode.EVM,
    ])
  })
  it("badges a provider with its chain modes, never Default", () => {
    const modes = getWalletSourceModes(WalletProviderType.Phantom)

    expect(modes).toContain(WalletMode.Solana)
    expect(modes).not.toContain(WalletMode.Default)
  })

  it("omits composite modes, which carry no chain icon", () => {
    const modes = getWalletSourceModes(SUBSTRATE_PROVIDERS[0]!)

    expect(modes).not.toContain(WalletMode.SubstrateEVM)
    expect(modes).toContain(WalletMode.Substrate)
  })
})

describe("getWalletGroupSourceModes", () => {
  it("scopes a multi-network wallet's badges to the selected route", () => {
    const [group] = groupWalletsBySource([TALISMAN, TALISMAN_EVM, TALISMAN_SOL])
    if (!group) throw new Error("expected a group")

    expect(getWalletGroupSourceModes(group, WalletMode.EVM)).toEqual([
      WalletMode.EVM,
    ])
  })
  it("badges a brand's group with one entry per chain it covers", () => {
    const [group] = groupWalletsBySource([TALISMAN, TALISMAN_EVM, TALISMAN_SOL])
    if (!group) throw new Error("expected a group")

    expect(getWalletGroupSourceModes(group)).toEqual([
      WalletMode.Substrate,
      WalletMode.EVM,
      WalletMode.Solana,
    ])
  })
})

describe("getWalletSourceModeLabel", () => {
  it("names a chain mode", () => {
    expect(getWalletSourceModeLabel(WalletMode.Solana)).toBe("Solana")
  })

  it("has no label for composite and absent modes", () => {
    expect(getWalletSourceModeLabel(WalletMode.SubstrateEVM)).toBeUndefined()
    expect(getWalletSourceModeLabel(undefined)).toBeUndefined()
  })
})

describe("getWalletSourceAction", () => {
  it("connects an installed, disconnected wallet", () => {
    expect(getWalletSourceAction(TALISMAN, "disconnected")).toBe("connect")
  })

  it("connects a wallet whose last attempt failed, so it can be retried", () => {
    expect(getWalletSourceAction(TALISMAN, "error")).toBe("connect")
  })

  it("only selects a wallet that is connected or already connecting", () => {
    expect(getWalletSourceAction(TALISMAN, "connected")).toBe("select")
    expect(getWalletSourceAction(TALISMAN, "pending")).toBe("select")
  })

  it("installs a wallet that is not installed", () => {
    expect(getWalletSourceAction(NOT_INSTALLED, "disconnected")).toBe("install")
  })
})

describe("getWalletSourceGroupAction", () => {
  const groupOf = (...wallets: WalletSourceLike[]) => {
    const [group] = groupWalletsBySource(wallets)
    if (!group) throw new Error("no group")
    return group
  }

  it("opens the mode picker when several wallets are selectable", () => {
    const action = getWalletSourceGroupAction(
      groupOf(TALISMAN, TALISMAN_EVM),
      [],
    )
    expect(action.kind).toBe("modes")
  })

  it("acts on the single selectable wallet", () => {
    const action = getWalletSourceGroupAction(
      groupOf(
        TALISMAN,
        wallet(WalletProviderType.TalismanSol, "Talisman", false),
      ),
      [],
    )
    expect(action).toEqual({ kind: "wallet", wallet: TALISMAN })
  })

  it("falls back to the first wallet when none is selectable", () => {
    const uninstalled = wallet(
      WalletProviderType.TalismanEvm,
      "Talisman",
      false,
    )
    const action = getWalletSourceGroupAction(
      groupOf(
        wallet(WalletProviderType.Talisman, "Talisman", false),
        uninstalled,
      ),
      [],
    )
    expect(action).toEqual({
      kind: "wallet",
      wallet: wallet(WalletProviderType.Talisman, "Talisman", false),
    })
  })

  it("counts a connected but uninstalled wallet as selectable", () => {
    const action = getWalletSourceGroupAction(
      groupOf(
        TALISMAN,
        wallet(WalletProviderType.TalismanEvm, "Talisman", false),
      ),
      [WalletProviderType.TalismanEvm],
    )
    expect(action.kind).toBe("modes")
  })
})

describe("getConnectAllGroups", () => {
  const providers = (groups: { providers: WalletProviderType[] }[]) =>
    groups.flatMap((group) => group.providers)

  it("connects only providers that can sign on Hydration", () => {
    const groups = getConnectAllGroups([
      TALISMAN,
      TALISMAN_EVM,
      TALISMAN_SOL,
      TALISMAN_H160,
      POLKADOT_JS,
      PHANTOM,
      METEOR,
      RABBY,
      wallet(WalletProviderType.Suiet, "Suiet"),
      wallet(WalletProviderType.NoirWallet, "Noir"),
      wallet(WalletProviderType.WalletConnect, "WalletConnect"),
    ])

    expect(providers(groups)).toEqual([
      WalletProviderType.Talisman,
      WalletProviderType.PolkadotJS,
      WalletProviderType.RabbyWallet,
    ])
  })

  it("requests only one installed compatible account type per wallet", () => {
    const groups = getConnectAllGroups(
      [
        TALISMAN,
        TALISMAN_EVM,
        TALISMAN_SOL,
        SUBWALLET,
        SUBWALLET_EVM,
        SUBWALLET_H160,
        POLKADOT_JS,
      ],
      [WalletProviderType.SubwalletEvm, WalletProviderType.TalismanEvm],
    )

    expect(providers(groups)).toEqual([
      WalletProviderType.TalismanEvm,
      WalletProviderType.SubwalletEvm,
      WalletProviderType.PolkadotJS,
    ])
    expect(groups.every((group) => group.wallets.length === 1)).toBe(true)
  })

  it("does not batch an unsupported or uninstalled remembered type", () => {
    const groups = getConnectAllGroups(
      [
        TALISMAN,
        { ...TALISMAN_EVM, installed: false },
        TALISMAN_SOL,
        POLKADOT_JS,
      ],
      [WalletProviderType.TalismanSol, WalletProviderType.TalismanEvm],
    )

    expect(providers(groups)).toEqual([
      WalletProviderType.Talisman,
      WalletProviderType.PolkadotJS,
    ])
  })

  it("skips wallets that are not installed", () => {
    const groups = getConnectAllGroups([TALISMAN, POLKADOT_JS, NOT_INSTALLED])
    expect(titles(groups)).toEqual(["Talisman", "Polkadot.js"])
  })

  it("offers nothing for a single wallet, however many providers it has", () => {
    expect(getConnectAllGroups([TALISMAN, TALISMAN_EVM, PHANTOM])).toEqual([])
  })
})
