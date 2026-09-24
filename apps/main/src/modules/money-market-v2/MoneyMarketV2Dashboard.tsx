import { eModeCategories } from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useClaimableRewards,
  useHollarFacilitator,
  useMoneyMarket,
  useReserveSummaries,
  useWalletBalances,
} from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import {
  Button,
  Flex,
  Grid,
  Stack,
  ValueStats,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { ActionModal } from "@/modules/money-market-v2/actions/ActionModal"
import { BorrowForm } from "@/modules/money-market-v2/actions/BorrowForm"
import { ClaimRewardsForm } from "@/modules/money-market-v2/actions/ClaimRewardsForm"
import { CollateralForm } from "@/modules/money-market-v2/actions/CollateralForm"
import { EModeForm } from "@/modules/money-market-v2/actions/EModeForm"
import { RepayForm } from "@/modules/money-market-v2/actions/RepayForm"
import { SupplyForm } from "@/modules/money-market-v2/actions/SupplyForm"
import { WithdrawForm } from "@/modules/money-market-v2/actions/WithdrawForm"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import { MarketSelect } from "@/modules/money-market-v2/MoneyMarketV2Layout"
import {
  borrowedColumns,
  BorrowRow,
  isHollar,
  ReserveTable,
  RowAction,
  suppliedColumns,
  SuppliedRow,
  SupplyRow,
  toBorrowColumns,
  toSupplyColumns,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"

type OpenAction =
  | { action: RowAction; asset: Address }
  | { action: "emode" | "claim" }

/** Claimable rewards worth less than this are not offered. */
const MIN_CLAIM_USD = "0.01"

const isUsable = (reserve: ReserveSummary) =>
  reserve.isActive && !reserve.isFrozen && !reserve.isPaused

/** Base APY weighted by USD size - incentives are never summed in (ADR-0005). */
const weightedApy = <T,>(
  rows: T[],
  usd: (row: T) => string,
  apy: (row: T) => string,
) => {
  const total = rows.reduce((sum, row) => sum.plus(usd(row)), Big(0))
  return total.eq(0)
    ? 0
    : rows
        .reduce((sum, row) => sum.plus(Big(usd(row)).times(apy(row))), Big(0))
        .div(total)
        .toNumber()
}

const TableStats: FC<{ isLoading: boolean; stats: [string, string][] }> = ({
  isLoading,
  stats,
}) => (
  <Flex gap="xxxl" p="xl">
    {stats.map(([label, value]) => (
      <ValueStats
        key={label}
        wrap
        size="small"
        label={label}
        isLoading={isLoading}
        value={value}
      />
    ))}
  </Flex>
)

const byUsdDesc =
  <T,>(usd: (row: T) => string | undefined) =>
  (a: T, b: T) =>
    Big(usd(b) ?? 0).cmp(usd(a) ?? 0)

const ActionForm: FC<{ open: OpenAction; onSubmitted: () => void }> = ({
  open,
  onSubmitted,
}) => {
  switch (open.action) {
    case "supply":
      return <SupplyForm asset={open.asset} onSubmitted={onSubmitted} />
    case "withdraw":
      return <WithdrawForm asset={open.asset} onSubmitted={onSubmitted} />
    case "borrow":
      return <BorrowForm asset={open.asset} onSubmitted={onSubmitted} />
    case "repay":
      return <RepayForm asset={open.asset} onSubmitted={onSubmitted} />
    case "collateral":
      return <CollateralForm asset={open.asset} onSubmitted={onSubmitted} />
    case "emode":
      return <EModeForm onSubmitted={onSubmitted} />
    case "claim":
      return <ClaimRewardsForm onSubmitted={onSubmitted} />
  }
}

export const MoneyMarketV2Dashboard: FC = () => {
  const { t } = useTranslation(["common", "moneyMarket"])
  const user = useUserAddress()
  const [open, setOpen] = useState<OpenAction | null>(null)

  const reserves = useReserveSummaries()
  const account = useAccountSummary(user)
  const balances = useWalletBalances(user)
  const facilitator = useHollarFacilitator()
  const claimable = useClaimableRewards(user)
  const { market } = useMoneyMarket()

  const { supplied, borrowed, toSupply, toBorrow } = useMemo(() => {
    const summaries = reserves.data ?? []
    const byAsset = new Map(summaries.map((r) => [r.underlyingAsset, r]))
    const positions = account.data?.positions ?? []
    const acc = account.data?.account

    const withReserve = positions.flatMap((position): SuppliedRow[] => {
      const reserve = byAsset.get(position.underlyingAsset)
      return reserve ? [{ reserve, position }] : []
    })

    const walletByAsset = new Map(
      balances.data?.balances.map((b) => [b.underlyingAsset, b.amount]),
    )

    const toSupply = summaries.filter(isUsable).map((reserve): SupplyRow => {
      const balance = walletByAsset.get(reserve.underlyingAsset)
      return {
        reserve,
        balance,
        balanceUsd: balance && Big(balance).times(reserve.priceInUsd).toFixed(),
      }
    })

    // ponytail: min(borrowing power, pool liquidity) - v1's caps/e-mode
    // adjustments are not applied, so this may read higher than /borrow
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
        const liquidity = isHollar(reserve.underlyingAsset, market)
          ? Big.max(hollarRoom, 0)
          : Big(reserve.availableLiquidity)
        const power =
          acc && Big(reserve.priceInUsd).gt(0)
            ? Big(acc.availableBorrowsUsd).div(reserve.priceInUsd)
            : liquidity
        const available = power.lt(liquidity) ? power : liquidity
        return {
          reserve,
          available: available.toFixed(),
          availableUsd: available.times(reserve.priceInUsd).toFixed(),
        }
      })

    return {
      supplied: withReserve
        .filter((r) => Big(r.position.underlyingBalance).gt(0))
        .sort(byUsdDesc((r) => r.position.underlyingBalanceUsd)),
      borrowed: withReserve
        .filter((r) => Big(r.position.variableBorrows).gt(0))
        .sort(byUsdDesc((r) => r.position.variableBorrowsUsd)),
      toSupply: toSupply.sort(byUsdDesc((r) => r.balanceUsd)),
      toBorrow: toBorrow.sort(byUsdDesc((r) => r.reserve.totalLiquidityUsd)),
    }
  }, [reserves.data, account.data, balances.data, facilitator.data, market])

  const acc = account.data?.account
  const accountLoading = !!user && account.isPending
  const usd = (value: string | undefined) =>
    value ? t("currency", { value, maximumFractionDigits: 2 }) : "-"
  const percent = (value: number) => t("percent", { value: value * 100 })

  const maxBorrows = Big(acc?.totalBorrowsMarketReferenceCurrency ?? 0).plus(
    acc?.availableBorrowsMarketReferenceCurrency ?? 0,
  )
  const borrowPowerUsed = maxBorrows.eq(0)
    ? 0
    : Big(acc?.totalBorrowsMarketReferenceCurrency ?? 0)
        .div(maxBorrows)
        .toNumber()

  const eModeLabel =
    eModeCategories(reserves.data ?? []).find(
      (c) => c.id === acc?.eModeCategoryId,
    )?.label ?? t("moneyMarket:emode.none")
  const claimableUsd = (claimable.data ?? []).reduce(
    (sum, r) => sum.plus(r.amountUsd),
    Big(0),
  )

  const columns = useMemo(() => {
    const onAction = user
      ? (action: RowAction, asset: Address) => setOpen({ action, asset })
      : undefined
    return {
      supplied: suppliedColumns(onAction),
      borrowed: borrowedColumns(onAction),
      toSupply: toSupplyColumns(onAction),
      toBorrow: toBorrowColumns(onAction),
    }
  }, [user])

  const title = (action: OpenAction["action"]) => {
    switch (action) {
      case "supply":
      case "withdraw":
      case "borrow":
      case "repay":
      case "claim":
        return t(`moneyMarket:${action}`)
      case "collateral":
        return t("moneyMarket:collateral.title")
      case "emode":
        return t("moneyMarket:emode.title")
    }
  }

  return (
    <Stack gap="xxl">
      <Flex
        direction={["column-reverse", null, "row"]}
        justify="space-between"
        gap="xl"
      >
        <Stack
          direction={["column", null, "row"]}
          justify="flex-start"
          gap={["base", null, "xxxl"]}
          separated
        >
          <ValueStats
            size="large"
            isLoading={accountLoading}
            label="Net worth"
            wrap
            value={usd(acc?.netWorthUsd)}
          />
          <ValueStats
            size="large"
            isLoading={accountLoading}
            label="Health factor"
            wrap
            value={
              acc && acc.healthFactor !== "-1"
                ? t("number", {
                    value: acc.healthFactor,
                    maximumFractionDigits: 2,
                  })
                : "-"
            }
          />
          <ValueStats
            size="large"
            isLoading={accountLoading}
            label="Collateral"
            wrap
            value={usd(acc?.totalCollateralUsd)}
          />
          <ValueStats
            size="large"
            isLoading={accountLoading}
            label="Available to borrow"
            wrap
            value={usd(acc?.availableBorrowsUsd)}
          />
        </Stack>
        <Flex justify="flex-end" align="flex-start" gap="base">
          {user && acc && (
            <Button
              variant="tertiary"
              onClick={() => setOpen({ action: "emode" })}
            >
              {t("moneyMarket:emode.button", { category: eModeLabel })}
            </Button>
          )}
          {user && claimableUsd.gte(MIN_CLAIM_USD) && (
            <Button
              variant="tertiary"
              onClick={() => setOpen({ action: "claim" })}
            >
              {t("moneyMarket:claim.button", {
                value: claimableUsd.toFixed(),
              })}
            </Button>
          )}
          <MarketSelect />
        </Flex>
      </Flex>

      <Grid columnTemplate={["1fr", null, null, "1fr 1fr"]} gap="xl">
        <ReserveTable
          title="Your supplies"
          empty={user ? "Nothing supplied yet." : "Connect a wallet."}
          header={
            (accountLoading || supplied.length > 0) && (
              <TableStats
                isLoading={accountLoading}
                stats={[
                  ["Balance", usd(acc?.totalLiquidityUsd)],
                  [
                    "APY",
                    percent(
                      weightedApy(
                        supplied,
                        (r) => r.position.underlyingBalanceUsd,
                        (r) => r.reserve.supplyApy,
                      ),
                    ),
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
          title="Your borrows"
          empty={user ? "Nothing borrowed yet." : "Connect a wallet."}
          header={
            (accountLoading || borrowed.length > 0) && (
              <TableStats
                isLoading={accountLoading}
                stats={[
                  ["Balance", usd(acc?.totalBorrowsUsd)],
                  [
                    "APY",
                    percent(
                      weightedApy(
                        borrowed,
                        (r) => r.position.variableBorrowsUsd,
                        (r) => r.reserve.variableBorrowApy,
                      ),
                    ),
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
          title="Assets to supply"
          empty="No assets to supply."
          data={toSupply}
          columns={columns.toSupply}
          isLoading={reserves.isPending || (!!user && balances.isPending)}
          error={reserves.error ?? balances.error}
        />
        <ReserveTable
          title="Assets to borrow"
          empty="No assets to borrow."
          data={toBorrow}
          columns={columns.toBorrow}
          isLoading={
            reserves.isPending || accountLoading || facilitator.isPending
          }
          error={reserves.error}
        />
      </Grid>

      <ActionModal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? title(open.action) : ""}
      >
        {open && <ActionForm open={open} onSubmitted={() => setOpen(null)} />}
      </ActionModal>
    </Stack>
  )
}
