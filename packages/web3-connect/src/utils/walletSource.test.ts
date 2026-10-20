import { describe, expect, it } from "vitest"

import {
  NEAR_PROVIDERS,
  SOLANA_PROVIDERS,
  SUBSTRATE_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import { WalletMode } from "@/config/wallet"
import {
  getConnectAllGroups,
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

  it("only selects a wallet that is connected or already connecting", () => {
    expect(getWalletSourceAction(TALISMAN, "connected")).toBe("select")
    expect(getWalletSourceAction(TALISMAN, "pending")).toBe("select")
    expect(getWalletSourceAction(TALISMAN, "error")).toBe("select")
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
      WalletProviderType.TalismanEvm,
      WalletProviderType.PolkadotJS,
      WalletProviderType.RabbyWallet,
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
