import {
  ArrowRightLong,
  ArrowUpRight,
  BadgeDollarSign,
  ChevronRight,
} from "@galacticcouncil/ui/assets/icons"
import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import {
  Amount,
  Button,
  ButtonIcon,
  Chip,
  ChipVariant,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
  PieChart,
  ScrollArea,
  Select,
  Skeleton,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  DOT_ASSET_ID,
  HDX_ASSET_ID,
  HOLLAR_ASSET_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { Link, useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { EmptyState } from "@/components/EmptyState"
import { RelativeDateText } from "@/components/RelativeDateText"
import { LINKS } from "@/config/navigation"
import {
  DashboardMarketMover,
  DashboardOpportunity,
  DashboardOpportunityKind,
  useDashboardData,
} from "@/modules/dashboard/DashboardPage.data"
import {
  SAssetIdentity,
  SCardHeader,
  SCompactFilterBar,
  SConnectedDiscovery,
  SConnectedDiscoveryHeader,
  SCuratedOpportunityList,
  SCuratedOpportunityRow,
  SDashboardCard,
  SDashboardColumn,
  SDashboardGrid,
  SDashboardPage,
  SDashboardSplitView,
  SDashboardViewToolbar,
  SDiscoveryList,
  SDiscoveryRow,
  SEarnHeader,
  SEmptyPortfolioChart,
  SEmptyState,
  SExternalAssetRow,
  SExternalPortfolioSection,
  SFilterBar,
  SFilterButton,
  SList,
  SListRow,
  SMetric,
  SMetricGrid,
  SNetWorth,
  SOpportunityCard,
  SOpportunityFooter,
  SOpportunityGrid,
  SOpportunityPill,
  SOpportunityPills,
  SOpportunityTop,
  SPlainDashboardCard,
  SPortfolioBalances,
  SPortfolioChart,
  SPortfolioContent,
  SPortfolioHeadline,
  SPositionLinkRow,
  SRewardsMetric,
} from "@/modules/dashboard/DashboardPage.styled"
import { Container, MainContent } from "@/modules/layout/components/Content"
import { PortfolioChainHeader } from "@/modules/portfolio/overview/PortfolioChainHeader"
import { BilDeposit } from "@/modules/strategies/bil/components/BilDeposit"
import { BilStrategyProvider } from "@/modules/strategies/bil/context/BilStrategyContext"
import { StableBondsDeposit } from "@/modules/strategies/stable-bonds/components/StableBondsDeposit"
import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import { StableBondsConfigProvider } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { useStableBondsOtcOrders } from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"

type OpportunityFilter = "all" | "matched" | DashboardOpportunityKind
type PortfolioPreviewTab = "assets" | "strategies" | "liquidity"
type DashboardPreviewState =
  | "live"
  | "hydration"
  | "external"
  | "empty"
  | "earner"
type StableBondsOpportunity = Omit<DashboardOpportunity, "destination"> & {
  destination: Extract<DashboardOpportunity["destination"], { type: "bonds" }>
}

const OPPORTUNITIES_LIMIT = 6
const PORTFOLIO_ASSETS_PER_PAGE = 5
const DASHBOARD_PREVIEW_STATES: DashboardPreviewState[] = [
  "live",
  "hydration",
  "external",
  "empty",
]

export const DashboardPage = () => {
  const [filter, setFilter] = useState<OpportunityFilter>("all")
  const [previewState, setPreviewState] =
    useState<DashboardPreviewState>("live")
  const [quickStartOpportunity, setQuickStartOpportunity] =
    useState<DashboardOpportunity | null>(null)
  const {
    wallet,
    netWorth,
    claimableRewards,
    isRewardsLoading,
    isWalletLoading,
    topAssets,
    walletAssets,
    isAssetsLoading,
    recentActivity,
    isActivityLoading,
    marketMovers,
    isMarketMoversLoading,
    opportunities,
    isOpportunitiesLoading,
  } = useDashboardData()

  const visibleOpportunities = useMemo(() => {
    if (filter === "all") {
      const matched = opportunities.filter(
        (opportunity) => opportunity.isMatched,
      )
      const strategies = opportunities.filter(
        (opportunity) => opportunity.kind === "strategy",
      )
      const prioritized = [
        ...matched.slice(0, 3),
        ...strategies,
        ...opportunities,
      ]
      const unique = Array.from(
        new Map(
          prioritized.map((opportunity) => [opportunity.id, opportunity]),
        ).values(),
      )

      return unique.slice(0, OPPORTUNITIES_LIMIT)
    }

    return opportunities
      .filter((opportunity) =>
        filter === "matched"
          ? opportunity.isMatched
          : opportunity.kind === filter,
      )
      .slice(0, OPPORTUNITIES_LIMIT)
  }, [filter, opportunities])

  const allocationTotal = Big(wallet.assets || 0)
    .plus(wallet.liquidity || 0)
    .plus(wallet.borrow || 0)
  const assetAllocation = allocationTotal.gt(0)
    ? Big(wallet.assets || 0)
        .div(allocationTotal)
        .times(100)
        .toNumber()
    : 0
  const liquidityAllocation = allocationTotal.gt(0)
    ? Big(wallet.liquidity || 0)
        .div(allocationTotal)
        .times(100)
        .toNumber()
    : 0
  const borrowedAllocation = allocationTotal.gt(0)
    ? Big(wallet.borrow || 0)
        .div(allocationTotal)
        .times(100)
        .toNumber()
    : 0

  const resolvedState = previewState === "live" ? "disconnected" : previewState
  const isLiveWallet = false

  return (
    <Container>
      <MainContent>
        <SDashboardPage>
          <DashboardStateToolbar
            value={previewState}
            onChange={setPreviewState}
          />

          {resolvedState === "hydration" && (
            <SDashboardSplitView>
              <SDashboardColumn>
                <PortfolioCard
                  accountConnected
                  netWorth={isLiveWallet ? netWorth : "3226.86"}
                  claimableRewards={isLiveWallet ? claimableRewards : "42.18"}
                  isRewardsLoading={isLiveWallet && isRewardsLoading}
                  assets={isLiveWallet ? wallet.assets : "2550.20"}
                  liquidity={isLiveWallet ? wallet.liquidity : "704.69"}
                  borrowed={isLiveWallet ? wallet.borrow : "28.04"}
                  assetAllocation={isLiveWallet ? assetAllocation : 77.69}
                  liquidityAllocation={
                    isLiveWallet ? liquidityAllocation : 21.46
                  }
                  borrowedAllocation={isLiveWallet ? borrowedAllocation : 0.85}
                  isLoading={isLiveWallet && isWalletLoading}
                />
                {isLiveWallet ? (
                  <>
                    <PositionsCard
                      accountConnected
                      transparent
                      positions={topAssets}
                      isLoading={isAssetsLoading}
                    />
                    <ActivityCard
                      accountConnected
                      transparent
                      activity={recentActivity}
                      isLoading={isActivityLoading}
                    />
                  </>
                ) : (
                  <>
                    <PreviewAssetsCard />
                    <PreviewActivityCard />
                  </>
                )}
              </SDashboardColumn>

              <SDashboardColumn>
                {isLiveWallet ? (
                  <EarnOptionsCard
                    opportunities={opportunities}
                    walletAssets={walletAssets}
                    isLoading={isOpportunitiesLoading || isAssetsLoading}
                    onQuickStart={setQuickStartOpportunity}
                  />
                ) : (
                  <PreviewIdleCapitalCard
                    opportunities={opportunities}
                    onQuickStart={setQuickStartOpportunity}
                  />
                )}
                <EarnOpportunitiesSection
                  accountConnected
                  compact
                  filter={filter}
                  onFilterChange={setFilter}
                  opportunities={visibleOpportunities}
                  isLoading={isOpportunitiesLoading}
                  onQuickStart={setQuickStartOpportunity}
                />
              </SDashboardColumn>
            </SDashboardSplitView>
          )}

          {resolvedState === "external" && (
            <ExternalFundsState
              opportunities={opportunities}
              filter={filter}
              onFilterChange={setFilter}
              isLoading={isOpportunitiesLoading}
              onQuickStart={setQuickStartOpportunity}
            />
          )}

          {resolvedState === "empty" && (
            <SDashboardSplitView>
              <SDashboardColumn>
                <PortfolioCard
                  accountConnected
                  isEmpty
                  netWorth="0"
                  claimableRewards="0"
                  isRewardsLoading={false}
                  assets="0"
                  liquidity="0"
                  borrowed="0"
                  assetAllocation={0}
                  liquidityAllocation={0}
                  borrowedAllocation={0}
                  isLoading={false}
                />
                <EmptyWalletStarterCard />
              </SDashboardColumn>

              <SDashboardColumn>
                <EarnOpportunitiesSection
                  accountConnected
                  walletEmpty
                  compact
                  filter="all"
                  onFilterChange={setFilter}
                  opportunities={opportunities.slice(0, OPPORTUNITIES_LIMIT)}
                  isLoading={isOpportunitiesLoading}
                  onQuickStart={setQuickStartOpportunity}
                />
              </SDashboardColumn>
            </SDashboardSplitView>
          )}

          {resolvedState === "earner" && (
            <ActiveEarnerState
              opportunities={opportunities}
              filter={filter}
              onFilterChange={setFilter}
              isLoading={isOpportunitiesLoading}
              onQuickStart={setQuickStartOpportunity}
            />
          )}

          {resolvedState === "disconnected" && (
            <>
              <EarnOpportunitiesSection
                accountConnected={false}
                filter={filter}
                onFilterChange={setFilter}
                opportunities={visibleOpportunities}
                isLoading={isOpportunitiesLoading}
                onQuickStart={setQuickStartOpportunity}
              />
              <GuestDiscovery
                movers={marketMovers}
                isLoading={isMarketMoversLoading}
              />
            </>
          )}

          {resolvedState !== "disconnected" && (
            <ConnectedDiscovery
              movers={marketMovers}
              isMoversLoading={isMarketMoversLoading}
            />
          )}

          <DashboardOpportunityModal
            opportunity={quickStartOpportunity}
            open={quickStartOpportunity !== null}
            onOpenChange={(open) => {
              if (!open) setQuickStartOpportunity(null)
            }}
          />
        </SDashboardPage>
      </MainContent>
    </Container>
  )
}

const DashboardStateToolbar = ({
  value,
  onChange,
}: {
  value: DashboardPreviewState
  onChange: (value: DashboardPreviewState) => void
}) => {
  const { t } = useTranslation("dashboard")
  const items = DASHBOARD_PREVIEW_STATES.map((state) => ({
    key: state,
    label: t(`statePreview.${state}`),
  }))

  return (
    <SDashboardViewToolbar>
      <Text fs="p5" color={getToken("text.low")}>
        {t("statePreview.label")}
      </Text>
      <SFilterBar data-state-tabs aria-label={t("statePreview.label")}>
        {DASHBOARD_PREVIEW_STATES.map((state) => (
          <DashboardStateButton
            key={state}
            state={state}
            selected={value}
            onSelect={onChange}
          >
            {t(`statePreview.${state}`)}
          </DashboardStateButton>
        ))}
      </SFilterBar>
      <Flex data-state-select sx={{ display: "none" }}>
        <Select
          size="small"
          value={value}
          items={items}
          onValueChange={onChange}
        />
      </Flex>
    </SDashboardViewToolbar>
  )
}

const PREVIEW_ASSETS = [
  {
    id: USDC_ASSET_ID,
    symbol: "USDC",
    name: "USD Coin (Ethereum native)",
    value: "635.53",
    amount: "635.8143",
  },
  {
    id: USDT_ASSET_ID,
    symbol: "USDT",
    name: "Tether (Ethereum native)",
    value: "608.45",
    amount: "608.6272",
  },
  {
    id: USDT_ASSET_ID,
    symbol: "USDT",
    name: "Tether",
    value: "395.80",
    amount: "395.8042",
  },
  {
    id: HOLLAR_ASSET_ID,
    symbol: "HOLLAR",
    name: "Hydration Dollar",
    value: "325.24",
    amount: "325.2400",
  },
  {
    id: DOT_ASSET_ID,
    symbol: "DOT",
    name: "Polkadot",
    value: "145.45",
    amount: "31.1324",
  },
] as const

const PREVIEW_EXTERNAL_ASSETS = [
  {
    id: USDC_ASSET_ID,
    symbol: "USDC",
    name: "USD Coin",
    value: "1840.32",
    amount: "1840.8241",
    assetKey: "usdc",
  },
  {
    id: USDT_ASSET_ID,
    symbol: "USDT",
    name: "Tether",
    value: "979.82",
    amount: "980.0137",
    assetKey: "usdt",
  },
] as const

const PREVIEW_EARNER_IDLE_ASSETS = [
  {
    id: USDC_ASSET_ID,
    symbol: "USDC",
    name: "USD Coin (Ethereum native)",
    value: "401.57",
    amount: "401.7504",
  },
  {
    id: HOLLAR_ASSET_ID,
    symbol: "HOLLAR",
    name: "Hydration Dollar",
    value: "300.00",
    amount: "300.0000",
  },
  {
    id: USDT_ASSET_ID,
    symbol: "USDT",
    name: "Tether",
    value: "175.44",
    amount: "175.4902",
  },
  {
    id: DOT_ASSET_ID,
    symbol: "DOT",
    name: "Polkadot",
    value: "93.21",
    amount: "19.9593",
  },
] as const

const PreviewAssetsCard = () => {
  const { t } = useTranslation(["dashboard", "common"])
  const [activeTab, setActiveTab] = useState<PortfolioPreviewTab>("assets")

  return (
    <SDashboardCard transparent>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:positions.title")}
        </Text>
        <Button variant="muted" size="small" asChild>
          <Link to={LINKS.portfolio}>{t("dashboard:portfolio.view")}</Link>
        </Button>
      </SCardHeader>
      <Flex
        mb="m"
        width="100%"
        sx={{ "& > [role='group']": { width: "100%" } }}
      >
        <ToggleGroup<PortfolioPreviewTab>
          type="single"
          size="small"
          value={activeTab}
          onValueChange={(value) => value && setActiveTab(value)}
          aria-label={t("dashboard:positions.filters")}
        >
          <ToggleGroupItem value="assets">Assets</ToggleGroupItem>
          <ToggleGroupItem value="strategies">Strategies</ToggleGroupItem>
          <ToggleGroupItem value="liquidity">Liquidity</ToggleGroupItem>
        </ToggleGroup>
      </Flex>

      {activeTab === "assets" && (
        <ScrollArea height="14rem" width="100%">
          <SList sx={{ pr: "m" }}>
            {PREVIEW_ASSETS.map((asset, index) => (
              <SListRow key={`${asset.id}-${index}`}>
                <SAssetIdentity>
                  <AssetLogo id={asset.id} size="small" />
                  <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
                    <Text fs="p4" fw={600} truncate>
                      {asset.symbol}
                    </Text>
                    <Text fs="p6" color={getToken("text.low")} truncate>
                      {asset.name}
                    </Text>
                  </Flex>
                </SAssetIdentity>
                <Flex align="center" gap="m">
                  <Flex direction="column" gap="xs" align="flex-end">
                    <Text fs="p4" fw={600}>
                      {t("common:currency", { value: asset.value })}
                    </Text>
                    <Text fs="p6" color={getToken("text.low")}>
                      {asset.amount}
                    </Text>
                  </Flex>
                  <Button variant="muted" size="small" asChild>
                    <Link
                      to={LINKS.swapMarket}
                      search={{ assetIn: HOLLAR_ASSET_ID, assetOut: asset.id }}
                    >
                      {t("dashboard:actions.trade")}
                    </Link>
                  </Button>
                </Flex>
              </SListRow>
            ))}
          </SList>
        </ScrollArea>
      )}

      {activeTab === "strategies" && (
        <Flex py="xl" justify="center">
          <Text fs="p4" color={getToken("text.low")}>
            No strategy positions yet.
          </Text>
        </Flex>
      )}

      {activeTab === "liquidity" && (
        <SList>
          <SListRow>
            <SAssetIdentity>
              <AssetLogo id={[USDT_ASSET_ID, HOLLAR_ASSET_ID]} size="small" />
              <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
                <Text fs="p4" fw={600} truncate>
                  USDT / HOLLAR
                </Text>
                <Text fs="p6" color={getToken("text.low")} truncate>
                  Omnipool position
                </Text>
              </Flex>
            </SAssetIdentity>
            <Flex align="center" gap="m">
              <Text fs="p4" fw={600}>
                {t("common:currency", { value: "704.69" })}
              </Text>
              <Button variant="muted" size="small" asChild>
                <Link to={LINKS.liquidity} search={{ myLiquidity: true }}>
                  {t("dashboard:earner.manage")}
                </Link>
              </Button>
            </Flex>
          </SListRow>
        </SList>
      )}
    </SDashboardCard>
  )
}

const PreviewActivityCard = () => {
  const { t } = useTranslation("dashboard")
  const rows = [
    [
      { id: HOLLAR_ASSET_ID, symbol: "HOLLAR" },
      { id: HDX_ASSET_ID, symbol: "HDX" },
      "359.0232 HDX",
      "−3.9092 HOLLAR",
      "1d ago",
    ],
    [
      { id: HOLLAR_ASSET_ID, symbol: "HOLLAR" },
      { id: HDX_ASSET_ID, symbol: "HDX" },
      "309.2081 HDX",
      "−3.3333 HOLLAR",
      "1d ago",
    ],
    [
      { id: USDC_ASSET_ID, symbol: "USDC" },
      { id: HOLLAR_ASSET_ID, symbol: "HOLLAR" },
      "248.12 HOLLAR",
      "−250 USDC",
      "3d ago",
    ],
  ] as const

  return (
    <SDashboardCard transparent>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("activity.title")}
        </Text>
        <Button variant="muted" size="small" asChild>
          <Link to={LINKS.swapMarket} search={{ tab: "myActivity" }}>
            {t("common.viewAll")}
          </Link>
        </Button>
      </SCardHeader>
      <SList>
        {rows.map(([from, to, received, spent, date]) => (
          <SListRow key={`${from.id}-${to.id}-${received}`}>
            <Flex direction="column" gap="xs">
              <TransactionPair from={from} to={to} />
              <Text fs="p6" color={getToken("text.low")}>
                {date}
              </Text>
            </Flex>
            <Flex direction="column" gap="xs" align="flex-end">
              <Text fs="p4" fw={600}>
                {received}
              </Text>
              <Text fs="p6" color={getToken("text.low")}>
                {spent}
              </Text>
            </Flex>
          </SListRow>
        ))}
      </SList>
    </SDashboardCard>
  )
}

const TransactionPair = ({
  from,
  to,
}: {
  from: { id: string; symbol: string }
  to: { id: string; symbol: string }
}) => (
  <Flex align="center" gap="s">
    <AssetLogo id={from.id} size="small" />
    <Text fs="p4" fw={600}>
      {from.symbol}
    </Text>
    <Icon
      component={ArrowRightLong}
      size="s"
      color={getToken("icons.onContainer")}
    />
    <AssetLogo id={to.id} size="small" />
    <Text fs="p4" fw={600}>
      {to.symbol}
    </Text>
  </Flex>
)

const PreviewIdleCapitalCard = ({
  opportunities,
  onQuickStart,
  context = "hydration",
}: {
  opportunities: DashboardOpportunity[]
  onQuickStart: (opportunity: DashboardOpportunity) => void
  context?: "hydration" | "external" | "earner"
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const navigate = useNavigate()
  const bil = opportunities.find(
    (opportunity) => opportunity.destination.type === "bil",
  )
  const bonds = opportunities.find(
    (opportunity) => opportunity.destination.type === "bonds",
  )
  const options = [bil, bonds].filter(Boolean) as DashboardOpportunity[]
  const assets =
    context === "external"
      ? PREVIEW_EXTERNAL_ASSETS
      : context === "earner"
        ? PREVIEW_EARNER_IDLE_ASSETS.slice(0, 3)
        : PREVIEW_ASSETS.slice(0, 3)
  const idleValue =
    context === "external"
      ? "2820.14"
      : context === "earner"
        ? "970.22"
        : "1623.79"

  return (
    <SPlainDashboardCard>
      <SCardHeader>
        <Flex direction="column" gap="xs">
          <Text as="h2" fs="h7" fw={600} font="primary">
            {context === "external"
              ? t("dashboard:external.optionsTitle")
              : t("dashboard:spotlight.options")}
          </Text>
          <Text fs="p4" color={getToken("text.low")}>
            {context === "external"
              ? t("dashboard:external.description")
              : t("dashboard:spotlight.description")}
          </Text>
        </Flex>
        <Flex direction="column" gap="xs" align="flex-end">
          <Text fs="h7" fw={600} font="primary">
            {t("common:currency", { value: idleValue })}
          </Text>
          <Text fs="p6" color={getToken("text.low")}>
            {context === "external"
              ? t("dashboard:external.onChain")
              : t("dashboard:spotlight.idleBalance")}
          </Text>
        </Flex>
      </SCardHeader>
      <SCuratedOpportunityList>
        {assets.map((asset, assetIndex) => (
          <SCuratedOpportunityRow key={`${asset.id}-${assetIndex}`}>
            <SAssetIdentity>
              <AssetLogo id={asset.id} size="small" />
              <Amount
                value={`${asset.amount} ${asset.symbol}`}
                displayValue={t("common:currency", { value: asset.value })}
              />
            </SAssetIdentity>
            <SOpportunityPills>
              {options.map((opportunity, opportunityIndex) => (
                <Tooltip
                  key={opportunity.id}
                  asChild
                  size="small"
                  side="bottom"
                  text={
                    context === "external"
                      ? t("dashboard:external.moveTooltip")
                      : null
                  }
                >
                  <SOpportunityPill
                    type="button"
                    onClick={() => {
                      if (context === "external") {
                        navigate({
                          to: LINKS.crossChain,
                          search: {
                            srcChain: "ethereum",
                            srcAsset:
                              "assetKey" in asset ? asset.assetKey : "usdc",
                          },
                        })
                        return
                      }

                      onQuickStart(opportunity)
                    }}
                  >
                    <span>{getEarnOptionLabel(opportunity)}</span>
                    <strong>
                      {getPotentialApr(
                        opportunity,
                        assetIndex,
                        opportunityIndex,
                      )}
                      % APR
                    </strong>
                    <AssetLogo id={opportunity.logoIds} size="extra-small" />
                    <span data-opportunity-chevron aria-hidden="true">
                      <Icon component={ChevronRight} size={10} />
                    </span>
                  </SOpportunityPill>
                </Tooltip>
              ))}
            </SOpportunityPills>
          </SCuratedOpportunityRow>
        ))}
      </SCuratedOpportunityList>
    </SPlainDashboardCard>
  )
}

const ExternalFundsState = ({
  opportunities,
  filter,
  onFilterChange,
  isLoading,
  onQuickStart,
}: {
  opportunities: DashboardOpportunity[]
  filter: OpportunityFilter
  onFilterChange: (filter: OpportunityFilter) => void
  isLoading: boolean
  onQuickStart: (opportunity: DashboardOpportunity) => void
}) => {
  return (
    <SDashboardSplitView>
      <SDashboardColumn>
        <PortfolioCard
          accountConnected
          badge="Ethereum"
          netWorth="2820.14"
          claimableRewards="0"
          isRewardsLoading={false}
          assets="2820.14"
          liquidity="0"
          borrowed="0"
          assetAllocation={100}
          liquidityAllocation={0}
          borrowedAllocation={0}
          isLoading={false}
        />
        <PreviewExternalAssetsCard />
      </SDashboardColumn>
      <SDashboardColumn>
        <PreviewIdleCapitalCard
          context="external"
          opportunities={opportunities}
          onQuickStart={onQuickStart}
        />
        <EarnOpportunitiesSection
          accountConnected={false}
          compact
          context="external"
          filter={filter}
          onFilterChange={onFilterChange}
          opportunities={opportunities.slice(0, OPPORTUNITIES_LIMIT)}
          isLoading={isLoading}
          onQuickStart={onQuickStart}
        />
      </SDashboardColumn>
    </SDashboardSplitView>
  )
}

const ActiveEarnerState = ({
  opportunities,
  filter,
  onFilterChange,
  isLoading,
  onQuickStart,
}: {
  opportunities: DashboardOpportunity[]
  filter: OpportunityFilter
  onFilterChange: (filter: OpportunityFilter) => void
  isLoading: boolean
  onQuickStart: (opportunity: DashboardOpportunity) => void
}) => {
  const { t } = useTranslation("dashboard")
  const investedPositions = new Map<string, string>()
  const bonds = opportunities.find(
    (opportunity) => opportunity.destination.type === "bonds",
  )
  const bil = opportunities.find(
    (opportunity) => opportunity.destination.type === "bil",
  )
  const liquidity = opportunities.find(
    (opportunity) => opportunity.kind === "liquidity",
  )

  if (bonds) investedPositions.set(bonds.id, "1420.00")
  if (bil) investedPositions.set(bil.id, "860.00")
  if (liquidity) investedPositions.set(liquidity.id, "704.69")

  const prioritizedOpportunities = opportunities
    .toSorted(
      (a, b) =>
        Number(investedPositions.has(b.id)) -
        Number(investedPositions.has(a.id)),
    )
    .slice(0, OPPORTUNITIES_LIMIT)

  return (
    <SDashboardSplitView>
      <SDashboardColumn>
        <PortfolioCard
          accountConnected
          assetsLabel={t("portfolio.assetsAndStrategies")}
          netWorth="3926.87"
          claimableRewards="86.42"
          isRewardsLoading={false}
          assets="3250.22"
          liquidity="704.69"
          borrowed="28.04"
          assetAllocation={81.6}
          liquidityAllocation={17.69}
          borrowedAllocation={0.71}
          isLoading={false}
        />
        <PreviewEarningPositionsCard
          bondsOpportunity={bonds}
          bilOpportunity={bil}
          liquidityOpportunity={liquidity}
        />
        <PreviewActivityCard />
      </SDashboardColumn>
      <SDashboardColumn>
        <PreviewIdleCapitalCard
          context="earner"
          opportunities={opportunities}
          onQuickStart={onQuickStart}
        />
        <EarnOpportunitiesSection
          accountConnected
          compact
          context="earner"
          filter={filter}
          onFilterChange={onFilterChange}
          opportunities={prioritizedOpportunities}
          isLoading={isLoading}
          onQuickStart={onQuickStart}
          investedPositions={investedPositions}
        />
      </SDashboardColumn>
    </SDashboardSplitView>
  )
}

const PreviewExternalAssetsCard = () => {
  const { t } = useTranslation(["dashboard", "common"])

  return (
    <SDashboardCard transparent>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:positions.title")}
        </Text>
      </SCardHeader>
      <SExternalPortfolioSection>
        <CollapsibleRoot defaultOpen>
          <CollapsibleTrigger asChild>
            <PortfolioChainHeader
              isExpandable
              name="Ethereum"
              chainId={1}
              ecosystem={ChainEcosystem.Ethereum}
              totalDisplay={t("common:currency", { value: "2820.14" })}
              isLoading={false}
            />
          </CollapsibleTrigger>
          <CollapsibleContent animationDurationMs={400}>
            <SList>
              {PREVIEW_EXTERNAL_ASSETS.map((asset) => (
                <SExternalAssetRow key={asset.id}>
                  <SAssetIdentity>
                    <AssetLogo id={asset.id} size="small" />
                    <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
                      <Text fs="p4" fw={600} truncate>
                        {asset.symbol}
                      </Text>
                      <Text fs="p6" color={getToken("text.low")} truncate>
                        {asset.name}
                      </Text>
                    </Flex>
                  </SAssetIdentity>
                  <Flex align="center" gap="m">
                    <Flex direction="column" gap="xs" align="flex-end">
                      <Text fs="p4" fw={600}>
                        {t("common:currency", { value: asset.value })}
                      </Text>
                      <Text fs="p6" color={getToken("text.low")}>
                        {asset.amount}
                      </Text>
                    </Flex>
                    <Button variant="muted" size="small" asChild>
                      <Link
                        to={LINKS.crossChain}
                        search={{
                          srcChain: "ethereum",
                          srcAsset: asset.assetKey,
                        }}
                      >
                        {t("dashboard:actions.move")}
                      </Link>
                    </Button>
                  </Flex>
                </SExternalAssetRow>
              ))}
            </SList>
          </CollapsibleContent>
        </CollapsibleRoot>
      </SExternalPortfolioSection>
    </SDashboardCard>
  )
}

const PreviewEarningPositionsCard = ({
  bondsOpportunity,
  bilOpportunity,
  liquidityOpportunity,
}: {
  bondsOpportunity?: DashboardOpportunity
  bilOpportunity?: DashboardOpportunity
  liquidityOpportunity?: DashboardOpportunity
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const [activeTab, setActiveTab] = useState<PortfolioPreviewTab>("assets")
  const getRateLabel = (
    opportunity: DashboardOpportunity | undefined,
    fallbackRate: string,
  ) =>
    `${t("common:percent", {
      value: opportunity?.rate ?? fallbackRate,
    })} APR`
  const positions = [
    {
      name: bondsOpportunity?.title ?? "HOLLAR Bonds",
      detail: getRateLabel(bondsOpportunity, "6.57"),
      value: "1420.00",
      logoId: bondsOpportunity?.logoIds ?? HOLLAR_ASSET_ID,
      destination:
        bondsOpportunity?.destination ??
        ({ type: "bonds", bondId: "" } as const),
    },
    {
      name: bilOpportunity?.title ?? "Brazilian Invoice Loans",
      detail: getRateLabel(bilOpportunity, "8.43"),
      value: "860.00",
      logoId: bilOpportunity?.logoIds ?? HOLLAR_ASSET_ID,
      destination: bilOpportunity?.destination ?? ({ type: "bil" } as const),
    },
    {
      name: liquidityOpportunity?.title ?? "Liquidity position",
      detail: getRateLabel(liquidityOpportunity, "0"),
      value: "704.69",
      logoId: liquidityOpportunity?.logoIds ?? USDT_ASSET_ID,
      destination: liquidityOpportunity?.destination,
    },
  ]

  return (
    <SDashboardCard transparent>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:earner.portfolioPositions")}
        </Text>
        <Button variant="muted" size="small" asChild>
          <Link to={LINKS.portfolio}>{t("dashboard:portfolio.view")}</Link>
        </Button>
      </SCardHeader>
      <Flex
        mb="m"
        width="100%"
        sx={{ "& > [role='group']": { width: "100%" } }}
      >
        <ToggleGroup<PortfolioPreviewTab>
          type="single"
          size="small"
          value={activeTab}
          onValueChange={(value) => value && setActiveTab(value)}
          aria-label={t("dashboard:positions.filters")}
        >
          <ToggleGroupItem value="assets">Assets</ToggleGroupItem>
          <ToggleGroupItem value="strategies">Strategies</ToggleGroupItem>
          <ToggleGroupItem value="liquidity">Liquidity</ToggleGroupItem>
        </ToggleGroup>
      </Flex>

      {activeTab === "assets" && (
        <ScrollArea height="14rem" width="100%">
          <SList sx={{ pr: "m" }}>
            {PREVIEW_EARNER_IDLE_ASSETS.map((asset, index) => (
              <SListRow key={`${asset.id}-${index}`}>
                <SAssetIdentity>
                  <AssetLogo id={asset.id} size="small" />
                  <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
                    <Text fs="p4" fw={600} truncate>
                      {asset.symbol}
                    </Text>
                    <Text fs="p6" color={getToken("text.low")} truncate>
                      {asset.name}
                    </Text>
                  </Flex>
                </SAssetIdentity>
                <Flex align="center" gap="m">
                  <Flex direction="column" gap="xs" align="flex-end">
                    <Text fs="p4" fw={600}>
                      {t("common:currency", { value: asset.value })}
                    </Text>
                    <Text fs="p6" color={getToken("text.low")}>
                      {asset.amount}
                    </Text>
                  </Flex>
                  <Button variant="muted" size="small" asChild>
                    <Link
                      to={LINKS.swapMarket}
                      search={{ assetIn: asset.id, assetOut: HOLLAR_ASSET_ID }}
                    >
                      {t("dashboard:actions.trade")}
                    </Link>
                  </Button>
                </Flex>
              </SListRow>
            ))}
          </SList>
        </ScrollArea>
      )}

      {activeTab === "strategies" && (
        <SList>
          {positions.slice(0, 2).map((position) => (
            <PreviewEarningPositionRow
              key={position.name}
              position={position}
            />
          ))}
        </SList>
      )}

      {activeTab === "liquidity" && (
        <SList>
          {positions.slice(2).map((position) => (
            <PreviewEarningPositionRow
              key={position.name}
              position={position}
            />
          ))}
        </SList>
      )}
    </SDashboardCard>
  )
}

const PreviewEarningPositionRow = ({
  position,
}: {
  position: {
    name: string
    detail: string
    value: string
    logoId: string | string[]
    destination?: DashboardOpportunity["destination"]
  }
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const content = (
    <SPositionLinkRow>
      <SAssetIdentity>
        <AssetLogo id={position.logoId} size="small" />
        <Flex direction="column" gap="xs">
          <Text fs="p4" fw={600}>
            {position.name}
          </Text>
          <Text fs="p6" color={getToken("accents.success.emphasis")}>
            {position.detail}
          </Text>
        </Flex>
      </SAssetIdentity>
      <Flex align="center" gap="m">
        <Flex direction="column" gap="xs" align="flex-end">
          <Text fs="p4" fw={600}>
            {t("common:currency", { value: position.value })}
          </Text>
          <Text fs="p6" color={getToken("text.low")}>
            {t("dashboard:earner.totalInvested")}
          </Text>
        </Flex>
        <span data-position-chevron aria-hidden="true">
          <Icon component={ChevronRight} size="s" />
        </span>
      </Flex>
    </SPositionLinkRow>
  )
  const linkProps = {
    "aria-label": t("dashboard:earner.manageFor", { title: position.name }),
    style: { color: "inherit", textDecoration: "none" },
  }

  if (position.destination?.type === "bil") {
    return (
      <Link to={LINKS.strategiesBil} {...linkProps}>
        {content}
      </Link>
    )
  }

  if (position.destination?.type === "bonds") {
    return (
      <Link to={LINKS.strategiesHollarBonds} {...linkProps}>
        {content}
      </Link>
    )
  }

  if (position.destination?.type === "liquidity") {
    return (
      <Link
        to="/liquidity/$id"
        params={{ id: position.destination.poolId }}
        search={{ expanded: true }}
        {...linkProps}
      >
        {content}
      </Link>
    )
  }

  return (
    <Link to={LINKS.liquidity} search={{ myLiquidity: true }} {...linkProps}>
      {content}
    </Link>
  )
}

const EmptyWalletStarterCard = () => {
  const { t } = useTranslation("dashboard")

  return (
    <SDashboardCard transparent>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("positions.title")}
        </Text>
      </SCardHeader>
      <EmptyState
        image={NoFunds}
        header={t("positions.emptyTitle")}
        description={t("positions.empty")}
        action={
          <Flex gap="s" sx={{ flexWrap: "wrap" }}>
            <Button variant="primary" size="small" asChild>
              <Link to={LINKS.deposit}>{t("actions.deposit")}</Link>
            </Button>
            <Button variant="tertiary" outline size="small" asChild>
              <Link to={LINKS.swapMarket}>{t("actions.trade")}</Link>
            </Button>
          </Flex>
        }
      />
    </SDashboardCard>
  )
}

const ConnectedDiscovery = ({
  movers,
  isMoversLoading,
}: {
  movers: DashboardMarketMover[]
  isMoversLoading: boolean
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const compactMovers = movers.slice(0, 5)

  return (
    <SConnectedDiscovery>
      <SConnectedDiscoveryHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:discover.trade.title")}
        </Text>
        <Button variant="muted" size="small" asChild>
          <Link to={LINKS.swapMarket}>{t("dashboard:discover.trade.all")}</Link>
        </Button>
      </SConnectedDiscoveryHeader>
      {isMoversLoading && !compactMovers.length ? (
        <ListSkeletons />
      ) : compactMovers.length ? (
        <SDiscoveryList>
          {compactMovers.map((mover) => (
            <MarketMoverLink key={mover.assetId} mover={mover} />
          ))}
        </SDiscoveryList>
      ) : (
        <Text fs="p5" color={getToken("text.low")}>
          {t("dashboard:discover.trade.empty")}
        </Text>
      )}
    </SConnectedDiscovery>
  )
}

const POPULAR_DEPOSITS = [
  {
    assetId: DOT_ASSET_ID,
    assetKey: "dot",
    symbol: "DOT",
    name: "Polkadot",
  },
  {
    assetId: USDC_ASSET_ID,
    assetKey: "usdc",
    symbol: "USDC",
    name: "USD Coin",
  },
  {
    assetId: USDT_ASSET_ID,
    assetKey: "usdt",
    symbol: "USDT",
    name: "Tether USD",
  },
  {
    assetId: "30",
    assetKey: "myth",
    symbol: "MYTH",
    name: "Mythos",
  },
  {
    assetId: "1000771",
    assetKey: "ksm",
    symbol: "KSM",
    name: "Kusama",
  },
] as const

const MarketMoverLink = ({ mover }: { mover: DashboardMarketMover }) => {
  const { t } = useTranslation(["dashboard", "common"])

  return (
    <Link
      to={LINKS.swapMarket}
      search={{
        assetIn: HOLLAR_ASSET_ID,
        assetOut: mover.assetId,
      }}
      aria-label={t("dashboard:discover.trade.action", {
        symbol: mover.symbol,
      })}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <SDiscoveryRow>
        <SAssetIdentity>
          <AssetLogo id={mover.assetId} size="small" />
          <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
            <Text fs="p4" fw={600} truncate>
              {mover.symbol}
            </Text>
            <Text fs="p6" color={getToken("text.low")} truncate>
              {mover.name}
            </Text>
          </Flex>
        </SAssetIdentity>
        <Flex align="center" gap="m">
          <Text
            fs="p5"
            fw={500}
            color={getToken("text.low")}
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {mover.price ? t("common:currency", { value: mover.price }) : "—"}
          </Text>
          {mover.weeklyChange === null ? (
            <Chip variant="secondary" size="small" rounded>
              {t("dashboard:discover.trade.popular")}
            </Chip>
          ) : (
            <Chip
              variant={mover.weeklyChange >= 0 ? "green" : "red"}
              size="small"
              rounded
            >
              {mover.weeklyChange >= 0 ? "+" : "−"}
              {t("common:number", {
                value: Math.abs(mover.weeklyChange),
                maximumFractionDigits: 2,
              })}
              %
            </Chip>
          )}
          <Icon component={ArrowUpRight} size="s" />
        </Flex>
      </SDiscoveryRow>
    </Link>
  )
}

const GuestDiscovery = ({
  movers,
  isLoading,
}: {
  movers: DashboardMarketMover[]
  isLoading: boolean
}) => {
  const { t } = useTranslation(["dashboard", "common"])

  return (
    <SDashboardGrid>
      <SDashboardCard columns={7}>
        <SCardHeader>
          <Flex direction="column" gap="s">
            <Text as="h2" fs="h7" fw={600} font="primary">
              {t("dashboard:discover.trade.title")}
            </Text>
            <Text fs="p5" color={getToken("text.low")}>
              {t("dashboard:discover.trade.description")}
            </Text>
          </Flex>
          <Chip variant="cyan" size="small" rounded>
            {t("dashboard:discover.trade.period")}
          </Chip>
        </SCardHeader>

        {isLoading && !movers.length ? (
          <ListSkeletons />
        ) : movers.length ? (
          <SDiscoveryList>
            {movers.map((mover) => (
              <MarketMoverLink key={mover.assetId} mover={mover} />
            ))}
          </SDiscoveryList>
        ) : (
          <SEmptyState>
            <Text fs="p4">{t("dashboard:discover.trade.empty")}</Text>
            <Button variant="tertiary" outline asChild>
              <Link to={LINKS.swapMarket}>{t("dashboard:actions.trade")}</Link>
            </Button>
          </SEmptyState>
        )}

        <Flex mt="l">
          <Button variant="muted" size="small" asChild>
            <Link to={LINKS.swapMarket}>
              {t("dashboard:discover.trade.all")}
            </Link>
          </Button>
        </Flex>
      </SDashboardCard>

      <SDashboardCard columns={5} featured>
        <SCardHeader>
          <Flex direction="column" gap="s">
            <Text as="h2" fs="h7" fw={600} font="primary">
              {t("dashboard:discover.deposit.title")}
            </Text>
            <Text fs="p5" color={getToken("text.low")}>
              {t("dashboard:discover.deposit.description")}
            </Text>
          </Flex>
        </SCardHeader>

        <SDiscoveryList>
          {POPULAR_DEPOSITS.map((asset) => (
            <Link
              key={asset.assetId}
              to={LINKS.crossChain}
              search={{ srcChain: "assethub", srcAsset: asset.assetKey }}
              aria-label={t("dashboard:discover.deposit.action", {
                symbol: asset.symbol,
              })}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <SDiscoveryRow>
                <SAssetIdentity>
                  <AssetLogo id={asset.assetId} size="small" />
                  <Flex direction="column" gap="xs">
                    <Text fs="p4" fw={600}>
                      {asset.symbol}
                    </Text>
                    <Text fs="p6" color={getToken("text.low")}>
                      {asset.name}
                    </Text>
                  </Flex>
                </SAssetIdentity>
                <Flex align="center" gap="s">
                  <Text fs="p6" color={getToken("text.low")}>
                    {t("dashboard:discover.deposit.network")}
                  </Text>
                  <Icon component={ArrowUpRight} size="s" />
                </Flex>
              </SDiscoveryRow>
            </Link>
          ))}
        </SDiscoveryList>

        <Flex mt="l">
          <Button variant="muted" size="small" asChild>
            <Link to={LINKS.deposit}>
              {t("dashboard:discover.deposit.more")}
            </Link>
          </Button>
        </Flex>
      </SDashboardCard>
    </SDashboardGrid>
  )
}

type PortfolioCardProps = {
  accountConnected: boolean
  isEmpty?: boolean
  badge?: string
  assetsLabel?: string
  netWorth: string
  claimableRewards: string
  isRewardsLoading: boolean
  assets: string
  liquidity: string
  borrowed: string
  assetAllocation: number
  liquidityAllocation: number
  borrowedAllocation: number
  isLoading: boolean
}

const PORTFOLIO_TONE_TOKENS = {
  assets: "controls.solid.activeHover",
  liquidity: "tags.soft.teal.foreground",
  borrowed: "text.tint.primary",
} as const

const PortfolioCard = ({
  accountConnected,
  isEmpty = false,
  badge,
  assetsLabel,
  netWorth,
  claimableRewards,
  isRewardsLoading,
  assets,
  liquidity,
  borrowed,
  assetAllocation,
  liquidityAllocation,
  borrowedAllocation,
  isLoading,
}: PortfolioCardProps) => {
  const { t } = useTranslation(["dashboard", "common", "wallet"])
  const { getToken: getThemeToken } = useTheme()
  const allocationSegments = [
    {
      value: assetAllocation,
      label: assetsLabel ?? t("dashboard:portfolio.assets"),
      color: getThemeToken(PORTFOLIO_TONE_TOKENS.assets),
    },
    {
      value: liquidityAllocation,
      label: t("dashboard:portfolio.liquidity"),
      color: getThemeToken(PORTFOLIO_TONE_TOKENS.liquidity),
    },
    {
      value: borrowedAllocation,
      label: t("dashboard:portfolio.borrowed"),
      color: getThemeToken(PORTFOLIO_TONE_TOKENS.borrowed),
    },
  ]

  return (
    <SPlainDashboardCard columns={7}>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:portfolio.title")}
        </Text>
        {badge ? (
          <Chip variant="secondary" size="small" rounded>
            {badge}
          </Chip>
        ) : isEmpty ? (
          <Chip variant="secondary" size="small" rounded>
            {t("dashboard:portfolio.notFunded")}
          </Chip>
        ) : null}
      </SCardHeader>

      {!accountConnected ? (
        <SEmptyState>
          <Text as="h3" fs="h5" fw={600} font="primary">
            {t("dashboard:portfolio.connect.title")}
          </Text>
          <Text fs="p4" sx={{ maxWidth: "28rem" }}>
            {t("dashboard:portfolio.connect.description")}
          </Text>
          <Web3ConnectButton variant="secondary" />
        </SEmptyState>
      ) : (
        <SPortfolioContent>
          <SPortfolioChart>
            {isLoading ? (
              <Skeleton width="6.5rem" height="6.5rem" borderRadius="full" />
            ) : isEmpty ? (
              <SEmptyPortfolioChart
                role="img"
                aria-label={t("dashboard:portfolio.emptyComposition")}
              />
            ) : (
              <PieChart
                size={[88, null, 112]}
                innerRadius={0.64}
                animationDurationMs={750}
                ariaLabel={t("dashboard:portfolio.composition")}
                tooltipLabel={t("dashboard:portfolio.composition")}
                formatValue={({ value }: { value: number }) =>
                  t("common:percent", { value })
                }
                segments={allocationSegments}
              />
            )}
          </SPortfolioChart>
          <SPortfolioBalances>
            <SPortfolioHeadline>
              <SNetWorth>
                <Text fs="p5" color={getToken("text.low")}>
                  {t("dashboard:portfolio.netWorth")}
                </Text>
                {isLoading ? (
                  <Skeleton width="13rem" height="3rem" />
                ) : (
                  <Text
                    fs="h4"
                    lh={1}
                    fw={600}
                    font="primary"
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {t("common:currency", { value: netWorth })}
                  </Text>
                )}
              </SNetWorth>
              <SRewardsMetric>
                <Text fs="p6" color={getToken("text.low")}>
                  {t("wallet:myAssets.claimableRewards")}
                </Text>
                {isRewardsLoading ? (
                  <Skeleton width="4.5rem" height="1.25rem" />
                ) : (
                  <Flex align="center" gap="xs">
                    <Text
                      fs="p4"
                      fw={600}
                      font="primary"
                      color={getToken("accents.success.emphasis")}
                      sx={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {t("common:currency", { value: claimableRewards })}
                    </Text>
                    {Big(claimableRewards).gt(0) && (
                      <Tooltip
                        asChild
                        side="top"
                        text={t("dashboard:portfolio.claimRewards")}
                      >
                        <ButtonIcon
                          asChild
                          sx={{ color: getToken("accents.success.emphasis") }}
                        >
                          <Link
                            to={LINKS.portfolio}
                            aria-label={t("dashboard:portfolio.claimRewards")}
                          >
                            <Icon component={BadgeDollarSign} size="s" />
                          </Link>
                        </ButtonIcon>
                      </Tooltip>
                    )}
                  </Flex>
                )}
              </SRewardsMetric>
            </SPortfolioHeadline>
            <SMetricGrid>
              <PortfolioMetric
                label={assetsLabel ?? t("dashboard:portfolio.assets")}
                value={assets}
                tone="assets"
                isLoading={isLoading}
              />
              <PortfolioMetric
                label={t("dashboard:portfolio.liquidity")}
                value={liquidity}
                tone="liquidity"
                isLoading={isLoading}
              />
              <PortfolioMetric
                label={t("dashboard:portfolio.borrowed")}
                value={borrowed}
                tone="borrowed"
                isLoading={isLoading}
              />
            </SMetricGrid>
          </SPortfolioBalances>
        </SPortfolioContent>
      )}
    </SPlainDashboardCard>
  )
}

const PortfolioMetric = ({
  label,
  value,
  tone,
  isLoading,
}: {
  label: string
  value: string
  tone: "assets" | "liquidity" | "borrowed"
  isLoading: boolean
}) => {
  const { t } = useTranslation("common")
  const toneToken = PORTFOLIO_TONE_TOKENS[tone]

  return (
    <SMetric>
      <Text fs="p6" fw={500} color={getToken(toneToken)}>
        {label}
      </Text>
      {isLoading ? (
        <Skeleton width="5rem" height="1.25rem" />
      ) : (
        <Text
          fs="p4"
          fw={600}
          font="primary"
          color={getToken(toneToken)}
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {t("currency", { value })}
        </Text>
      )}
    </SMetric>
  )
}

const EarnOptionsCard = ({
  opportunities,
  walletAssets,
  isLoading,
  onQuickStart,
}: {
  opportunities: DashboardOpportunity[]
  walletAssets: ReturnType<typeof useDashboardData>["walletAssets"]
  isLoading: boolean
  onQuickStart: (opportunity: DashboardOpportunity) => void
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const options = walletAssets
    .filter((asset) => Big(asset.transferable).gt(0))
    .map((heldAsset) => ({
      heldAsset,
      opportunities: getEarnOptionsForAsset(opportunities, heldAsset.id),
    }))
    .filter(({ opportunities }) => opportunities.length > 0)
    .toSorted((a, b) =>
      Big(b.heldAsset.transferableDisplay ?? 0).cmp(
        a.heldAsset.transferableDisplay ?? 0,
      ),
    )
    .slice(0, 3)
  const idleCapital = options.reduce(
    (total, { heldAsset }) => total.plus(heldAsset.transferableDisplay ?? 0),
    Big(0),
  )

  return (
    <SPlainDashboardCard columns={5}>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:spotlight.options")}
        </Text>
        {idleCapital.gt(0) && (
          <Chip variant="info" size="small" rounded>
            {t("common:currency", { value: idleCapital.toString() })}{" "}
            {t("dashboard:spotlight.idle")}
          </Chip>
        )}
      </SCardHeader>

      {isLoading && !options.length ? (
        <ListSkeletons />
      ) : options.length ? (
        <SCuratedOpportunityList>
          {options.map(
            ({ opportunities: assetOpportunities, heldAsset }, assetIndex) => (
              <SCuratedOpportunityRow key={heldAsset.id}>
                <SAssetIdentity>
                  <AssetLogo id={heldAsset.id} size="small" />
                  <Amount
                    value={`${t("common:number", {
                      value: heldAsset.transferable,
                    })} ${heldAsset.symbol}`}
                    displayValue={
                      heldAsset.transferableDisplay
                        ? t("common:currency", {
                            value: heldAsset.transferableDisplay,
                          })
                        : undefined
                    }
                  />
                </SAssetIdentity>
                <SOpportunityPills>
                  {assetOpportunities.map((opportunity, opportunityIndex) => (
                    <SOpportunityPill
                      key={opportunity.id}
                      type="button"
                      onClick={() => onQuickStart(opportunity)}
                      aria-label={t("dashboard:opportunity.startEarningFor", {
                        title: opportunity.title,
                      })}
                    >
                      <span>{getEarnOptionLabel(opportunity)}</span>
                      <strong>
                        {getPotentialApr(
                          opportunity,
                          assetIndex,
                          opportunityIndex,
                        )}
                        % APR
                      </strong>
                      <AssetLogo id={opportunity.logoIds} size="extra-small" />
                      <span data-opportunity-chevron aria-hidden="true">
                        <Icon component={ChevronRight} size={10} />
                      </span>
                    </SOpportunityPill>
                  ))}
                </SOpportunityPills>
              </SCuratedOpportunityRow>
            ),
          )}
        </SCuratedOpportunityList>
      ) : (
        <SEmptyState>
          <Text fs="p4">{t("dashboard:spotlight.emptyIdle")}</Text>
          <Button variant="tertiary" outline asChild>
            <Link to={LINKS.liquidity}>
              {t("dashboard:earn.exploreLiquidity")}
            </Link>
          </Button>
        </SEmptyState>
      )}
    </SPlainDashboardCard>
  )
}

const getEarnOptionsForAsset = (
  opportunities: DashboardOpportunity[],
  assetId: string,
) => {
  const strategies = opportunities
    .filter((opportunity) => opportunity.kind === "strategy")
    .toSorted((a, b) => Big(b.rate ?? 0).cmp(a.rate ?? 0))

  const matchedLiquidity = opportunities
    .filter(
      (opportunity) =>
        opportunity.kind === "liquidity" &&
        opportunity.matchingAssetIds.includes(assetId),
    )
    .toSorted((a, b) => Big(b.rate ?? 0).cmp(a.rate ?? 0))

  return [...strategies, ...matchedLiquidity].slice(0, 2)
}

const getEarnOptionLabel = (opportunity: DashboardOpportunity) => {
  if (opportunity.destination.type === "bil") return "BIL"
  if (opportunity.destination.type === "bonds") return "HOLLAR Bonds"

  return opportunity.title
}

const getPotentialApr = (
  opportunity: DashboardOpportunity,
  assetIndex: number,
  opportunityIndex: number,
) => {
  const previewBase =
    opportunity.destination.type === "bil"
      ? "8.25"
      : opportunity.destination.type === "bonds"
        ? "6.45"
        : "10.5"
  const baseRate = Big(opportunity.rate ?? previewBase)
  const previewOffsets = ["-0.18", "0.12", "0.28"]
  const offsetIndex = (assetIndex + opportunityIndex) % previewOffsets.length

  return baseRate.plus(previewOffsets[offsetIndex] ?? "0").toFixed(2)
}

const PositionsCard = ({
  accountConnected,
  transparent,
  positions,
  isLoading,
}: {
  accountConnected: boolean
  transparent?: boolean
  positions: ReturnType<typeof useDashboardData>["topAssets"]
  isLoading: boolean
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(positions.length / PORTFOLIO_ASSETS_PER_PAGE)
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1))
  const visiblePositions = positions.slice(
    (visiblePage - 1) * PORTFOLIO_ASSETS_PER_PAGE,
    visiblePage * PORTFOLIO_ASSETS_PER_PAGE,
  )

  return (
    <SDashboardCard columns={5} transparent={transparent}>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:positions.title")}
        </Text>
        {accountConnected && (
          <Button variant="muted" size="small" asChild>
            <Link to={LINKS.portfolio}>{t("dashboard:portfolio.view")}</Link>
          </Button>
        )}
      </SCardHeader>
      {!accountConnected ? (
        <SEmptyState>
          <Text fs="p4">{t("dashboard:positions.connect")}</Text>
        </SEmptyState>
      ) : isLoading ? (
        <ListSkeletons />
      ) : positions.length ? (
        <SList>
          {visiblePositions.map((position) => (
            <SListRow key={position.id}>
              <SAssetIdentity>
                <AssetLogo id={position.id} size="small" />
                <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
                  <Text fs="p4" fw={600} truncate>
                    {position.symbol}
                  </Text>
                  <Text fs="p6" color={getToken("text.low")} truncate>
                    {position.name}
                  </Text>
                </Flex>
              </SAssetIdentity>
              <Flex align="center" gap="m">
                <Flex direction="column" gap="xs" align="flex-end">
                  <Text
                    fs="p4"
                    fw={600}
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {position.totalDisplay
                      ? t("common:currency", { value: position.totalDisplay })
                      : "—"}
                  </Text>
                  <Text fs="p6" color={getToken("text.low")}>
                    {t("common:number", { value: position.total })}
                  </Text>
                </Flex>
                <Button variant="muted" size="small" asChild>
                  <Link
                    to={LINKS.swapMarket}
                    search={{
                      assetIn: HOLLAR_ASSET_ID,
                      assetOut: position.id,
                    }}
                  >
                    {t("dashboard:actions.trade")}
                  </Link>
                </Button>
              </Flex>
            </SListRow>
          ))}
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={visiblePage}
              onPageChange={setCurrentPage}
            />
          )}
        </SList>
      ) : (
        <EmptyState
          image={NoFunds}
          header={t("dashboard:positions.emptyTitle")}
          description={t("dashboard:positions.empty")}
          action={
            <Flex gap="s" sx={{ flexWrap: "wrap" }}>
              <Button variant="primary" size="small" asChild>
                <Link to={LINKS.deposit}>{t("dashboard:actions.deposit")}</Link>
              </Button>
              <Button variant="tertiary" outline size="small" asChild>
                <Link to={LINKS.swapMarket}>
                  {t("dashboard:actions.trade")}
                </Link>
              </Button>
            </Flex>
          }
        />
      )}
    </SDashboardCard>
  )
}

const ActivityCard = ({
  accountConnected,
  transparent,
  activity,
  isLoading,
}: {
  accountConnected: boolean
  transparent?: boolean
  activity: ReturnType<typeof useDashboardData>["recentActivity"]
  isLoading: boolean
}) => {
  const { t } = useTranslation(["dashboard", "common"])

  return (
    <SDashboardCard columns={7} transparent={transparent}>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:activity.title")}
        </Text>
        {accountConnected && (
          <Button variant="muted" size="small" asChild>
            <Link to={LINKS.swapMarket} search={{ tab: "myActivity" }}>
              {t("dashboard:common.viewAll")}
            </Link>
          </Button>
        )}
      </SCardHeader>
      {!accountConnected ? (
        <SEmptyState>
          <Text fs="p4">{t("dashboard:activity.connect")}</Text>
        </SEmptyState>
      ) : isLoading ? (
        <ListSkeletons />
      ) : activity.length ? (
        <SList>
          {activity.map((trade, index) => (
            <SListRow key={`${trade.link ?? trade.date.valueOf()}-${index}`}>
              <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
                <TransactionPair from={trade.from} to={trade.to} />
                <RelativeDateText
                  date={trade.date}
                  shortFormat
                  fs="p6"
                  color={getToken("text.low")}
                />
              </Flex>
              <Flex direction="column" gap="xs" align="flex-end">
                <Text
                  fs="p4"
                  fw={600}
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {t("common:number", { value: trade.toAmount })}{" "}
                  {trade.to.symbol}
                </Text>
                <Text fs="p6" color={getToken("text.low")}>
                  −{t("common:number", { value: trade.fromAmount })}{" "}
                  {trade.from.symbol}
                </Text>
              </Flex>
            </SListRow>
          ))}
        </SList>
      ) : (
        <EmptyState
          image={NoFunds}
          header={t("dashboard:activity.emptyTitle")}
          description={t("dashboard:activity.empty")}
          action={
            <Button variant="tertiary" outline size="small" asChild>
              <Link to={LINKS.swapMarket}>{t("dashboard:actions.trade")}</Link>
            </Button>
          }
        />
      )}
    </SDashboardCard>
  )
}

const EarnOpportunitiesSection = ({
  accountConnected,
  walletEmpty = false,
  compact = false,
  context = "default",
  filter,
  onFilterChange,
  opportunities,
  isLoading,
  onQuickStart,
  investedPositions,
}: {
  accountConnected: boolean
  walletEmpty?: boolean
  compact?: boolean
  context?: "default" | "external" | "earner"
  filter: OpportunityFilter
  onFilterChange: (filter: OpportunityFilter) => void
  opportunities: DashboardOpportunity[]
  isLoading: boolean
  onQuickStart: (opportunity: DashboardOpportunity) => void
  investedPositions?: ReadonlyMap<string, string>
}) => {
  const { t } = useTranslation("dashboard")

  return (
    <section>
      <SEarnHeader>
        <Flex direction="column" gap="s">
          <Text
            as="h2"
            fs={compact ? "h7" : "h5"}
            fw={600}
            font="primary"
            whiteSpace={compact ? "nowrap" : undefined}
          >
            {t("earn.title")}
          </Text>
          <Text fs="p4" color={getToken("text.low")}>
            {context === "external"
              ? t("earn.description.external")
              : context === "earner"
                ? t("earn.description.earner")
                : walletEmpty
                  ? t("earn.description.emptyWallet")
                  : accountConnected
                    ? t("earn.description.connected")
                    : t("earn.description.disconnected")}
          </Text>
        </Flex>
        {!compact && (
          <SFilterBar aria-label={t("earn.filters.label")}>
            <OpportunityFilterButton
              filter="all"
              selected={filter}
              onSelect={onFilterChange}
            >
              {t("earn.filters.all")}
            </OpportunityFilterButton>
            {accountConnected && !walletEmpty && (
              <OpportunityFilterButton
                filter="matched"
                selected={filter}
                onSelect={onFilterChange}
              >
                {t("earn.filters.forYou")}
              </OpportunityFilterButton>
            )}
            <OpportunityFilterButton
              filter="strategy"
              selected={filter}
              onSelect={onFilterChange}
            >
              {t("earn.filters.strategies")}
            </OpportunityFilterButton>
            <OpportunityFilterButton
              filter="liquidity"
              selected={filter}
              onSelect={onFilterChange}
            >
              {t("earn.filters.liquidity")}
            </OpportunityFilterButton>
          </SFilterBar>
        )}
      </SEarnHeader>

      {compact && (
        <Flex mt="m">
          <SCompactFilterBar>
            <ToggleGroup<OpportunityFilter>
              type="single"
              size="small"
              value={filter}
              onValueChange={(value) => value && onFilterChange(value)}
              aria-label={t("earn.filters.label")}
            >
              <ToggleGroupItem value="all">
                {t("earn.filters.all")}
              </ToggleGroupItem>
              <ToggleGroupItem value="strategy">
                {t("earn.filters.strategies")}
              </ToggleGroupItem>
              <ToggleGroupItem value="liquidity">
                {t("earn.filters.liquidity")}
              </ToggleGroupItem>
            </ToggleGroup>
          </SCompactFilterBar>
        </Flex>
      )}

      <Flex direction="column" gap="l" mt={compact ? "l" : "xl"}>
        {isLoading && !opportunities.length ? (
          <OpportunitySkeletons compact={compact} />
        ) : opportunities.length ? (
          <SOpportunityGrid compact={compact}>
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onQuickStart={onQuickStart}
                context={context}
                investedValue={investedPositions?.get(opportunity.id)}
              />
            ))}
          </SOpportunityGrid>
        ) : (
          <SDashboardCard columns={12}>
            <SEmptyState>
              <Text fs="h6" fw={600} font="primary">
                {t("earn.empty.title")}
              </Text>
              <Text fs="p4">{t("earn.empty.description")}</Text>
              <Button
                variant="tertiary"
                outline
                onClick={() => onFilterChange("all")}
              >
                {t("earn.empty.action")}
              </Button>
            </SEmptyState>
          </SDashboardCard>
        )}
        <Flex justify="center" gap="base" sx={{ flexWrap: "wrap" }}>
          <Button variant="tertiary" outline asChild>
            <Link to={LINKS.strategies}>{t("earn.exploreStrategies")}</Link>
          </Button>
          <Button variant="tertiary" outline asChild>
            <Link to={LINKS.liquidity} search={{ myLiquidity: false }}>
              {t("earn.exploreLiquidity")}
            </Link>
          </Button>
        </Flex>
      </Flex>
    </section>
  )
}

