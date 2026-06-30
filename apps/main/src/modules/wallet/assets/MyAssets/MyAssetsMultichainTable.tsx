import {
  ClassicWallet,
  Search,
  Trash2,
  WalletExtension,
} from "@galacticcouncil/ui/assets/icons"
import TrackedWalletImage from "@galacticcouncil/ui/assets/images/TrackedWallet.png"
import {
  AccountAvatar,
  AssetLabel,
  Box,
  Button,
  DataTable,
  Flex,
  Icon,
  Image,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Skeleton,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import type { BoxProps } from "@galacticcouncil/ui/components/Box"
import type { FlexProps } from "@galacticcouncil/ui/components/Flex"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  getChainAssetId,
  getChainId,
  HYDRATION_CHAIN_KEY,
  HYDRATION_PARACHAIN_ID,
  isEvmParachainAccount,
  safeConvertAddressH160,
  safeConvertSS58toH160,
  shortenAccountAddress,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  getWalletModeByAddress,
  useAccount,
  useAddresses,
  useAddressStore,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import {
  EVM_PROVIDERS,
  SOLANA_PROVIDERS,
} from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import {
  AnyChain,
  Asset,
  AssetAmount,
  ChainEcosystem,
  EvmParachain,
} from "@galacticcouncil/xc-core"
import Big from "big.js"
import { ChevronDown, RefreshCw } from "lucide-react"
import {
  FC,
  ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"

import {
  useCrossChainBalance,
  useCrossChainBalanceSubscription,
} from "@/api/xcm"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { ChainLogo } from "@/components/ChainLogo"
import { ExternalAssetLogo } from "@/components/ExternalAssetLogo"
import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalances.data"
import { AssetDetailExpanded } from "@/modules/wallet/assets/MyAssets/AssetDetailExpanded"
import { ExpandedNativeRow } from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow"
import { MyAssetsEmptyState } from "@/modules/wallet/assets/MyAssets/MyAssetsEmptyState"
import {
  MyAsset,
  MyAssetsTableColumn,
  useMyAssetsColumns,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useClaimAllWalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.claim"
import { useWalletRewardsSectionData } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.data"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { Balance } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

type Props = {
  readonly data: Array<MyAsset>
  readonly isLoading: boolean
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
  readonly showAllAssets: boolean
  readonly onToggleShowAllAssets: () => void
  readonly activeTab: WalletPortfolioTab
  readonly onActiveTabChange: (tab: WalletPortfolioTab) => void
  readonly liquidityContent: ReactNode
  readonly bondsContent: ReactNode
  readonly strategyContent: ReactNode
  readonly trackedOnly?: boolean
}

export type WalletPortfolioTab = "assets" | "liquidity" | "strategy" | "bonds"

type AssetGroup = {
  readonly id: string
  readonly title: string
  readonly chain: AnyChain | null
  readonly totalDisplay: string
  readonly assets: Array<MyAsset>
}

type AssetGroupDraft = Omit<AssetGroup, "totalDisplay"> & {
  totalValue: Big
}

const HYDRATION_GROUP_ID = "hydration"
const EVM_WALLET_CHAIN_KEYS = ["ethereum", "base"] as const
const SOLANA_WALLET_CHAIN_KEYS = ["solana"] as const
const TRACKED_WALLET_FILTER = { isCustom: true, related: true }
const TRACKED_WALLET_GLYPH_COLORS = [
  { bg: "#53A4F3", color: "#030816" },
  { bg: "#DFB1F3", color: "#240E32" },
  { bg: "#74C742", color: "#050905" },
  { bg: "#F7BF06", color: "#0C0900" },
  { bg: "#FF9C73", color: "#100400" },
  { bg: "#64D7D9", color: "#031011" },
  { bg: "#B8D987", color: "#080E03" },
  { bg: "#F083C5", color: "#14020C" },
] as const

type TrackedWallet = ReturnType<typeof useAddresses>[number]
type WalletGlyphIconSize = number | "xs" | "s" | "m" | "l"
type ExternalWalletAssetRow = {
  readonly asset: Asset
  readonly balance?: AssetAmount
  readonly amountDisplay: string
  readonly valueDisplay: string
  readonly valueUsd: Big
  readonly registryAsset?: ReturnType<ReturnType<typeof useAssets>["getAsset"]>
}

type TrackedHydrationAssetRow = {
  readonly asset: TAsset
  readonly balance?: Balance
  readonly amountDisplay: string
  readonly valueDisplay: string
  readonly valueUsd: Big
}

export const MyAssetsMultichainTable: FC<Props> = ({
  data,
  isLoading,
  searchPhrase,
  onSearchPhraseChange,
  showAllAssets,
  onToggleShowAllAssets,
  activeTab,
  onActiveTabChange,
  liquidityContent,
  bondsContent,
  strategyContent,
  trackedOnly,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const { account } = useAccount()
  const searchInputId = useId()

  const filteredData = useMemo(() => {
    const phrase = searchPhrase.trim().toLowerCase()

    if (!phrase) return data

    return data.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(phrase) ||
        asset.name.toLowerCase().includes(phrase) ||
        asset.origin?.name.toLowerCase().includes(phrase),
    )
  }, [data, searchPhrase])

  const groups = useMemo(() => getAssetGroups(filteredData), [filteredData])
  const hydrationGroup = useMemo(
    () =>
      groups.find((group) => group.id === HYDRATION_GROUP_ID) ??
      getEmptyHydrationGroup(),
    [groups],
  )
  const externalGroups = useMemo(
    () => groups.filter((group) => group.id !== HYDRATION_GROUP_ID),
    [groups],
  )
  const connectedExternalChains = useMemo(
    () => getExternalChainsForAccount(account),
    [account],
  )
  const isHydrationPortfolio = !account?.isIncompatible
  const hasHydrationAssets = hydrationGroup.assets.length > 0
  const shouldMoveHydrationSectionToBottom =
    activeTab === "assets" &&
    !hasHydrationAssets &&
    (externalGroups.length > 0 || connectedExternalChains.length > 0)

  const hydrationSection = (
    <HydrationPortfolioSection
      group={hydrationGroup}
      isLoading={isLoading}
      showPortfolioDetails={isHydrationPortfolio}
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
      liquidityContent={liquidityContent}
      strategyContent={strategyContent}
      bondsContent={bondsContent}
    />
  )

  const externalSections =
    activeTab === "assets" && !isLoading ? (
      <>
        {externalGroups.map((group) => (
          <AssetChainGroup key={group.id} group={group} />
        ))}

        {account &&
          connectedExternalChains.map((chain) => (
            <ExternalWalletChainGroup
              key={`connected-${chain.key}`}
              address={account.rawAddress}
              chain={chain}
              showAllAssets={showAllAssets}
            />
          ))}
      </>
    ) : null

  if (trackedOnly) {
    return (
      <TrackedWalletsSection
        showAllAssets={showAllAssets}
        onToggleShowAllAssets={onToggleShowAllAssets}
        standalone
      />
    )
  }

  return (
    <Flex direction="column" gap="l">
      <Flex align="center" justify="space-between" gap="base">
        <Text as="h2" font="primary" fs="h7" fw={500} color="text.high">
          {t("myAssets.redesign.title")}
        </Text>
        <Flex align="center" gap="base">
          <Input
            id={searchInputId}
            value={searchPhrase}
            placeholder={t("common:search.placeholder.assets")}
            leadingElement={
              <Label asChild htmlFor={searchInputId}>
                <Icon
                  as="label"
                  sx={{ cursor: "text" }}
                  size="m"
                  component={Search}
                  mr="base"
                />
              </Label>
            }
            sx={{ width: 290 }}
            onChange={(e) => onSearchPhraseChange(e.target.value)}
          />
          <ToggleRoot>
            <ToggleLabel>
              {t("myAssets.redesign.showSmallBalances")}
            </ToggleLabel>
            <Toggle
              checked={showAllAssets}
              onCheckedChange={onToggleShowAllAssets}
            />
          </ToggleRoot>
        </Flex>
      </Flex>

      <Box
        sx={{
          overflow: "hidden",
          borderRadius: getToken("containers.cornerRadius.containersPrimary"),
          bg: getToken("surfaces.containers.high.primary"),
          border: "1px solid",
          borderColor: getToken("details.borders"),
          boxSizing: "border-box",
          boxShadow:
            "0px 1px 3px rgba(0, 0, 0, 0.07), 0px 4px 18px rgba(0, 0, 0, 0.01)",
        }}
      >
        {shouldMoveHydrationSectionToBottom ? (
          <>
            {externalSections}
            {hydrationSection}
          </>
        ) : (
          <>
            {hydrationSection}
            {externalSections}
          </>
        )}
      </Box>

      <TrackedWalletsSection
        showAllAssets={showAllAssets}
        onToggleShowAllAssets={onToggleShowAllAssets}
      />
    </Flex>
  )
}

const WalletOverviewHeader: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const {
    assets,
    isAssetsLoading,
    liquidity,
    isLiquidityLoading,
    borrow,
    isBorrowLoading,
    supply,
  } = useWalletBalancesSectionData()

  const rewards = useWalletRewardsSectionData()
  const claimAll = useClaimAllWalletRewards()

  const netWorth = useMemo(
    () =>
      Big(assets || 0)
        .plus(liquidity || 0)
        .minus(borrow || 0)
        .toString(),
    [assets, borrow, liquidity],
  )

  const claimableRewards = useMemo(
    () =>
      Big(rewards.incentives.value || 0)
        .plus(rewards.farming.value || 0)
        .toString(),
    [rewards.farming.value, rewards.incentives.value],
  )

  return (
    <Box sx={{ p: getToken("containers.paddings.tertiary") }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(214px, auto)",
          alignItems: "center",
          minHeight: 37,
        }}
      >
        <WalletStatCell>
          <WalletStat
            label={t("balances.header.netWorth")}
            value={t("common:currency", { value: netWorth })}
            isLoading={isAssetsLoading || isLiquidityLoading || isBorrowLoading}
          />
        </WalletStatCell>
        <StatDivider />
        <WalletStatCell>
          <WalletStat
            label={t("balances.header.assets")}
            value={t("common:currency", { value: assets })}
            isLoading={isAssetsLoading}
          />
        </WalletStatCell>
        <StatDivider />
        <WalletStatCell>
          <WalletStat
            label={t("myAssets.redesign.totalBorrow")}
            value={t("common:currency", { value: borrow })}
            isLoading={isBorrowLoading}
          />
        </WalletStatCell>
        <StatDivider />
        <WalletStatCell>
          <WalletStat
            label={t("myAssets.redesign.totalSupply")}
            value={t("common:currency", { value: supply || 0 })}
            isLoading={isBorrowLoading}
          />
        </WalletStatCell>
        <StatDivider />
        <WalletStatCell>
          <WalletStat
            label={t("balances.header.liquidity")}
            value={t("common:currency", { value: liquidity })}
            isLoading={isLiquidityLoading}
          />
        </WalletStatCell>
        <StatDivider />
        <Flex
          align="center"
          justify="flex-end"
          gap="base"
          sx={{
            pl: getToken("containers.paddings.tertiary"),
            minWidth: 0,
          }}
        >
          <WalletStat
            align="right"
            label={t("myAssets.redesign.claimableRewards")}
            value={t("common:currency", { value: claimableRewards })}
            isLoading={rewards.isLoading}
          />
          <Button
            disabled={claimAll.isPending || rewards.isEmpty}
            onClick={() => claimAll.mutate()}
            sx={primaryPillSx}
          >
            {t("myAssets.redesign.claim")}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

const WalletStatCell: FC<{ readonly children: ReactNode }> = ({ children }) => (
  <Box
    sx={{
      height: 33,
      px: getToken("containers.paddings.tertiary"),
      display: "flex",
      alignItems: "center",
      minWidth: 0,
    }}
  >
    {children}
  </Box>
)

const StatDivider: FC = () => (
  <Box
    sx={{
      alignSelf: "center",
      width: 1,
      height: 33,
      bg: getToken("details.separators"),
    }}
  />
)

const WalletStat: FC<{
  readonly label: string
  readonly value: string
  readonly isLoading?: boolean
  readonly align?: "left" | "right"
}> = ({ label, value, isLoading, align = "left" }) => (
  <Flex
    direction="column"
    gap="xs"
    align={align === "right" ? "flex-end" : "flex-start"}
  >
    <Text fs="p6" lh={1.4} color="text.medium">
      {label}
    </Text>
    {isLoading ? (
      <Skeleton width={78} height={16} />
    ) : (
      <Text font="primary" fs="p3" fw={500} lh="15px" color="text.high">
        {value}
      </Text>
    )}
  </Flex>
)

const PortfolioTabs: FC<{
  readonly activeTab: WalletPortfolioTab
  readonly onActiveTabChange: (tab: WalletPortfolioTab) => void
}> = ({ activeTab, onActiveTabChange }) => {
  const { t } = useTranslation("wallet")

  const tabs = [
    { id: "assets", label: t("myAssets.redesign.tabs.assets") },
    { id: "liquidity", label: t("myAssets.redesign.tabs.liquidity") },
    { id: "strategy", label: t("myAssets.redesign.tabs.strategy") },
    { id: "bonds", label: t("myAssets.redesign.tabs.bonds") },
  ] as const

  return (
    <Flex
      align="center"
      gap="base"
      sx={{
        height: 61,
        px: getToken("containers.paddings.tertiary"),
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: getToken("details.separators"),
        boxSizing: "border-box",
      }}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          size="small"
          variant={activeTab === tab.id ? "sliderTabActive" : "muted"}
          outline
          onClick={() => onActiveTabChange(tab.id)}
          sx={activeTab === tab.id ? activeTabSx : inactiveTabSx}
        >
          {tab.label}
        </Button>
      ))}
    </Flex>
  )
}

