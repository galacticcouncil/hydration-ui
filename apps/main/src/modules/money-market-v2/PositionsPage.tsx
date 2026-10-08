import { markets } from "@galacticcouncil/money-market-v2/core"
import {
  MoneyMarketProvider,
  useMoneyMarket,
} from "@galacticcouncil/money-market-v2/react"
import {
  Box,
  Button,
  DataTable,
  Flex,
  Paper,
  PieChart,
  SectionHeader,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { Link, useNavigate } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { FC, ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useMoneyMarketEvents } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { DateText } from "@/components/RelativeDateText"
import { useAssetColor } from "@/hooks/useAssetColor"
import {
  BorrowHistoryRow,
  useBorrowHistoryColumns,
} from "@/modules/borrow/history/BorrowHistoryTable.columns"
import { useFormatEventName } from "@/modules/borrow/history/utils"
import {
  HealthFactorNumber,
  HF_UNBOUNDED,
} from "@/modules/money-market-v2/HealthFactorNumber"
import { DEFAULT_MARKET, useUserAddress } from "@/modules/money-market-v2/hooks"
import {
  NetApyValue,
  NoData,
  ReadError,
  SuppliedRow,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { ReserveApyProvider } from "@/modules/money-market-v2/ReserveApyProvider"
import { usePositions } from "@/modules/money-market-v2/usePositions"
import { useResolveReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"

const MAX_ICONS = 3
const PIE_SIZE = 96
const ACTIVITY_COUNT = 10
const ACTIVITY_PAGE = { pageIndex: 0, pageSize: ACTIVITY_COUNT }

const activityColumn = createColumnHelper<BorrowHistoryRow>()

/**
 * One side's assets as icons, a count past the third. The tooltip splits the
 * side by dollar value: a pie in the asset colors, with the amounts beside it.
 */
const PositionAssets: FC<{
  label: string
  rows: SuppliedRow[]
  usd: (row: SuppliedRow) => string
}> = ({ label, rows, usd }) => {
  const { t } = useTranslation()
  const resolveDisplay = useResolveReserveDisplay()
  const getAssetColor = useAssetColor()

  if (!rows.length) return <NoData />

  const assets = rows.map((row) => ({
    ...resolveDisplay(row.reserve),
    usd: usd(row),
  }))
  const hidden = assets.length - MAX_ICONS
  const total = assets.reduce((sum, { usd }) => sum + Number(usd), 0)

  return (
    <Tooltip
      asChild
      preventDefault
      paper
      text={
        <Flex align="center" gap="l">
          <Box width={PIE_SIZE} sx={{ flexShrink: 0 }}>
            <PieChart
              size={PIE_SIZE}
              ariaLabel={label}
              segments={assets.map(({ logoId, symbol, usd }) => ({
                value: Number(usd),
                label: symbol,
                color: getAssetColor(logoId),
              }))}
              formatValue={({ value }) =>
                t("percent", { value: total ? (value / total) * 100 : 0 })
              }
            />
          </Box>
          <Stack gap="s">
            {assets.map(({ logoId, symbol, usd }) => (
              <Flex key={logoId} justify="space-between" gap="xl">
                <Flex align="center" gap="s">
                  <AssetLogo id={logoId} size="extra-small" />
                  <Text fs="p5" fw={500}>
                    {symbol}
                  </Text>
                </Flex>
                <Text fs="p5" fw={500}>
                  {t("currency", { value: usd, maximumFractionDigits: 2 })}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Flex>
      }
    >
      <Flex inline align="center" gap="xs">
        {assets.slice(0, MAX_ICONS).map(({ logoId }) => (
          <AssetLogo key={logoId} id={logoId} size="small" />
        ))}
        {hidden > 0 && (
          <Text fs="p5" fw={500} color={getToken("text.medium")}>
            +{hidden}
          </Text>
        )}
      </Flex>
    </Tooltip>
  )
}

/** The account's standing in the market of the provider it sits in. */
const MarketRow: FC = () => {
  const { t } = useTranslation(["common", "moneyMarket"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const navigate = useNavigate()
  const { account, acc, isLoading, supplied, borrowed, netApy } =
    usePositions(user)

  const cell = (content: ReactNode) => (
    <TableCell>{isLoading ? <Skeleton width="4em" /> : content}</TableCell>
  )

  return (
    <TableRow
      isClickable
      onClick={() =>
        navigate({
          to: "/money-market",
          search: {
            market:
              market.market === DEFAULT_MARKET ? undefined : market.market,
          },
        })
      }
    >
      <TableCell>
        <Text fw={500}>{market.marketTitle}</Text>
      </TableCell>
      {account.error ? (
        <TableCell colSpan={5}>
          <ReadError error={account.error} />
        </TableCell>
      ) : (
        <>
          {cell(
            acc ? (
              t("currency", {
                value: acc.netWorthUsd,
                maximumFractionDigits: 2,
              })
            ) : (
              <NoData />
            ),
          )}
          {cell(
            acc ? <NetApyValue netApy={netApy} figure="netApy" /> : <NoData />,
          )}
          {cell(
            acc && acc.healthFactor !== HF_UNBOUNDED ? (
              <HealthFactorNumber value={acc.healthFactor} withHeart />
            ) : (
              <NoData />
            ),
          )}
          {cell(
            <PositionAssets
              label={t("moneyMarket:position.supplied")}
              rows={supplied}
              usd={(row) => row.position.underlyingBalanceUsd}
            />,
          )}
          {cell(
            <PositionAssets
              label={t("moneyMarket:position.borrowed")}
              rows={borrowed}
              usd={(row) => row.position.variableBorrowsUsd}
            />,
          )}
        </>
      )}
    </TableRow>
  )
}

/** The last few events of /money-market/history, without its controls. */
const Activity: FC = () => {
  const { t } = useTranslation(["common", "moneyMarket"])
  const formatEventName = useFormatEventName()
  const historyColumns = useBorrowHistoryColumns()
  const { data, isLoading } = useMoneyMarketEvents(undefined, "", ACTIVITY_PAGE)
  const rows = useMemo<BorrowHistoryRow[]>(
    () => [...(data?.items ?? [])],
    [data],
  )

  const columns = useMemo(
    () => [
      activityColumn.display({
        id: "type",
        header: t("type"),
        // the table header turns a column size into its width
        size: 160,
        cell: ({ row }) =>
          row.original instanceof Date ? null : (
            <>
              <Text color={getToken("text.high")} fw={600}>
                {formatEventName(row.original.eventName)}
              </Text>
              <DateText
                date={row.original.date}
                fs="p6"
                color={getToken("text.medium")}
              />
            </>
          ),
      }),
      // the history table's description column, as is
      ...historyColumns.slice(1),
    ],
    [t, formatEventName, historyColumns],
  )

  return (
    <Box>
      <SectionHeader title={t("moneyMarket:positions.activity")} />
      <TableContainer as={Paper}>
        <DataTable
          size="small"
          data={rows}
          columns={columns}
          isLoading={isLoading}
        />
      </TableContainer>
      {(data?.totalCount ?? 0) > ACTIVITY_COUNT && (
        <Flex justify="center" pt="l">
          <Button variant="tertiary" size="small" asChild>
            <Link to="/money-market/history">{t("showMore")}</Link>
          </Button>
        </Flex>
      )}
    </Box>
  )
}

/** The account across every market, a row each, and its latest activity. */
export const PositionsPage: FC = () => {
  const { t } = useTranslation(["common", "moneyMarket"])
  const { config } = useMoneyMarket()
  const { account } = useAccount()

  return (
    <Stack gap="xxl">
      <Box>
        <SectionHeader
          as="h1"
          noTopPadding
          title={t("moneyMarket:positions.title")}
        />
        <TableContainer as={Paper}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("moneyMarket:positions.market")}</TableHead>
                <TableHead>{t("moneyMarket:netWorth")}</TableHead>
                <TableHead>{t("moneyMarket:netApy")}</TableHead>
                <TableHead>{t("moneyMarket:healthFactor")}</TableHead>
                <TableHead>{t("moneyMarket:position.supplied")}</TableHead>
                <TableHead>{t("moneyMarket:position.borrowed")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* every v2 read takes its market from the provider, so each row sits in its own */}
              {Object.values(markets).map((market) => (
                <MoneyMarketProvider
                  key={market.market}
                  config={config}
                  market={market}
                >
                  <ReserveApyProvider>
                    <MarketRow />
                  </ReserveApyProvider>
                </MoneyMarketProvider>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {account && <Activity />}
    </Stack>
  )
}
