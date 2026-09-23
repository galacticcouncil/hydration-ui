import {
  canBorrowAgainst,
  markets,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useHollarFacilitator,
  useMoneyMarket,
  useReserveSummaries,
  useWalletBalances,
} from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import { Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Flex,
  Grid,
  Icon,
  Separator,
  Spinner,
  Stack,
  Summary,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { useParams, useSearch } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { FC, ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { CapProgressCircle } from "@/modules/borrow/reserve/components/CapProgressCircle"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { DEFAULT_MARKET, useUserAddress } from "@/modules/money-market-v2/hooks"
import { InterestRateModelChart } from "@/modules/money-market-v2/InterestRateModelChart"
import { MarketSelect } from "@/modules/money-market-v2/MoneyMarketV2Layout"
import {
  ApyCell,
  CollateralCell,
  isHollar,
  ReadError,
  ReserveAsset,
  reserveAssetId,
  ReserveDataTable,
  useReserveLogoId,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { SStickyCard } from "@/modules/money-market-v2/ReserveDetailPage.styled"
import { ReserveRatesChart } from "@/modules/money-market-v2/ReserveRatesChart"
import { useAssets } from "@/providers/assetsProvider"

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
    from: "/money-market/$address",
    shouldThrow: false,
  })
  const search = useSearch({ from: "/money-market", shouldThrow: false })
  const { getAsset } = useAssets()

  if (!params) return null

  const market = markets[search?.market ?? DEFAULT_MARKET]
  return getAsset(reserveAssetId(params.address, market))?.symbol ?? null
}

const ReserveDetail: FC<{
  reserve: ReserveSummary
  reserves: ReserveSummary[]
}> = ({ reserve, reserves }) => {
  const { symbol, borrowingEnabled } = reserve
  const { market } = useMoneyMarket()
  const hollar = isHollar(reserve.underlyingAsset, market)

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

  return (
    <Stack gap="xxl">
      <Flex justify="space-between" align="center" gap="base" wrap>
        <ReserveTitle reserve={reserve} />
        <MarketSelect />
      </Flex>

      {hollar ? (
        <HollarHeader reserve={reserve} />
      ) : (
        <ReserveHeader reserve={reserve} />
      )}

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
                columns={collateralColumns}
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
                columns={borrowableColumns}
                empty={`Nothing can currently be borrowed against ${symbol}.`}
              />
            </Section>
          )}
        </Stack>
        <SStickyCard>
          <YourPosition reserve={reserve} hollar={hollar} />
        </SStickyCard>
      </TwoColumnGrid>
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