const HydrationPortfolioSection: FC<{
  readonly group: AssetGroup
  readonly isLoading: boolean
  readonly showPortfolioDetails: boolean
  readonly activeTab: WalletPortfolioTab
  readonly onActiveTabChange: (tab: WalletPortfolioTab) => void
  readonly liquidityContent: ReactNode
  readonly strategyContent: ReactNode
  readonly bondsContent: ReactNode
}> = ({
  group,
  isLoading,
  showPortfolioDetails,
  activeTab,
  onActiveTabChange,
  liquidityContent,
  strategyContent,
  bondsContent,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <ChainHeader
        group={group}
        isOpen={isOpen}
        onToggle={() => setIsOpen((isOpen) => !isOpen)}
      />
      <SmoothCollapse isOpen={isOpen}>
        {showPortfolioDetails && (
          <>
            <WalletOverviewHeader />
            <PortfolioTabs
              activeTab={activeTab}
              onActiveTabChange={onActiveTabChange}
            />
          </>
        )}

        <Box sx={walletShellTableSx}>
          {(!showPortfolioDetails || activeTab === "assets") &&
            (isLoading ? (
              <MultichainTableSkeleton />
            ) : group.assets.length ? (
              <AssetGroupTable group={group} />
            ) : (
              <Box sx={{ p: getToken("containers.paddings.primary") }}>
                <MyAssetsEmptyState />
              </Box>
            ))}
          {showPortfolioDetails &&
            activeTab === "liquidity" &&
            liquidityContent}
          {showPortfolioDetails && activeTab === "strategy" && strategyContent}
          {showPortfolioDetails && activeTab === "bonds" && bondsContent}
        </Box>
      </SmoothCollapse>
    </>
  )
}

