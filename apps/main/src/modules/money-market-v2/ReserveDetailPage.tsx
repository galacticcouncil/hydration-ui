import {
  assessBorrow,
  canBorrowAgainst,
  eModeCategories,
  markets,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountRequest,
  useAccountSummary,
  useHollarFacilitator,
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Chip,
  Flex,
  Grid,
  Paper,
  ProgressCircle,
  Separator,
  Spinner,
  Stack,
  Summary,
  Text,
  ValueStats,
  ValueStatsProps,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useParams, useSearch } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { FC, Fragment, ReactNode, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { CapProgressCircle } from "@/modules/borrow/reserve/components/CapProgressCircle"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import {
  OpenAction,
  OpenActionModal,
} from "@/modules/money-market-v2/actions/ActionModal"
import { ApySide } from "@/modules/money-market-v2/ApyTooltip"
import { DEFAULT_MARKET, useUserAddress } from "@/modules/money-market-v2/hooks"
import { InterestRateModelChart } from "@/modules/money-market-v2/InterestRateModelChart"
import {
  ACTION_ICONS,
  ActionsCell,
  OnRowAction,
  ReadError,
  ReserveApyCell,
  ReserveAsset,
  ReserveDataTable,
  RowAction,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { MyPosition } from "@/modules/money-market-v2/MyPosition"
import { reserveDisplay } from "@/modules/money-market-v2/reserveDisplay"
import { ReserveRatesChart } from "@/modules/money-market-v2/ReserveRatesChart"
import { isHollar } from "@/modules/money-market-v2/reserves"
import { useReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"
import { useAssets } from "@/providers/assetsProvider"

type Row = { reserve: ReserveSummary }

const byLiquidityDesc = (a: Row, b: Row) =>
  Big(b.reserve.totalLiquidityUsd).cmp(a.reserve.totalLiquidityUsd)

const byLtvDesc = (a: Row, b: Row) =>
  Big(b.reserve.ltv).cmp(a.reserve.ltv) || byLiquidityDesc(a, b)

const canBeCollateral = (reserve: ReserveSummary) =>
  reserve.usageAsCollateralEnabled && Big(reserve.ltv).gt(0)

const yesNo = (value: boolean) => (value ? "Yes" : "No")

const usePercent = () => {
  const { t } = useTranslation()
  return (fraction: string) => t("percent", { value: Number(fraction) * 100 })
}

export const ReserveDetailPage: FC<{ address: string }> = ({ address }) => {
  const reserves = useReserveSummaries()
  const { market } = useMoneyMarket()

  if (reserves.error) return <ReadError error={reserves.error} />
  if (!reserves.data) {
    return (
      <Flex justify="center" p="xl">
        <Spinner />
      </Flex>
    )
  }

  const reserve = findReserve(reserves.data, address)

  if (!reserve) {
    return (
      <Alert
        variant="warning"
        title="Reserve not found"
        description={`${address} is not a reserve of the ${market.marketTitle} market.`}
      />
    )
  }

  return <ReserveDetail reserve={reserve} reserves={reserves.data} />
}

const findReserve = (reserves: ReserveSummary[], address: string) =>
  reserves.find((r) => r.underlyingAsset === address.toLowerCase())

/**
 * Renders in the pending layout too, outside the MoneyMarketProvider, so it
 * reads the asset registry rather than the market's reserves.
 */
export const ReserveCrumb: FC = () => {
  const params = useParams({
    from: "/money-market/markets/$address",
    shouldThrow: false,
  })
  const search = useSearch({ from: "/money-market", shouldThrow: false })
  const registry = useAssets()

  if (!params) return null

  const market = markets[search?.market ?? DEFAULT_MARKET]
  const { symbol } = reserveDisplay(
    { underlyingAsset: params.address, symbol: "", name: "" },
    market,
    registry,
  )
  return symbol || null
}

const ReserveDetail: FC<{
  reserve: ReserveSummary
  reserves: ReserveSummary[]
}> = ({ reserve, reserves }) => {
  const { borrowingEnabled } = reserve
  const { symbol } = useReserveDisplay(reserve)
  const { market } = useMoneyMarket()
  const hollar = isHollar(reserve.underlyingAsset, market)
  const { t } = useTranslation("moneyMarket")
  const user = useUserAddress()
  const eModeId = useAccountSummary(user).data?.account.eModeCategoryId
  const [open, setOpen] = useState<OpenAction | null>(null)

  const columns = useMemo(() => {
    const onAction = user
      ? (action: RowAction, asset: Address) => setOpen({ action, asset })
      : undefined
    // in e-mode only the category's own assets can be borrowed
    const eMode = eModeCategories(reserves).find((c) => c.id === eModeId)
    return {
      collateral: collateralColumns(onAction),
      borrowable: borrowableColumns(onAction, (candidate) =>
        eMode && candidate.eModeCategoryId !== eMode.id
          ? t("emode.notAvailable", { category: eMode.label })
          : undefined,
      ),
    }
  }, [user, eModeId, reserves, t])

  const collateral = useMemo(
    () =>
      reserves
        .filter((candidate) => canBorrowAgainst(candidate, reserve))
        .map((candidate) => ({ reserve: candidate }))
        .sort(byLtvDesc),
    [reserves, reserve],
  )

  const borrowable = useMemo(
    () =>
      reserves
        .filter((candidate) => canBorrowAgainst(reserve, candidate))
        .map((candidate) => ({ reserve: candidate }))
        .sort(byLiquidityDesc),
    [reserves, reserve],
  )

  return (
    <Stack gap="xxl">
      <Flex align="center" justify="space-between" gap="xxl" wrap>
        <ReserveTitle reserve={reserve} />
        <ReserveActions reserve={reserve} hollar={hollar} />
      </Flex>

      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" sx={{ order: [1, null, 0] }}>
          {hollar ? (
            <>
              <AboutHollar />
              <HollarBorrowInfo reserve={reserve} />
            </>
          ) : (
            <InterestRates reserve={reserve} />
          )}
          <ProtocolParameters reserve={reserve} hollar={hollar} />
          {reserve.eModeCategoryId !== 0 && (
            <EModeParameters reserve={reserve} />
          )}
          {borrowingEnabled && !hollar && (
            <InterestRateModel reserve={reserve} />
          )}
          {borrowingEnabled && (
            <Section
              flush
              title="Supported collateral"
              description={`Assets that can be supplied as collateral to borrow ${symbol} in this market. E-mode and an account's own state can narrow this further.`}
            >
              <ReserveDataTable
                size="compact"
                data={collateral}
                columns={columns.collateral}
                limit={10}
                empty={`Nothing can currently back a ${symbol} borrow.`}
              />
            </Section>
          )}
          {canBeCollateral(reserve) && (
            <Section
              flush
              title="Assets you can borrow"
              description={`What can be borrowed with ${symbol} as collateral.`}
            >
              <ReserveDataTable
                size="compact"
                data={borrowable}
                columns={columns.borrowable}
                limit={10}
                empty={`Nothing can currently be borrowed against ${symbol}.`}
              />
            </Section>
          )}
        </Stack>
        <Stack gap="xl">
          {hollar ? (
            <HollarStats reserve={reserve} />
          ) : (
            <ReserveStats reserve={reserve} />
          )}
          <MyPosition reserve={reserve} />
        </Stack>
      </TwoColumnGrid>
      <OpenActionModal open={open} onClose={() => setOpen(null)} />
    </Stack>
  )
}

/** `flush` drops the body padding, so a table runs edge to edge. */
const Section: FC<{
  title: string
  description: string
  flush?: boolean
  children: ReactNode
}> = ({ title, description, flush = false, children }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    {flush ? (
      children
    ) : (
      <CardBody>
        <Stack gap="xl">{children}</Stack>
      </CardBody>
    )}
  </Card>
)

const ReserveTitle: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { name, symbol, logoId } = useReserveDisplay(reserve)

  return (
    <Flex align="center" gap="base">
      <AssetLogo id={logoId} size="large" />
      <Flex direction="column">
        <Text
          font="primary"
          fs="h6"
          lh={1}
          fw={600}
          color={getToken("text.high")}
        >
          {name}
        </Text>
        <Text fs="p5" color={getToken("text.medium")}>
          {symbol}
        </Text>
      </Flex>
    </Flex>
  )
}

/** The same panel as the stats beside the liquidity pool chart. */
const StatsPanel: FC<{ stats: ValueStatsProps[] }> = ({ stats }) => (
  <Paper p={["secondary", "primary"]}>
    <Flex direction="column" gap="xl">
      {stats.map((stat, index) => (
        <Fragment key={index}>
          {index > 0 && <Separator mx="-xl" />}
          <ValueStats wrap {...stat} />
        </Fragment>
      ))}
    </Flex>
  </Paper>
)

const ReserveStats: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { t } = useTranslation()
  const percent = usePercent()
  const { symbol } = useReserveDisplay(reserve)
  const tokens = (value: string) =>
    `${t("number.compact", { value })} ${symbol}`

  return (
    <StatsPanel
      stats={[
        {
          label: "Total supplied",
          value: t("currency.compact", { value: reserve.totalLiquidityUsd }),
          bottomLabel: tokens(reserve.totalLiquidity),
        },
        {
          label: "Total borrowed",
          value: t("currency.compact", { value: reserve.totalDebtUsd }),
          bottomLabel: tokens(reserve.totalDebt),
        },
        {
          label: "Available liquidity",
          value: t("currency.compact", {
            value: reserve.availableLiquidityUsd,
          }),
          bottomLabel: tokens(reserve.availableLiquidity),
        },
        {
          label: "Utilization",
          value: percent(reserve.borrowUsageRatio),
        },
        {
          label: "Oracle price",
          value: t("currency", { value: reserve.priceInUsd }),
        },
      ]}
    />
  )
}

const HollarStats: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { t } = useTranslation()
  const facilitator = useHollarFacilitator()
  const cap = facilitator.data?.maxCapacity
  const { symbol } = useReserveDisplay(reserve)
  const tokens = (value: string) =>
    `${t("number.compact", { value })} ${symbol}`

  return (
    <StatsPanel
      stats={[
        {
          label: "Total borrowed",
          value: t("currency.compact", { value: reserve.totalDebtUsd }),
          bottomLabel: tokens(reserve.totalDebt),
        },
        {
          label: "Borrow cap",
          isLoading: facilitator.isPending,
          value: cap
            ? t("currency.compact", {
                value: Big(cap).times(reserve.priceInUsd).toFixed(),
              })
            : "-",
          bottomLabel: cap ? tokens(cap) : undefined,
        },
        {
          label: "Oracle price",
          value: t("currency", { value: reserve.priceInUsd }),
        },
      ]}
    />
  )
}

