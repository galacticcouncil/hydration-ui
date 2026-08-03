import {
  CircleAlert,
  HydrationLogo,
  Search,
  Wallet as WalletIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Box,
  BoxProps,
  Button,
  Chip,
  CopyButton,
  Flex,
  Grid,
  Icon,
  Image,
  Input,
  ModalBody,
  ModalHeader,
  ScrollArea,
  Spinner,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { formatCurrency, shortenAccountAddress } from "@galacticcouncil/utils"
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  LogOut,
} from "lucide-react"
import {
  ComponentType,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"
import { pick, prop, uniqueBy } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { SChangeAccountButton } from "@/components/account/AccountOption.styled"
import { AddressBookModal } from "@/components/address-book"
import {
  getFilteredAccounts,
  isAccountSelected,
  useAccountsWithBalance,
} from "@/components/content/AccountSelectContent.utils"
import {
  ExternalWalletForm,
  useExternalWalletConnection,
} from "@/components/external/ExternalWalletForm"
import { useExternalWalletForm } from "@/components/external/ExternalWalletForm.form"
import { ProviderLoader } from "@/components/provider/ProviderLoader"
import { Web3ConnectModalPage } from "@/config/modal"
import { WalletProviderType } from "@/config/providers"
import { WalletAccountFilterOption, WalletMode } from "@/config/wallet"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks/useAccount"
import {
  COMPATIBLE_WALLET_PROVIDERS,
  PROVIDERS_BY_WALLET_MODE,
  useWeb3Connect,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { Wallet } from "@/types/wallet"
import {
  getAccountAvatarTheme,
  getWalletModeIcon,
  getWalletModesByProviderType,
  isEip1193Provider,
  requestAccounts,
  toAccount,
} from "@/utils"
import { getWallet, getWallets, MetaMask } from "@/wallets"

type WalletSourceGroupId = `walletGroup:${string}`
type WalletSourceId =
  | "all"
  | "recent"
  | WalletProviderType
  | WalletSourceGroupId
type WalletSourceButtonVariant =
  | "management"
  | "firstConnection"
  | "firstConnectionPlain"
type WalletAccount = ReturnType<typeof toAccount> & {
  balance?: number
  isActive?: boolean
}
type WalletSourceChainBadge = {
  id: string
  icon?: ComponentType
  iconSrc?: string
}
type WalletSourceGroup = {
  id: WalletSourceGroupId
  title: string
  logo?: string
  wallets: [Wallet, ...Wallet[]]
  providers: [WalletProviderType, ...WalletProviderType[]]
}

const ACCOUNT_FILTERS: WalletAccountFilterOption[] = [
  WalletMode.Default,
  WalletMode.Substrate,
  WalletMode.EVM,
  WalletMode.Solana,
]

const CONNECT_ALL_PROVIDER_BLACKLIST = [WalletProviderType.WalletConnect]

const getWalletSourceGroupId = (wallet: Wallet): WalletSourceGroupId =>
  `walletGroup:${wallet.title}`

const isWalletSourceGroupId = (
  source: WalletSourceId,
): source is WalletSourceGroupId => source.startsWith("walletGroup:")

const groupWalletsBySource = (wallets: Wallet[]) => {
  const groups = new Map<WalletSourceGroupId, WalletSourceGroup>()

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

const getWalletSourceModes = (provider: WalletProviderType) =>
  uniqueBy(
    getWalletModesByProviderType(provider).filter(
      (walletMode): walletMode is WalletMode =>
        walletMode !== WalletMode.Default && !!getWalletModeIcon(walletMode),
    ),
    (walletMode) => walletMode,
  )

const getWalletGroupSourceModes = (group: WalletSourceGroup) =>
  uniqueBy(
    group.providers.flatMap((provider) => getWalletSourceModes(provider)),
    (walletMode) => walletMode,
  )

const getSelectableWallets = (
  group: WalletSourceGroup,
  connectedProviderTypes: WalletProviderType[],
) =>
  group.wallets.filter(
    (wallet) =>
      wallet.installed || connectedProviderTypes.includes(wallet.provider),
  )

const getWalletPrimaryMode = (provider: WalletProviderType) =>
  getWalletSourceModes(provider)[0]

const getWalletSourceChainBadges = (
  modes: WalletMode[],
): WalletSourceChainBadge[] =>
  modes.flatMap((mode) => {
    const modeIcon = getWalletModeIcon(mode)
    const badges: WalletSourceChainBadge[] = []

    if (mode === WalletMode.EVM) {
      badges.push({
        id: "hydration-evm",
        icon: HydrationLogo,
      })
    }

    if (modeIcon) {
      badges.push({
        id: mode,
        iconSrc: modeIcon,
      })
    }

    return badges
  })

const getWalletSourceModeLabel = (mode?: WalletMode) => {
  switch (mode) {
    case WalletMode.Substrate:
      return "Polkadot"
    case WalletMode.SubstrateH160:
      return "Substrate H160"
    case WalletMode.EVM:
      return "EVM"
    case WalletMode.Solana:
      return "Solana"
    case WalletMode.Sui:
      return "Sui"
    case WalletMode.Near:
      return "NEAR"
    case WalletMode.Zcash:
      return "Zcash"
    default:
      return "Wallet"
  }
}

export const WalletManagementContent = () => {
  const { t } = useTranslation()
  const { account: currentAccount } = useAccount()
  const { page, mode, onAccountSelect, isControlled, setModalContentWidth } =
    useWeb3ConnectContext()
  const { enable, disconnect } = useWeb3Enable()
  const { enable: enableConnectAll } = useWeb3Enable({
    disconnectOnError: true,
  })
  const {
    accounts,
    toggle,
    providers: walletProviders,
    recentProvider,
    recentlyDisconnectedProviders,
    error,
    meta,
    getStatus,
  } = useWeb3Connect(
    useShallow(
      pick([
        "accounts",
        "toggle",
        "providers",
        "recentProvider",
        "recentlyDisconnectedProviders",
        "error",
        "meta",
        "getStatus",
      ]),
    ),
  )

  const [selectedSource, setSelectedSource] = useState<WalletSourceId>(
    meta?.initialProvider ?? "all",
  )
  const [accountFilter, setAccountFilter] = useState<WalletAccountFilterOption>(
    WalletMode.Default,
  )
  const [walletSearchValue, setWalletSearchValue] = useState("")
  const [accountSearchValue, setAccountSearchValue] = useState("")
  const [walletSearch, setWalletSearch] = useState("")
  const [accountSearch, setAccountSearch] = useState("")
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false)
  const externalWalletForm = useExternalWalletForm()
  const { connectExternalWallet } = useExternalWalletConnection()
  const showExternalWallet = !meta?.hideExternalWallet

  useDebounce(() => setWalletSearch(walletSearchValue), 100, [
    walletSearchValue,
  ])
  useDebounce(() => setAccountSearch(accountSearchValue), 100, [
    accountSearchValue,
  ])

  const allWallets = useMemo(() => getWallets(), [])
  const providers = useMemo(() => {
    const providersByMode = PROVIDERS_BY_WALLET_MODE[mode]
    return walletProviders.filter(
      ({ type }) => !providersByMode.length || providersByMode.includes(type),
    )
  }, [mode, walletProviders])
  const connectedProviderTypes = useMemo(
    () =>
      providers
        .filter(({ status }) => status === WalletProviderStatus.Connected)
        .map(prop("type")),
    [providers],
  )
  const pendingProviderTypes = useMemo(
    () =>
      providers
        .filter(({ status }) => status === WalletProviderStatus.Pending)
        .map(prop("type")),
    [providers],
  )

  const isProvidersConnecting = pendingProviderTypes.length > 0
  const hasConnectedWalletState =
    connectedProviderTypes.length > 0 || accounts.length > 0
  const showErrorState = page === Web3ConnectModalPage.Error && !!error

  const compatibleWallets = useMemo(
    () =>
      allWallets.filter((wallet) =>
        getWalletModesByProviderType(wallet.provider).some((walletMode) =>
          ACCOUNT_FILTERS.includes(walletMode as WalletAccountFilterOption),
        ),
      ),
    [allWallets],
  )

  const walletGroups = useMemo(
    () => groupWalletsBySource(compatibleWallets),
    [compatibleWallets],
  )

  const sortedWallets = useMemo(
    () =>
      uniqueBy(
        compatibleWallets
          .filter(
            (wallet) =>
              wallet.installed ||
              connectedProviderTypes.includes(wallet.provider),
          )
          .sort((a, b) => {
            const aConnected = connectedProviderTypes.includes(a.provider)
            const bConnected = connectedProviderTypes.includes(b.provider)
            if (aConnected !== bConnected) return aConnected ? -1 : 1
            return a.title.localeCompare(b.title)
          }),
        prop("provider"),
      ),
    [compatibleWallets, connectedProviderTypes],
  )

  const sortedWalletGroups = useMemo(
    () =>
      walletGroups
        .filter((group) =>
          group.wallets.some(
            (wallet) =>
              wallet.installed ||
              connectedProviderTypes.includes(wallet.provider),
          ),
        )
        .sort((a, b) => {
          const aConnected = a.providers.some((provider) =>
            connectedProviderTypes.includes(provider),
          )
          const bConnected = b.providers.some((provider) =>
            connectedProviderTypes.includes(provider),
          )
          if (aConnected !== bConnected) return aConnected ? -1 : 1
          return a.title.localeCompare(b.title)
        }),
    [connectedProviderTypes, walletGroups],
  )

  const otherWalletGroups = useMemo(
    () =>
      walletGroups
        .filter(
          (group) =>
            !group.wallets.some(
              (wallet) =>
                wallet.installed ||
                connectedProviderTypes.includes(wallet.provider),
            ),
        )
        .sort((a, b) => a.title.localeCompare(b.title)),
    [connectedProviderTypes, walletGroups],
  )

  const selectedWallet =
    selectedSource !== "all" &&
    selectedSource !== "recent" &&
    !isWalletSourceGroupId(selectedSource)
      ? getWallet(selectedSource)
      : undefined
  const selectedWalletGroup = isWalletSourceGroupId(selectedSource)
    ? [...sortedWalletGroups, ...otherWalletGroups].find(
        (group) => group.id === selectedSource,
      )
    : undefined
  const selectedWalletStatus = selectedWallet
    ? getStatus(selectedWallet.provider)
    : null
  const isExternalWalletSelected =
    selectedSource === WalletProviderType.ExternalWallet && showExternalWallet
  const isSelectedWalletConnecting =
    !!selectedWallet &&
    selectedWallet.installed &&
    selectedWalletStatus === WalletProviderStatus.Pending
  const showSelectedWalletConnectState =
    !!selectedWallet &&
    selectedWallet.provider !== WalletProviderType.ExternalWallet &&
    !selectedWallet.installed &&
    (selectedWalletStatus === WalletProviderStatus.Disconnected ||
      selectedWalletStatus === WalletProviderStatus.Pending)
  const showWalletGroupChainSelectState =
    !!selectedWalletGroup &&
    getSelectableWallets(selectedWalletGroup, connectedProviderTypes).length > 1
  const showAccountPanel =
    hasConnectedWalletState ||
    isExternalWalletSelected ||
    isSelectedWalletConnecting ||
    showSelectedWalletConnectState ||
    showWalletGroupChainSelectState ||
    showErrorState

  useLayoutEffect(() => {
    setModalContentWidth(showAccountPanel ? pxToRem(650) : pxToRem(452))
  }, [setModalContentWidth, showAccountPanel])

  const recentlyDisconnectedProviderTypes = useMemo(
    () =>
      recentlyDisconnectedProviders.filter((provider) => {
        const isCompatible = compatibleWallets.some(
          (wallet) => wallet.provider === provider,
        )
        return isCompatible && !connectedProviderTypes.includes(provider)
      }),
    [compatibleWallets, connectedProviderTypes, recentlyDisconnectedProviders],
  )
  const recentlyConnectedProviderTypes = useMemo(() => {
    const providers = [
      ...(recentProvider ? [recentProvider] : []),
      ...recentlyDisconnectedProviderTypes,
    ]

    return uniqueBy(
      providers.filter((provider) => {
        const isCompatible = compatibleWallets.some(
          (wallet) => wallet.provider === provider,
        )
        return isCompatible && !connectedProviderTypes.includes(provider)
      }),
      (provider) => provider,
    ).slice(0, 3)
  }, [
    compatibleWallets,
    connectedProviderTypes,
    recentProvider,
    recentlyDisconnectedProviderTypes,
  ])
  const connectAllProviderTypes = useMemo(
    () =>
      sortedWallets
        .filter(
          ({ installed, provider }) =>
            installed &&
            COMPATIBLE_WALLET_PROVIDERS.includes(provider) &&
            !CONNECT_ALL_PROVIDER_BLACKLIST.includes(provider) &&
            !connectedProviderTypes.includes(provider) &&
            !pendingProviderTypes.includes(provider),
        )
        .map(prop("provider")),
    [connectedProviderTypes, pendingProviderTypes, sortedWallets],
  )
  const visibleWallets = useMemo(() => {
    const phrase = walletSearch.toLowerCase().trim()
    if (!phrase) return sortedWalletGroups
    return sortedWalletGroups.filter((group) =>
      group.title.toLowerCase().includes(phrase),
    )
  }, [sortedWalletGroups, walletSearch])

  const visibleSuggestedWalletGroups = useMemo(
    () =>
      showAccountPanel
        ? visibleWallets
        : visibleWallets.filter(
            (group) =>
              !group.providers.every((provider) =>
                recentlyConnectedProviderTypes.includes(provider),
              ),
          ),
    [recentlyConnectedProviderTypes, showAccountPanel, visibleWallets],
  )

  const visibleOtherWalletGroups = useMemo(() => {
    const phrase = walletSearch.toLowerCase().trim()
    if (!phrase) return otherWalletGroups
    return otherWalletGroups.filter((group) =>
      group.title.toLowerCase().includes(phrase),
    )
  }, [otherWalletGroups, walletSearch])

  const shouldAutoOpenMoreWallets =
    !showAccountPanel &&
    visibleSuggestedWalletGroups.length === 0 &&
    recentlyConnectedProviderTypes.length === 0
  const isMoreWalletsListOpen = isMoreOpen || shouldAutoOpenMoreWallets

  const accountList = useMemo(() => {
    const selectedProvider =
      selectedSource !== "all" &&
      selectedSource !== "recent" &&
      !isWalletSourceGroupId(selectedSource)
        ? selectedSource
        : null

    const sourceAccounts =
      selectedSource === "recent"
        ? accounts.filter((account) =>
            connectedProviderTypes.includes(account.provider),
          )
        : selectedProvider
          ? accounts.filter((account) => account.provider === selectedProvider)
          : accounts

    return getFilteredAccounts(
      sourceAccounts.map(toAccount),
      currentAccount,
      accountSearch,
      accountFilter,
    )
  }, [
    accountFilter,
    accountSearch,
    accounts,
    connectedProviderTypes,
    currentAccount,
    selectedSource,
  ])

  const { accountsWithBalances, areBalancesLoading } =
    useAccountsWithBalance(accountList)

  const groupedAccounts = useMemo(() => {
    const groups = new Map<WalletProviderType, WalletAccount[]>()

    for (const account of accountsWithBalances) {
      const group = groups.get(account.provider) ?? []
      group.push(account)
      groups.set(account.provider, group)
    }

    return Array.from(groups.entries()).map(([provider, groupAccounts]) => ({
      provider,
      wallet: getWallet(provider),
      accounts: groupAccounts,
    }))
  }, [accountsWithBalances])

  const handleAccountSelect = useCallback(
    (account: ReturnType<typeof toAccount>) => {
      onAccountSelect(account)
      if (!isControlled) {
        toggle()
      }
    },
    [isControlled, onAccountSelect, toggle],
  )

  const handleProviderSelect = (wallet: Wallet) => {
    setSelectedSource(wallet.provider)
  }

  const handleWalletClick = (wallet: Wallet) => {
    handleProviderSelect(wallet)

    const status = getStatus(wallet.provider)
    if (wallet.installed && status === WalletProviderStatus.Disconnected) {
      void enable(wallet.provider).catch(() => undefined)
    }
  }

  const handleWalletGroupSelect = (group: WalletSourceGroup) => {
    const selectableWallets = getSelectableWallets(
      group,
      connectedProviderTypes,
    )
    const [wallet] = selectableWallets

    if (wallet && selectableWallets.length === 1) {
      handleWalletClick(wallet)
      return
    }

    if (!wallet) {
      handleWalletClick(group.wallets[0])
      return
    }

    setSelectedSource(group.id)
  }

  const handleRecentWalletsConnect = () => {
    for (const provider of recentlyConnectedProviderTypes) {
      if (pendingProviderTypes.includes(provider)) continue
      enable(provider)
    }
  }

  const handleConnectAllWallets = async () => {
    for (const provider of connectAllProviderTypes) {
      try {
        await enableConnectAll(provider)
      } catch (error) {
        console.error(error)
        continue
      }
    }
  }

  if (isAddressBookOpen) {
    return (
      <AddressBookModal
        whitelist={[WalletMode.Substrate, WalletMode.EVM]}
        onBack={() => setIsAddressBookOpen(false)}
        onSelect={async (address) => {
          externalWalletForm.setValue("address", address.address, {
            shouldValidate: true,
          })
          const isConnected = await connectExternalWallet(address.address)

          if (!isConnected) {
            setIsAddressBookOpen(false)
          }
        }}
      />
    )
  }

  const shouldFoldOtherWallets =
    !showAccountPanel && visibleSuggestedWalletGroups.length >= 3
  const visibleOtherWalletPreview =
    shouldFoldOtherWallets && !isMoreWalletsListOpen
      ? visibleOtherWalletGroups.slice(0, 2)
      : visibleOtherWalletGroups
  const hasHiddenOtherWallets =
    shouldFoldOtherWallets &&
    visibleOtherWalletPreview.length < visibleOtherWalletGroups.length

  return (
    <Box sx={walletManagementShellSx(showAccountPanel)}>
      <ModalHeader
        title={
          showAccountPanel
            ? t("provider.selectSourceWallet")
            : t("provider.selectSourceWalletOnly")
        }
        description={
          showAccountPanel
            ? undefined
            : t("provider.selectSourceWalletDescription")
        }
        align="center"
        sx={modalHeaderSx(showAccountPanel)}
      />
      <ModalBody noPadding scrollable={false} sx={modalBodySx}>
        <Grid sx={layoutGridSx(showAccountPanel)}>
          <Flex direction="column" sx={sourceColumnSx(showAccountPanel)}>
            <Input
              value={walletSearchValue}
              onChange={(event) => setWalletSearchValue(event.target.value)}
              customSize="large"
              iconStart={Search}
              placeholder={t("provider.searchWallets")}
            />

            <Text fs="p5" fw={500} color="text.low" sx={sourceSectionLabelSx}>
              {t("provider.installedAndRecent")}
            </Text>

            <Box sx={sourceScrollFrameSx}>
              <ScrollArea>
                <Flex
                  direction="column"
                  sx={sourceScrollContentSx(showAccountPanel)}
                >
                  <Flex direction="column" sx={sourceListSx}>
                    {showAccountPanel && (
                      <WalletSourceButton
                        active={selectedSource === "all"}
                        title={t("provider.allAccountsAndWallets")}
                        icon={WalletIcon}
                        onClick={() => setSelectedSource("all")}
                      />
                    )}

                    {recentlyConnectedProviderTypes.length > 0 && (
                      <WalletSourceButton
                        title={t("provider.recentlyConnected")}
                        subtitle={t("provider.connect")}
                        logos={recentlyConnectedProviderTypes}
                        pending={recentlyConnectedProviderTypes.some(
                          (provider) => pendingProviderTypes.includes(provider),
                        )}
                        variant={
                          showAccountPanel ? "management" : "firstConnection"
                        }
                        onClick={handleRecentWalletsConnect}
                      />
                    )}

                    {visibleSuggestedWalletGroups.map((group) =>
                      group.wallets.length === 1 ? (
                        <WalletProviderSourceButton
                          key={group.id}
                          wallet={group.wallets[0]}
                          active={selectedSource === group.wallets[0].provider}
                          status={getStatus(group.wallets[0].provider)}
                          pending={pendingProviderTypes.includes(
                            group.wallets[0].provider,
                          )}
                          variant={
                            showAccountPanel ? "management" : "firstConnection"
                          }
                          onClick={() => handleWalletClick(group.wallets[0])}
                          onDisconnect={() =>
                            disconnect(group.wallets[0].provider)
                          }
                        />
                      ) : (
                        <WalletGroupSourceButton
                          key={group.id}
                          group={group}
                          active={
                            selectedSource === group.id ||
                            group.providers.includes(
                              selectedSource as WalletProviderType,
                            )
                          }
                          connected={group.providers.some((provider) =>
                            connectedProviderTypes.includes(provider),
                          )}
                          pending={group.providers.some((provider) =>
                            pendingProviderTypes.includes(provider),
                          )}
                          variant={
                            showAccountPanel ? "management" : "firstConnection"
                          }
                          onClick={() => handleWalletGroupSelect(group)}
                        />
                      ),
                    )}

                    {showExternalWallet && (
                      <WalletProviderSourceButton
                        wallet={getWallet(WalletProviderType.ExternalWallet)}
                        active={
                          selectedSource === WalletProviderType.ExternalWallet
                        }
                        status={getStatus(WalletProviderType.ExternalWallet)}
                        pending={pendingProviderTypes.includes(
                          WalletProviderType.ExternalWallet,
                        )}
                        variant={
                          showAccountPanel ? "management" : "firstConnection"
                        }
                        onClick={() =>
                          setSelectedSource(WalletProviderType.ExternalWallet)
                        }
                        onDisconnect={() =>
                          disconnect(WalletProviderType.ExternalWallet)
                        }
                      />
                    )}

                    {connectAllProviderTypes.length > 0 && (
                      <WalletSourceButton
                        title={t("provider.connectAll")}
                        subtitle={t("provider.connect")}
                        logos={connectAllProviderTypes}
                        variant={
                          showAccountPanel ? "management" : "firstConnection"
                        }
                        onClick={handleConnectAllWallets}
                      />
                    )}

                    {hasConnectedWalletState && (
                      <WalletSourceButton
                        title={t("provider.logOutAll")}
                        icon={LogOut}
                        variant={
                          showAccountPanel ? "management" : "firstConnection"
                        }
                        onClick={() => disconnect()}
                      />
                    )}
                  </Flex>

                  {visibleOtherWalletGroups.length > 0 && (
                    <Flex direction="column" sx={sourceListSx}>
                      <Text
                        fs="p5"
                        fw={500}
                        color="text.low"
                        sx={sourceOtherSectionLabelSx(showAccountPanel)}
                      >
                        {showAccountPanel
                          ? t("provider.otherWallets")
                          : t("provider.otherWalletsFirstConnection")}
                      </Text>
                      {showAccountPanel ? (
                        <Box sx={moreWalletsDropdownSx}>
                          <WalletSourceButton
                            title={t("provider.moreWallets")}
                            onClick={() => setIsMoreOpen((open) => !open)}
                            action={
                              <Icon
                                size="xs"
                                component={
                                  isMoreWalletsListOpen
                                    ? ChevronUp
                                    : ChevronDown
                                }
                              />
                            }
                          />
                          {isMoreWalletsListOpen && (
                            <Flex direction="column" sx={moreWalletsListSx}>
                              {visibleOtherWalletGroups.map((group) =>
                                group.wallets.length === 1 ? (
                                  <WalletProviderSourceButton
                                    key={group.id}
                                    wallet={group.wallets[0]}
                                    active={
                                      selectedSource ===
                                      group.wallets[0].provider
                                    }
                                    status={getStatus(
                                      group.wallets[0].provider,
                                    )}
                                    pending={pendingProviderTypes.includes(
                                      group.wallets[0].provider,
                                    )}
                                    onClick={() =>
                                      handleWalletClick(group.wallets[0])
                                    }
                                    onDisconnect={() =>
                                      disconnect(group.wallets[0].provider)
                                    }
                                  />
                                ) : (
                                  <WalletGroupSourceButton
                                    key={group.id}
                                    group={group}
                                    active={selectedSource === group.id}
                                    connected={false}
                                    pending={group.providers.some((provider) =>
                                      pendingProviderTypes.includes(provider),
                                    )}
                                    onClick={() =>
                                      handleWalletGroupSelect(group)
                                    }
                                  />
                                ),
                              )}
                            </Flex>
                          )}
                        </Box>
                      ) : (
                        <>
                          {visibleOtherWalletPreview.map((group) =>
                            group.wallets.length === 1 ? (
                              <WalletProviderSourceButton
                                key={group.id}
                                wallet={group.wallets[0]}
                                active={
                                  selectedSource === group.wallets[0].provider
                                }
                                status={getStatus(group.wallets[0].provider)}
                                pending={pendingProviderTypes.includes(
                                  group.wallets[0].provider,
                                )}
                                variant="firstConnection"
                                onClick={() =>
                                  handleWalletClick(group.wallets[0])
                                }
                                onDisconnect={() =>
                                  disconnect(group.wallets[0].provider)
                                }
                              />
                            ) : (
                              <WalletGroupSourceButton
                                key={group.id}
                                group={group}
                                active={selectedSource === group.id}
                                connected={false}
                                pending={group.providers.some((provider) =>
                                  pendingProviderTypes.includes(provider),
                                )}
                                variant="firstConnection"
                                onClick={() => handleWalletGroupSelect(group)}
                              />
                            ),
                          )}
                          {(hasHiddenOtherWallets ||
                            (shouldFoldOtherWallets &&
                              isMoreWalletsListOpen)) && (
                            <WalletSourceButton
                              title={
                                isMoreWalletsListOpen
                                  ? t("provider.hide")
                                  : t("provider.showMore")
                              }
                              icon={
                                isMoreWalletsListOpen ? ChevronUp : ChevronDown
                              }
                              variant="firstConnectionPlain"
                              onClick={() => setIsMoreOpen((open) => !open)}
                            />
                          )}
                        </>
                      )}
                    </Flex>
                  )}
                </Flex>
              </ScrollArea>
            </Box>
          </Flex>

          <Box
            aria-hidden={!showAccountPanel}
            sx={rightPanelFrameSx(showAccountPanel)}
          >
            {selectedSource === WalletProviderType.ExternalWallet &&
            showExternalWallet ? (
              <Flex direction="column" gap="base" sx={rightColumnSx}>
                <FormProvider {...externalWalletForm}>
                  <ExternalWalletForm
                    onAddressBookOpen={() => setIsAddressBookOpen(true)}
                    hideSubmitAction
                  />
                </FormProvider>
              </Flex>
            ) : showErrorState ? (
              <WalletErrorState
                error={error}
                onRetry={
                  recentProvider
                    ? () => enableConnectAll(recentProvider)
                    : undefined
                }
              />
            ) : showWalletGroupChainSelectState && selectedWalletGroup ? (
              <WalletChainSelectState
                group={selectedWalletGroup}
                getStatus={getStatus}
                onConnect={(wallet) => enable(wallet.provider)}
                onInstall={(wallet) => {
                  if (wallet.installUrl) {
                    window.open(
                      wallet.installUrl,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                }}
                onSelect={handleProviderSelect}
              />
            ) : showSelectedWalletConnectState && selectedWallet ? (
              <WalletConnectState
                wallet={selectedWallet}
                isConnecting={
                  selectedWalletStatus === WalletProviderStatus.Pending
                }
                onConnect={() => enable(selectedWallet.provider)}
              />
            ) : (
              <Flex direction="column" gap="base" sx={rightColumnSx}>
                <Input
                  value={accountSearchValue}
                  onChange={(event) =>
                    setAccountSearchValue(event.target.value)
                  }
                  customSize="large"
                  iconStart={Search}
                  placeholder={t("account.searchAccounts")}
                />

                <Flex gap="base" wrap>
                  {ACCOUNT_FILTERS.map((filter) => (
                    <Button
                      key={filter}
                      variant={accountFilter === filter ? "secondary" : "muted"}
                      outline={accountFilter !== filter}
                      size="small"
                      onClick={() => setAccountFilter(filter)}
                      sx={accountFilterButtonSx}
                    >
                      {filter === WalletMode.Default
                        ? t("accountFilter.all")
                        : t(`accountFilter.${filter}`)}
                    </Button>
                  ))}
                </Flex>

                <Flex direction="column" gap="base" sx={accountListSx}>
                  {isProvidersConnecting ? (
                    <ProviderLoader providers={pendingProviderTypes} />
                  ) : accountsWithBalances.length > 0 ? (
                    selectedSource === "all" ? (
                      groupedAccounts.map((group) => (
                        <WalletAccountSection
                          key={group.provider}
                          title={group.wallet?.title ?? group.provider}
                          logo={group.wallet?.logo}
                          accounts={group.accounts}
                          currentAccount={currentAccount}
                          isBalanceLoading={areBalancesLoading}
                          onAccountSelect={handleAccountSelect}
                        />
                      ))
                    ) : (
                      accountsWithBalances.map((account) => (
                        <WalletAccountTile
                          key={`${account.publicKey}-${account.provider}`}
                          account={account}
                          isActive={isAccountSelected(currentAccount, account)}
                          isBalanceLoading={areBalancesLoading}
                          onClick={() => handleAccountSelect(account)}
                        />
                      ))
                    )
                  ) : (
                    <Flex align="center" justify="center" sx={emptyStateSx}>
                      <Text fs="p4" color="text.medium">
                        {t("account.noResults")}
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            )}
          </Box>
        </Grid>
      </ModalBody>
    </Box>
  )
}

const WalletProviderSourceButton: React.FC<{
  readonly wallet?: Wallet
  readonly active: boolean
  readonly status: WalletProviderStatus
  readonly pending: boolean
  readonly variant?: WalletSourceButtonVariant
  readonly onClick: () => void
  readonly onDisconnect: () => void
}> = ({
  wallet,
  active,
  status,
  pending,
  variant = "management",
  onClick,
  onDisconnect,
}) => {
  const { t } = useTranslation()

  if (!wallet) return null

  const isConnected = status === WalletProviderStatus.Connected
  const chainModes =
    variant === "management" ? undefined : getWalletSourceModes(wallet.provider)

  return (
    <WalletSourceButton
      active={active}
      title={wallet.title}
      subtitle={isConnected ? t("provider.connected") : t("provider.connect")}
      logo={wallet.logo}
      pending={pending}
      variant={variant}
      chainModes={chainModes}
      onClick={onClick}
      action={
        isConnected ? (
          <Box
            as="span"
            aria-label={t("provider.disconnect")}
            onClick={(event) => {
              event.stopPropagation()
              onDisconnect()
            }}
            sx={sourceActionSx}
          >
            <Icon size="xs" component={LogOut} />
          </Box>
        ) : (
          <Box as="span" sx={sourceActionSx}>
            <Icon size="xs" component={ChevronRight} />
          </Box>
        )
      }
    />
  )
}

const WalletGroupSourceButton: React.FC<{
  readonly group: WalletSourceGroup
  readonly active: boolean
  readonly connected: boolean
  readonly pending: boolean
  readonly variant?: WalletSourceButtonVariant
  readonly onClick: () => void
}> = ({
  group,
  active,
  connected,
  pending,
  variant = "management",
  onClick,
}) => {
  const { t } = useTranslation()

  return (
    <WalletSourceButton
      active={active}
      title={group.title}
      subtitle={connected ? t("provider.connected") : t("provider.connect")}
      logo={group.logo}
      pending={pending}
      variant={variant}
      chainModes={getWalletGroupSourceModes(group)}
      onClick={onClick}
    />
  )
}

const WalletErrorState: React.FC<{
  readonly error: string
  readonly onRetry?: () => void
}> = ({ error, onRetry }) => {
  const { t } = useTranslation()

  return (
    <Flex align="center" justify="center" sx={walletErrorStateSx}>
      <Flex
        direction="column"
        align="center"
        gap="base"
        sx={{ maxWidth: pxToRem(340) }}
      >
        <Box sx={walletErrorIconSx}>
          <Icon size="s" component={CircleAlert} />
        </Box>
        <Flex direction="column" align="center" sx={{ gap: "6px" }}>
          <Text
            fs="h7"
            fw={500}
            lh={1}
            font="primary"
            align="center"
            color="text.high"
          >
            {t("error.title")}
          </Text>
          <Text fs="p5" lh="m" color="text.medium" align="center">
            {error || t("error.unknown")}
          </Text>
        </Flex>
        {onRetry && (
          <Button
            variant="secondary"
            size="small"
            onClick={onRetry}
            sx={walletErrorRetryButtonSx}
          >
            {t("error.retry")}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

const WalletChainSelectState: React.FC<{
  readonly group: WalletSourceGroup
  readonly getStatus: (
    provider: WalletProviderType | null,
  ) => WalletProviderStatus
  readonly onConnect: (wallet: Wallet) => void
  readonly onInstall: (wallet: Wallet) => void
  readonly onSelect: (wallet: Wallet) => void
}> = ({ group, getStatus, onConnect, onInstall, onSelect }) => {
  const { t } = useTranslation()
  const selectableWallets = group.wallets.filter((wallet) => {
    const status = getStatus(wallet.provider)
    return wallet.installed || status === WalletProviderStatus.Connected
  })

  return (
    <Flex direction="column" gap="base" sx={rightColumnSx}>
      <Flex
        direction="column"
        align="center"
        gap="base"
        sx={chainSelectHeaderSx}
      >
        {group.logo && (
          <Image
            src={group.logo}
            alt=""
            sx={{ size: 52, borderRadius: "full", flexShrink: 0 }}
          />
        )}
        <Text
          fs="h7"
          fw={500}
          lh={1}
          font="primary"
          align="center"
          color="text.high"
        >
          {group.title}
        </Text>
      </Flex>

      <Flex direction="column" gap="s">
        {selectableWallets.map((wallet) => {
          const status = getStatus(wallet.provider)
          const isConnected = status === WalletProviderStatus.Connected
          const isPending = status === WalletProviderStatus.Pending
          const mode = getWalletPrimaryMode(wallet.provider)
          const modeIcon = mode ? getWalletModeIcon(mode) : ""

          return (
            <WalletSourceButton
              key={wallet.provider}
              title={getWalletSourceModeLabel(mode)}
              subtitle={
                isConnected
                  ? t("provider.connected")
                  : wallet.installed
                    ? t("provider.connect")
                    : t("provider.download")
              }
              logo={mode === WalletMode.EVM ? undefined : modeIcon}
              icon={mode === WalletMode.EVM ? HydrationLogo : undefined}
              pending={isPending}
              onClick={() => {
                if (isPending) return
                if (isConnected) {
                  onSelect(wallet)
                  return
                }
                if (wallet.installed) {
                  onConnect(wallet)
                  return
                }
                onInstall(wallet)
              }}
              action={
                <Box as="span" sx={sourceActionSx}>
                  <Icon
                    size="xs"
                    component={
                      !wallet.installed && wallet.installUrl
                        ? Download
                        : ChevronRight
                    }
                  />
                </Box>
              }
            />
          )
        })}
      </Flex>
    </Flex>
  )
}

const WalletConnectState: React.FC<{
  readonly wallet: Wallet
  readonly isConnecting: boolean
  readonly onConnect: () => void
}> = ({ wallet, isConnecting, onConnect }) => {
  const { t } = useTranslation()

  return (
    <Flex align="center" justify="center" sx={walletConnectStateSx}>
      <Flex direction="column" align="center" gap="base" sx={{ width: "100%" }}>
        <Image
          src={wallet.logo}
          alt=""
          sx={{ size: 52, borderRadius: "full", flexShrink: 0 }}
        />
        <Flex direction="column" align="center" sx={{ gap: "4px" }}>
          <Text
            fs="h7"
            fw={500}
            lh={1}
            font="primary"
            align="center"
            color="text.high"
          >
            {wallet.title}
          </Text>
          <Text fs="p5" lh="m" color="text.medium" align="center">
            {!wallet.installed
              ? t("provider.walletNotInstalledDescription", {
                  wallet: wallet.title,
                })
              : isConnecting
                ? t("provider.connectingWalletDescription")
                : t("provider.walletNotConnectedDescription")}
          </Text>
        </Flex>
        <Button
          variant="secondary"
          size="small"
          disabled={isConnecting || (!wallet.installed && !wallet.installUrl)}
          onClick={() => {
            if (!wallet.installed) {
              if (wallet.installUrl) {
                window.open(wallet.installUrl, "_blank", "noopener,noreferrer")
              }
              return
            }

            onConnect()
          }}
          sx={walletConnectButtonSx}
        >
          {isConnecting ? (
            <Spinner size="xs" />
          ) : !wallet.installed ? (
            <Icon size="xs" component={Download} />
          ) : (
            <Icon size="xs" component={WalletIcon} />
          )}
          {!wallet.installed
            ? t("provider.installWallet", { wallet: wallet.title })
            : isConnecting
              ? t("provider.connectingWallet")
              : t("provider.connectWallet")}
        </Button>
      </Flex>
    </Flex>
  )
}

const WalletSourceButton: React.FC<{
  readonly active?: boolean
  readonly title: string
  readonly subtitle?: string
  readonly logo?: string
  readonly logos?: WalletProviderType[]
  readonly icon?: ComponentType
  readonly pending?: boolean
  readonly variant?: WalletSourceButtonVariant
  readonly chainModes?: WalletMode[]
  readonly action?: React.ReactNode
  readonly onClick: () => void
}> = ({
  active,
  title,
  subtitle,
  logo,
  logos,
  icon,
  pending,
  variant = "management",
  chainModes,
  action,
  onClick,
}) => (
  <button
    type="button"
    data-active={active}
    data-variant={variant}
    onClick={onClick}
    sx={sourceButtonSx}
  >
    <Flex align="center" sx={sourceButtonContentSx}>
      {logo ? (
        <Image
          src={logo}
          alt=""
          lazy={false}
          sx={{ size: 20, flexShrink: 0, objectFit: "contain" }}
        />
      ) : icon ? (
        <Box sx={sourceIconSx}>
          <Icon size="xs" component={icon} />
        </Box>
      ) : logos?.length ? (
        <Flex sx={{ flexShrink: 0 }}>
          {logos.slice(0, 3).map((provider, index) => {
            const wallet = getWallet(provider)
            if (!wallet) return null
            return (
              <Image
                key={provider}
                src={wallet.logo}
                alt=""
                lazy={false}
                sx={{
                  size: 14,
                  borderRadius: "full",
                  ml: index === 0 ? 0 : -4,
                  objectFit: "contain",
                }}
              />
            )
          })}
        </Flex>
      ) : null}
      <Flex direction="column" sx={{ minWidth: 0 }}>
        <Text fs="p5" fw={500} color="text.high" truncate>
          {title}
        </Text>
        {subtitle && (
          <Text
            fs="p7"
            fw={500}
            lh="xs"
            color={getToken("text.medium")}
            truncate
          >
            {subtitle}
          </Text>
        )}
      </Flex>
    </Flex>
    {pending ? (
      <Spinner size="xs" />
    ) : variant === "firstConnectionPlain" ? null : (
      <Flex align="center" sx={sourceButtonEndSx}>
        {chainModes && chainModes.length > 0 && (
          <WalletSourceChainBadges modes={chainModes} />
        )}
        {action || (
          <Box as="span" sx={sourceActionSx}>
            <Icon size="xs" component={ChevronRight} />
          </Box>
        )}
      </Flex>
    )}
  </button>
)

const WalletSourceChainBadges: React.FC<{ readonly modes: WalletMode[] }> = ({
  modes,
}) => {
  const badges = getWalletSourceChainBadges(modes)

  return (
    <Flex align="center" sx={sourceChainBadgesSx}>
      {badges.slice(0, 4).map((badge, index) => (
        <Box
          key={badge.id}
          sx={{
            ...sourceChainBadgeSx,
            ml: index === 0 ? 0 : -5,
          }}
        >
          {badge.icon ? (
            <Icon size="xs" component={badge.icon} />
          ) : badge.iconSrc ? (
            <Image
              src={badge.iconSrc}
              alt=""
              lazy={false}
              sx={{ size: 12, borderRadius: "full", objectFit: "contain" }}
            />
          ) : null}
        </Box>
      ))}
    </Flex>
  )
}

const WalletAccountSection: React.FC<{
  readonly title: string
  readonly logo?: string
  readonly accounts: WalletAccount[]
  readonly currentAccount: WalletAccount | null
  readonly isBalanceLoading: boolean
  readonly onAccountSelect: (account: WalletAccount) => void
}> = ({
  title,
  logo,
  accounts,
  currentAccount,
  isBalanceLoading,
  onAccountSelect,
}) => (
  <Flex direction="column" gap="s">
    <Flex align="center" gap="xs" sx={{ minWidth: 0 }}>
      {logo && (
        <Image
          src={logo}
          alt=""
          lazy={false}
          sx={{
            size: 16,
            borderRadius: "full",
            flexShrink: 0,
            objectFit: "contain",
          }}
        />
      )}
      <Text fs="p4" fw={500} color="text.high" truncate>
        {title}
      </Text>
    </Flex>
    <Flex direction="column" gap="base">
      {accounts.map((account) => (
        <WalletAccountTile
          key={`${account.publicKey}-${account.provider}`}
          account={account}
          isActive={isAccountSelected(currentAccount, account)}
          isBalanceLoading={isBalanceLoading}
          onClick={() => onAccountSelect(account)}
        />
      ))}
    </Flex>
  </Flex>
)

const WalletAccountTile: React.FC<{
  readonly account: WalletAccount
  readonly isActive: boolean
  readonly isBalanceLoading: boolean
  readonly onClick: () => void
}> = ({ account, isActive, isBalanceLoading, onClick }) => {
  const { t } = useTranslation()
  const mode = getWalletModesByProviderType(account.provider).find(
    (walletMode) => walletMode !== WalletMode.Default,
  )
  const modeIcon = mode ? getWalletModeIcon(mode) : ""
  const wallet = getWallet(account.provider)
  const metaMaskExtension =
    wallet instanceof MetaMask && isEip1193Provider(wallet.extension)
      ? wallet.extension
      : undefined

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        data-active={isActive}
        data-has-change-account={!!metaMaskExtension || undefined}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return

          event.preventDefault()
          onClick()
        }}
        sx={accountTileSx}
      >
        <AccountAvatar
          address={account.displayAddress}
          theme={getAccountAvatarTheme(account)}
          size={32}
        />
        <Flex direction="column" gap="xs" sx={{ minWidth: 0, flex: 1 }}>
          <Flex
            align="center"
            justify="space-between"
            gap="base"
            sx={{ minWidth: 0 }}
          >
            <Flex align="center" gap="xs" sx={{ minWidth: 0 }}>
              {modeIcon && (
                <Image
                  src={modeIcon}
                  alt=""
                  lazy={false}
                  sx={{
                    size: 12,
                    flexShrink: 0,
                    borderRadius: "full",
                    objectFit: "contain",
                  }}
                />
              )}
              <Text fs="p4" fw={500} color="text.high" truncate>
                {account.name}
              </Text>
              {isActive && (
                <Chip size="small" rounded variant="green">
                  {t("account.active")}
                </Chip>
              )}
            </Flex>
            <Text fs="p4" fw={500} color="text.high" sx={{ flexShrink: 0 }}>
              {isBalanceLoading && account.balance === undefined
                ? ""
                : account.balance !== undefined
                  ? formatCurrency(account.balance)
                  : ""}
            </Text>
          </Flex>
          <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
            <Text
              fs="p5"
              color={getToken("text.medium")}
              truncate
              sx={{ minWidth: 0 }}
            >
              {shortenAccountAddress(account.displayAddress, 12)}
            </Text>
            <Box
              asChild
              sx={accountTileCopyButtonSx}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <CopyButton
                aria-label="Copy address"
                text={account.displayAddress}
                iconSize="xs"
              />
            </Box>
          </Flex>
        </Flex>
      </Box>
      {metaMaskExtension && (
        <SChangeAccountButton
          isActive={isActive}
          variant="muted"
          size="small"
          onClick={(event) => {
            event.stopPropagation()
            requestAccounts(metaMaskExtension)
          }}
        >
          {t("account.changeAccount")}
        </SChangeAccountButton>
      )}
    </Box>
  )
}

const walletManagementShellSx = (
  showAccountPanel: boolean,
): BoxProps["sx"] => ({
  width: ["100%", null, showAccountPanel ? pxToRem(650) : pxToRem(452)],
  maxWidth: "100%",
  height: ["100dvh", null, showAccountPanel ? "min(720px, 80vh)" : "80vh"],
  maxHeight: ["100dvh", null, "80vh"],
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "width 180ms ease",
})

const modalHeaderSx = (showAccountPanel: boolean): BoxProps["sx"] => ({
  pb: showAccountPanel ? "base" : "l",
  flexShrink: 0,
})

const modalBodySx: BoxProps["sx"] = {
  pt: 0,
  px: ["base", null, "m"],
  pb: ["base", null, "m"],
  borderTop: 0,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
}

const layoutGridSx = (showAccountPanel: boolean): BoxProps["sx"] => ({
  display: "grid",
  gridTemplateColumns: [
    "1fr",
    null,
    showAccountPanel
      ? `${pxToRem(200)} minmax(0, 1fr)`
      : "minmax(0, 1fr) minmax(0, 0fr)",
  ],
  gap: ["base", null, showAccountPanel ? 20 : 0],
  width: "100%",
  maxWidth: "100%",
  flex: 1,
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  transition: "grid-template-columns 180ms ease, gap 180ms ease",
})

const sourceColumnSx = (showAccountPanel: boolean): BoxProps["sx"] => ({
  gap: showAccountPanel ? "10px" : "base",
  minWidth: 0,
  minHeight: 0,
  maxHeight: ["none", null, "100%"],
  overflow: "hidden",
  pl: 0,
  pr: 0,
})

const sourceSectionLabelSx: BoxProps["sx"] = {
  lineHeight: "15px",
}

const sourceOtherSectionLabelSx = (
  showAccountPanel: boolean,
): BoxProps["sx"] => ({
  lineHeight: "15px",
  pt: showAccountPanel ? 0 : "l",
})

const sourceScrollFrameSx: BoxProps["sx"] = {
  flex: 1,
  minHeight: 0,
  height: "100%",
  overflow: "hidden",
}

const sourceScrollContentSx = (showAccountPanel: boolean): BoxProps["sx"] => ({
  display: "flex",
  flexDirection: "column",
  gap: showAccountPanel ? "10px" : "base",
  minWidth: 0,
  pr: [0, null, showAccountPanel ? "xs" : 0],
})

const sourceListSx: BoxProps["sx"] = {
  gap: "4px",
}

const rightPanelFrameSx = (showAccountPanel: boolean): BoxProps["sx"] => ({
  minWidth: 0,
  minHeight: 0,
  maxHeight: [showAccountPanel ? "none" : 0, null, "100%"],
  overflow: "hidden",
  opacity: showAccountPanel ? 1 : 0,
  visibility: showAccountPanel ? "visible" : "hidden",
  pointerEvents: showAccountPanel ? "auto" : "none",
  transition: showAccountPanel
    ? "opacity 120ms ease 120ms"
    : "opacity 80ms ease, visibility 0s linear 80ms",
})

const rightColumnSx: BoxProps["sx"] = {
  minWidth: 0,
  minHeight: 0,
  maxHeight: ["none", null, "100%"],
  overflowY: ["visible", null, "auto"],
}

const chainSelectHeaderSx: BoxProps["sx"] = {
  pt: ["base", null, "xl"],
  px: ["base", null, 30],
  pb: "s",
}

const walletErrorStateSx: BoxProps["sx"] = {
  borderRadius: "m",
  bg: getToken("surfaces.containers.dim.dimOnBg"),
  minHeight: 260,
  height: "100%",
  p: ["xl", null, 30],
}

const walletErrorIconSx: BoxProps["sx"] = {
  size: 40,
  borderRadius: "full",
  bg: getToken("accents.danger.dimBg"),
  color: getToken("accents.danger.secondary"),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}

const walletErrorRetryButtonSx: BoxProps["sx"] = {
  mt: "s",
}

const walletConnectStateSx: BoxProps["sx"] = {
  width: "100%",
  height: "100%",
  minHeight: 260,
  px: ["base", null, 30],
  py: ["xl", null, 46],
}

const walletConnectButtonSx: BoxProps["sx"] = {
  mt: "s",
  gap: "xs",
  color: getToken("buttons.primary.medium.onButton"),
}

const sourceButtonSx: BoxProps["sx"] = {
  width: "100%",
  minHeight: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4px",
  px: "base",
  py: "base",
  borderRadius: "m",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
  bg: "transparent",
  color: getToken("text.high"),
  cursor: "pointer",
  transition: "colors",
  '&:not([data-variant="firstConnectionPlain"])': {
    bg: getToken("surfaces.containers.dim.dimOnBg"),
  },
  '&:not([data-variant="firstConnectionPlain"]):hover': {
    bg: getToken("buttons.secondary.accent.restSubtle"),
    borderColor: getToken("buttons.secondary.accent.outline"),
  },
  '&[data-variant="firstConnection"]': {
    minHeight: 40,
    px: "base",
    py: "base",
  },
  '&[data-variant="firstConnectionPlain"]': {
    width: "auto",
    minHeight: 36,
    alignSelf: "flex-start",
    justifyContent: "flex-start",
    gap: "6px",
    px: "base",
    py: "s",
    bg: "transparent",
  },
  '&[data-variant="firstConnectionPlain"]:hover': {
    bg: getToken("buttons.secondary.accent.restSubtle"),
  },
  '&[data-active="true"]': {
    bg: getToken("buttons.secondary.accent.rest"),
    borderColor: getToken("buttons.secondary.accent.outline"),
  },
  '&[data-active="true"]:hover': {
    bg: getToken("buttons.secondary.accent.hover"),
    borderColor: getToken("buttons.secondary.accent.outline"),
  },
}

const sourceButtonContentSx: BoxProps["sx"] = {
  gap: "base",
  minWidth: 0,
  flex: 1,
}

const sourceButtonEndSx: BoxProps["sx"] = {
  gap: "s",
  flexShrink: 0,
}

const sourceIconSx: BoxProps["sx"] = {
  size: 20,
  borderRadius: "full",
  bg: getToken("buttons.secondary.outline.fill"),
  color: getToken("text.high"),
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}

const sourceChainBadgesSx: BoxProps["sx"] = {
  flexShrink: 0,
}

const sourceChainBadgeSx: BoxProps["sx"] = {
  size: 18,
  borderRadius: "full",
  bg: getToken("surfaces.containers.high.primary"),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}

const sourceActionSx: BoxProps["sx"] = {
  color: getToken("text.medium"),
  cursor: "pointer",
  size: 24,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    bg: getToken("controls.dim.hover"),
    color: getToken("text.high"),
  },
}

const accountFilterButtonSx: BoxProps["sx"] = {
  minWidth: pxToRem(80),
  py: "s",
}

const accountListSx: BoxProps["sx"] = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  pr: "xs",
}

const moreWalletsDropdownSx: BoxProps["sx"] = {
  borderRadius: "m",
  overflow: "hidden",
}

const moreWalletsListSx: BoxProps["sx"] = {
  pt: "xs",
}

const accountTileSx: BoxProps["sx"] = {
  width: "100%",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: "base",
  p: "base",
  borderRadius: "m",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
  bg: getToken("surfaces.containers.dim.dimOnBg"),
  color: getToken("text.high"),
  cursor: "pointer",
  overflow: "hidden",
  transition: "colors",
  "&:hover": {
    bg: getToken("details.borders"),
  },
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: getToken("buttons.secondary.accent.outline"),
    outlineOffset: 2,
  },
  '&[data-active="true"]': {
    bg: getToken("buttons.secondary.outline.fill"),
    borderColor: getToken("buttons.secondary.outline.outline"),
  },
  '&[data-has-change-account="true"]': {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
}

const accountTileCopyButtonSx: BoxProps["sx"] = {
  color: getToken("text.medium"),
  cursor: "pointer",
  flexShrink: 0,
  "&[data-copied='true']": {
    color: getToken("accents.success.emphasis"),
  },
  "&:hover:not(:disabled)": {
    color: getToken("text.high"),
  },
}

const emptyStateSx: BoxProps["sx"] = {
  minHeight: 260,
  borderRadius: "m",
  bg: getToken("surfaces.containers.dim.dimOnBg"),
}