const AssetChainGroup: FC<{ readonly group: AssetGroup }> = ({ group }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <ChainHeader
        group={group}
        isOpen={isOpen}
        onToggle={() => setIsOpen((isOpen) => !isOpen)}
      />
      <SmoothCollapse isOpen={isOpen}>
        <AssetGroupTable group={group} />
      </SmoothCollapse>
    </>
  )
}

const ExternalWalletChainGroup: FC<{
  readonly address: string
  readonly chain: AnyChain
  readonly refreshNonce?: number
  readonly showAllAssets: boolean
}> = ({ address, chain, refreshNonce = 0, showAllAssets }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [localRefreshNonce, setLocalRefreshNonce] = useState(0)
  const { rows, hasPositiveBalance, isLoading, totalDisplay } =
    useExternalWalletAssetRows({
      address,
      chain,
      refreshKey: `${refreshNonce}:${localRefreshNonce}`,
      showAllAssets,
    })

  if (!isLoading && !hasPositiveBalance) return null

  return (
    <>
      <ExternalChainHeader
        chain={chain}
        isOpen={isOpen}
        totalDisplay={totalDisplay}
        isLoading={isLoading}
        onRefresh={() => setLocalRefreshNonce((nonce) => nonce + 1)}
        onToggle={() => setIsOpen((isOpen) => !isOpen)}
      />
      <SmoothCollapse isOpen={isOpen}>
        <ExternalWalletAssetTable
          chain={chain}
          rows={rows}
          isLoading={isLoading}
        />
      </SmoothCollapse>
    </>
  )
}

const ExternalChainHeader: FC<{
  readonly chain: AnyChain
  readonly isOpen: boolean
  readonly totalDisplay: string
  readonly isLoading: boolean
  readonly onRefresh: () => void
  readonly onToggle: () => void
}> = ({ chain, isOpen, totalDisplay, isLoading, onRefresh, onToggle }) => {
  return (
    <Flex
      as="button"
      align="center"
      justify="space-between"
      data-state={isOpen ? "open" : "closed"}
      onClick={onToggle}
      sx={chainHeaderSx}
    >
      <Flex align="center" gap="s">
        <ChainLogo
          ecosystem={chain.ecosystem}
          chainId={getChainId(chain)}
          size="extra-small"
        />
        <Text fs="p5" fw={600} lh={1.2} color="text.high">
          {chain.name}
        </Text>
      </Flex>
      <Flex align="center" gap="base">
        {isLoading ? (
          <Skeleton width={64} height={14} />
        ) : (
          <Text fs="p6" fw={500} lh={1.4} color="text.high">
            {totalDisplay}
          </Text>
        )}
        <Button
          size="small"
          variant="muted"
          outline
          aria-label="Refresh balances"
          onClick={(e) => {
            e.stopPropagation()
            onRefresh()
          }}
          sx={refreshIconButtonSx}
        >
          <RefreshCw size={14} />
        </Button>
        <ChevronDown data-collapse-chevron size={14} color="currentColor" />
      </Flex>
    </Flex>
  )
}

const ExternalWalletAssetTable: FC<{
  readonly chain: AnyChain
  readonly rows: Array<ExternalWalletAssetRow>
  readonly isLoading: boolean
}> = ({ chain, rows, isLoading }) => {
  const { t } = useTranslation(["wallet", "common"])

  if (isLoading) {
    return <ExternalWalletAssetSkeleton />
  }

  if (!rows.length) {
    return (
      <Flex
        align="center"
        justify="center"
        sx={{
          minHeight: 64,
          px: getToken("containers.paddings.primary"),
          borderTop: "1px solid",
          borderColor: getToken("details.separators"),
        }}
      >
        <Text fs="p5" color="text.medium">
          {t("myAssets.redesign.external.empty", { chain: chain.name })}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex direction="column">
      <ExternalWalletTableHeader />
      {rows.map((row) => (
        <ExternalWalletAssetTableRow
          key={row.asset.key}
          chain={chain}
          row={row}
        />
      ))}
    </Flex>
  )
}

const ExternalWalletTableHeader = () => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Box sx={externalWalletTableHeaderSx}>
      <Text fs="p5" fw={500} color="text.low">
        {t("common:asset")}
      </Text>
      <Text fs="p5" fw={500} color="text.low">
        {t("myAssets.header.total")}
      </Text>
      <Text fs="p5" fw={500} color="text.low" sx={{ textAlign: "right" }}>
        {t("myAssets.redesign.value")}
      </Text>
    </Box>
  )
}

const ExternalWalletAssetTableRow: FC<{
  readonly chain: AnyChain
  readonly row: ExternalWalletAssetRow
}> = ({ chain, row }) => {
  const { t } = useTranslation(["common"])
  const meta = row.registryAsset
    ? {
        symbol: row.registryAsset.symbol,
        name: row.registryAsset.name,
      }
    : {
        symbol: row.asset.originSymbol,
        name: row.asset.originSymbol,
      }

  return (
    <Box sx={externalWalletTableRowSx}>
      <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
        <ExternalWalletAssetLogo chain={chain} asset={row.asset} />
        <AssetLabel symbol={meta.symbol} name={meta.name} />
      </Flex>
      <Flex direction="column" gap="xs">
        <Text fs="p4" fw={500} color="text.high">
          {t("number", {
            value: row.amountDisplay,
            symbol: row.asset.originSymbol,
          })}
        </Text>
      </Flex>
      <Text fs="p5" fw={500} color="text.medium" sx={{ textAlign: "right" }}>
        {row.valueDisplay}
      </Text>
    </Box>
  )
}

const ExternalWalletAssetLogo: FC<{
  readonly chain: AnyChain
  readonly asset: Asset
}> = ({ chain, asset }) => (
  <ExternalAssetLogo
    id={getChainAssetId(chain, asset).toString()}
    ecosystem={chain.ecosystem || ChainEcosystem.Polkadot}
    chainId={getChainId(chain) ?? ""}
    size="small"
  />
)

const ExternalWalletAssetSkeleton: FC = () => (
  <Flex direction="column">
    <Box sx={externalWalletTableHeaderSx}>
      <Skeleton width={54} height={14} />
      <Skeleton width={96} height={14} />
      <Skeleton width={58} height={14} sx={{ justifySelf: "end" }} />
    </Box>
    {Array.from({ length: 3 }).map((_, index) => (
      <Box key={index} sx={externalWalletTableRowSx}>
        <Flex align="center" gap="base">
          <Skeleton width={28} height={28} sx={{ borderRadius: "full" }} />
          <Flex direction="column" gap="xs">
            <Skeleton width={64} height={16} />
            <Skeleton width={100} height={14} />
          </Flex>
        </Flex>
        <Skeleton width={96} height={16} />
        <Skeleton width={64} height={16} sx={{ justifySelf: "end" }} />
      </Box>
    ))}
  </Flex>
)