const AboutHollar: FC = () => {
  const { t } = useTranslation("borrow")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("reserve.hollar.title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <Text fs="p4" color={getToken("text.medium")}>
          {t("reserve.hollar.description")}
        </Text>
      </CardBody>
    </Card>
  )
}

/**
 * Hollar is minted on borrow, so its only cap is the facilitator bucket and its
 * rate is set by governance - there is no supply side and no utilization curve.
 */
const HollarBorrowInfo: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const facilitator = useHollarFacilitator()
  const { symbol } = useReserveDisplay(reserve)

  return (
    <Section
      title="Borrow info"
      description={`${symbol} is minted when borrowed, up to a cap set by governance, at a rate set by governance rather than by utilization.`}
    >
      <Flex gap="xxxl" align="center" wrap>
        {facilitator.error ? (
          <ReadError error={facilitator.error} />
        ) : facilitator.data ? (
          <CapStat
            type="borrow"
            label="Total borrowed"
            amount={reserve.totalDebt}
            amountUsd={reserve.totalDebtUsd}
            cap={facilitator.data.maxCapacity}
            capUsd={Big(facilitator.data.maxCapacity)
              .times(reserve.priceInUsd)
              .toFixed()}
          />
        ) : (
          <ValueStats size="small" wrap isLoading label="Total borrowed" />
        )}
        <ApyStat reserve={reserve} side="borrow" />
      </Flex>
    </Section>
  )
}