const DashboardStateButton = ({
  state,
  selected,
  onSelect,
  children,
}: {
  state: DashboardPreviewState
  selected: DashboardPreviewState
  onSelect: (state: DashboardPreviewState) => void
  children: React.ReactNode
}) => (
  <SFilterButton
    type="button"
    active={selected === state}
    aria-pressed={selected === state}
    onClick={() => onSelect(state)}
  >
    {children}
  </SFilterButton>
)

const OpportunityFilterButton = ({
  filter,
  selected,
  onSelect,
  children,
}: {
  filter: OpportunityFilter
  selected: OpportunityFilter
  onSelect: (filter: OpportunityFilter) => void
  children: React.ReactNode
}) => (
  <SFilterButton
    type="button"
    active={selected === filter}
    aria-pressed={selected === filter}
    onClick={() => onSelect(filter)}
  >
    {children}
  </SFilterButton>
)

const OpportunityCard = ({
  opportunity,
  onQuickStart,
  context = "default",
  investedValue,
}: {
  opportunity: DashboardOpportunity
  onQuickStart: (opportunity: DashboardOpportunity) => void
  context?: "default" | "external" | "earner"
  investedValue?: string
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const navigate = useNavigate()

  const openOpportunity = () => {
    if (opportunity.destination.type === "bil") {
      navigate({ to: LINKS.strategiesBil })
      return
    }

    if (opportunity.destination.type === "bonds") {
      navigate({ to: LINKS.strategiesHollarBonds })
      return
    }

    navigate({
      to: "/liquidity/$id",
      params: { id: opportunity.destination.poolId },
      search: { expanded: true },
    })
  }

  const handleOpen = () => {
    if (context === "external") {
      navigate({
        to: LINKS.crossChain,
        search: { srcChain: "ethereum", srcAsset: "usdc" },
      })
      return
    }

    if (investedValue) {
      openOpportunity()
      return
    }

    if (opportunity.isMatched) {
      onQuickStart(opportunity)
      return
    }

    openOpportunity()
  }

  return (
    <SOpportunityCard
      type="button"
      onClick={handleOpen}
      aria-label={
        context === "external"
          ? t("dashboard:external.moveFor", { title: opportunity.title })
          : investedValue
            ? t("dashboard:earner.manageFor", { title: opportunity.title })
            : opportunity.isMatched
              ? t("opportunity.startEarningFor", { title: opportunity.title })
              : t("open", { title: opportunity.title })
      }
    >
      <SOpportunityTop>
        <AssetLogo id={opportunity.logoIds} size="medium" />
        <Flex gap="s" sx={{ flexWrap: "wrap" }} justify="flex-end">
          {investedValue && (
            <Chip variant="green" size="small" rounded>
              {t("dashboard:earner.invested")}
            </Chip>
          )}
          <Chip
            variant={getOpportunityChipVariant(opportunity)}
            size="small"
            rounded
          >
            {opportunity.source}
          </Chip>
        </Flex>
      </SOpportunityTop>
      <Flex direction="column" gap="s">
        <Text as="h3" fs="h7" fw={600} font="primary">
          {opportunity.title}
        </Text>
        <Text fs="p5" lh={1.45} color={getToken("text.low")} truncate>
          {opportunity.description}
        </Text>
      </Flex>
      <SOpportunityFooter>
        <OpportunityRate opportunity={opportunity} />
        {context === "external" ? (
          <Button as="span" variant="tertiary" outline size="small">
            {t("dashboard:external.moveAction")} →
          </Button>
        ) : investedValue ? (
          <Flex direction="column" gap="xs" align="flex-end">
            <Text fs="p6" color={getToken("text.low")}>
              {t("dashboard:earner.yourPosition")}
            </Text>
            <Text fs="p5" fw={600} color={getToken("accents.success.emphasis")}>
              {t("common:currency", { value: investedValue })} ·{" "}
              {t("dashboard:earner.manage")}
            </Text>
          </Flex>
        ) : null}
      </SOpportunityFooter>
    </SOpportunityCard>
  )
}

const getOpportunityChipVariant = (
  opportunity: DashboardOpportunity,
): ChipVariant => {
  if (opportunity.destination.type === "bil") return "purple"
  if (opportunity.destination.type === "bonds") return "blue"
  if (opportunity.source === "Stablepool") return "lime"
  if (opportunity.source === "Isolated pool") return "amber"

  return "cyan"
}

const OpportunityRate = ({
  opportunity,
}: {
  opportunity: DashboardOpportunity
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  if (opportunity.isLoading) {
    return <Skeleton width="5rem" height="2rem" />
  }

  return (
    <Flex direction="column" gap="xs">
      <Text
        fs="h7"
        lh={1}
        fw={600}
        font="primary"
        color={getToken("text.tint.secondary")}
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {opportunity.rate
          ? t("common:percent", { value: opportunity.rate })
          : "—"}
      </Text>
    </Flex>
  )
}

const DashboardOpportunityModal = ({
  opportunity,
  open,
  onOpenChange,
}: {
  opportunity: DashboardOpportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  if (!opportunity) return null

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {opportunity.destination.type === "liquidity" ? (
        <AddLiquidityModalContent
          id={opportunity.destination.poolId}
          stableswapId={opportunity.destination.stableswapId}
          erc20Id={opportunity.destination.erc20Id}
          closable
          onSubmitted={() => onOpenChange(false)}
        />
      ) : opportunity.destination.type === "bil" ? (
        <>
          <ModalHeader
            title={opportunity.title}
            description={opportunity.description}
          />
          <ModalBody p={0}>
            <BilStrategyProvider>
              <BilDeposit />
            </BilStrategyProvider>
          </ModalBody>
        </>
      ) : isStableBondsOpportunity(opportunity) ? (
        <StableBondsQuickStart opportunity={opportunity} />
      ) : null}
    </Modal>
  )
}

const isStableBondsOpportunity = (
  opportunity: DashboardOpportunity,
): opportunity is StableBondsOpportunity =>
  opportunity.destination.type === "bonds"

const StableBondsQuickStart = ({
  opportunity,
}: {
  opportunity: StableBondsOpportunity
}) => {
  const { destination } = opportunity
  const config = STABLE_BONDS[destination.bondId]
  const { data: orders, isReady } = useStableBondsOtcOrders(
    destination.bondId,
    config?.otcAcceptedAssetIds ?? [],
    config?.otcOfferIds ?? [],
  )

  return (
    <>
      <ModalHeader
        title={opportunity.title}
        description={opportunity.description}
      />
      <ModalBody p={0}>
        {config && isReady ? (
          <StableBondsConfigProvider config={config}>
            <StableBondsDeposit orders={orders} />
          </StableBondsConfigProvider>
        ) : (
          <Flex direction="column" gap="m" p="xl">
            <Skeleton width="100%" height="7rem" />
            <Skeleton width="100%" height="7rem" />
            <Skeleton width="100%" height="3rem" />
          </Flex>
        )}
      </ModalBody>
    </>
  )
}

const ListSkeletons = () => (
  <Flex direction="column" gap="m">
    {[0, 1, 2].map((item) => (
      <Flex key={item} align="center" justify="space-between" py="base">
        <Flex align="center" gap="m">
          <Skeleton circle width="2rem" height="2rem" />
          <Skeleton width="7rem" height="1.25rem" />
        </Flex>
        <Skeleton width="5rem" height="1.25rem" />
      </Flex>
    ))}
  </Flex>
)

const OpportunitySkeletons = ({ compact = false }: { compact?: boolean }) => (
  <SOpportunityGrid compact={compact}>
    {[0, 1, 2].map((item) => (
      <SOpportunityCard key={item} as="div">
        <Flex direction="column" gap="xl">
          <Flex justify="space-between">
            <Skeleton circle width="3rem" height="3rem" />
            <Skeleton width="5rem" height="1.5rem" />
          </Flex>
          <Skeleton width="75%" height="1.5rem" />
          <Skeleton width="100%" height="2.5rem" />
          <Skeleton width="6rem" height="2rem" />
        </Flex>
      </SOpportunityCard>
    ))}
  </SOpportunityGrid>
)