const useExternalWalletAssetRows = ({
  address,
  chain,
  refreshKey,
  showAllAssets,
}: {
  readonly address: string
  readonly chain: AnyChain
  readonly refreshKey?: string
  readonly showAllAssets: boolean
}) => {
  const { getAsset } = useAssets()
  const registryChain = chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain
  const assets = useMemo(
    () => [...chain.assetsData.values()].map(({ asset }) => asset),
    [chain],
  )
  const priceIds = useMemo(
    () =>
      assets.map((asset) => registryChain.getBalanceAssetId(asset).toString()),
    [assets, registryChain],
  )

  const { getAssetPrice, isLoading: isAssetPriceLoading } =
    useAssetsPrice(priceIds)
  const { isLoading: isLoadingBalances } = useCrossChainBalanceSubscription(
    address,
    chain.key,
    undefined,
    refreshKey,
  )
  const { data: balances } = useCrossChainBalance(address, chain.key)
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = useState(false)

  useEffect(() => {
    setHasLoadingTimedOut(false)

    if (!isLoadingBalances && !isAssetPriceLoading) return

    const timeout = window.setTimeout(() => {
      setHasLoadingTimedOut(true)
    }, 5000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [address, chain.key, isAssetPriceLoading, isLoadingBalances])

  const hasPositiveBalance = useMemo(
    () =>
      [...(balances?.values() ?? [])].some((balance) => balance.amount > 0n),
    [balances],
  )

  const rows = useMemo(() => {
    return assets
      .map((asset): ExternalWalletAssetRow => {
        const registryId = registryChain.getBalanceAssetId(asset)
        const registryAsset = getAsset(registryId.toString())
        const balance = balances?.get(asset.key)
        const amountDisplay = balance
          ? toDecimal(balance.amount, balance.decimals)
          : "0"
        const { price } = getAssetPrice(registryId.toString())
        const valueUsd =
          balance && price ? Big(amountDisplay).times(price) : Big(0)

        return {
          asset,
          balance,
          amountDisplay,
          valueUsd,
          valueDisplay: new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
          }).format(Number(valueUsd.toString())),
          registryAsset,
        }
      })
      .filter(
        (row) =>
          showAllAssets ||
          row.valueUsd.gt(0) ||
          (row.balance?.amount ?? 0n) > 0n,
      )
      .sort((a, b) => {
        const byValue = b.valueUsd.cmp(a.valueUsd)
        if (byValue !== 0) return byValue
        return b.amountDisplay.localeCompare(a.amountDisplay, undefined, {
          numeric: true,
        })
      })
  }, [assets, balances, getAsset, getAssetPrice, registryChain, showAllAssets])

  const totalValue = useMemo(
    () => rows.reduce((total, row) => total.plus(row.valueUsd), Big(0)),
    [rows],
  )

  const totalDisplay = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(totalValue.toString())),
    [totalValue],
  )

  return {
    rows,
    hasPositiveBalance,
    totalDisplay,
    isLoading:
      !hasLoadingTimedOut && (isLoadingBalances || isAssetPriceLoading),
  }
}

const useTrackedHydrationAssetRows = ({
  address,
  refreshKey,
  showAllAssets,
}: {
  readonly address: string
  readonly refreshKey: number
  readonly showAllAssets: boolean
}) => {
  const { isApiLoaded, sdk } = useRpcProvider()
  const { native, tokens, erc20, xykShareTokens } = useAssets()
  const [balances, setBalances] = useState(new Map<string, Balance>())
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)

  const tokenAssets = useMemo(
    () => [
      ...tokens.filter((token) => token.id !== native.id),
      ...(xykShareTokens ?? []),
    ],
    [native.id, tokens, xykShareTokens],
  )
  const hydrationAssets = useMemo(
    () => [native, ...tokenAssets, ...erc20],
    [erc20, native, tokenAssets],
  )
  const tokenAssetIds = useMemo(
    () => tokenAssets.map((token) => Number(token.id)),
    [tokenAssets],
  )
  const erc20AssetIds = useMemo(
    () => erc20.map((asset) => Number(asset.id)),
    [erc20],
  )
  const priceIds = useMemo(
    () => hydrationAssets.map((asset) => asset.id),
    [hydrationAssets],
  )
  const { getAssetPrice, isLoading: isAssetPriceLoading } =
    useAssetsPrice(priceIds)

  useEffect(() => {
    setBalances(new Map())

    if (!address || !isApiLoaded) {
      setIsBalanceLoading(false)
      return
    }

    const { balance } = sdk.client
    const loaded = {
      system: false,
      tokens: tokenAssetIds.length === 0,
      erc20: erc20AssetIds.length === 0,
    }
    const markLoaded = (key: keyof typeof loaded) => {
      loaded[key] = true
      setIsBalanceLoading(!(loaded.system && loaded.tokens && loaded.erc20))
    }
    const updateBalance = (
      assetId: string,
      balance: Omit<Balance, "assetId">,
    ) => {
      setBalances((balances) => {
        const next = new Map(balances)

        if (balance.total > 0n) {
          next.set(assetId, { assetId, ...balance })
        } else {
          next.delete(assetId)
        }

        return next
      })
    }

    setIsBalanceLoading(true)

    const systemSubscription = balance.watchSystemBalance(address).subscribe({
      next: ({ balance }) => {
        updateBalance(native.id, balance)
        markLoaded("system")
      },
      error: () => markLoaded("system"),
    })

    const tokensSubscription = tokenAssetIds.length
      ? balance.watchTokensBalance(address).subscribe({
          next: (balances) => {
            const trackedIds = new Set(tokenAssetIds)

            balances.forEach(({ id, balance }) => {
              if (!trackedIds.has(id)) return

              updateBalance(id.toString(), balance)
            })

            markLoaded("tokens")
          },
          error: () => markLoaded("tokens"),
        })
      : undefined

    const ercSubscription = erc20AssetIds.length
      ? balance.watchErc20Balance(address, erc20AssetIds).subscribe({
          next: (balances) => {
            balances.forEach(({ id, balance }) => {
              updateBalance(id.toString(), balance)
            })

            markLoaded("erc20")
          },
          error: () => markLoaded("erc20"),
        })
      : undefined

    return () => {
      systemSubscription.unsubscribe()
      tokensSubscription?.unsubscribe()
      ercSubscription?.unsubscribe()
    }
  }, [
    address,
    erc20AssetIds,
    isApiLoaded,
    native.id,
    refreshKey,
    sdk.client,
    tokenAssetIds,
  ])

  const rows = useMemo(() => {
    return hydrationAssets
      .map((asset): TrackedHydrationAssetRow => {
        const balance = balances.get(asset.id)
        const amountDisplay = balance
          ? toDecimal(balance.total, asset.decimals)
          : "0"
        const { price } = getAssetPrice(asset.id)
        const valueUsd =
          balance && price ? Big(amountDisplay).times(price) : Big(0)

        return {
          asset,
          balance,
          amountDisplay,
          valueUsd,
          valueDisplay: new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
          }).format(Number(valueUsd.toString())),
        }
      })
      .filter(
        (row) =>
          showAllAssets ||
          row.valueUsd.gt(0) ||
          (row.balance?.total ?? 0n) > 0n,
      )
      .sort((a, b) => {
        const byValue = b.valueUsd.cmp(a.valueUsd)
        if (byValue !== 0) return byValue
        return b.amountDisplay.localeCompare(a.amountDisplay, undefined, {
          numeric: true,
        })
      })
  }, [balances, getAssetPrice, hydrationAssets, showAllAssets])

  const totalValue = useMemo(
    () => rows.reduce((total, row) => total.plus(row.valueUsd), Big(0)),
    [rows],
  )
  const totalDisplay = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(totalValue.toString())),
    [totalValue],
  )

  return {
    rows,
    totalDisplay,
    isLoading: isBalanceLoading || isAssetPriceLoading,
  }
}