const InterestRates: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { symbol } = useReserveDisplay(reserve)

  return (
    <Section
      title="Interest rates"
      description={`Current supply and borrow rates for ${symbol}, with each incentive listed apart from the base rate.`}
    >
      <Flex gap="xxxl">
        <ApyStat reserve={reserve} side="supply" />
        {reserve.borrowingEnabled && (
          <ApyStat reserve={reserve} side="borrow" />
        )}
      </Flex>
      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <ReserveRatesChart reserve={reserve} />
      )}
    </Section>
  )
}

const ApyStat: FC<{ reserve: ReserveSummary; side: ApySide }> = ({
  reserve,
  side,
}) => (
  <ValueStats
    size="medium"
    wrap
    label={side === "supply" ? "Supply APY" : "Borrow APY"}
    customValue={
      <ValueStatsValue size="medium">
        <ReserveApyCell reserve={reserve} side={side} font="primary" />
      </ValueStatsValue>
    }
  />
)

const CapStat: FC<{
  label: string
  amount: string
  amountUsd: string
  cap: string
  capUsd: string
  type: "supply" | "borrow"
}> = ({ label, amount, amountUsd, cap, capUsd, type }) => {
  const { t } = useTranslation(["common", "borrow"])
  const hasCap = cap !== "0"

  return (
    <Flex gap="m" align="center">
      {hasCap && (
        <CapProgressCircle
          type={type}
          radius={32}
          thickness={4}
          percent={Big(amount).div(cap).times(100).toNumber()}
          tooltip={`${t("number.compact", { value: Big(cap).minus(amount).toFixed() })} left before the cap`}
        />
      )}
      <ValueStats
        size="medium"
        wrap
        label={label}
        value={
          hasCap
            ? t("borrow:cap.range", { valueA: amount, valueB: cap })
            : t("number.compact", { value: amount })
        }
        bottomLabel={
          hasCap
            ? t("borrow:cap.range.usd", { valueA: amountUsd, valueB: capUsd })
            : t("currency.compact", { value: amountUsd })
        }
      />
    </Flex>
  )
}

