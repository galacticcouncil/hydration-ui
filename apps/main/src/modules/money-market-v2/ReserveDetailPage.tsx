import { canBorrowAgainst } from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useMoneyMarket,
  useReserveSummaries,
  useWalletBalances,
} from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Paper,
  Spinner,
  Stack,
  Summary,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link, useSearch } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { ChevronLeft } from "lucide-react"
import { FC, ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { CapProgressCircle } from "@/modules/borrow/reserve/components/CapProgressCircle"
import { ReserveSectionDivider } from "@/modules/borrow/reserve/components/ReserveSectionDivider"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import { InterestRateModelChart } from "@/modules/money-market-v2/InterestRateModelChart"
import {
  AmountCell,
  ApyCell,
  CollateralCell,
  ReadError,
  ReserveAsset,
  ReserveDataTable,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { ReserveRatesChart } from "@/modules/money-market-v2/ReserveRatesChart"

type Row = { reserve: ReserveSummary }

const byLiquidityDesc = (a: Row, b: Row) =>
  Big(b.reserve.totalLiquidityUsd).cmp(a.reserve.totalLiquidityUsd)

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

  const reserve = reserves.data.find(
    (r) => r.underlyingAsset === address.toLowerCase(),
  )

  if (!reserve) {
    return (
      <Stack gap="xl" align="flex-start">
        <BackLink />
        <Alert
          variant="warning"
          title="Reserve not found"
          description={`${address} is not a reserve of the ${market.marketTitle} market.`}
        />
      </Stack>
    )
  }

  return <ReserveDetail reserve={reserve} reserves={reserves.data} />
}

const BackLink: FC = () => {
  const { market } = useSearch({ from: "/money-market" })

  return (
    <Button variant="tertiary" size="small" asChild>
      <Link to="/money-market" search={{ market }}>
        <Icon component={ChevronLeft} size="s" />
        Back
      </Link>
    </Button>
  )
}

const ReserveDetail: FC<{
  reserve: ReserveSummary
  reserves: ReserveSummary[]
}> = ({ reserve, reserves }) => {
  const { symbol, borrowingEnabled } = reserve

  const collateral = useMemo(
    () =>
      reserves
        .filter((candidate) => canBorrowAgainst(candidate, reserve))
        .map((candidate) => ({ reserve: candidate }))
        .sort(byLiquidityDesc),
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

  const sections: ReadonlyArray<[string, ReactNode] | false> = [
    ["rates", <InterestRates key="rates" reserve={reserve} />],
    ["params", <ProtocolParameters key="params" reserve={reserve} />],
    borrowingEnabled && [
      "model",
      <InterestRateModel key="model" reserve={reserve} />,
    ],
    borrowingEnabled && [
      "collateral",
      <Section
        key="collateral"
        title="Supported collateral"
        description={`Assets that can be supplied as collateral to borrow ${symbol} in this market. E-mode and an account's own state can narrow this further.`}
      >
        <Paper variant="bordered">
          <ReserveDataTable
            data={collateral}
            columns={collateralColumns}
            empty={`Nothing can currently back a ${symbol} borrow.`}
          />
        </Paper>
      </Section>,
    ],
    canBeCollateral(reserve) && [
      "borrowable",
      <Section
        key="borrowable"
        title="Assets you can borrow"
        description={`What can be borrowed with ${symbol} as collateral.`}
      >
        <Paper variant="bordered">
          <ReserveDataTable
            data={borrowable}
            columns={borrowableColumns}
            empty={`Nothing can currently be borrowed against ${symbol}.`}
          />
        </Paper>
      </Section>,
    ],
  ]

  return (
    <Stack gap="xxl">
      <Stack gap="xl" align="flex-start">
        <BackLink />
        <ReserveAsset reserve={reserve} size="large" withName />
      </Stack>

      <ReserveHeader reserve={reserve} />

      <TwoColumnGrid template="sidebar">
        <Paper p="xl">
          {sections
            .filter((section) => section !== false)
            .map(([key, node], index) => (
              <Box key={key}>
                {index > 0 && <ReserveSectionDivider />}
                {node}
              </Box>
            ))}
        </Paper>
        <Paper p="xl">
          <YourPosition reserve={reserve} />
        </Paper>
      </TwoColumnGrid>
    </Stack>
  )
}

const Section: FC<{
  title: string
  description: string
  children: ReactNode
}> = ({ title, description, children }) => (
  <Stack gap="xl">
    <Stack gap="s">
      <Text fs="p3" fw={500}>
        {title}
      </Text>
      <Text fs="p5" color={getToken("text.low")}>
        {description}
      </Text>
    </Stack>
    {children}
  </Stack>
)

const ReserveHeader: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { t } = useTranslation()
  const percent = usePercent()

  return (
    <Stack
      direction={["column", null, "row"]}
      justify="flex-start"
      gap={["base", null, "xxxl"]}
      separated
    >
      <ValueStats
        size="large"
        wrap={[false, false, true]}
        label="Total supplied"
        value={t("currency.compact", { value: reserve.totalLiquidityUsd })}
        bottomLabel={`${t("number.compact", { value: reserve.totalLiquidity })} ${reserve.symbol}`}
      />
      <ValueStats
        size="large"
        wrap={[false, false, true]}
        label="Total borrowed"
        value={t("currency.compact", { value: reserve.totalDebtUsd })}
        bottomLabel={`${t("number.compact", { value: reserve.totalDebt })} ${reserve.symbol}`}
      />
      <ValueStats
        size="large"
        wrap={[false, false, true]}
        label="Available liquidity"
        value={t("currency.compact", { value: reserve.availableLiquidityUsd })}
        bottomLabel={`${t("number.compact", { value: reserve.availableLiquidity })} ${reserve.symbol}`}
      />
      <ValueStats
        size="large"
        wrap={[false, false, true]}
        label="Utilization"
        value={percent(reserve.borrowUsageRatio)}
      />
      <ValueStats
        size="large"
        wrap={[false, false, true]}
        label="Reserve factor"
        value={percent(reserve.reserveFactor)}
      />
      <ValueStats
        size="large"
        wrap={[false, false, true]}
        label="Oracle price"
        value={t("currency", { value: reserve.priceInUsd })}
      />
    </Stack>
  )
}

const InterestRates: FC<{ reserve: ReserveSummary }> = ({ reserve }) => (
  <Section
    title="Interest rates"
    description={`Current supply and borrow rates for ${reserve.symbol}, with each incentive listed apart from the base rate.`}
  >
    <Flex gap="xxxl">
      <Stack gap="s">
        <Text fs="p5" color={getToken("text.medium")}>
          Supply APY
        </Text>
        <ApyCell
          apy={reserve.supplyApy}
          incentives={reserve.supplyIncentives}
        />
      </Stack>
      {reserve.borrowingEnabled && (
        <Stack gap="s">
          <Text fs="p5" color={getToken("text.medium")}>
            Borrow APY
          </Text>
          <ApyCell
            apy={reserve.variableBorrowApy}
            incentives={reserve.borrowIncentives}
          />
        </Stack>
      )}
    </Flex>
    <ReserveRatesChart reserve={reserve} />
  </Section>
)

const CapStat: FC<{
  label: string
  amount: string
  amountUsd: string
  cap: string
  capUsd: string
}> = ({ label, amount, amountUsd, cap, capUsd }) => {
  const { t } = useTranslation(["common", "borrow"])
  const hasCap = cap !== "0"

  return (
    <Flex gap="m" align="center">
      {hasCap && (
        <CapProgressCircle
          radius={30}
          thickness={3}
          percent={Big(amount).div(cap).times(100).toNumber()}
          tooltip={`${t("number.compact", { value: Big(cap).minus(amount).toFixed() })} left before the cap`}
        />
      )}
      <ValueStats
        size="small"
        font="secondary"
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

const ProtocolParameters: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { t } = useTranslation(["common", "borrow"])
  const percent = usePercent()
  const { market } = useMoneyMarket()

  const capLabel = (cap: string) =>
    cap === "0"
      ? "Unlimited"
      : `${t("number", { value: cap })} ${reserve.symbol}`

  const status = reserve.isPaused
    ? "Paused"
    : reserve.isFrozen
      ? "Frozen"
      : reserve.isActive
        ? "Active"
        : "Inactive"

  const collateralUsage = !canBeCollateral(reserve)
    ? "Cannot be collateral"
    : reserve.isIsolated
      ? "Isolated collateral"
      : "Can be collateral"

  return (
    <Section
      title="Protocol parameters"
      description={`How ${reserve.symbol} is configured in this market.`}
    >
      <Grid columns={[1, 2]} gap="xl">
        <CapStat
          label="Total supplied"
          amount={reserve.totalLiquidity}
          amountUsd={reserve.totalLiquidityUsd}
          cap={reserve.supplyCap}
          capUsd={reserve.supplyCapUsd}
        />
        {reserve.borrowingEnabled && (
          <CapStat
            label="Total borrowed"
            amount={reserve.totalDebt}
            amountUsd={reserve.totalDebtUsd}
            cap={reserve.borrowCap}
            capUsd={reserve.borrowCapUsd}
          />
        )}
      </Grid>

      <Paper variant="bordered" p="base">
        <Grid columns={[1, null, 2]} gap="xl" align="start">
          <Summary
            rows={[
              { label: "Market", content: market.marketTitle },
              { label: "Status", content: status },
              { label: "Supply cap", content: capLabel(reserve.supplyCap) },
              { label: "Borrow cap", content: capLabel(reserve.borrowCap) },
              { label: "Collateral usage", content: collateralUsage },
              {
                label: "Borrowing",
                content: reserve.borrowingEnabled ? "Enabled" : "Disabled",
              },
              {
                label: "Borrowable in isolation",
                content: yesNo(reserve.borrowableInIsolation),
              },
              {
                label: "Siloed borrowing",
                content: yesNo(reserve.isSiloedBorrowing),
              },
              {
                label: "Flash loans",
                content: yesNo(reserve.flashLoanEnabled),
              },
            ]}
          />
          <Summary
            rows={[
              { label: "Max LTV", content: percent(reserve.ltv) },
              {
                label: "Liquidation threshold",
                content: percent(reserve.liquidationThreshold),
              },
              {
                label: "Liquidation penalty",
                content: percent(reserve.liquidationBonus),
              },
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
              ...(reserve.eModeCategoryId !== 0
                ? [
                    { label: "E-mode", content: reserve.eModeLabel },
                    {
                      label: "E-mode max LTV",
                      content: percent(reserve.eModeLtv),
                    },
                    {
                      label: "E-mode liquidation threshold",
                      content: percent(reserve.eModeLiquidationThreshold),
                    },
                    {
                      label: "E-mode liquidation penalty",
                      content: percent(reserve.eModeLiquidationBonus),
                    },
                  ]
                : []),
            ]}
          />
        </Grid>
      </Paper>
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
      <Grid columnTemplate={[null, null, "1fr 2fr"]} gap="xl" align="center">
        <Stack gap="xl">
          <ValueStats
            size="small"
            font="secondary"
            wrap
            label="Utilization"
            value={percent(reserve.borrowUsageRatio)}
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

const YourPosition: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { t } = useTranslation()
  const user = useUserAddress()
  const account = useAccountSummary(user)
  const balances = useWalletBalances(user)

  const position = account.data?.positions.find(
    (p) => p.underlyingAsset === reserve.underlyingAsset,
  )
  const walletBalance =
    balances.data?.balances.find(
      (b) => b.underlyingAsset === reserve.underlyingAsset,
    )?.amount ?? "0"

  const amount = (value: string, usd: string) => (
    <AmountCell amount={value} usd={usd} />
  )

  return (
    <Stack gap="xl">
      <Text fs="p3" fw={500}>
        Your position
      </Text>
      {!user ? (
        <Text fs="p5" color={getToken("text.low")}>
          Connect a wallet to see your {reserve.symbol} position.
        </Text>
      ) : account.error ? (
        <ReadError error={account.error} />
      ) : (
        <Summary
          rows={[
            {
              label: "Wallet balance",
              loading: balances.isPending,
              content: amount(
                walletBalance,
                Big(walletBalance).times(reserve.priceInUsd).toFixed(),
              ),
            },
            {
              label: "Supplied",
              loading: account.isPending,
              content: amount(
                position?.underlyingBalance ?? "0",
                position?.underlyingBalanceUsd ?? "0",
              ),
            },
            {
              label: "Used as collateral",
              loading: account.isPending,
              content: (
                <CollateralCell
                  enabled={!!position?.usageAsCollateralEnabledOnUser}
                  isolated={reserve.isIsolated}
                />
              ),
            },
            {
              label: "Borrowed",
              loading: account.isPending,
              content: amount(
                position?.variableBorrows ?? "0",
                position?.variableBorrowsUsd ?? "0",
              ),
            },
            ...(position?.rewards ?? []).map((reward) => ({
              label: `Accrued ${reward.rewardTokenSymbol}`,
              content: t("number", { value: reward.amount }),
            })),
          ]}
        />
      )}
    </Stack>
  )
}

const columnHelper = createColumnHelper<Row>()

const collateralColumns = [
  columnHelper.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  columnHelper.display({
    header: "Max LTV",
    meta: { sx: { textAlign: "right" } },
    cell: ({ row }) => <PercentCell value={row.original.reserve.ltv} />,
  }),
  columnHelper.display({
    header: "Liquidation threshold",
    meta: { sx: { textAlign: "right" } },
    cell: ({ row }) => (
      <PercentCell value={row.original.reserve.liquidationThreshold} />
    ),
  }),
]

const borrowableColumns = [
  columnHelper.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  columnHelper.display({
    header: "Borrow APY",
    meta: { sx: { textAlign: "right" } },
    cell: ({ row }) => (
      <ApyCell
        apy={row.original.reserve.variableBorrowApy}
        incentives={row.original.reserve.borrowIncentives}
      />
    ),
  }),
]

const PercentCell: FC<{ value: string }> = ({ value }) => {
  const percent = usePercent()
  return <Text fs="p5">{percent(value)}</Text>
}
