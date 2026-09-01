import {
  ArrowRightLong,
  ArrowUpRight,
  ChevronRight,
} from "@galacticcouncil/ui/assets/icons"
import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import {
  Amount,
  Button,
  Chip,
  ChipVariant,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
  PieChart,
  Select,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  DOT_ASSET_ID,
  HOLLAR_ASSET_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
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
  SCompactDiscoveryCard,
  SCompactDiscoveryHeader,
  SConnectedDiscovery,
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
  SPlatformMetric,
  SPlatformMetricGrid,
  SPortfolioBalances,
  SPortfolioChart,
  SPortfolioContent,
  SPortfolioHeadline,
  SRewardsMetric,
} from "@/modules/dashboard/DashboardPage.styled"
import { Container, MainContent } from "@/modules/layout/components/Content"
import { BilDeposit } from "@/modules/strategies/bil/components/BilDeposit"
import { BilStrategyProvider } from "@/modules/strategies/bil/context/BilStrategyContext"
import { StableBondsDeposit } from "@/modules/strategies/stable-bonds/components/StableBondsDeposit"
import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import { StableBondsConfigProvider } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { useStableBondsOtcOrders } from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"

type OpportunityFilter = "all" | "matched" | DashboardOpportunityKind
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
  "earner",
]

export const DashboardPage = () => {
  const [filter, setFilter] = useState<OpportunityFilter>("all")
  const [previewState, setPreviewState] =
    useState<DashboardPreviewState>("live")
  const [quickStartOpportunity, setQuickStartOpportunity] =
    useState<DashboardOpportunity | null>(null)
  const {
    account,
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
    platformStats,
    isPlatformStatsLoading,
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

  const resolvedState =
    previewState === "live"
      ? account
        ? "hydration"
        : "disconnected"
      : previewState
  const isLiveWallet = previewState === "live" && !!account

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
              platformStats={platformStats}
              isMoversLoading={isMarketMoversLoading}
              isPlatformLoading={isPlatformStatsLoading}
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

const PreviewAssetsCard = () => {
  const { t } = useTranslation(["dashboard", "common"])

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
      <SList>
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
    </SDashboardCard>
  )
}

const PreviewActivityCard = () => {
  const { t } = useTranslation("dashboard")
  const rows = [
    ["HOLLAR", "HDX", "359.0232 HDX", "−3.9092 HOLLAR", "1d ago"],
    ["HOLLAR", "HDX", "309.2081 HDX", "−3.3333 HOLLAR", "1d ago"],
    ["USDC", "HOLLAR", "248.12 HOLLAR", "−250 USDC", "3d ago"],
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
          <SListRow key={`${from}-${to}-${received}`}>
            <Flex direction="column" gap="xs">
              <Text fs="p4" fw={600}>
                {from} → {to}
              </Text>
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

const PreviewIdleCapitalCard = ({
  opportunities,
  onQuickStart,
}: {
  opportunities: DashboardOpportunity[]
  onQuickStart: (opportunity: DashboardOpportunity) => void
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const bil = opportunities.find(
    (opportunity) => opportunity.destination.type === "bil",
  )
  const bonds = opportunities.find(
    (opportunity) => opportunity.destination.type === "bonds",
  )
  const options = [bil, bonds].filter(Boolean) as DashboardOpportunity[]

  return (
    <SPlainDashboardCard>
      <SCardHeader>
        <Text as="h2" fs="h7" fw={600} font="primary">
          {t("dashboard:spotlight.options")}
        </Text>
        <Chip variant="info" size="small" rounded>
          {t("common:currency", { value: "1623.79" })}{" "}
          {t("dashboard:spotlight.idle")}
        </Chip>
      </SCardHeader>
      <SCuratedOpportunityList>
        {PREVIEW_ASSETS.slice(0, 3).map((asset, assetIndex) => (
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
                <SOpportunityPill
                  key={opportunity.id}
                  type="button"
                  onClick={() => onQuickStart(opportunity)}
                >
                  <span>{getEarnOptionLabel(opportunity)}</span>
                  <strong>
                    {getPotentialApr(opportunity, assetIndex, opportunityIndex)}
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
  const { t } = useTranslation(["dashboard", "common"])

  return (
    <SDashboardSplitView>
      <SDashboardColumn>
        <SPlainDashboardCard>
          <SCardHeader>
            <Flex direction="column" gap="s">
              <Text as="h2" fs="h7" fw={600} font="primary">
                {t("dashboard:external.title")}
              </Text>
              <Text fs="p4" color={getToken("text.low")}>
                {t("dashboard:external.description")}
              </Text>
            </Flex>
            <Chip variant="secondary" size="small" rounded>
              Ethereum
            </Chip>
          </SCardHeader>
          <Flex direction="column" gap="s" mb="xl">
            <Text fs="p5" color={getToken("text.low")}>
              {t("dashboard:external.available")}
            </Text>
            <Text fs="h4" fw={600} font="primary">
              {t("common:currency", { value: "2820.14" })}
            </Text>
          </Flex>
          <SList>
            {PREVIEW_ASSETS.slice(0, 2).map((asset) => (
              <SListRow key={asset.id}>
                <SAssetIdentity>
                  <AssetLogo id={asset.id} size="small" />
                  <Flex direction="column" gap="xs">
                    <Text fs="p4" fw={600}>
                      {asset.symbol}
                    </Text>
                    <Text fs="p6" color={getToken("text.low")}>
                      Ethereum
                    </Text>
                  </Flex>
                </SAssetIdentity>
                <Text fs="p4" fw={600}>
                  {t("common:currency", {
                    value: asset.symbol === "USDC" ? "1840.32" : "979.82",
                  })}
                </Text>
              </SListRow>
            ))}
          </SList>
        </SPlainDashboardCard>
      </SDashboardColumn>
      <SDashboardColumn>
        <SDashboardCard>
          <SCardHeader>
            <Flex direction="column" gap="s">
              <Text as="h2" fs="h7" fw={600} font="primary">
                {t("dashboard:external.moveTitle")}
              </Text>
              <Text fs="p4" color={getToken("text.low")}>
                {t("dashboard:external.moveDescription")}
              </Text>
            </Flex>
          </SCardHeader>
          <Flex
            align="center"
            justify="space-between"
            gap="l"
            sx={{ flexWrap: "wrap" }}
          >
            <Flex direction="column" gap="xs">
              <Text fs="p6" color={getToken("text.low")}>
                {t("dashboard:external.afterMoving")}
              </Text>
              <Text fs="p4" fw={600}>
                BIL 8.43% APR · HOLLAR Bonds 6.57% APR
              </Text>
            </Flex>
            <Button variant="primary" asChild>
              <Link
                to={LINKS.crossChain}
                search={{ srcChain: "ethereum", srcAsset: "usdc" }}
              >
                {t("dashboard:external.moveAction")}
              </Link>
            </Button>
          </Flex>
        </SDashboardCard>
        <EarnOpportunitiesSection
          accountConnected={false}
          compact
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
  const { t } = useTranslation(["dashboard", "common"])
  const positions = [
    ["HOLLAR Bonds", "6.57% APR", "$1 420.00", HOLLAR_ASSET_ID],
    ["Brazilian Invoice Loans", "8.43% APR", "$860.00", HOLLAR_ASSET_ID],
    ["HUSDT liquidity", "14.25% APR", "$704.69", USDT_ASSET_ID],
  ] as const

  return (
    <SDashboardSplitView>
      <SDashboardColumn>
        <PortfolioCard
          accountConnected
          netWorth="3658.22"
          claimableRewards="86.42"
          isRewardsLoading={false}
          assets="648.14"
          liquidity="704.69"
          borrowed="28.04"
          assetAllocation={18.01}
          liquidityAllocation={20.13}
          borrowedAllocation={0.8}
          isLoading={false}
        />
        <SDashboardCard transparent>
          <SCardHeader>
            <Text as="h2" fs="h7" fw={600} font="primary">
              {t("dashboard:earner.positions")}
            </Text>
            <Button variant="muted" size="small" asChild>
              <Link to={LINKS.portfolio}>{t("dashboard:portfolio.view")}</Link>
            </Button>
          </SCardHeader>
          <SList>
            {positions.map(([name, apr, value, logo]) => (
              <SListRow key={name}>
                <SAssetIdentity>
                  <AssetLogo id={logo} size="small" />
                  <Flex direction="column" gap="xs">
                    <Text fs="p4" fw={600}>
                      {name}
                    </Text>
                    <Text fs="p6" color={getToken("accents.success.emphasis")}>
                      {apr}
                    </Text>
                  </Flex>
                </SAssetIdentity>
                <Text fs="p4" fw={600}>
                  {value}
                </Text>
              </SListRow>
            ))}
          </SList>
        </SDashboardCard>
      </SDashboardColumn>
      <SDashboardColumn>
        <SDashboardCard>
          <SCardHeader>
            <Flex direction="column" gap="s">
              <Text as="h2" fs="h7" fw={600} font="primary">
                {t("dashboard:earner.title")}
              </Text>
              <Text fs="p4" color={getToken("text.low")}>
                {t("dashboard:earner.description")}
              </Text>
            </Flex>
            <Chip variant="green" size="small" rounded>
              +$34.82 {t("dashboard:earner.thisMonth")}
            </Chip>
          </SCardHeader>
          <SPlatformMetricGrid>
            <SPlatformMetric>
              <Text fs="p6" color={getToken("text.low")}>
                {t("dashboard:earner.earningBalance")}
              </Text>
              <Text fs="h7" fw={600} font="primary">
                $2 984.69
              </Text>
            </SPlatformMetric>
            <SPlatformMetric>
              <Text fs="p6" color={getToken("text.low")}>
                {t("dashboard:earner.blendedApr")}
              </Text>
              <Text fs="h7" fw={600} font="primary">
                9.18%
              </Text>
            </SPlatformMetric>
            <SPlatformMetric>
              <Text fs="p6" color={getToken("text.low")}>
                {t("dashboard:earner.claimable")}
              </Text>
              <Text
                fs="h7"
                fw={600}
                font="primary"
                color={getToken("accents.success.emphasis")}
              >
                $86.42
              </Text>
            </SPlatformMetric>
          </SPlatformMetricGrid>
        </SDashboardCard>
        <EarnOpportunitiesSection
          accountConnected
          compact
          filter={filter}
          onFilterChange={onFilterChange}
          opportunities={opportunities.slice(0, 4)}
          isLoading={isLoading}
          onQuickStart={onQuickStart}
        />
      </SDashboardColumn>
    </SDashboardSplitView>
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
  platformStats,
  isMoversLoading,
  isPlatformLoading,
}: {
  movers: DashboardMarketMover[]
  platformStats: ReturnType<typeof useDashboardData>["platformStats"]
  isMoversLoading: boolean
  isPlatformLoading: boolean
}) => {
  const { t } = useTranslation(["dashboard", "common"])
  const compactMovers = movers.slice(0, 3)

  return (
    <SConnectedDiscovery>
      <SCompactDiscoveryCard>
        <SCompactDiscoveryHeader>
          <Text as="h2" fs="h7" fw={600} font="primary">
            {t("dashboard:platform.title")}
          </Text>
          <Chip variant="cyan" size="small" rounded>
            {t("dashboard:platform.live")}
          </Chip>
        </SCompactDiscoveryHeader>
        <SPlatformMetricGrid>
          <SPlatformMetric>
            <Text fs="p6" color={getToken("text.low")}>
              {t("dashboard:platform.liquidity")}
            </Text>
            {isPlatformLoading ? (
              <Skeleton width="4.5rem" height="1.25rem" />
            ) : (
              <Text
                fs="p4"
                fw={600}
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {platformStats.totalLiquidity === null
                  ? "—"
                  : t("common:currency.compact", {
                      value: platformStats.totalLiquidity,
                    })}
              </Text>
            )}
          </SPlatformMetric>
          <SPlatformMetric>
            <Text fs="p6" color={getToken("text.low")}>
              {t("dashboard:platform.volume")}
            </Text>
            {isPlatformLoading ? (
              <Skeleton width="4.5rem" height="1.25rem" />
            ) : (
              <Text
                fs="p4"
                fw={600}
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {platformStats.volume24h === null
                  ? "—"
                  : t("common:currency.compact", {
                      value: platformStats.volume24h,
                    })}
              </Text>
            )}
          </SPlatformMetric>
          <SPlatformMetric>
            <Text fs="p6" color={getToken("text.low")}>
              {t("dashboard:platform.earnOptions")}
            </Text>
            <Text fs="p4" fw={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
              {t("common:number", { value: platformStats.earningOptions })}
            </Text>
          </SPlatformMetric>
        </SPlatformMetricGrid>
      </SCompactDiscoveryCard>

      <SCompactDiscoveryCard>
        <SCompactDiscoveryHeader>
          <Text as="h2" fs="h7" fw={600} font="primary">
            {t("dashboard:discover.trade.title")}
          </Text>
          <Button variant="muted" size="small" asChild>
            <Link to={LINKS.swapMarket}>
              {t("dashboard:discover.trade.all")}
            </Link>
          </Button>
        </SCompactDiscoveryHeader>
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
      </SCompactDiscoveryCard>
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
      label: t("dashboard:portfolio.assets"),
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
        {isEmpty && (
          <Chip variant="secondary" size="small" rounded>
            {t("dashboard:portfolio.notFunded")}
          </Chip>
        )}
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
                  <Text
                    fs="p4"
                    fw={600}
                    font="primary"
                    color={getToken("accents.success.emphasis")}
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {t("common:currency", { value: claimableRewards })}
                  </Text>
                )}
              </SRewardsMetric>
            </SPortfolioHeadline>
            <SMetricGrid>
              <PortfolioMetric
                label={t("dashboard:portfolio.assets")}
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
              <SAssetIdentity>
                <AssetLogo id={[trade.from.id, trade.to.id]} size="small" />
                <Flex direction="column" gap="xs" sx={{ minWidth: 0 }}>
                  <Flex align="center" gap="s">
                    <Text fs="p4" fw={600}>
                      {trade.from.symbol}
                    </Text>
                    <Icon
                      component={ArrowRightLong}
                      size="s"
                      color={getToken("icons.onContainer")}
                    />
                    <Text fs="p4" fw={600}>
                      {trade.to.symbol}
                    </Text>
                  </Flex>
                  <RelativeDateText
                    date={trade.date}
                    shortFormat
                    fs="p6"
                    color={getToken("text.low")}
                  />
                </Flex>
              </SAssetIdentity>
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
  filter,
  onFilterChange,
  opportunities,
  isLoading,
  onQuickStart,
}: {
  accountConnected: boolean
  walletEmpty?: boolean
  compact?: boolean
  filter: OpportunityFilter
  onFilterChange: (filter: OpportunityFilter) => void
  opportunities: DashboardOpportunity[]
  isLoading: boolean
  onQuickStart: (opportunity: DashboardOpportunity) => void
}) => {
  const { t } = useTranslation("dashboard")
  const filterItems: ReadonlyArray<{
    key: OpportunityFilter
    label: string
  }> = [
    { key: "all", label: t("earn.filters.all") },
    ...(accountConnected && !walletEmpty
      ? [{ key: "matched" as const, label: t("earn.filters.forYou") }]
      : []),
    { key: "strategy", label: t("earn.filters.strategies") },
    { key: "liquidity", label: t("earn.filters.liquidity") },
  ]

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
            {walletEmpty
              ? t("earn.description.emptyWallet")
              : accountConnected
                ? t("earn.description.connected")
                : t("earn.description.disconnected")}
          </Text>
        </Flex>
        {compact ? (
          <Select
            size="small"
            value={filter}
            items={filterItems}
            onValueChange={onFilterChange}
          />
        ) : (
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
}: {
  opportunity: DashboardOpportunity
  onQuickStart: (opportunity: DashboardOpportunity) => void
}) => {
  const { t } = useTranslation("dashboard")
  const navigate = useNavigate()

  const handleOpen = () => {
    if (opportunity.isMatched) {
      onQuickStart(opportunity)
      return
    }

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

  return (
    <SOpportunityCard
      type="button"
      onClick={handleOpen}
      aria-label={
        opportunity.isMatched
          ? t("opportunity.startEarningFor", { title: opportunity.title })
          : t("open", { title: opportunity.title })
      }
    >
      <SOpportunityTop>
        <AssetLogo id={opportunity.logoIds} size="medium" />
        <Flex gap="s" sx={{ flexWrap: "wrap" }} justify="flex-end">
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
