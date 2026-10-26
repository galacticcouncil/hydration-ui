import { BookOpen, Plus, WalletIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Icon,
  ScrollArea,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CircleAlert,
  Download,
  ExternalLink,
  HatGlasses,
  LogOut,
  LucideWallet,
  Users,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"
import { pick, prop } from "remeda"
import { useShallow } from "zustand/react/shallow"

import {
  WalletAccount,
  WalletAccountList,
  WalletAccountSection,
} from "@/components/content/WalletManagementAccounts"
import {
  SLayoutGrid,
  SModalBody,
  SModalHeader,
  SRightColumn,
  SRightPanelFrame,
  SScrollAreaContent,
  SSearchInput,
  SSourceColumn,
  SSourceFooter,
  SSourceScrollFrame,
  SWalletManagementShell,
} from "@/components/content/WalletManagementContent.styled"
import {
  WalletGroupSourceButton,
  WalletProviderSourceButton,
  WalletSourceAction,
  WalletSourceButton,
  WalletSourceCategoryLabel,
  WalletSourceGroup,
} from "@/components/content/WalletManagementSource"
import {
  WalletAccountsEmptyState,
  WalletChainSelectState,
  WalletConnectionState,
} from "@/components/content/WalletManagementStates"
import { ExternalWalletForm } from "@/components/external/ExternalWalletForm"
import { useExternalWalletForm } from "@/components/external/ExternalWalletForm.form"
import { MultisigConfigList } from "@/components/multisig/MultisigConfigList"
import { MultisigSetupPanel } from "@/components/multisig/MultisigSetupPanel"
import { MultisigSignerSelect } from "@/components/multisig/MultisigSignerSelect"
import { getWalletDeeplink } from "@/config/deeplinks"
import { WalletProviderType } from "@/config/providers"
import {
  chipModesForAccounts,
  providersForMode,
  WalletAccountFilterOption,
  WalletMode,
} from "@/config/wallet"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks/useAccount"
import { useAccountsWithBalance } from "@/hooks/useAccountsWithBalance"
import { useMultisigConfigs } from "@/hooks/useMultisigConfigs"
import {
  useWeb3Connect,
  WalletProviderEntry,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { Wallet } from "@/types/wallet"
import { getWalletModeName, isNovaWalletApp, toAccount } from "@/utils"
import { filterAccounts, getFilteredAccounts } from "@/utils/accountFilter"
import {
  getConflictingWalletProviders,
  getConnectAllGroups,
  getSelectableWallets,
  getWalletSourceAction,
  getWalletSourceGroupAction,
  isWalletSourceGroupId,
  selectWalletSources,
  WalletSourceId,
} from "@/utils/walletSource"
import { getWallet, getWallets } from "@/wallets"

type MultisigStep = "list" | "setup" | "signer"

const filterWalletGroups = (groups: WalletSourceGroup[], search: string) => {
  const phrase = search.toLowerCase().trim()
  if (!phrase) return groups
  return groups.filter((group) => group.title.toLowerCase().includes(phrase))
}

export const WalletManagementContent = () => {
  const { t } = useTranslation()
  const { account: activeAccount } = useAccount()
  const {
    mode,
    meta,
    onAccountSelect,
    isControlled,
    setModalContentWidth,
    isPage,
    accountFilter: filterPageAccount,
    customSource,
    onBack,
  } = useWeb3ConnectContext()
  const currentAccount = filterPageAccount ? null : activeAccount
  const { gte } = useBreakpoints()
  const isDesktop = gte("md")
  const { enable, disconnect } = useWeb3Enable()
  const sourceViewportRef = useRef<HTMLDivElement>(null)
  const { enable: enableWithDisconnectOnError } = useWeb3Enable({
    disconnectOnError: true,
  })
  const {
    accounts,
    toggle,
    providers: walletProviders,
    recentProvider,
    recentlyUsedProviders,
    error,
    getStatus,
  } = useWeb3Connect(
    useShallow(
      pick([
        "accounts",
        "toggle",
        "providers",
        "recentProvider",
        "recentlyUsedProviders",
        "error",
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
  // Global pickers open the selected account; embedded flows start with sources.
  const [showAccounts, setShowAccounts] = useState(!isPage && !!currentAccount)
  const [isCustomSourceSelected, setIsCustomSourceSelected] = useState(false)
  const [walletSearchValue, setWalletSearchValue] = useState("")
  const [accountSearchValue, setAccountSearchValue] = useState("")
  const [walletSearch, setWalletSearch] = useState("")
  const [accountSearch, setAccountSearch] = useState("")
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isConnectingAll, setIsConnectingAll] = useState(false)
  const [connectionResults, setConnectionResults] = useState<
    Partial<Record<WalletProviderType, "pending" | "connected" | "rejected">>
  >({})
  const externalWalletForm = useExternalWalletForm()
  const isChainMode = mode !== WalletMode.Default
  // View-only accounts don't belong to a chain-specific connect
  const showExternalWallet = !isChainMode && !meta?.hideExternalWallet
  const showMultisig =
    !meta?.hideMultisig &&
    (mode === WalletMode.Default ||
      mode === WalletMode.Substrate ||
      mode === WalletMode.SubstrateEVM)
  const multisigConfigs = useMultisigConfigs()
  const [multisigStep, setMultisigStep] = useState<MultisigStep>("list")

  useEffect(() => {
    if (!meta?.initialProvider) return
    setSelectedSource(meta.initialProvider)
  }, [meta?.initialProvider])

  /**
   * The single entry point for picking a wallet source. Seeding the initial
   * provider above deliberately does not go through it: it must not switch
   * columns on its own.
   */
  const selectSource = useCallback((source: WalletSourceId) => {
    setSelectedSource(source)
    setIsCustomSourceSelected(false)
    setShowAccounts(true)
  }, [])

  useDebounce(() => setWalletSearch(walletSearchValue), 100, [
    walletSearchValue,
  ])
  useDebounce(() => setAccountSearch(accountSearchValue), 100, [
    accountSearchValue,
  ])

  const allWallets = useMemo(() => getWallets(), [])
  const deeplinkedProviders = useMemo(
    () =>
      allWallets
        .map(prop("provider"))
        .filter((provider) => !!getWalletDeeplink(provider)),
    [allWallets],
  )

  const modeProviders = useMemo(() => providersForMode(mode), [mode])

  const providers = useMemo(
    () =>
      modeProviders
        ? walletProviders.filter(({ type }) => modeProviders.includes(type))
        : walletProviders,
    [modeProviders, walletProviders],
  )
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
  const pendingProvider = pendingProviderTypes[0]
  const pendingWallet = pendingProvider ? getWallet(pendingProvider) : undefined
  const errorWallet =
    recentProvider && (!modeProviders || modeProviders.includes(recentProvider))
      ? getWallet(recentProvider)
      : undefined
  const connectedAccountsCount = useMemo(
    () =>
      filterAccounts(mode)(accounts.map(toAccount)).filter(
        (account) => !filterPageAccount || filterPageAccount(account),
      ).length,
    [accounts, mode, filterPageAccount],
  )
  const hasConnectedWalletState =
    connectedProviderTypes.length > 0 || connectedAccountsCount > 0
  const showLogOutAll = !isChainMode && hasConnectedWalletState

  const showErrorState =
    !!error &&
    (!modeProviders || !!errorWallet) &&
    (selectedSource === "all" || selectedSource === recentProvider)

  const {
    recentGroups: recentWalletGroups,
    installedGroups: installedWalletGroups,
    moreGroups: moreWalletGroups,
    deeplinkedGroups: deeplinkedWalletGroups,
    walletConnectGroups,
  } = useMemo(
    () =>
      selectWalletSources(
        allWallets,
        modeProviders,
        connectedProviderTypes,
        recentlyUsedProviders,
        deeplinkedProviders,
      ),
    [
      allWallets,
      connectedProviderTypes,
      deeplinkedProviders,
      modeProviders,
      recentlyUsedProviders,
    ],
  )

  const selectedWallet =
    selectedSource !== "all" &&
    selectedSource !== "recent" &&
    !isWalletSourceGroupId(selectedSource) &&
    (!modeProviders || modeProviders.includes(selectedSource))
      ? getWallet(selectedSource)
      : undefined
  const selectedWalletGroup = isWalletSourceGroupId(selectedSource)
    ? [
        ...recentWalletGroups,
        ...installedWalletGroups,
        ...moreWalletGroups,
        ...walletConnectGroups,
      ].find((group) => group.id === selectedSource)
    : undefined
  const emptyStateWallet = selectedWallet ?? selectedWalletGroup
  const selectedWalletStatus = selectedWallet
    ? getStatus(selectedWallet.provider)
    : null
  const isExternalWalletSelected =
    selectedSource === WalletProviderType.ExternalWallet && showExternalWallet
  const isMultisigSelected =
    selectedSource === WalletProviderType.Multisig && showMultisig
  const showSelectedWalletConnectState =
    !!selectedWallet &&
    selectedWallet.provider !== WalletProviderType.ExternalWallet &&
    !selectedWallet.installed &&
    (selectedWalletStatus === WalletProviderStatus.Disconnected ||
      selectedWalletStatus === WalletProviderStatus.Pending)
  const showWalletGroupChainSelectState =
    !!selectedWalletGroup &&
    getSelectableWallets(selectedWalletGroup, connectedProviderTypes).length > 1

  const showAccountPanel = isPage
    ? showAccounts
    : connectedProviderTypes.length > 0 ||
      connectedAccountsCount > 0 ||
      isExternalWalletSelected ||
      isMultisigSelected ||
      isProvidersConnecting ||
      showSelectedWalletConnectState ||
      showWalletGroupChainSelectState ||
      showErrorState
  const showAllAccounts =
    (isPage || showAccountPanel) && connectedAccountsCount > 0

  /** Global pickers fall back when emptied; embedded flows switch on selection. */
  const isAccountsView = showAccounts && showAccountPanel

  /**
   * The panel's content mounts once the columns finish opening: rendering it
   * mid-transition costs frames on the main thread the width animation needs.
   * Embedded pages, mobile, and reduced motion keep their content mounted.
   */
  const [isPanelOpened, setIsPanelOpened] = useState(showAccountPanel)
  if (
    isPanelOpened !== showAccountPanel &&
    (!showAccountPanel ||
      isPage ||
      !isDesktop ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  )
    setIsPanelOpened(showAccountPanel)

  /**
   * Below `md` the width is pinned: only one column is ever on screen, and
   * `--modal-content-width` lives two components up, so a change here is an
   * unanimated jump on every forward/back press.
   */
  useLayoutEffect(() => {
    setModalContentWidth(
      !isDesktop || showAccountPanel ? pxToRem(650) : pxToRem(452),
    )
  }, [isDesktop, setModalContentWidth, showAccountPanel])

  const visibleRecentWalletGroups = useMemo(
    () => filterWalletGroups(recentWalletGroups, walletSearch),
    [recentWalletGroups, walletSearch],
  )

  const visibleInstalledWalletGroups = useMemo(
    () => filterWalletGroups(installedWalletGroups, walletSearch),
    [installedWalletGroups, walletSearch],
  )

  const visibleMoreWalletGroups = useMemo(
    () => filterWalletGroups(moreWalletGroups, walletSearch),
    [moreWalletGroups, walletSearch],
  )

  const visibleDeeplinkedWalletGroups = useMemo(
    () => filterWalletGroups(deeplinkedWalletGroups, walletSearch),
    [deeplinkedWalletGroups, walletSearch],
  )

  const visibleWalletConnectGroups = useMemo(
    () => filterWalletGroups(walletConnectGroups, walletSearch),
    [walletConnectGroups, walletSearch],
  )

  const visibleReachableWalletCount =
    visibleRecentWalletGroups.length + visibleInstalledWalletGroups.length

  const shouldAutoOpenMoreWallets =
    !showAccountPanel && visibleReachableWalletCount === 0
  const isMoreWalletsListOpen = isMoreOpen || shouldAutoOpenMoreWallets

  const hasConnectedWalletSource = (
    provider: WalletProviderType,
    providers: WalletProviderEntry[] = walletProviders,
  ) => {
    const family = [
      provider,
      ...getConflictingWalletProviders(allWallets, provider),
    ]

    return providers.some(
      ({ type, status }) =>
        family.includes(type) &&
        (status === WalletProviderStatus.Connected ||
          status === WalletProviderStatus.Pending),
    )
  }

  const connectAllGroups = getConnectAllGroups(allWallets, [
    ...(activeAccount ? [activeAccount.provider] : []),
    ...walletProviders
      .filter(
        ({ status }) =>
          status === WalletProviderStatus.Connected ||
          status === WalletProviderStatus.Pending,
      )
      .map(prop("type")),
    ...recentlyUsedProviders,
  ]).filter(
    (group) =>
      !group.providers.some((provider) => hasConnectedWalletSource(provider)),
  )
  /**
   * Offered only before anything is connected. Once it starts it stays up as
   * a spinner until every wallet settles, even though the first to connect
   * flips `hasConnectedWalletState`.
   */
  const showConnectAll =
    !isNovaWalletApp() &&
    !isChainMode &&
    !walletSearch &&
    (isConnectingAll ||
      ((!hasConnectedWalletState || isPage) && connectAllGroups.length > 0))

  /**
   * Accounts the forced mode allows, narrowed by the selected wallet source.
   * `mode` is a hard bound applied unconditionally - the chips below can only
   * narrow further, never widen past it.
   */
  const modeAccounts = useMemo(() => {
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

    return filterAccounts(mode)(sourceAccounts.map(toAccount)).filter(
      (account) => !filterPageAccount || filterPageAccount(account),
    )
  }, [
    accounts,
    connectedProviderTypes,
    mode,
    selectedSource,
    filterPageAccount,
  ])

  /**
   * Flows that hide the chips keep every eligible account available in search.
   * Chips are derived from the accounts actually on screen, so a filter that
   * cannot change what is displayed is never offered. A forced mode therefore
   * renders no chips at all: one mode survives, and one chip plus All is noise.
   */
  const chipModes = useMemo(
    () =>
      meta?.hideAccountFilters ? [] : chipModesForAccounts(modeAccounts, mode),
    [meta?.hideAccountFilters, modeAccounts, mode],
  )

  /**
   * The chip set shrinks as wallets disconnect. Drop a filter that no longer
   * has a chip, otherwise it silently empties the list.
   */
  useEffect(() => {
    if (accountFilter === WalletMode.Default) return
    if (chipModes.includes(accountFilter)) return
    setAccountFilter(WalletMode.Default)
  }, [accountFilter, chipModes])

  const accountList = useMemo(
    () =>
      getFilteredAccounts(
        modeAccounts,
        currentAccount,
        accountSearch,
        accountFilter,
      ),
    [accountFilter, accountSearch, currentAccount, modeAccounts],
  )

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
      if (
        !filterAccounts(mode)([account]).length ||
        (filterPageAccount && !filterPageAccount(account))
      )
        return
      onAccountSelect(account)
      if (!isControlled) {
        toggle()
      }
    },
    [isControlled, onAccountSelect, toggle, mode, filterPageAccount],
  )

  const handleProviderSelect = (wallet: Wallet) => {
    selectSource(wallet.provider)
  }

  const handleWalletClick = (wallet: Wallet) => {
    if (modeProviders && !modeProviders.includes(wallet.provider)) return
    handleProviderSelect(wallet)

    if (
      getWalletSourceAction(wallet, getStatus(wallet.provider)) === "connect"
    ) {
      void enable(wallet.provider).catch(() => undefined)
    }
  }

  /** Page flows request authorization in sequence; the global picker keeps its existing behavior. */
  const handleConnectAll = async () => {
    if (isConnectingAll) return
    setIsConnectingAll(true)
    selectSource("all")

    const queue = connectAllGroups
      .flatMap(prop("providers"))
      .filter(
        (provider) =>
          !hasConnectedWalletSource(
            provider,
            useWeb3Connect.getState().providers,
          ),
      )
    if (isPage) {
      setConnectionResults({})
      for (const provider of queue) {
        if (
          hasConnectedWalletSource(
            provider,
            useWeb3Connect.getState().providers,
          )
        ) {
          continue
        }
        setConnectionResults((previous) => ({
          ...previous,
          [provider]: "pending",
        }))
        try {
          await enableWithDisconnectOnError(provider)
          setConnectionResults((previous) => ({
            ...previous,
            [provider]: "connected",
          }))
        } catch {
          setConnectionResults((previous) => ({
            ...previous,
            [provider]: "rejected",
          }))
        }
      }
    } else {
      await Promise.allSettled(
        queue.map((provider) => enableWithDisconnectOnError(provider)),
      )
    }

    setIsConnectingAll(false)
  }

  const handleWalletGroupSelect = (group: WalletSourceGroup) => {
    const action = getWalletSourceGroupAction(group, connectedProviderTypes)

    if (action.kind === "wallet") {
      handleWalletClick(action.wallet)
      return
    }

    selectSource(group.id)
  }

  const renderWalletGroup = (
    group: WalletSourceGroup,
    connectLabel?: string,
  ) => {
    const variant = showAccountPanel ? "management" : "firstConnection"

    if (group.wallets.length === 1) {
      const [wallet] = group.wallets

      return (
        <WalletProviderSourceButton
          key={group.id}
          wallet={wallet}
          active={!isCustomSourceSelected && selectedSource === wallet.provider}
          status={getStatus(wallet.provider)}
          pending={pendingProviderTypes.includes(wallet.provider)}
          variant={variant}
          mode={mode}
          connectLabel={connectLabel}
          onClick={() => handleWalletClick(wallet)}
          onDisconnect={() => disconnect(wallet.provider)}
        />
      )
    }

    const connectedGroupProviders = group.providers.filter((provider) =>
      connectedProviderTypes.includes(provider),
    )

    return (
      <WalletGroupSourceButton
        key={group.id}
        group={group}
        active={
          !isCustomSourceSelected &&
          (selectedSource === group.id ||
            group.providers.includes(selectedSource as WalletProviderType))
        }
        connected={connectedGroupProviders.length > 0}
        pending={group.providers.some((provider) =>
          pendingProviderTypes.includes(provider),
        )}
        variant={variant}
        mode={mode}
        connectLabel={connectLabel}
        onClick={() => handleWalletGroupSelect(group)}
        onDisconnect={() => {
          for (const provider of connectedGroupProviders) {
            disconnect(provider)
          }
        }}
      />
    )
  }

  const moreWalletsPreviewCount = 2
  // The title only separates more wallets from the sections above it
  const isMoreWalletsOnlySection =
    !showAllAccounts &&
    visibleReachableWalletCount === 0 &&
    !showConnectAll &&
    visibleDeeplinkedWalletGroups.length === 0 &&
    visibleWalletConnectGroups.length === 0 &&
    !showExternalWallet &&
    !showMultisig
  const hasCollapsedMoreWallets =
    !shouldAutoOpenMoreWallets &&
    visibleMoreWalletGroups.length > moreWalletsPreviewCount
  const visibleMoreWallets =
    !hasCollapsedMoreWallets || isMoreWalletsListOpen
      ? visibleMoreWalletGroups
      : visibleMoreWalletGroups.slice(0, moreWalletsPreviewCount)

  const selectedSourceTitle = isCustomSourceSelected
    ? customSource?.title
    : isMultisigSelected
      ? t("multisig.title")
      : (selectedWallet?.title ?? selectedWalletGroup?.title)

  return (
    <SWalletManagementShell isPage={isPage}>
      <SModalHeader
        closable={meta?.closable ?? !isPage}
        title={
          meta?.title ??
          (!isDesktop && isAccountsView && selectedSourceTitle
            ? selectedSourceTitle
            : showAccountPanel
              ? t("provider.selectSourceWallet")
              : t("provider.selectSourceWalletOnly"))
        }
        onBack={
          (isPage || !isDesktop) && isAccountsView
            ? () => setShowAccounts(false)
            : onBack
        }
        description={meta?.description}
        align="center"
      />
      {isPage && Object.entries(connectionResults).length > 0 && (
        <Flex direction="column" gap="s" px="m" pb="m">
          {Object.entries(connectionResults).map(([provider, status]) => (
            <Flex key={provider} justify="space-between">
              <Text fs="p5">
                {getWallet(provider as WalletProviderType)?.title ?? provider}
              </Text>
              <Text
                fs="p5"
                color={getToken(
                  status === "connected"
                    ? "accents.success.emphasis"
                    : "text.medium",
                )}
              >
                {t(`provider.queue.${status}`)}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
      <SModalBody noPadding scrollable={false}>
        <SLayoutGrid
          showAccountPanel={showAccountPanel}
          isPage={isPage}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "grid-template-columns" &&
              showAccountPanel
            )
              setIsPanelOpened(true)
          }}
        >
          <SSourceColumn mobileHidden={isAccountsView} isPage={isPage}>
            {!isChainMode && (
              <SSearchInput
                value={walletSearchValue}
                onChange={(event) => setWalletSearchValue(event.target.value)}
                customSize="large"
                placeholder={t("provider.searchWallets")}
              />
            )}

            <SSourceScrollFrame hasFooter={showLogOutAll}>
              <ScrollArea viewportRef={sourceViewportRef}>
                <SScrollAreaContent direction="column" gap="base">
                  {showAllAccounts && (
                    <Flex direction="column" gap="s">
                      <WalletSourceButton
                        active={
                          !isCustomSourceSelected && selectedSource === "all"
                        }
                        title={t("provider.allAccountsAndWallets")}
                        subtitle={t("provider.allAccountsCount", {
                          count: connectedAccountsCount,
                        })}
                        icon={WalletIcon}
                        onClick={() => selectSource("all")}
                      />
                    </Flex>
                  )}

                  {customSource && (
                    <WalletSourceButton
                      title={customSource.title}
                      icon={BookOpen}
                      active={isCustomSourceSelected}
                      onClick={() => {
                        selectSource("all")
                        setIsCustomSourceSelected(true)
                        setShowAccounts(true)
                      }}
                    />
                  )}

                  {visibleRecentWalletGroups.length > 0 && (
                    <Flex direction="column" gap="s">
                      <WalletSourceCategoryLabel>
                        {t("provider.recentlyUsed")}
                      </WalletSourceCategoryLabel>
                      {visibleRecentWalletGroups.map((group) =>
                        renderWalletGroup(group),
                      )}
                    </Flex>
                  )}

                  {(visibleInstalledWalletGroups.length > 0 ||
                    showConnectAll) && (
                    <Flex direction="column" gap="s">
                      {visibleInstalledWalletGroups.length > 0 && (
                        <WalletSourceCategoryLabel>
                          {t(
                            isChainMode
                              ? "provider.available"
                              : "provider.installed",
                          )}
                        </WalletSourceCategoryLabel>
                      )}
                      {visibleInstalledWalletGroups.map((group) =>
                        renderWalletGroup(group),
                      )}
                      {showConnectAll && (
                        <WalletSourceButton
                          title={t("provider.connectAll")}
                          subtitle={connectAllGroups
                            .map(prop("title"))
                            .join(", ")}
                          icon={LucideWallet}
                          iconColor="neutral"
                          pending={isConnectingAll}
                          variant={
                            showAccountPanel ? "management" : "firstConnection"
                          }
                          onClick={handleConnectAll}
                        />
                      )}
                    </Flex>
                  )}

                  {(visibleDeeplinkedWalletGroups.length > 0 ||
                    visibleWalletConnectGroups.length > 0 ||
                    showExternalWallet ||
                    showMultisig) && (
                    <Flex direction="column" gap="s">
                      <WalletSourceCategoryLabel>
                        {t("provider.other")}
                      </WalletSourceCategoryLabel>
                      {visibleDeeplinkedWalletGroups.map((group) =>
                        renderWalletGroup(group, t("provider.open")),
                      )}
                      {visibleWalletConnectGroups.map((group) =>
                        renderWalletGroup(group, t("provider.open")),
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
                          connectLabel={t("provider.open")}
                          icon={HatGlasses}
                          iconColor="dark"
                          onClick={() =>
                            selectSource(WalletProviderType.ExternalWallet)
                          }
                          onDisconnect={() =>
                            disconnect(WalletProviderType.ExternalWallet)
                          }
                        />
                      )}

                      {showMultisig && (
                        <WalletSourceButton
                          title={t("multisig.title")}
                          subtitle={t("provider.open")}
                          icon={Users}
                          iconColor="pink"
                          variant={
                            showAccountPanel ? "management" : "firstConnection"
                          }
                          active={isMultisigSelected}
                          onClick={() => {
                            setMultisigStep(
                              multisigConfigs.length > 0 ? "list" : "setup",
                            )
                            selectSource(WalletProviderType.Multisig)
                          }}
                        />
                      )}
                    </Flex>
                  )}

                  {!(isNovaWalletApp() && !isChainMode) &&
                    visibleMoreWalletGroups.length > 0 && (
                      <Flex direction="column" gap="s">
                        {!isMoreWalletsOnlySection && (
                          <WalletSourceCategoryLabel>
                            {t("provider.moreWallets")}
                          </WalletSourceCategoryLabel>
                        )}
                        {visibleMoreWallets.map((group) =>
                          renderWalletGroup(group),
                        )}
                        {hasCollapsedMoreWallets && (
                          <WalletSourceButton
                            title={
                              isMoreWalletsListOpen
                                ? t("provider.hide")
                                : t("provider.showMore")
                            }
                            icon={
                              isMoreWalletsListOpen ? ChevronUp : ChevronDown
                            }
                            iconColor="neutral"
                            variant={
                              showAccountPanel
                                ? "management"
                                : "firstConnection"
                            }
                            action={
                              <WalletSourceAction
                                icon={
                                  isMoreWalletsListOpen
                                    ? ChevronUp
                                    : ChevronDown
                                }
                              />
                            }
                            onClick={() => setIsMoreOpen((open) => !open)}
                          />
                        )}
                      </Flex>
                    )}
                </SScrollAreaContent>
              </ScrollArea>
              {showLogOutAll && (
                <SSourceFooter>
                  <WalletSourceButton
                    title={t("provider.logOutAll")}
                    icon={LogOut}
                    iconColor="red"
                    variant={
                      showAccountPanel ? "management" : "firstConnection"
                    }
                    onClick={() => {
                      disconnect()
                      sourceViewportRef.current?.scrollTo({ top: 0 })
                    }}
                  />
                </SSourceFooter>
              )}
            </SSourceScrollFrame>
          </SSourceColumn>

          <SRightPanelFrame
            aria-hidden={!showAccountPanel}
            showAccountPanel={showAccountPanel}
            isPage={isPage}
            mobileHidden={!isAccountsView}
          >
            {!isPanelOpened ? null : isCustomSourceSelected && customSource ? (
              <SRightColumn>{customSource.content}</SRightColumn>
            ) : isMultisigSelected ? (
              <SRightColumn>
                {multisigStep !== "list" && multisigConfigs.length > 0 && (
                  <Button
                    variant="muted"
                    size="small"
                    type="button"
                    flexShrink={0}
                    sx={{ alignSelf: "flex-start" }}
                    onClick={() => setMultisigStep("list")}
                  >
                    <Icon size="s" component={ChevronLeft} />
                    {t("back")}
                  </Button>
                )}
                <Box flex={1} sx={{ minHeight: 0, overflowY: "auto" }}>
                  {multisigStep === "list" ? (
                    <MultisigConfigList
                      onSelected={() => setMultisigStep("signer")}
                    />
                  ) : multisigStep === "setup" ? (
                    <MultisigSetupPanel
                      onContinue={() => setMultisigStep("signer")}
                    />
                  ) : (
                    <MultisigSignerSelect />
                  )}
                </Box>
                {multisigStep === "list" && (
                  <Button
                    variant="accent"
                    outline
                    size="large"
                    width="100%"
                    type="button"
                    flexShrink={0}
                    onClick={() => setMultisigStep("setup")}
                  >
                    <Icon size="s" component={Plus} />
                    {t("multisig.configSelect.setupNew")}
                  </Button>
                )}
              </SRightColumn>
            ) : selectedSource === WalletProviderType.ExternalWallet &&
              showExternalWallet ? (
              <SRightColumn>
                <Box flex={1} sx={{ minHeight: 0 }}>
                  <FormProvider {...externalWalletForm}>
                    <ExternalWalletForm />
                  </FormProvider>
                </Box>
              </SRightColumn>
            ) : showErrorState ? (
              <WalletConnectionState
                title={t("error.title")}
                description={error || t("error.unknown")}
                visual={
                  errorWallet
                    ? { type: "error", wallet: errorWallet }
                    : { type: "icon", icon: CircleAlert }
                }
                action={
                  recentProvider
                    ? {
                        label: t("error.retry"),
                        onClick: () =>
                          enableWithDisconnectOnError(recentProvider),
                      }
                    : undefined
                }
              />
            ) : showWalletGroupChainSelectState && selectedWalletGroup ? (
              <SRightColumn>
                <WalletChainSelectState
                  group={selectedWalletGroup}
                  getStatus={getStatus}
                  onInstall={openWalletOrInstall}
                  onSelect={handleWalletClick}
                  onDisconnect={(wallet) => disconnect(wallet.provider)}
                />
              </SRightColumn>
            ) : showSelectedWalletConnectState && selectedWallet ? (
              <WalletConnectionState
                title={selectedWallet.title}
                description={
                  selectedWalletStatus === WalletProviderStatus.Pending
                    ? t("provider.connectingWalletDescription")
                    : t("provider.walletNotInstalledDescription", {
                        wallet: selectedWallet.title,
                      })
                }
                visual={{
                  type:
                    selectedWalletStatus === WalletProviderStatus.Pending
                      ? "loading"
                      : "wallet",
                  wallet: selectedWallet,
                }}
                action={
                  selectedWalletStatus === WalletProviderStatus.Pending
                    ? {
                        label: t("provider.connectingWallet"),
                      }
                    : getWalletDeeplink(selectedWallet.provider)
                      ? {
                          label: t("provider.openInWallet", {
                            wallet: selectedWallet.title,
                          }),
                          icon: ExternalLink,
                          onClick: () => openWalletOrInstall(selectedWallet),
                        }
                      : {
                          label: t("provider.installWallet", {
                            wallet: selectedWallet.title,
                          }),
                          icon: Download,
                          disabled: !selectedWallet.installUrl,
                          onClick: () => openWalletOrInstall(selectedWallet),
                        }
                }
              />
            ) : isProvidersConnecting && pendingWallet ? (
              <WalletConnectionState
                title={t("provider.waitingForAuth")}
                description={t("provider.authorizeDescription")}
                visual={{
                  type: "loading",
                  wallet: pendingWallet,
                }}
                action={{
                  label: t("provider.connectingWallet"),
                }}
              />
            ) : (
              <SRightColumn key={selectedSource}>
                <SSearchInput
                  value={accountSearchValue}
                  onChange={(event) =>
                    setAccountSearchValue(event.target.value)
                  }
                  customSize="large"
                  placeholder={t("account.searchAccounts")}
                />

                {chipModes.length > 0 && (
                  <Flex gap="base" wrap flexShrink={0}>
                    {chipModes.map((filter) => (
                      <Button
                        key={filter}
                        variant={
                          accountFilter === filter ? "secondary" : "muted"
                        }
                        outline={accountFilter !== filter}
                        size="small"
                        minWidth={pxToRem(80)}
                        py="s"
                        onClick={() => setAccountFilter(filter)}
                      >
                        {filter === WalletMode.Default
                          ? t("accountFilter.all")
                          : getWalletModeName(filter)}
                      </Button>
                    ))}
                  </Flex>
                )}

                <Box
                  flex={1}
                  height="100%"
                  overflow="hidden"
                  sx={{ minHeight: 0 }}
                >
                  <ScrollArea>
                    <SScrollAreaContent direction="column" gap="xl">
                      {accountsWithBalances.length > 0 ? (
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
                          <WalletAccountList
                            accounts={accountsWithBalances}
                            currentAccount={currentAccount}
                            isBalanceLoading={areBalancesLoading}
                            onAccountSelect={handleAccountSelect}
                          />
                        )
                      ) : (
                        <WalletAccountsEmptyState source={emptyStateWallet} />
                      )}
                    </SScrollAreaContent>
                  </ScrollArea>
                </Box>
              </SRightColumn>
            )}
          </SRightPanelFrame>
        </SLayoutGrid>
      </SModalBody>
    </SWalletManagementShell>
  )
}

// On mobile, a wallet with a deeplink opens Hydration in its in-app browser
// instead of sending the user to the install page.
function openWalletOrInstall(wallet: Wallet) {
  const deeplink = getWalletDeeplink(wallet.provider)
  if (deeplink) {
    window.location.href = deeplink
  } else if (wallet.installUrl) {
    window.open(wallet.installUrl, "_blank", "noopener,noreferrer")
  }
}