const ProtocolParameters: FC<{ reserve: ReserveSummary; hollar: boolean }> = ({
  reserve,
  hollar,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const percent = usePercent()
  const { symbol } = useReserveDisplay(reserve)

  const capLabel = (cap: string) =>
    cap === "0" ? "Unlimited" : `${t("number", { value: cap })} ${symbol}`

  const status = reserve.isPaused
    ? "Paused"
    : reserve.isFrozen
      ? "Frozen"
      : reserve.isActive
        ? "Active"
        : "Inactive"

  const collateralUsage = !canBeCollateral(reserve) ? (
    "Cannot be collateral"
  ) : reserve.isIsolated ? (
    <Chip variant="amber" size="small">
      Isolated
    </Chip>
  ) : (
    <Chip variant="green" size="small">
      Supported
    </Chip>
  )

  // one list split evenly, so a reserve with few rows still fills both columns
  const rows = [
    { label: "Status", content: status },
    // Hollar's real cap is its facilitator bucket, shown in Borrow info
    ...(hollar
      ? []
      : [
          { label: "Supply cap", content: capLabel(reserve.supplyCap) },
          { label: "Borrow cap", content: capLabel(reserve.borrowCap) },
        ]),
    { label: "Collateral usage", content: collateralUsage },
    {
      label: "Borrowing",
      content: reserve.borrowingEnabled ? "Enabled" : "Disabled",
    },
    {
      label: "Borrowable in isolation",
      content: yesNo(reserve.borrowableInIsolation),
    },
    // unset on a reserve that cannot back a borrow, so meaningless there
    ...(canBeCollateral(reserve)
      ? [
          { label: "Max LTV", content: percent(reserve.ltv) },
          {
            label: "Liquidation threshold",
            content: percent(reserve.liquidationThreshold),
          },
          {
            label: "Liquidation penalty",
            content: percent(reserve.liquidationBonus),
          },
        ]
      : []),
    {
      label: "Reserve factor",
      content: percent(reserve.reserveFactor),
    },
    ...(reserve.isIsolated
      ? [
          {
            label: "Debt ceiling",
            content: t("borrow:cap.range.usd", {
              valueA: reserve.isolationModeTotalDebtUsd,
              valueB: reserve.debtCeilingUsd,
            }),
          },
        ]
      : []),
  ]
  const half = Math.ceil(rows.length / 2)

  return (
    <Section
      title="Protocol parameters"
      description={`How ${symbol} is configured in this market.`}
    >
      {!hollar && (
        <Grid columns={[1, 2]} gap="xl">
          <CapStat
            type="supply"
            label="Total supplied"
            amount={reserve.totalLiquidity}
            amountUsd={reserve.totalLiquidityUsd}
            cap={reserve.supplyCap}
            capUsd={reserve.supplyCapUsd}
          />
          {reserve.borrowingEnabled && (
            <CapStat
              type="borrow"
              label="Total borrowed"
              amount={reserve.totalDebt}
              amountUsd={reserve.totalDebtUsd}
              cap={reserve.borrowCap}
              capUsd={reserve.borrowCapUsd}
            />
          )}
        </Grid>
      )}

      <Grid columns={[1, null, 2]} gap="xl" align="start">
        <Summary rows={rows.slice(0, half)} />
        <Summary rows={rows.slice(half)} />
      </Grid>
    </Section>
  )
}

const EModeParameters: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const percent = usePercent()
  const { symbol } = useReserveDisplay(reserve)

  return (
    <Section
      title="E-mode parameters"
      description={`What applies to ${symbol} instead once an account enables the ${reserve.eModeLabel} E-mode category.`}
    >
      <Grid columns={[1, null, 2]} gap="xl" align="start">
        <Summary
          rows={[
            { label: "Category", content: reserve.eModeLabel },
            { label: "Max LTV", content: percent(reserve.eModeLtv) },
          ]}
        />
        <Summary
          rows={[
            {
              label: "Liquidation threshold",
              content: percent(reserve.eModeLiquidationThreshold),
            },
            {
              label: "Liquidation penalty",
              content: percent(reserve.eModeLiquidationBonus),
            },
          ]}
        />
      </Grid>
    </Section>
  )
}

