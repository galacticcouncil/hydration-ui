import { uniqueBy } from "remeda"

import {
  NEAR_PROVIDERS,
  SUBSTRATE_H160_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import {
  COMPATIBLE_WALLET_PROVIDERS,
  getWalletChainModes,
  WALLET_MODES,
  WalletMode,
} from "@/config/wallet"

export type WalletSourceLike = {
  provider: WalletProviderType
  title: string
  logo: string
  installed: boolean
  hasExtension?: boolean
}

export type WalletSourceGroupId = `walletGroup:${string}`

export type WalletSourceId =
  | "all"
  | "recent"
  | WalletProviderType
  | WalletSourceGroupId

export type WalletSourceGroup<T extends WalletSourceLike> = {
  id: WalletSourceGroupId
  title: string
  logo?: string
  wallets: [T, ...T[]]
  providers: [WalletProviderType, ...WalletProviderType[]]
}

export const getWalletSourceGroupId = (
  wallet: WalletSourceLike,
): WalletSourceGroupId => `walletGroup:${wallet.title}`

export const isWalletSourceGroupId = (
  source: WalletSourceId,
): source is WalletSourceGroupId => source.startsWith("walletGroup:")

/** Other account types supplied by the same wallet brand. */
export const getConflictingWalletProviders = (
  wallets: WalletSourceLike[],
  provider: WalletProviderType,
): WalletProviderType[] => {
  if (provider === WalletProviderType.Multisig) return []

  const selectedWallet = wallets.find((wallet) => wallet.provider === provider)
  if (!selectedWallet?.title) return []

  return uniqueBy(
    wallets
      .filter(
        (wallet) =>
          wallet.provider !== provider &&
          wallet.provider !== WalletProviderType.Multisig &&
          wallet.title === selectedWallet.title,
      )
      .map((wallet) => wallet.provider),
    (type) => type,
  )
}

/**
 * Keep one account type per wallet brand, preferring active/recent types when
 * supplied. Retained providers stay in their original order. Unknown sources
 * and multisig remain independent, rather than sharing a fallback brand.
 */
export const getExclusiveWalletProviderTypes = (
  wallets: WalletSourceLike[],
  providerTypes: WalletProviderType[],
  preferredTypes: WalletProviderType[] = [],
): WalletProviderType[] => {
  const available = new Set(providerTypes)
  const retained = new Map<string, WalletProviderType>()
  const walletsByProvider = new Map(
    wallets.map((wallet) => [wallet.provider, wallet]),
  )

  for (const provider of [...preferredTypes, ...providerTypes]) {
    if (!available.has(provider)) continue

    const wallet = walletsByProvider.get(provider)
    const brand =
      provider !== WalletProviderType.Multisig && wallet?.title
        ? getWalletSourceGroupId(wallet)
        : `provider:${provider}`

    if (!retained.has(brand)) retained.set(brand, provider)
  }

  const selected = new Set(retained.values())
  return uniqueBy(
    providerTypes.filter((provider) => selected.has(provider)),
    (provider) => provider,
  )
}

/**
 * One group per wallet brand. Talisman ships four providers (substrate, EVM,
 * H160, Solana) that the user thinks of as one wallet, so they are offered as
 * one source and the chain is picked afterwards.
 */
export const groupWalletsBySource = <T extends WalletSourceLike>(
  wallets: T[],
): WalletSourceGroup<T>[] => {
  const groups = new Map<WalletSourceGroupId, WalletSourceGroup<T>>()

  for (const wallet of wallets) {
    const id = getWalletSourceGroupId(wallet)
    const group = groups.get(id)

    if (group) {
      group.wallets.push(wallet)
      group.providers.push(wallet.provider)
      continue
    }

    groups.set(id, {
      id,
      title: wallet.title,
      logo: wallet.logo,
      wallets: [wallet],
      providers: [wallet.provider],
    })
  }

  return Array.from(groups.values())
}

export const getWalletSourceModes = (
  provider: WalletProviderType,
  mode: WalletMode = WalletMode.Default,
) => {
  const modes = getWalletChainModes(provider)
  if (mode === WalletMode.Default) return modes
  if (!WALLET_MODES[mode].providers.includes(provider)) return []
  return WALLET_MODES[mode].chain
    ? modes.filter((walletMode) => walletMode === mode)
    : modes
}

export const getWalletGroupSourceModes = <T extends WalletSourceLike>(
  group: WalletSourceGroup<T>,
  mode: WalletMode = WalletMode.Default,
) =>
  uniqueBy(
    group.providers.flatMap((provider) => getWalletSourceModes(provider, mode)),
    (walletMode) => walletMode,
  )

export const getWalletPrimaryMode = (provider: WalletProviderType) =>
  getWalletSourceModes(provider)[0]

export const getWalletSourceModeLabel = (mode?: WalletMode) => {
  const entry = mode ? WALLET_MODES[mode] : undefined
  // composite and absent modes have no chain name; callers supply a fallback
  return entry?.chain ? entry.name : undefined
}

/**
 * Within a group, only wallets the user can actually act on: installed, or
 * already connected. A group with one such wallet needs no chain picker.
 */
export const getSelectableWallets = <T extends WalletSourceLike>(
  group: WalletSourceGroup<T>,
  connectedProviderTypes: WalletProviderType[],
) =>
  group.wallets.filter(
    (wallet) =>
      wallet.installed || connectedProviderTypes.includes(wallet.provider),
  )

const isReachable = <T extends WalletSourceLike>(
  wallet: T,
  connectedProviderTypes: WalletProviderType[],
) => wallet.installed || connectedProviderTypes.includes(wallet.provider)

const isHiddenByDefault = (wallet: WalletSourceLike) =>
  SUBSTRATE_H160_PROVIDERS.includes(wallet.provider) ||
  (NEAR_PROVIDERS.includes(wallet.provider) && !wallet.hasExtension)

const RECENT_GROUPS_LIMIT = 5

const NOT_RECENT = Number.MAX_SAFE_INTEGER

const getRecentRank = <T extends WalletSourceLike>(
  group: WalletSourceGroup<T>,
  recentlyUsedProviders: WalletProviderType[],
) =>
  Math.min(
    ...group.providers.map((provider) => {
      const index = recentlyUsedProviders.indexOf(provider)
      return index === -1 ? NOT_RECENT : index
    }),
  )

export const selectWalletSources = <T extends WalletSourceLike>(
  wallets: T[],
  modeProviders: WalletProviderType[] | null,
  connectedProviderTypes: WalletProviderType[],
  recentlyUsedProviders: WalletProviderType[] = [],
  deeplinkedProviders: WalletProviderType[] = [],
) => {
  const available = wallets.filter(
    (wallet) =>
      wallet.provider !== WalletProviderType.ExternalWallet &&
      (modeProviders
        ? modeProviders.includes(wallet.provider)
        : !isHiddenByDefault(wallet) ||
          connectedProviderTypes.includes(wallet.provider)),
  )

  const groups = groupWalletsBySource(
    available.filter(
      (wallet) => wallet.provider !== WalletProviderType.WalletConnect,
    ),
  )

  // WalletConnect has no extension, so it sits in the Other section instead
  const walletConnectGroups = groupWalletsBySource(
    available.filter(
      (wallet) => wallet.provider === WalletProviderType.WalletConnect,
    ),
  )

  const isGroupReachable = (group: WalletSourceGroup<T>) =>
    group.wallets.some((wallet) => isReachable(wallet, connectedProviderTypes))

  const isGroupConnected = (group: WalletSourceGroup<T>) =>
    group.providers.some((provider) =>
      connectedProviderTypes.includes(provider),
    )

  const byTitle = (a: WalletSourceGroup<T>, b: WalletSourceGroup<T>) =>
    a.title.localeCompare(b.title)

  const rankOf = (group: WalletSourceGroup<T>) =>
    getRecentRank(group, recentlyUsedProviders)

  const reachableGroups = groups.filter(isGroupReachable)

  const recentGroups = reachableGroups
    .filter((group) => isGroupConnected(group) || rankOf(group) !== NOT_RECENT)
    .sort((a, b) => rankOf(a) - rankOf(b) || byTitle(a, b))
    .slice(0, RECENT_GROUPS_LIMIT)

  const installedGroups = reachableGroups
    .filter((group) => !recentGroups.includes(group))
    .sort(byTitle)

  const unreachableGroups = groups
    .filter((group) => !isGroupReachable(group))
    .sort(byTitle)

  // not installed, but the wallet's mobile app can open Hydration directly
  const isGroupDeeplinked = (group: WalletSourceGroup<T>) =>
    group.providers.some((provider) => deeplinkedProviders.includes(provider))

  const deeplinkedGroups = unreachableGroups.filter(isGroupDeeplinked)

  const moreGroups = unreachableGroups.filter(
    (group) => !isGroupDeeplinked(group),
  )

  return {
    available,
    recentGroups,
    installedGroups,
    moreGroups,
    deeplinkedGroups,
    walletConnectGroups,
  }
}

/** Actual connections across source sections, without the recent-wallet cap. */
export const getConnectedWalletSourceGroups = <T extends WalletSourceLike>(
  groups: WalletSourceGroup<T>[],
  connectedProviderTypes: WalletProviderType[],
): WalletSourceGroup<T>[] =>
  uniqueBy(
    groups.filter((group) =>
      group.providers.some((provider) =>
        connectedProviderTypes.includes(provider),
      ),
    ),
    (group) => group.id,
  )

/**
 * What "Connect all" enables: installed wallets that can sign Hydration
 * transactions, minus WalletConnect, whose QR flow can't run in a batch. A
 * brand contributes one compatible account type, preferring its current or
 * recent type. With a single wallet its own row does the same job, so nothing
 * is offered.
 */
export const getConnectAllGroups = <T extends WalletSourceLike>(
  wallets: T[],
  preferredTypes: WalletProviderType[] = [],
) => {
  const compatibleWallets = wallets.filter(
    ({ installed, provider }) =>
      installed &&
      provider !== WalletProviderType.WalletConnect &&
      COMPATIBLE_WALLET_PROVIDERS.includes(provider),
  )
  const providerTypes = getExclusiveWalletProviderTypes(
    compatibleWallets,
    compatibleWallets.map((wallet) => wallet.provider),
    preferredTypes,
  )
  const groups = groupWalletsBySource(
    compatibleWallets.filter((wallet) =>
      providerTypes.includes(wallet.provider),
    ),
  )

  return groups.length > 1 ? groups : []
}

/**
 * The status of a wallet provider, as the store spells it. Kept as a plain
 * union so the source utils stay free of any dependency on the store module.
 */
export type WalletSourceStatus =
  | "connected"
  | "pending"
  | "disconnected"
  | "error"

/**
 * What clicking a wallet source does. `connect` is the only action that talks
 * to the extension; every action but `install` selects the wallet as the
 * source first, so the right panel follows the click without a second one.
 */
export type WalletSourceAction = "select" | "connect" | "install"

export const getWalletSourceAction = <T extends WalletSourceLike>(
  wallet: T,
  status: WalletSourceStatus,
): WalletSourceAction => {
  if (!wallet.installed) return "install"
  return status === "disconnected" || status === "error" ? "connect" : "select"
}

/**
 * What clicking a group entry in the source column does: act on a single
 * wallet when only one is reachable, otherwise open the chain picker so the
 * user can choose a mode.
 */
export type WalletSourceGroupAction<T extends WalletSourceLike> =
  | { kind: "wallet"; wallet: T }
  | { kind: "modes" }

export const getWalletSourceGroupAction = <T extends WalletSourceLike>(
  group: WalletSourceGroup<T>,
  connectedProviderTypes: WalletProviderType[],
): WalletSourceGroupAction<T> => {
  const selectableWallets = getSelectableWallets(group, connectedProviderTypes)
  const [wallet] = selectableWallets

  if (!wallet) return { kind: "wallet", wallet: group.wallets[0] }
  if (selectableWallets.length === 1) return { kind: "wallet", wallet }

  return { kind: "modes" }
}