const SmoothCollapse: FC<{
  readonly isOpen: boolean
  readonly children: ReactNode
}> = ({ isOpen, children }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useLayoutEffect(() => {
    const content = contentRef.current

    if (!content) return

    const updateHeight = () => {
      setContentHeight(content.scrollHeight)
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)

    resizeObserver.observe(content)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <Box
      sx={{
        height: isOpen ? contentHeight : 0,
        overflow: "hidden",
        transition: `height ${isOpen ? 520 : 280}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: "height",
      }}
    >
      <Box ref={contentRef} sx={{ overflow: "hidden" }}>
        {children}
      </Box>
    </Box>
  )
}

const TrackedWalletsSection: FC<{
  readonly showAllAssets: boolean
  readonly onToggleShowAllAssets: () => void
  readonly standalone?: boolean
}> = ({ showAllAssets, onToggleShowAllAssets, standalone = false }) => {
  const { t } = useTranslation("wallet")
  const { account } = useAccount()
  const relatedTrackedWallets = useAddresses(TRACKED_WALLET_FILTER)
  const trackedWallets = useMemo(
    () => (account ? relatedTrackedWallets : []),
    [account, relatedTrackedWallets],
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const refreshTrackedWallets = () => {
    setRefreshNonce((nonce) => nonce + 1)
  }

  return (
    <Flex direction="column" gap="base">
      <Flex
        align="center"
        justify="space-between"
        gap="base"
        sx={{
          pt: standalone ? 0 : getToken("scales.paddings.xxl"),
          pb: getToken("containers.paddings.secondary"),
        }}
      >
        <Flex align="center" gap="s">
          <WalletGlyph size={20} iconSize={11} />
          <Text as="h2" font="primary" fs="h7" fw={500} color="text.high">
            {t("myAssets.redesign.tracked.title")}
          </Text>
        </Flex>
        <Flex align="center" gap="base">
          <Button
            size="small"
            variant="muted"
            outline
            onClick={() => setIsModalOpen(true)}
            sx={trackedManageButtonSx}
          >
            <Icon size="xs" component={ClassicWallet} />
            {t("myAssets.redesign.tracked.manage")}
          </Button>
          <ToggleRoot>
            <ToggleLabel>
              {t("myAssets.redesign.showSmallBalances")}
            </ToggleLabel>
            <Toggle
              checked={showAllAssets}
              onCheckedChange={onToggleShowAllAssets}
            />
          </ToggleRoot>
        </Flex>
      </Flex>

      <Box sx={trackedWalletShellSx}>
        {trackedWallets.length ? (
          trackedWallets.map((wallet) => (
            <TrackedWalletGroup
              key={wallet.publicKey}
              wallet={wallet}
              refreshNonce={refreshNonce}
              onRefresh={refreshTrackedWallets}
              showAllAssets={showAllAssets}
            />
          ))
        ) : (
          <TrackedWalletSectionEmpty onManage={() => setIsModalOpen(true)} />
        )}
      </Box>

      <ManageTrackedWalletsModal
        open={isModalOpen}
        trackedWallets={trackedWallets}
        onOpenChange={setIsModalOpen}
        onSaved={refreshTrackedWallets}
      />
    </Flex>
  )
}

const TrackedWalletGroup: FC<{
  readonly wallet: TrackedWallet
  readonly refreshNonce: number
  readonly onRefresh: () => void
  readonly showAllAssets: boolean
}> = ({ wallet, refreshNonce, onRefresh, showAllAssets }) => {
  const { t } = useTranslation("wallet")
  const [isOpen, setIsOpen] = useState(true)
  const trackedAddress = useMemo(
    () => getTrackedWalletFetchAddress(wallet.address),
    [wallet.address],
  )
  const hydrationAddress = useMemo(
    () => getTrackedHydrationAddress(trackedAddress),
    [trackedAddress],
  )
  const chains = useMemo(
    () => getExternalChainsForAddress(trackedAddress),
    [trackedAddress],
  )
  const hasTrackedSources = !!hydrationAddress || chains.length > 0

  return (
    <>
      <Flex
        as="button"
        align="center"
        justify="space-between"
        data-state={isOpen ? "open" : "closed"}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
        sx={trackedWalletHeaderSx}
      >
        <Flex align="center" gap="s" sx={{ minWidth: 0 }}>
          <WalletGlyph size={20} iconSize={10} address={trackedAddress} />
          <Text fs="p6" fw={500} color="text.medium" truncate={300}>
            {shortenAccountAddress(trackedAddress, 12)}
          </Text>
        </Flex>
        <Flex align="center" gap="base">
          <Text fs="p6" fw={600} color="text.high">
            {t("myAssets.redesign.tracked.externalBalances")}
          </Text>
          <Button
            size="small"
            variant="muted"
            outline
            aria-label="Refresh balances"
            onClick={(e) => {
              e.stopPropagation()
              onRefresh()
            }}
            sx={refreshIconButtonSx}
          >
            <RefreshCw size={14} />
          </Button>
          <ChevronDown data-collapse-chevron size={14} color="currentColor" />
        </Flex>
      </Flex>
      <SmoothCollapse isOpen={isOpen}>
        {hydrationAddress && (
          <TrackedHydrationChainGroup
            address={hydrationAddress}
            refreshNonce={refreshNonce}
            showAllAssets={showAllAssets}
          />
        )}
        {chains.length
          ? chains.map((chain) => (
              <ExternalWalletChainGroup
                key={`${wallet.publicKey}-${chain.key}`}
                address={trackedAddress}
                chain={chain}
                refreshNonce={refreshNonce}
                showAllAssets={showAllAssets}
              />
            ))
          : null}
        {!hasTrackedSources && (
          <>
            <TrackedWalletTableHeader />
            <Flex
              align="center"
              justify="center"
              sx={{
                minHeight: 64,
                px: getToken("containers.paddings.primary"),
                borderTop: "1px solid",
                borderColor: getToken("details.separators"),
              }}
            >
              <Text fs="p5" color="text.medium">
                {t("myAssets.redesign.tracked.empty.balance")}
              </Text>
            </Flex>
          </>
        )}
      </SmoothCollapse>
    </>
  )
}

const TrackedHydrationChainGroup: FC<{
  readonly address: string
  readonly refreshNonce: number
  readonly showAllAssets: boolean
}> = ({ address, refreshNonce, showAllAssets }) => {
  const [isOpen, setIsOpen] = useState(true)
  const { rows, isLoading, totalDisplay } = useTrackedHydrationAssetRows({
    address,
    refreshKey: refreshNonce,
    showAllAssets,
  })

  const group = useMemo<AssetGroup>(
    () => ({
      id: HYDRATION_GROUP_ID,
      title: "Hydration",
      chain: null,
      totalDisplay,
      assets: [],
    }),
    [totalDisplay],
  )

  return (
    <>
      <ChainHeader
        group={group}
        isOpen={isOpen}
        onToggle={() => setIsOpen((isOpen) => !isOpen)}
      />
      <SmoothCollapse isOpen={isOpen}>
        <TrackedHydrationAssetTable rows={rows} isLoading={isLoading} />
      </SmoothCollapse>
    </>
  )
}

const TrackedHydrationAssetTable: FC<{
  readonly rows: Array<TrackedHydrationAssetRow>
  readonly isLoading: boolean
}> = ({ rows, isLoading }) => {
  const { t } = useTranslation(["wallet", "common"])

  if (isLoading) {
    return <ExternalWalletAssetSkeleton />
  }

  if (!rows.length) {
    return (
      <Flex
        align="center"
        justify="center"
        sx={{
          minHeight: 64,
          px: getToken("containers.paddings.primary"),
          borderTop: "1px solid",
          borderColor: getToken("details.separators"),
        }}
      >
        <Text fs="p5" color="text.medium">
          {t("myAssets.redesign.tracked.empty.balance")}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex direction="column">
      <ExternalWalletTableHeader />
      {rows.map((row) => (
        <TrackedHydrationAssetTableRow key={row.asset.id} row={row} />
      ))}
    </Flex>
  )
}

const TrackedHydrationAssetTableRow: FC<{
  readonly row: TrackedHydrationAssetRow
}> = ({ row }) => {
  const { t } = useTranslation(["common"])

  return (
    <Box sx={externalWalletTableRowSx}>
      <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
        <AssetLabelFull asset={row.asset} />
      </Flex>
      <Flex direction="column" gap="xs">
        <Text fs="p4" fw={500} color="text.high">
          {t("number", {
            value: row.amountDisplay,
            symbol: row.asset.symbol,
          })}
        </Text>
      </Flex>
      <Text fs="p5" fw={500} color="text.medium" sx={{ textAlign: "right" }}>
        {row.valueDisplay}
      </Text>
    </Box>
  )
}

const TrackedWalletTableHeader = () => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Box
      sx={{
        height: 30,
        px: getToken("containers.paddings.primary"),
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1fr) 180px minmax(220px, auto)",
        alignItems: "center",
        borderTop: "1px solid",
        borderColor: getToken("details.separators"),
      }}
    >
      <Text fs="p5" fw={500} color="text.low">
        {t("common:asset")}
      </Text>
      <Text fs="p5" fw={500} color="text.low">
        {t("myAssets.header.total")}
      </Text>
      <Text fs="p5" fw={500} color="text.low" sx={{ textAlign: "right" }}>
        {t("common:actions")}
      </Text>
    </Box>
  )
}

const TrackedWalletSectionEmpty: FC<{
  readonly onManage: () => void
}> = ({ onManage }) => {
  const { t } = useTranslation("wallet")

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="base"
      sx={{ minHeight: 180, p: getToken("containers.paddings.primary") }}
    >
      <TrackedWalletEmptyImage size={92} />
      <Flex direction="column" align="center" gap="xs">
        <Text font="primary" fs="p3" fw={500} color="text.high">
          {t("myAssets.redesign.tracked.empty.title")}
        </Text>
        <Text
          fs="p5"
          lh={1.3}
          align="center"
          color={getToken("text.medium")}
          sx={{ textWrap: "balance" }}
        >
          {t("myAssets.redesign.tracked.empty.description")}
        </Text>
      </Flex>
      <Button size="small" variant="muted" outline onClick={onManage}>
        {t("myAssets.redesign.tracked.manage")}
      </Button>
    </Flex>
  )
}

const ManageTrackedWalletsModal: FC<{
  readonly open: boolean
  readonly trackedWallets: Array<TrackedWallet>
  readonly onOpenChange: (open: boolean) => void
  readonly onSaved: () => void
}> = ({ open, trackedWallets, onOpenChange, onSaved }) => {
  const { t } = useTranslation("wallet")
  const [address, setAddress] = useState("")
  const { account } = useAccount()
  const { add, edit, remove } = useAddressStore()
  const trimmedAddress = address.trim()
  const normalizedAddress = normalizeTrackedWalletAddress(trimmedAddress)
  const trackedWalletMode = normalizedAddress
    ? getWalletModeByAddress(normalizedAddress)
    : null
  const canSave = !!account && !!trackedWalletMode
  const isAddressFormStacked = trimmedAddress.length > 42

  const saveAddress = () => {
    if (!canSave || !account || !normalizedAddress || !trackedWalletMode) return

    add({
      address: normalizedAddress,
      name: "",
      isCustom: true,
      mode: trackedWalletMode,
      savedBy: [account.publicKey],
    })
    setAddress("")
    onSaved()
  }

  const removeTrackedWallet = (wallet: TrackedWallet) => {
    if (!account) return

    const savedBy = wallet.savedBy.filter(
      (publicKey) => !stringEquals(publicKey, account.publicKey),
    )

    if (savedBy.length) {
      edit({ ...wallet, savedBy })
      return
    }

    remove(wallet.publicKey)
  }

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onOpenChange}
      animationDurationMs={180}
    >
      <ModalHeader
        align="center"
        title={t("myAssets.redesign.tracked.modal.title")}
        sx={{ border: 0, borderBottom: 0 }}
      />
      <ModalBody
        scrollable={false}
        sx={{
          pt: 0,
          borderTop: 0,
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          gap: getToken("containers.paddings.tertiary"),
        }}
      >
        <Flex
          align="center"
          gap="s"
          sx={trackedWalletAddressFormSx}
          data-stack={isAddressFormStacked ? "true" : undefined}
        >
          <Box sx={trackedWalletAddressInputSx}>
            <Input
              value={address}
              customSize="large"
              iconStart={Search}
              placeholder={t("myAssets.redesign.tracked.modal.placeholder")}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveAddress()
                }
              }}
            />
          </Box>
          {canSave && (
            <Button
              size="small"
              variant="secondary"
              onClick={saveAddress}
              sx={trackedWalletAddressSaveButtonSx}
            >
              {t("myAssets.redesign.tracked.modal.save")}
            </Button>
          )}
        </Flex>

        <Flex direction="column" gap="base">
          <Flex align="center" gap="xs">
            <WalletGlyph size={16} iconSize={8} />
            <Text fs="p5" fw={500} color="text.high">
              {t("myAssets.redesign.tracked.title")}
            </Text>
          </Flex>

          {trackedWallets.length ? (
            <Flex direction="column" gap="base">
              {trackedWallets.map((wallet) => (
                <TrackedWalletModalTile
                  key={wallet.publicKey}
                  wallet={wallet}
                  onRemove={() => removeTrackedWallet(wallet)}
                />
              ))}
            </Flex>
          ) : (
            <TrackedWalletModalEmpty />
          )}
        </Flex>
      </ModalBody>
    </Modal>
  )
}

const TrackedWalletModalTile: FC<{
  readonly wallet: TrackedWallet
  readonly onRemove: () => void
}> = ({ wallet, onRemove }) => {
  const { t } = useTranslation("wallet")

  return (
    <Flex align="center" gap="base" sx={trackedWalletModalTileSx}>
      <AccountAvatar address={wallet.address} size={32} />
      <Flex direction="column" gap="xs" sx={{ minWidth: 0, flex: 1 }}>
        <Text fs="p5" fw={500} color="text.high" truncate={200}>
          {wallet.name || t("myAssets.redesign.tracked.modal.accountName")}
        </Text>
        <Text fs="p5" color="text.medium" truncate={320}>
          {shortenAccountAddress(wallet.address, 10)}
        </Text>
      </Flex>
      <Button
        aria-label={t("myAssets.redesign.tracked.modal.remove")}
        size="small"
        variant="muted"
        outline
        onClick={onRemove}
        sx={{ minWidth: 30, px: getToken("containers.paddings.quart") }}
      >
        <Icon size="xs" component={Trash2} />
      </Button>
    </Flex>
  )
}

const TrackedWalletModalEmpty = () => {
  const { t } = useTranslation("wallet")

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="s"
      sx={{ minHeight: 278, px: 30, textAlign: "center" }}
    >
      <TrackedWalletEmptyImage size={138} />
      <Flex direction="column" align="center" gap="s">
        <Text font="primary" fs="p3" fw={500} color="text.high">
          {t("myAssets.redesign.tracked.empty.title")}
        </Text>
        <Text
          fs="p5"
          lh={1.3}
          align="center"
          color={getToken("text.medium")}
          sx={{
            maxWidth: 320,
            whiteSpace: "pre-line",
            textWrap: "balance",
          }}
        >
          {t("myAssets.redesign.tracked.empty.modalDescription")}
        </Text>
      </Flex>
    </Flex>
  )
}

const TrackedWalletEmptyImage: FC<{ readonly size: number }> = ({ size }) => (
  <Image
    src={TrackedWalletImage}
    alt=""
    sx={{
      width: size,
      height: size,
      objectFit: "cover",
      objectPosition: "center",
      flexShrink: 0,
    }}
  />
)

const normalizeTrackedWalletAddress = (address: string) => {
  if (!address) return ""

  const h160 = getTrackedWalletEvmAddress(address)
  return h160 || address
}

const getTrackedWalletFetchAddress = (address: string) => {
  const h160 = getTrackedWalletEvmAddress(address)
  return h160 || address
}

const getTrackedWalletEvmAddress = (address: string) =>
  safeConvertAddressH160(address) ||
  (isEvmParachainAccount(address) ? safeConvertSS58toH160(address) : "")

const getTrackedHydrationAddress = (address: string) => {
  if (getTrackedWalletEvmAddress(address)) return ""
  return getWalletModeByAddress(address) === WalletMode.Substrate ? address : ""
}

const getExternalChainsForAccount = (
  account: ReturnType<typeof useAccount>["account"],
) => {
  if (!account) return []

  if (EVM_PROVIDERS.includes(account.provider)) {
    return getChainsByKeys(EVM_WALLET_CHAIN_KEYS)
  }

  if (SOLANA_PROVIDERS.includes(account.provider)) {
    return getChainsByKeys(SOLANA_WALLET_CHAIN_KEYS)
  }

  return []
}

const getExternalChainsForAddress = (address: string) => {
  if (getTrackedWalletEvmAddress(address)) {
    return getChainsByKeys(EVM_WALLET_CHAIN_KEYS)
  }

  const mode = getWalletModeByAddress(address)
  if (!mode) return []

  if (mode === WalletMode.Solana) {
    return getChainsByKeys(SOLANA_WALLET_CHAIN_KEYS)
  }

  return []
}

const getChainsByKeys = (keys: readonly string[]) =>
  keys.flatMap((key) => {
    const chain = chainsMap.get(key)
    return chain ? [chain] : []
  })

const getTrackedWalletGlyphColors = (address?: string) => {
  if (!address) return TRACKED_WALLET_GLYPH_COLORS[0]

  const index = Array.from(address).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0,
  )

  return (
    TRACKED_WALLET_GLYPH_COLORS[index % TRACKED_WALLET_GLYPH_COLORS.length] ??
    TRACKED_WALLET_GLYPH_COLORS[0]
  )
}

const WalletGlyph: FC<{
  readonly size: number
  readonly iconSize: WalletGlyphIconSize
  readonly address?: string
}> = ({ size, iconSize, address }) => {
  const colors = getTrackedWalletGlyphColors(address)

  return (
    <Flex
      align="center"
      justify="center"
      sx={{
        size,
        flexShrink: 0,
        borderRadius: "full",
        bg: colors.bg,
        color: colors.color,
        overflow: "hidden",
      }}
    >
      <Icon
        size={iconSize}
        component={WalletExtension}
        sx={{ transform: "rotate(180deg)" }}
      />
    </Flex>
  )
}

const ChainHeader: FC<{
  readonly group: AssetGroup
  readonly isOpen: boolean
  readonly onToggle: () => void
}> = ({ group, isOpen, onToggle }) => {
  return (
    <Flex
      as="button"
      align="center"
      justify="space-between"
      data-state={isOpen ? "open" : "closed"}
      onClick={onToggle}
      sx={chainHeaderSx}
    >
      <Flex align="center" gap="s">
        <GroupChainLogo group={group} />
        <Text fs="p5" fw={600} lh={1.2} color="text.high">
          {group.title}
        </Text>
      </Flex>
      <Flex align="center" gap="base">
        <Text fs="p6" fw={500} lh={1.4} color="text.high">
          {group.totalDisplay}
        </Text>
        <ChevronDown data-collapse-chevron size={14} color="currentColor" />
      </Flex>
    </Flex>
  )
}

const GroupChainLogo: FC<{ readonly group: AssetGroup }> = ({ group }) => {
  if (!group.chain) {
    return (
      <ChainLogo
        ecosystem={ChainEcosystem.Polkadot}
        chainId={HYDRATION_PARACHAIN_ID}
        size="extra-small"
      />
    )
  }

  return (
    <ChainLogo
      ecosystem={group.chain.ecosystem}
      chainId={getChainId(group.chain)}
      size="extra-small"
    />
  )
}

const AssetGroupTable: FC<{ readonly group: AssetGroup }> = ({ group }) => {
  const { native } = useAssets()
  const columns = useMyAssetsColumns(false)
  const isHydrationGroup = group.id === HYDRATION_GROUP_ID

  return (
    <Box
      sx={{
        "& table": {
          backgroundColor: "transparent",
        },
        "& thead, & tbody, & tr, & td, & th": {
          backgroundColor: "transparent",
        },
        "& thead th": {
          height: 34,
          px: getToken("containers.paddings.primary"),
          color: getToken("text.low"),
        },
        "& tbody td": {
          height: 54,
          px: getToken("containers.paddings.primary"),
        },
        ...tableActionAlignmentSx,
        "& tbody tr": {
          borderTopColor: getToken("details.separators"),
        },
        "& tbody tr:hover, & tbody tr:hover td": {
          backgroundColor: getToken("surfaces.containers.high.hover"),
        },
        "& [data-expanded='true'], & [data-expanded='true'] td": {
          backgroundColor: getToken("surfaces.containers.high.hover"),
        },
      }}
    >
      <DataTable
        data={group.assets}
        columns={columns}
        size="small"
        expandable="single"
        columnVisibility={
          isHydrationGroup
            ? undefined
            : {
                [MyAssetsTableColumn.Transferable]: false,
                [MyAssetsTableColumn.Staking]: false,
              }
        }
        renderSubComponent={(asset) =>
          asset.id === native.id ? (
            <ExpandedNativeRow asset={asset} />
          ) : (
            <AssetDetailExpanded asset={asset} />
          )
        }
      />
    </Box>
  )
}

const MultichainTableSkeleton: FC = () => (
  <Flex direction="column">
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: tableSkeletonGridColumns,
        alignItems: "center",
        columnGap: 24,
        height: 34,
        px: getToken("containers.paddings.primary"),
      }}
    >
      <Skeleton width={54} height={14} />
      <Skeleton width={96} height={14} />
      <Skeleton width={140} height={14} />
      <Skeleton width={58} height={14} sx={{ justifySelf: "end" }} />
    </Box>
    {Array.from({ length: 7 }).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: "grid",
          gridTemplateColumns: tableSkeletonGridColumns,
          alignItems: "center",
          columnGap: 24,
          minHeight: 60,
          px: getToken("containers.paddings.primary"),
          borderTop: "1px solid",
          borderColor: getToken("details.separators"),
          boxSizing: "border-box",
          bg:
            index === 0
              ? getToken("surfaces.containers.high.hover")
              : undefined,
        }}
      >
        <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
          <Skeleton width={32} height={32} sx={{ borderRadius: "full" }} />
          <Flex direction="column" gap="xs">
            <Skeleton width={64} height={16} />
            <Skeleton width={112} height={14} />
          </Flex>
        </Flex>
        <Flex direction="column" gap="xs">
          <Skeleton width={96} height={16} />
          <Skeleton width={64} height={14} />
        </Flex>
        <Flex direction="column" gap="xs">
          <Skeleton width={96} height={16} />
          <Skeleton width={64} height={14} />
        </Flex>
        <Flex justify="flex-end" gap="base">
          <Skeleton width={142} height={30} sx={{ borderRadius: 999 }} />
          <Skeleton width={74} height={30} sx={{ borderRadius: 999 }} />
          <Skeleton width={74} height={30} sx={{ borderRadius: 999 }} />
        </Flex>
        <Skeleton
          width={18}
          height={18}
          sx={{ justifySelf: "end", borderRadius: "full" }}
        />
      </Box>
    ))}
  </Flex>
)

const getAssetGroups = (assets: Array<MyAsset>): Array<AssetGroup> => {
  const groups = assets.reduce((acc, asset) => {
    const id = asset.origin?.key ?? HYDRATION_GROUP_ID
    const current = acc.get(id) ?? {
      id,
      title: asset.origin?.name ?? "Hydration",
      chain: asset.origin ?? null,
      totalValue: Big(0),
      assets: [],
    }

    current.assets.push(asset)
    current.totalValue = current.totalValue.plus(asset.totalDisplay ?? 0)

    acc.set(id, current)

    return acc
  }, new Map<string, AssetGroupDraft>())

  return [...groups.values()]
    .map((group) => ({
      ...group,
      totalDisplay: new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(group.totalValue.toString())),
    }))
    .sort((a, b) => {
      if (a.id === HYDRATION_GROUP_ID) return -1
      if (b.id === HYDRATION_GROUP_ID) return 1
      return a.title.localeCompare(b.title)
    })
}

const getEmptyHydrationGroup = (): AssetGroup => ({
  id: HYDRATION_GROUP_ID,
  title: "Hydration",
  chain: null,
  totalDisplay: "$0.00",
  assets: [],
})

const chainHeaderSx: FlexProps["sx"] = {
  width: "100%",
  height: 42,
  pl: getToken("containers.paddings.primary"),
  pr: getToken("containers.paddings.quart"),
  bg: getToken("surfaces.containers.dim.dimOnBg"),
  borderBottom: "1px solid",
  borderTop: 0,
  borderLeft: 0,
  borderRight: 0,
  borderColor: getToken("details.separators"),
  boxSizing: "border-box",
  color: getToken("text.high"),
  cursor: "pointer",
  textAlign: "left",
  transition: "background-color 0.15s ease",
  "&:hover": {
    bg: getToken("surfaces.containers.high.hover"),
  },
  "&[data-state='open'] [data-collapse-chevron]": {
    transform: "rotate(180deg)",
  },
  "[data-collapse-chevron]": {
    transition: "transform 0.15s ease",
  },
}

const primaryPillSx = {
  height: 30,
  px: getToken("buttons.paddings.primary"),
  py: 0,
  borderRadius: getToken("containers.cornerRadius.buttonsPrimary"),
}

const trackedManageButtonSx = {
  ...primaryPillSx,
  gap: getToken("buttons.paddings.quart"),
  color: getToken("buttons.secondary.low.onRest"),
  bg: getToken("buttons.secondary.low.rest"),
  borderColor: getToken("buttons.secondary.low.borderRest"),
}

const refreshIconButtonSx = {
  ...trackedManageButtonSx,
  minWidth: 30,
  width: 30,
  px: 0,
}

const tabBaseSx = {
  height: 30,
  px: getToken("containers.paddings.tertiary"),
  py: 0,
  borderRadius: getToken("containers.cornerRadius.buttonsPrimary"),
  fontSize: "p6",
  lineHeight: 1.2,
}

const activeTabSx = {
  ...tabBaseSx,
  color: getToken("buttons.primary.medium.onButton"),
  bg: getToken("buttons.primary.medium.rest"),
  boxShadow: "inset 0 0 0 1px transparent",
}

const inactiveTabSx = {
  ...tabBaseSx,
  color: getToken("buttons.secondary.low.onRest"),
  bg: getToken("buttons.outlineDark.rest"),
  boxShadow: "inset 0 0 0 1px transparent",
}

const tableSkeletonGridColumns =
  "minmax(220px, 1fr) 180px 220px minmax(260px, auto) 40px"

const externalWalletTableGridColumns =
  "minmax(220px, 1fr) 180px minmax(120px, auto)"

const externalWalletTableHeaderSx: BoxProps["sx"] = {
  height: 34,
  px: getToken("containers.paddings.primary"),
  display: "grid",
  gridTemplateColumns: externalWalletTableGridColumns,
  alignItems: "center",
  columnGap: 24,
  borderTop: "1px solid",
  borderColor: getToken("details.separators"),
}

const externalWalletTableRowSx: BoxProps["sx"] = {
  minHeight: 54,
  px: getToken("containers.paddings.primary"),
  display: "grid",
  gridTemplateColumns: externalWalletTableGridColumns,
  alignItems: "center",
  columnGap: 24,
  borderTop: "1px solid",
  borderColor: getToken("details.separators"),
  boxSizing: "border-box",
  transition: "background-color 0.15s ease",
  "&:hover": {
    bg: getToken("surfaces.containers.high.hover"),
  },
}

const trackedWalletShellSx: BoxProps["sx"] = {
  overflow: "hidden",
  borderRadius: getToken("containers.cornerRadius.containersPrimary"),
  bg: getToken("surfaces.containers.high.primary"),
  border: "1px solid",
  borderColor: getToken("details.borders"),
  boxSizing: "border-box",
  boxShadow:
    "0px 1px 3px rgba(0, 0, 0, 0.07), 0px 4px 18px rgba(0, 0, 0, 0.01)",
}

const trackedWalletHeaderSx: FlexProps["sx"] = {
  width: "100%",
  height: 42,
  pl: getToken("containers.paddings.primary"),
  pr: getToken("containers.paddings.quart"),
  bg: getToken("surfaces.containers.dim.dimOnBg"),
  borderBottom: "1px solid",
  borderTop: 0,
  borderLeft: 0,
  borderRight: 0,
  borderColor: getToken("details.separators"),
  boxSizing: "border-box",
  color: getToken("text.high"),
  cursor: "pointer",
  textAlign: "left",
  transition: "background-color 0.15s ease",
  "&:hover": {
    bg: getToken("surfaces.containers.high.hover"),
  },
  "&[data-state='open'] [data-collapse-chevron]": {
    transform: "rotate(180deg)",
  },
  "[data-collapse-chevron]": {
    transition: "transform 0.15s ease",
  },
}

const trackedWalletModalTileSx: FlexProps["sx"] = {
  p: getToken("containers.paddings.secondary"),
  borderRadius: 8,
  bg: getToken("controls.dim.base"),
}

const trackedWalletAddressFormSx: FlexProps["sx"] = {
  width: "100%",
  minWidth: 0,
  flexWrap: "wrap",
  "&[data-stack='true']": {
    alignItems: "stretch",
  },
  "&[data-stack='true'] > div": {
    flexBasis: "100%",
  },
  "&[data-stack='true'] > button": {
    ml: "auto",
  },
}

const trackedWalletAddressInputSx: BoxProps["sx"] = {
  flex: "1 1 360px",
  minWidth: 0,
  "& > div": {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  input: {
    minWidth: 0,
    textOverflow: "ellipsis",
  },
}

const trackedWalletAddressSaveButtonSx: BoxProps["sx"] = {
  flexShrink: 0,
  minWidth: 92,
}

const tableActionAlignmentSx: BoxProps["sx"] = {
  "& thead th:last-of-type": {
    textAlign: "right",
  },
  "& tbody td:last-of-type": {
    width: 40,
    minWidth: 40,
    maxWidth: 40,
    px: getToken("containers.paddings.quart"),
  },
  "& tbody td:last-of-type, & tbody td:nth-last-of-type(2)": {
    textAlign: "right",
  },
  "& tbody td:nth-last-of-type(2) > *": {
    marginLeft: "auto",
  },
  "& tbody td:last-of-type > div, & tbody td:nth-last-of-type(2) > div": {
    justifyContent: "flex-end",
  },
}

const walletShellTableSx: BoxProps["sx"] = {
  "& table": {
    backgroundColor: "transparent",
  },
  "& thead, & tbody, & tr, & td, & th": {
    backgroundColor: "transparent",
  },
  "& thead th": {
    color: getToken("text.low"),
  },
  ...tableActionAlignmentSx,
  "& tbody tr": {
    borderTopColor: getToken("details.separators"),
  },
  "& tbody tr:hover, & tbody tr:hover td": {
    backgroundColor: getToken("surfaces.containers.high.hover"),
  },
  "& [data-expanded='true'], & [data-expanded='true'] td": {
    backgroundColor: getToken("surfaces.containers.high.hover"),
  },
}