const InterestRateModel: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const percent = usePercent()

  return (
    <Section
      title="Interest rate model"
      description="The variable borrow rate follows the reserve's utilization, rising steeply past the optimal point."
    >
      <Grid columnTemplate={[null, null, "1fr 2fr"]} gap="xl" align="flex-end">
        <Stack gap="xl">
          <ValueStats
            size="large"
            wrap
            label="Utilization"
            customValue={
              <Flex align="center" gap="s">
                <ProgressCircle
                  radius={12}
                  thickness={3}
                  percent={Number(reserve.borrowUsageRatio) * 100}
                  color={getToken("text.high")}
                />
                <ValueStatsValue size="large">
                  {percent(reserve.borrowUsageRatio)}
                </ValueStatsValue>
              </Flex>
            }
          />
          <Summary
            rows={[
              {
                label: "Optimal utilization",
                content: percent(reserve.optimalUsageRatio),
              },
              {
                label: "Base rate",
                content: percent(reserve.baseVariableBorrowRate),
              },
              {
                label: "Slope below optimal",
                content: percent(reserve.variableRateSlope1),
              },
              {
                label: "Slope above optimal",
                content: percent(reserve.variableRateSlope2),
              },
            ]}
          />
        </Stack>
        <InterestRateModelChart reserve={reserve} />
      </Grid>
    </Section>
  )
}

