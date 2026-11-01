import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  getWalletErrorMessage,
  useWeb3Connect,
  useWeb3Enable,
  WalletMode,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { getWalletDeeplink } from "@galacticcouncil/web3-connect/src/config/deeplinks"
import {
  NEAR_PROVIDERS,
  WalletProviderType,
} from "@galacticcouncil/web3-connect/src/config/providers"
import { PROVIDERS_BY_WALLET_MODE } from "@galacticcouncil/web3-connect/src/config/wallet"
import { useWalletProviders } from "@galacticcouncil/web3-connect/src/hooks/useWalletProviders"
import {
  getConflictingWalletProviders,
  getExclusiveWalletProviderTypes,
  groupWalletsBySource,
} from "@galacticcouncil/web3-connect/src/utils/walletSource"
import {
  getWallet,
  getWallets,
} from "@galacticcouncil/web3-connect/src/wallets"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { create } from "zustand"

import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"

import {
  DepositWalletResult,
  isDetectedDepositWallet,
  startDepositWalletQueue,
} from "./useDepositWallets.utils"

type DepositWalletConnectionState = {
  queue: WalletProviderType[]
  results: Partial<Record<WalletProviderType, DepositWalletResult>>
  errors: Partial<Record<WalletProviderType, string>>
  currentProvider: WalletProviderType | null
  isConnecting: boolean
}

// Shared by the connect screen and asset sidebar, so arriving assets do not interrupt approvals.
const useDepositWalletConnectionState = create<DepositWalletConnectionState>(
  () => ({
    queue: [],
    results: {},
    errors: {},
    currentProvider: null,
    isConnecting: false,
  }),
)
let activeQueue: ReturnType<typeof startDepositWalletQueue> | null = null