const ReserveTitle: FC<{ reserve: ReserveSummary }> = ({ reserve }) => (
  <Flex align="center" gap="base">
    <AssetLogo id={useReserveLogoId(reserve)} size="large" />
    <Flex direction="column">
      <Text
        font="primary"
        fs="h6"
        lh={1}
        fw={600}
        color={getToken("text.high")}
      >
        {reserve.name}
      </Text>
      <Text fs="p5" color={getToken("text.medium")}>
        {reserve.symbol}
      </Text>
    </Flex>
  </Flex>
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

const HollarHeader: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { t } = useTranslation()
  const facilitator = useHollarFacilitator()
  const cap = facilitator.data?.maxCapacity

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
        label="Total borrowed"
        value={t("currency.compact", { value: reserve.totalDebtUsd })}
        bottomLabel={`${t("number.compact", { value: reserve.totalDebt })} ${reserve.symbol}`}
      />
      <ValueStats
        size="large"
        wrap={[false, false, true]}
        isLoading={facilitator.isPending}
        label="Borrow cap"
        value={
          cap
            ? t("currency.compact", {
                value: Big(cap).times(reserve.priceInUsd).toFixed(),
              })
            : "-"
        }
        bottomLabel={
          cap
            ? `${t("number.compact", { value: cap })} ${reserve.symbol}`
            : undefined
        }
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

  return (
    <Section
      title="Borrow info"
      description={`${reserve.symbol} is minted when borrowed, up to a cap set by governance, at a rate set by governance rather than by utilization.`}
    >
      <Flex gap="xxxl" align="center" wrap>
        {facilitator.error ? (
          <ReadError error={facilitator.error} />
        ) : facilitator.data ? (
          <CapStat
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
        <Stack gap="s">
          <Text fs="p5" color={getToken("text.medium")}>
            Borrow APY
          </Text>
          <ApyCell
            apy={reserve.variableBorrowApy}
            incentives={reserve.borrowIncentives}
          />
        </Stack>
      </Flex>
    </Section>
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

const ProtocolParameters: FC<{ reserve: ReserveSummary; hollar: boolean }> = ({
  reserve,
  hollar,
}) => {
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

  // one list split evenly, so a reserve with few rows still fills both columns
  const rows = [
    { label: "Market", content: market.marketTitle },
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
    {
      label: "Siloed borrowing",
      content: yesNo(reserve.isSiloedBorrowing),
    },
    {
      label: "Flash loans",
      content: yesNo(reserve.flashLoanEnabled),
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
  ]
  const half = Math.ceil(rows.length / 2)

  return (
    <Section
      title="Protocol parameters"
      description={`How ${reserve.symbol} is configured in this market.`}
    >
      {!hollar && (
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
      )}

      <Grid columns={[1, null, 2]} gap="xl" align="start">
        <Summary rows={rows.slice(0, half)} />
        <Summary rows={rows.slice(half)} />
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

const YourPosition: FC<{ reserve: ReserveSummary; hollar: boolean }> = ({
  reserve,
  hollar,
}) => {
  const { t } = useTranslation()
  const user = useUserAddress()
  const account = useAccountSummary(user)
  const balances = useWalletBalances(user)

  const acc = account.data?.account
  const position = account.data?.positions.find(
    (p) => p.underlyingAsset === reserve.underlyingAsset,
  )
  const walletBalance =
    balances.data?.balances.find(
      (b) => b.underlyingAsset === reserve.underlyingAsset,
    )?.amount ?? "0"

  const usd = (value: string) =>
    t("currency", { value, maximumFractionDigits: 2 })
  const tokens = (value: string) =>
    `${t("number", { value })} ${reserve.symbol}`

  return (
    <>
      <CardHeader>
        <CardTitle>Your position</CardTitle>
      </CardHeader>
      {!user ? (
        <Stack p="l" gap="l">
          <Text fs="p5" color={getToken("text.low")}>
            Connect a wallet to see your {reserve.symbol} position.
          </Text>
          <Web3ConnectButton size="large" width="100%" />
        </Stack>
      ) : account.error ? (
        <CardBody>
          <ReadError error={account.error} />
        </CardBody>
      ) : (
        <>
          <Stack p="l" gap="xl">
            <Grid
              columns={reserve.borrowingEnabled && !hollar ? 2 : 1}
              gap="xl"
            >
              {!hollar && (
                <ValueStats
                  size="medium"
                  wrap
                  isLoading={account.isPending}
                  label="Supplied"
                  value={usd(position?.underlyingBalanceUsd ?? "0")}
                  bottomLabel={tokens(position?.underlyingBalance ?? "0")}
                />
              )}
              {reserve.borrowingEnabled && (
                <ValueStats
                  size="medium"
                  wrap
                  isLoading={account.isPending}
                  label="Borrowed"
                  value={usd(position?.variableBorrowsUsd ?? "0")}
                  bottomLabel={tokens(position?.variableBorrows ?? "0")}
                />
              )}
            </Grid>
            <Flex gap="m" align="center">
              <Icon component={Wallet} sx={{ color: getToken("text.low") }} />
              <ValueStats
                size="small"
                font="secondary"
                wrap
                isLoading={balances.isPending}
                label="Wallet balance"
                value={tokens(walletBalance)}
                bottomLabel={usd(
                  Big(walletBalance).times(reserve.priceInUsd).toFixed(),
                )}
              />
            </Flex>
          </Stack>
          <Separator />
          <CardBody>
            <Summary
              rows={[
                ...(canBeCollateral(reserve)
                  ? [
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
                    ]
                  : []),
                {
                  label: "Health factor",
                  loading: account.isPending,
                  content:
                    acc && acc.healthFactor !== "-1"
                      ? t("number", {
                          value: acc.healthFactor,
                          maximumFractionDigits: 2,
                        })
                      : "-",
                },
                {
                  label: "Available to borrow",
                  loading: account.isPending,
                  content: usd(acc?.availableBorrowsUsd ?? "0"),
                },
                ...(position?.rewards ?? []).map((reward) => ({
                  label: `Accrued ${reward.rewardTokenSymbol}`,
                  content: t("number", { value: reward.amount }),
                })),
              ]}
            />
          </CardBody>
        </>
      )}
    </>
  )
}

const columnHelper = createColumnHelper<Row>()

const collateralColumns = [
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
]

const borrowableColumns = [
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