/**
 * Supply leads. The other actions sit behind a "..." menu, each only while the
 * account can take it, and the menu goes when none is left.
 */
const ReserveActions: FC<{ reserve: ReserveSummary; hollar: boolean }> = ({
  reserve,
  hollar,
}) => {
  const { t } = useTranslation("moneyMarket")
  const [open, setOpen] = useState<OpenAction | null>(null)
  const user = useUserAddress()
  const account = useAccountSummary(user).data
  const request = useAccountRequest(user).data
  const facilitator = useHollarFacilitator().data
  const asset = reserve.underlyingAsset

  const position = account?.positions.find((p) => p.underlyingAsset === asset)
  // the borrow form's own max, so the menu never offers what the form refuses.
  // No wallet has no account to assess, and sees borrow wherever it is enabled.
  const canBorrow =
    reserve.borrowingEnabled &&
    (!request ||
      Big(
        assessBorrow({
          ...request,
          asset,
          amount: "",
          hollarFacilitator: hollar ? facilitator : undefined,
        }).max,
      ).gt(0))

  const more = (["withdraw", "borrow", "repay"] as const).filter(
    (action) =>
      ({
        withdraw: Big(position?.underlyingBalance ?? 0).gt(0),
        borrow: canBorrow,
        repay: Big(position?.variableBorrows ?? 0).gt(0),
      })[action],
  )

  return (
    <Flex align="center" gap="base">
      {!hollar && (
        <Button
          iconStart={ACTION_ICONS.supply}
          size="medium"
          onClick={() => setOpen({ action: "supply", asset })}
        >
          {t("supply")}
        </Button>
      )}
      {more.length > 0 && (
        <ActionsCell
          asset={asset}
          actions={[]}
          more={more}
          size="medium"
          onAction={(action, asset) => setOpen({ action, asset })}
        />
      )}
      <OpenActionModal open={open} onClose={() => setOpen(null)} />
    </Flex>
  )
}

const columnHelper = createColumnHelper<Row>()

// fits one icon button, so the column before it ends right beside it
const ACTION_COLUMN_WIDTH = 45

const collateralColumns = (onAction: OnRowAction) => [
  columnHelper.display({
    header: "Asset",
    cell: ({ row }) => (
      <ReserveAsset reserve={row.original.reserve} size="small" />
    ),
  }),
  columnHelper.display({
    header: "Max LTV",
    meta: { sx: { textAlign: "right" } },
    cell: ({ row }) => <PercentCell value={row.original.reserve.ltv} />,
  }),
  columnHelper.display({
    id: "actions",
    size: ACTION_COLUMN_WIDTH,
    cell: ({ row }) => (
      <ActionsCell
        asset={row.original.reserve.underlyingAsset}
        actions={["supply"]}
        onAction={onAction}
        iconOnly
      />
    ),
  }),
]

const borrowableColumns = (
  onAction: OnRowAction,
  blockedReason: (reserve: ReserveSummary) => string | undefined,
) => [
  columnHelper.display({
    header: "Asset",
    cell: ({ row }) => (
      <ReserveAsset reserve={row.original.reserve} size="small" />
    ),
  }),
  columnHelper.display({
    header: "Borrow APY",
    meta: { sx: { textAlign: "right" } },
    cell: ({ row }) => (
      <ReserveApyCell reserve={row.original.reserve} side="borrow" />
    ),
  }),
  columnHelper.display({
    id: "actions",
    size: ACTION_COLUMN_WIDTH,
    cell: ({ row }) => {
      const reason = blockedReason(row.original.reserve)
      return (
        <ActionsCell
          asset={row.original.reserve.underlyingAsset}
          actions={["borrow"]}
          onAction={onAction}
          disabled={!!reason}
          tooltip={reason}
          iconOnly
        />
      )
    },
  }),
]

const PercentCell: FC<{ value: string }> = ({ value }) => {
  const percent = usePercent()
  return <Text fs="p5">{percent(value)}</Text>
}
