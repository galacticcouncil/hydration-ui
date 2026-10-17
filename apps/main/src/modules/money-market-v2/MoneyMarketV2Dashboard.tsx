import { useFormattedHealthFactor } from "@galacticcouncil/money-market/hooks"
import {
  assessBorrow,
  eModeCategories,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountRequest,
  useClaimableRewards,
  useHollarFacilitator,
  useMoneyMarket,
  useWalletBalances,
} from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Separator,
  Skeleton,
  Stack,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  ValueStats,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Settings, Zap } from "lucide-react"
import { FC, ReactNode, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { HealthFactorRisk } from "@/modules/borrow/healthfactor/HealthFactorRisk"
import {
  OpenAction,
  OpenActionModal,
} from "@/modules/money-market-v2/actions/ActionModal"
import {
  HealthFactorNumber,
  HF_UNBOUNDED,
} from "@/modules/money-market-v2/HealthFactorNumber"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import {
  borrowedColumns,
  BorrowRow,
  NetApyValue,
  ReserveTable,
  RowAction,
  suppliedColumns,
  SupplyRow,
  toBorrowColumns,
  toSupplyColumns,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { isHollar } from "@/modules/money-market-v2/reserves"
import { toSupplyRows } from "@/modules/money-market-v2/toSupplyRows"
import { byUsdDesc, usePositions } from "@/modules/money-market-v2/usePositions"
import { useResolveReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"

type Side = "supply" | "borrow"

/** Claimable rewards worth less than this are not offered. */
const MIN_CLAIM_USD = "0.01"

const isUsable = (reserve: ReserveSummary) =>
  reserve.isActive && !reserve.isFrozen && !reserve.isPaused

const canBorrow = (row: BorrowRow) => Big(row.available).gt(0)

// ponytail: categories by symbol pattern, as Aave's interface does it - a
// new asset whose symbol fits none lands in "Other"; move to a per-market
// asset list if patterns start misfiling
const CATEGORIES = [
  { key: "stable", label: "Stablecoins", pattern: /USD|HOLLAR|DAI|EUR/i },
  { key: "dot", label: "DOT correlated", pattern: /DOT/i },
  { key: "eth", label: "ETH correlated", pattern: /ETH/i },
  { key: "btc", label: "BTC correlated", pattern: /BTC/i },
  { key: "sol", label: "SOL correlated", pattern: /SOL/i },
  { key: "other", label: "Other", pattern: /.*/ },
] as const
type Category = (typeof CATEGORIES)[number]["key"]

const categoryOf = (symbol: string): Category =>
  CATEGORIES.find((c) => c.pattern.test(symbol))?.key ?? "other"

const TableStats: FC<{ isLoading: boolean; stats: [string, ReactNode][] }> = ({
  isLoading,
  stats,
}) => (
  <Flex justify="flex-end" gap="l" sx={{ whiteSpace: "nowrap" }}>
    {stats.map(([label, value]) => (
      <Flex key={label} align="center" gap="s">
        <Text fs="p5" color={getToken("text.medium")}>
          {label}:
        </Text>
        {isLoading ? (
          <Skeleton width="3em" />
        ) : (
          <Text as="div" fs="p5" fw={500} color={getToken("text.high")}>
            {value}
          </Text>
        )}
      </Flex>
    ))}
  </Flex>
)

/** The button under a table that reveals the rows it holds back. */
const ShowMore: FC<{
  open: boolean
  onToggle: () => void
  children: ReactNode
}> = ({ open, onToggle, children }) => (
  <>
    <Separator />
    <Box p="base">
      <Button
        iconEnd={ChevronDown}
        variant="transparent"
        size="small"
        width="100%"
        onClick={onToggle}
        sx={{
          "& > [data-icon='end']": {
            transition: getToken("transitions.transform"),
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          },
        }}
      >
        {children}
      </Button>
    </Box>
  </>
)

export const MoneyMarketV2Dashboard: FC = () => {
  const { t } = useTranslation(["common", "moneyMarket", "borrow"])
  const user = useUserAddress()
  const [open, setOpen] = useState<OpenAction | null>(null)
  const [riskOpen, setRiskOpen] = useState(false)
  // which column shows below the `lg` breakpoint, where they stack
  const [side, setSide] = useState<Side>("supply")
  const [showZeroBalance, setShowZeroBalance] = useState(false)
  const [showUnavailable, setShowUnavailable] = useState(false)
  const [category, setCategory] = useState<Category | "all">("all")

  const {
    reserves,
    account,
    acc,
    isLoading: accountLoading,
    supplied,
    borrowed,
    netApy,
    borrowPowerUsed,
  } = usePositions(user)
  const balances = useWalletBalances(user)
  const request = useAccountRequest(user).data
  const facilitator = useHollarFacilitator()
  const claimable = useClaimableRewards(user)
  const { market } = useMoneyMarket()
  const resolveDisplay = useResolveReserveDisplay()

  const { toSupply, toBorrow } = useMemo(() => {
    const summaries = reserves.data ?? []

    const walletByAsset = new Map(
      balances.data?.balances.map((b) => [b.underlyingAsset, b.amount]),
    )

    // Hollar is minted on borrow and takes no supply
    const toSupply = summaries
      .filter(
        (reserve) =>
          isUsable(reserve) && !isHollar(reserve.underlyingAsset, market),
      )
      .map((reserve): SupplyRow => {
        const balance = walletByAsset.get(reserve.underlyingAsset)
        return {
          reserve,
          balance,
          balanceUsd:
            balance && Big(balance).times(reserve.priceInUsd).toFixed(),
        }
      })

    // Hollar is minted, not lent, so its pool limit is the room left in the
    // facilitator bucket rather than the reserve's liquidity. A failed bucket
    // read counts as no room, so the row errs low rather than high. The room
    // is floored to cents: a full bucket leaves wei of dust (BIL: 2 wei).
    const hollarRoom = facilitator.data
      ? Big(facilitator.data.maxCapacity)
          .minus(facilitator.data.level)
          .round(2, Big.roundDown)
      : Big(0)

    const toBorrow = summaries
      .filter((r) => isUsable(r) && r.borrowingEnabled)
      .map((reserve): BorrowRow => {
        const hollar = isHollar(reserve.underlyingAsset, market)
        const liquidity = hollar
          ? Big.max(hollarRoom, 0)
          : Big(reserve.availableLiquidity)
        // the borrow form's own max, so a row never offers what the form
        // refuses (e-mode, isolation, siloed debt, no collateral). No wallet
        // has no account to assess and reads the pool's liquidity.
        // ponytail: re-summarizes the account per row on every tick; hoist
        // summarizeAccount out of assessBorrow if the reserve list grows
        const max = request
          ? Big(
              assessBorrow({
                ...request,
                asset: reserve.underlyingAsset,
                amount: "",
                hollarFacilitator: hollar ? facilitator.data : undefined,
              }).max,
            )
          : liquidity
        const available = max.lt(liquidity) ? max : liquidity
        return {
          reserve,
          available: available.toFixed(),
          availableUsd: available.times(reserve.priceInUsd).toFixed(),
        }
      })

    return {
      toSupply,
      // borrowable rows lead, so revealing the rest only appends below them
      toBorrow: toBorrow.sort(
        (a, b) =>
          Number(canBorrow(b)) - Number(canBorrow(a)) ||
          byUsdDesc<BorrowRow>((r) => r.reserve.totalLiquidityUsd)(a, b),
      ),
    }
  }, [reserves.data, request, balances.data, facilitator.data, market])

  // Aave's "show assets with 0 balance": the wallet's assets lead, the rest
  // wait behind a button under the table. An empty or disconnected wallet sees
  // everything. Swap-in reserves are pinned above both and never wait.
  const categoryOfReserve = (reserve: ReserveSummary) =>
    categoryOf(resolveDisplay(reserve).symbol)
  // only the categories this market has; the filter hides below two
  const categoryItems = CATEGORIES.filter((c) =>
    toSupply.some((r) => categoryOfReserve(r.reserve) === c.key),
  )
  const { rows: visibleToSupply, hidesZeroBalance } = toSupplyRows({
    rows: toSupply,
    market,
    showZeroBalance,
    inCategory: (r) =>
      category === "all" || categoryOfReserve(r.reserve) === category,
  })

  // the same for borrowing: what the account can borrow leads, and an account
  // that can borrow nothing sees everything
  const anyAvailable = toBorrow.some(canBorrow)
  const anyUnavailable = toBorrow.some((r) => !canBorrow(r))
  const visibleToBorrow =
    showUnavailable || !anyAvailable ? toBorrow : toBorrow.filter(canBorrow)

  const usd = (value: string | undefined) =>
    value ? t("currency", { value, maximumFractionDigits: 2 }) : "-"
  const percent = (value: number) => t("percent", { value: value * 100 })

  const eModeLabel =
    eModeCategories(reserves.data ?? []).find(
      (c) => c.id === acc?.eModeCategoryId,
    )?.label ?? t("moneyMarket:emode.disabled")
  const claimableUsd = (claimable.data ?? []).reduce(
    (sum, r) => sum.plus(r.amountUsd),
    Big(0),
  )

  // an account without debt has no health factor to show or explain
  const { isHealthFactorValid, healthFactorLevel } = useFormattedHealthFactor(
    acc?.healthFactor ?? HF_UNBOUNDED,
  )

  const columns = useMemo(() => {
    const onAction = user
      ? (action: RowAction, asset: Address) => setOpen({ action, asset })
      : undefined
    return {
      supplied: suppliedColumns(onAction),
      borrowed: borrowedColumns(onAction),
      toSupply: toSupplyColumns(onAction),
      toSupplyPinned: toSupplyColumns(onAction, true),
      toBorrow: toBorrowColumns(onAction),
    }
  }, [user])

  // stacked columns show one side at a time, side by side they both show
  const column = (s: Side) => ({
    display: [side === s ? "flex" : "none", null, null, "flex"],
  })

  return (
    <Stack gap="xxl">
      <Stack
        direction={["column", null, "row"]}
        justify="flex-start"
        gap={["base", null, "xxxl", "3.75rem"]}
        separated
      >
        <ValueStats
          size="large"
          isLoading={accountLoading}
          label={t("moneyMarket:netWorth")}
          wrap
          value={usd(acc?.netWorthUsd)}
        />
        <ValueStats
          size="large"
          isLoading={accountLoading}
          label={t("moneyMarket:netApy")}
          wrap
          customValue={
            <ValueStatsValue size="large">
              <NetApyValue netApy={netApy} figure="netApy" />
            </ValueStatsValue>
          }
        />
        <ValueStats
          size="large"
          isLoading={accountLoading}
          label={t("moneyMarket:healthFactor")}
          wrap
          customValue={
            <Flex align="center" gap="base">
              <ValueStatsValue size="large">
                {acc && isHealthFactorValid ? (
                  <HealthFactorNumber value={acc.healthFactor} />
                ) : (
                  "-"
                )}
              </ValueStatsValue>
              {acc && isHealthFactorValid && (
                <Button
                  outline
                  variant={healthFactorLevel === "good" ? "success" : "danger"}
                  onClick={() => setRiskOpen(true)}
                >
                  {t("borrow:risk.details")}
                </Button>
              )}
            </Flex>
          }
        />

        {user && claimableUsd.gte(MIN_CLAIM_USD) && (
          <ValueStats
            size="large"
            label={t("moneyMarket:availableRewards")}
            wrap
            customValue={
              <Flex align="center" gap="base">
                <ValueStatsValue size="large">
                  {usd(claimableUsd.toFixed())}
                </ValueStatsValue>
                <Button onClick={() => setOpen({ action: "claim" })}>
                  {t("moneyMarket:claim")}
                </Button>
              </Flex>
            }
          />
        )}
        {user && acc && (
          <ValueStats
            size="large"
            label={t("moneyMarket:emode.title")}
            wrap
            customValue={
              <Button
                iconStart={acc.eModeCategoryId ? Zap : Settings}
                size="small"
                variant={acc.eModeCategoryId ? "accent" : "tertiary"}
                outline
                onClick={() => setOpen({ action: "emode" })}
              >
                {eModeLabel}
              </Button>
            }
          />
        )}
      </Stack>

      <Box display={["block", null, null, "none"]}>
        <ToggleGroup<Side>
          type="single"
          fullWidth
          value={side}
          onValueChange={(value) => value && setSide(value)}
        >
          <ToggleGroupItem value="supply">
            {t("moneyMarket:supply")}
          </ToggleGroupItem>
          <ToggleGroupItem value="borrow">
            {t("moneyMarket:borrow")}
          </ToggleGroupItem>
        </ToggleGroup>
      </Box>

      <Grid
        columnTemplate={["1fr", null, null, "1fr 1fr"]}
        gap="xl"
        align="start"
      >
        <Stack gap="xl" sx={column("supply")}>
          <ReserveTable
            title="Your supplies"
            empty={user ? "Nothing supplied yet." : "Connect a wallet."}
            actions={
              (accountLoading || supplied.length > 0) && (
                <TableStats
                  isLoading={accountLoading}
                  stats={[
                    ["Balance", usd(acc?.totalLiquidityUsd)],
                    [
                      t("moneyMarket:earnedApy"),
                      <NetApyValue
                        key="earnedApy"
                        netApy={netApy}
                        figure="earnedApy"
                      />,
                    ],
                    ["Collateral", usd(acc?.totalCollateralUsd)],
                  ]}
                />
              )
            }
            data={supplied}
            columns={columns.supplied}
            isLoading={accountLoading}
            error={account.error}
          />
          <ReserveTable
            title="Assets to supply"
            actions={
              categoryItems.length > 1 && (
                <Select<Category | "all">
                  size="small"
                  items={[
                    { key: "all", label: "All categories" },
                    ...categoryItems,
                  ]}
                  value={category}
                  onValueChange={setCategory}
                />
              )
            }
            footer={
              hidesZeroBalance && (
                <ShowMore
                  open={showZeroBalance}
                  onToggle={() => setShowZeroBalance((show) => !show)}
                >
                  {showZeroBalance ? "Hide" : "Show"} assets with no balance
                </ShowMore>
              )
            }
            empty={
              category === "all"
                ? "No assets to supply."
                : "No assets in this category."
            }
            data={visibleToSupply.filter((r) => !r.pinned)}
            columns={columns.toSupply}
            pinned={{
              data: visibleToSupply.filter((r) => r.pinned),
              columns: columns.toSupplyPinned,
            }}
            isLoading={reserves.isPending || (!!user && balances.isPending)}
            error={reserves.error ?? balances.error}
          />
        </Stack>
        <Stack gap="xl" sx={column("borrow")}>
          <ReserveTable
            title="Your borrows"
            empty={user ? "Nothing borrowed yet." : "Connect a wallet."}
            actions={
              (accountLoading || borrowed.length > 0) && (
                <TableStats
                  isLoading={accountLoading}
                  stats={[
                    ["Balance", usd(acc?.totalBorrowsUsd)],
                    [
                      t("moneyMarket:debtApy"),
                      <NetApyValue
                        key="debtApy"
                        netApy={netApy}
                        figure="debtApy"
                      />,
                    ],
                    ["Borrow power used", percent(borrowPowerUsed)],
                  ]}
                />
              )
            }
            data={borrowed}
            columns={columns.borrowed}
            isLoading={accountLoading}
            error={account.error}
          />
          <ReserveTable
            title="Assets to borrow"
            empty="No assets to borrow."
            footer={
              anyAvailable &&
              anyUnavailable && (
                <ShowMore
                  open={showUnavailable}
                  onToggle={() => setShowUnavailable((show) => !show)}
                >
                  {showUnavailable
                    ? "Hide unavailable assets"
                    : "Show all assets"}
                </ShowMore>
              )
            }
            data={visibleToBorrow}
            columns={columns.toBorrow}
            isLoading={
              reserves.isPending || accountLoading || facilitator.isPending
            }
            error={reserves.error}
          />
        </Stack>
      </Grid>

      <OpenActionModal open={open} onClose={() => setOpen(null)} />
      <Modal open={riskOpen} onOpenChange={setRiskOpen}>
        <ModalHeader align="center" title={t("borrow:risk.title")} />
        <ModalBody scrollable={false}>
          {acc && (
            <HealthFactorRisk
              healthFactor={acc.healthFactor}
              loanToValue={
                Big(acc.totalCollateralMarketReferenceCurrency).gt(0)
                  ? Big(acc.totalBorrowsMarketReferenceCurrency)
                      .div(acc.totalCollateralMarketReferenceCurrency)
                      .toString()
                  : "0"
              }
              currentLoanToValue={acc.currentLoanToValue}
              currentLiquidationThreshold={acc.currentLiquidationThreshold}
            />
          )}
        </ModalBody>
      </Modal>
    </Stack>
  )
}