export const useDepositWallets = () => {
  const { t } = useTranslation("onramp")
  const substrate = useWalletProviders(WalletMode.Substrate)
  const substrateH160 = useWalletProviders(WalletMode.SubstrateH160)
  const evm = useWalletProviders(WalletMode.EVM)
  const solana = useWalletProviders(WalletMode.Solana)
  const sui = useWalletProviders(WalletMode.Sui)
  const near = useWalletProviders(WalletMode.Near)
  const { sourceChainAssetPairs } = useXcmProvider()
  const accounts = useDepositAccounts({ signersOnly: true })
  const providers = useWeb3Connect((state) => state.providers)
  const restoreStates = useWeb3Connect((state) => state.restoreStates)
  const state = useDepositWalletConnectionState()
  const { enable, disconnect } = useWeb3Enable({ disconnectOnError: true })
  const [, refresh] = useState(0)

  useEffect(() => {
    let frame = 0
    const discover = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => refresh((version) => version + 1))
    }
    window.addEventListener("eip6963:announceProvider", discover)
    window.addEventListener("focus", discover)
    window.dispatchEvent(new Event("eip6963:requestProvider"))
    const timer = window.setTimeout(discover, 1000)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      window.removeEventListener("eip6963:announceProvider", discover)
      window.removeEventListener("focus", discover)
    }
  }, [])

  useEffect(
    () =>
      useDepositJourneyStore.subscribe((next, previous) => {
        if (previous.active && !next.active) activeQueue?.cancel()
      }),
    [],
  )

  const supportedProviders = useMemo(
    () =>
      new Set(
        sourceChainAssetPairs
          .filter(
            ({ chain, assets }) =>
              chain.key !== HYDRATION_CHAIN_KEY && assets.length > 0,
          )
          .flatMap(
            ({ chain }) =>
              PROVIDERS_BY_WALLET_MODE[getWalletModeByChain(chain)],
          ),
      ),
    [sourceChainAssetPairs],
  )

  const wallets = useMemo(() => {
    // The native provider hook supplies QR, web-wallet and mobile-deeplink adapters too.
    const nativeWallets = [
      substrate,
      substrateH160,
      evm,
      solana,
      sui,
      near,
    ].flatMap((group) => [
      ...group.installed,
      ...group.deeplinked,
      ...group.other,
    ])
    return [
      ...new Map(
        nativeWallets.map((wallet) => [wallet.provider, wallet]),
      ).values(),
    ].filter(
      (wallet) =>
        supportedProviders.has(wallet.provider) &&
        wallet.provider !== WalletProviderType.ExternalWallet,
    )
  }, [substrate, substrateH160, evm, solana, sui, near, supportedProviders])
  const connectedProviders = useMemo(
    () => new Set(accounts.map((account) => account.provider)),
    [accounts],
  )
  // Re-read lazy extension getters after discovery events and wallet changes.
  const groups = groupWalletsBySource(
    wallets.filter(
      (wallet) =>
        isDetectedDepositWallet(wallet) ||
        connectedProviders.has(wallet.provider),
    ),
  )
  const otherWallets = wallets.filter(
    (wallet) => !connectedProviders.has(wallet.provider),
  )
  const currentWallet = state.currentProvider
    ? getWallet(state.currentProvider)
    : null
  const currentGroup = groups.find((group) =>
    group.providers.includes(state.currentProvider as WalletProviderType),
  )
  const connectableGroups = groups.filter((group) => {
    const native = useWeb3Connect.getState()
    return group.providers.every((provider) =>
      [
        provider,
        ...getConflictingWalletProviders(getWallets(), provider),
      ].every(
        (type) =>
          native.getStatus(type) !== WalletProviderStatus.Connected &&
          native.getStatus(type) !== WalletProviderStatus.Pending,
      ),
    )
  })

  const connectProviders = useCallback(
    (requested: WalletProviderType[], allowTypeSwitch = false) => {
      if (activeQueue) return
      const native = useWeb3Connect.getState()
      const walletSources = getWallets()
      const hasConnectedConflict = (provider: WalletProviderType) =>
        getConflictingWalletProviders(walletSources, provider).some((type) => {
          const status = useWeb3Connect.getState().getStatus(type)
          return (
            status === WalletProviderStatus.Connected ||
            status === WalletProviderStatus.Pending
          )
        })
      const queue = getExclusiveWalletProviderTypes(walletSources, requested, [
        ...(native.account ? [native.account.provider] : []),
        ...(native.recentProvider ? [native.recentProvider] : []),
        ...native.recentlyUsedProviders,
        ...native.providers
          .filter(({ status }) => status === WalletProviderStatus.Connected)
          .map(({ type }) => type),
      ]).filter(
        (provider) =>
          supportedProviders.has(provider) &&
          native.getStatus(provider) !== WalletProviderStatus.Pending &&
          (allowTypeSwitch || !hasConnectedConflict(provider)) &&
          !(
            native.getStatus(provider) === WalletProviderStatus.Connected &&
            getWallet(provider)?.enabled
          ),
      )
      if (!queue.length) return
      useDepositWalletConnectionState.setState({
        queue,
        results: Object.fromEntries(
          queue.map((provider) => [provider, "waiting"]),
        ),
        errors: {},
        currentProvider: null,
        isConnecting: true,
      })
      const running = startDepositWalletQueue(queue, {
        connect: async (provider) => {
          // Another screen may connect this brand while earlier approvals are open.
          if (!allowTypeSwitch && hasConnectedConflict(provider)) return false
          try {
            const connected = await enable(provider)
            const wallet = getWallet(provider)
            return (
              connected.length > 0 &&
              !!wallet?.enabled &&
              !!wallet.signer &&
              useWeb3Connect.getState().getStatus(provider) ===
                WalletProviderStatus.Connected
            )
          } catch (error) {
            if (
              activeQueue === running &&
              useDepositWalletConnectionState.getState().currentProvider ===
                provider
            ) {
              useDepositWalletConnectionState.setState((previous) => ({
                errors: {
                  ...previous.errors,
                  [provider]:
                    getWalletErrorMessage(error) || t("deposit.wallets.error"),
                },
              }))
            }
            return false
          }
        },
        // Native disconnect invalidates this provider's attempt before clearing its state.
        abandon: disconnect,
        onResult: (provider, result) =>
          useDepositWalletConnectionState.setState((previous) => ({
            currentProvider:
              result === "pending"
                ? provider
                : previous.currentProvider === provider
                  ? null
                  : previous.currentProvider,
            results: { ...previous.results, [provider]: result },
            errors:
              result === "rejected"
                ? {
                    ...previous.errors,
                    [provider]:
                      previous.errors[provider] || t("deposit.wallets.error"),
                  }
                : previous.errors,
          })),
      })
      activeQueue = running
      void running.done.finally(() => {
        if (activeQueue !== running) return
        activeQueue = null
        useDepositWalletConnectionState.setState({
          isConnecting: false,
          currentProvider: null,
        })
      })
    },
    [disconnect, enable, supportedProviders, t],
  )

  const connectAll = () =>
    connectProviders(connectableGroups.flatMap((group) => group.providers))
  const connectWallet = (provider: WalletProviderType) => {
    const wallet = getWallet(provider)
    if (!wallet) return
    const deeplink = getWalletDeeplink(provider)
    if (!wallet.installed && deeplink) {
      window.open(deeplink, "_blank", "noopener,noreferrer")
    } else if (
      wallet.installed ||
      NEAR_PROVIDERS.includes(provider) ||
      provider === WalletProviderType.WalletConnect
    ) {
      connectProviders([provider], true)
    } else if (wallet.installUrl) {
      window.open(wallet.installUrl, "_blank", "noopener,noreferrer")
    }
  }

  return {
    ...state,
    accounts,
    providers,
    restoreStates,
    wallets,
    groups,
    otherWallets,
    connectedProviders,
    connectedGroups: groups.filter((group) =>
      group.providers.some((provider) => connectedProviders.has(provider)),
    ),
    connectableGroups,
    currentWallet,
    currentGroup,
    connectProviders,
    connectAll,
    connectWallet,
    skipCurrent: () => activeQueue?.skip(),
    refresh: () => refresh((version) => version + 1),
    completed: Object.values(state.results).filter(
      (result) => result !== "waiting" && result !== "pending",
    ).length,
  }
}
