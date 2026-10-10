import type {
  PositionSummary,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"
import {
  Check,
  ChevronDown,
  CircleArrowDown,
  CircleArrowLeft,
  CircleArrowRight,
  CircleArrowUp,
  Ellipsis,
} from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Amount,
  AssetLabel,
  Box,
  Button,
  Chip,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  LogoSize,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  Separator,
  Skeleton,
  TableContainer,
  TableSize,
  Text,
  TextProps,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { FC, ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { UnavailableApy } from "@/components/DetailedApy/UnavailableApy"
import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { ApySide, ApyTooltip } from "@/modules/money-market-v2/ApyTooltip"
import { ApyRate, NetApyState } from "@/modules/money-market-v2/effectiveApy"
import { useNavigateToReserve } from "@/modules/money-market-v2/hooks"
import { useReserveApy } from "@/modules/money-market-v2/ReserveApyProvider"
import { useReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"

export type SuppliedRow = {
  reserve: ReserveSummary
  position: PositionSummary
}
export type SupplyRow = {
  reserve: ReserveSummary
  balance: string | undefined
  balanceUsd: string | undefined
  /** A swap-in reserve: supplied from any asset, whatever the wallet holds. */
  pinned?: boolean
}
export type BorrowRow = {
  reserve: ReserveSummary
  available: string
  availableUsd: string
}

export type RowAction =
  | "supply"
  | "withdraw"
  | "borrow"
  | "repay"
  | "collateral"

/** Opens an action on a row's reserve - absent while no wallet is connected. */
export type OnRowAction =
  | ((action: RowAction, asset: Address) => void)
  | undefined

export const ReserveAsset: FC<{
  reserve: ReserveSummary
  size?: LogoSize
}> = ({ reserve, size }) => {
  const { symbol, logoId } = useReserveDisplay(reserve)

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={logoId} size={size} />
      <AssetLabel symbol={symbol} />
    </AssetLabelFullContainer>
  )
}

export const NoData = () => <Text color={getToken("text.low")}>—</Text>

type ApyTextProps = Omit<TextProps, "children">

/**
 * An effective APY (ADR-0009): the total as the one headline figure, with its
 * parts in a tooltip unless the base rate is all there is. A rate that is not
 * known never shows a number. The figure is plain text that takes its size
 * from the parent, so it sits in a table cell or a summary row alike - any
 * `Text` prop overrides it.
 */
export const ApyCell: FC<ApyTextProps & { rate: ApyRate; side: ApySide }> = ({
  rate,
  side,
  ...textProps
}) => {
  const { t } = useTranslation()

  if (rate.status === "loading") return <Skeleton width="4em" />

  if (rate.status === "unavailable") {
    return (
      <Flex inline>
        <UnavailableApy />
      </Flex>
    )
  }

  const percent = (value: string) =>
    t("percent", { value: Big(value).times(100).toNumber() })

  const [first] = rate.parts
  const hasBreakdown = rate.parts.length > 1 || first?.kind !== "base"
  const incentiveAssetIds = rate.parts.flatMap(({ kind, assetId }) =>
    kind === "incentive" && assetId ? [assetId] : [],
  )

  return (
    <Flex inline gap="s" align="center">
      {incentiveAssetIds.length > 0 && (
        <AssetLogo size="extra-small" id={incentiveAssetIds} />
      )}
      <Text as="span" fw={500} color={getToken("text.high")} {...textProps}>
        {percent(rate.total)}
      </Text>
      {hasBreakdown && <ApyTooltip parts={rate.parts} side={side} />}
    </Flex>
  )
}

/**
 * One side of a reserve's effective APY, resolved here because a column's
 * `cell` cannot read the context. A reserve with no borrow rate shows a dash.
 */
export const ReserveApyCell: FC<
  ApyTextProps & { reserve: ReserveSummary; side: ApySide }
> = ({ reserve, side, ...textProps }) => {
  const rate = useReserveApy(reserve)[side]

  if (!rate) return <NoData />

  return <ApyCell rate={rate} side={side} {...textProps} />
}

/**
 * One of an account's net, earned or debt APY. A figure that cannot be
 * trusted shows the warning, never a number; an account with no net worth has
 * no net APY, which is a dash and not a warning.
 */
export const NetApyValue: FC<{
  netApy: NetApyState
  figure: "netApy" | "earnedApy" | "debtApy"
}> = ({ netApy, figure }) => {
  const { t } = useTranslation()

  if (netApy.status === "loading") return <Skeleton width="4em" />

  const value = netApy[figure]

  if (value === null) {
    return figure === "netApy" && netApy.reason === "noNetWorth" ? (
      <NoData />
    ) : (
      <Flex inline>
        <UnavailableApy />
      </Flex>
    )
  }

  return t("percent", { value: Big(value).times(100).toNumber() })
}

export const AmountCell: FC<{ amount: string; usd: string }> = ({
  amount,
  usd,
}) => {
  const { t } = useTranslation()

  return (
    <Amount
      value={t("number", { value: amount, subscript: true })}
      displayValue={t("currency", { value: usd, maximumFractionDigits: 2 })}
    />
  )
}

export const CollateralCell: FC<{ enabled: boolean; isolated: boolean }> = ({
  enabled,
  isolated,
}) => {
  if (!enabled) return <Text color={getToken("text.low")}>—</Text>
  if (isolated) {
    return (
      <Chip variant="amber" size="small">
        Isolated
      </Chip>
    )
  }

  return (
    <Icon
      display="inline-flex"
      color={getToken("accents.success.emphasis")}
      component={Check}
      size="m"
    />
  )
}

/** A supplied position's collateral flag; flipping it opens the collateral form. */
export const CollateralSwitch: FC<{
  row: SuppliedRow
  onAction: OnRowAction
}> = ({ row: { reserve, position }, onAction }) => (
  <Flex direction="column" align="center" gap="xs">
    <Toggle
      checked={position.usageAsCollateralEnabledOnUser}
      disabled={!onAction}
      onClick={(e) => e.stopPropagation()}
      onCheckedChange={() => onAction?.("collateral", reserve.underlyingAsset)}
    />
    {reserve.isIsolated && (
      <Chip variant="amber" size="small">
        Isolated
      </Chip>
    )}
  </Flex>
)

type IconAction = Exclude<RowAction, "collateral">

export const ACTION_ICONS = {
  supply: CircleArrowDown,
  withdraw: CircleArrowLeft,
  borrow: CircleArrowUp,
  repay: CircleArrowRight,
} as const satisfies Record<IconAction, unknown>

/**
 * A `tooltip` says why the row is disabled. It hangs off a wrapper, as a
 * disabled button fires no pointer events of its own. `iconOnly` swaps the
 * label for the action's icon, and the label moves to the tooltip. `more`
 * actions sit behind a "..." menu.
 */
export const ActionsCell: FC<{
  asset: Address
  actions: IconAction[]
  onAction: OnRowAction
  disabled?: boolean
  tooltip?: string
  iconOnly?: boolean
  more?: readonly IconAction[]
  size?: "small" | "medium"
}> = ({
  asset,
  actions,
  onAction,
  disabled,
  tooltip,
  iconOnly,
  more,
  size = "small",
}) => {
  const { t } = useTranslation(["moneyMarket", "common"])

  return (
    <Flex justify="flex-end" gap="s">
      {actions.map((action) => {
        const icon = ACTION_ICONS[action]

        return (
          <Tooltip
            key={action}
            text={tooltip ?? (iconOnly && t(action))}
            size="small"
            side="top"
            asChild
            preventDefault
          >
            <Flex inline>
              <Button
                icon={iconOnly ? icon : undefined}
                iconStart={icon}
                variant={iconOnly ? "ghost" : "muted"}
                outline={!iconOnly}
                size="small"
                aria-label={t(action)}
                disabled={disabled || !onAction}
                onClick={(e) => {
                  e.stopPropagation()
                  onAction?.(action, asset)
                }}
              >
                {!iconOnly && t(action)}
              </Button>
            </Flex>
          </Tooltip>
        )
      })}
      {more && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              icon={Ellipsis}
              variant="muted"
              outline
              size={size}
              aria-label={t("common:more")}
              disabled={disabled || !onAction}
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" size={size}>
            {more.map((action) => (
              <DropdownMenuItem key={action} asChild>
                <MenuSelectionItem
                  variant="filterLink"
                  onClick={(e) => {
                    // the menu is portaled, yet its clicks still bubble to the row
                    e.stopPropagation()
                    onAction?.(action, asset)
                  }}
                >
                  <MenuItemIcon component={ACTION_ICONS[action]} />
                  <MenuItemLabel>{t(action)}</MenuItemLabel>
                </MenuSelectionItem>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Flex>
  )
}

const right = { meta: { sx: { textAlign: "right" } } } as const
const center = { meta: { sx: { textAlign: "center" } } } as const

const supplied = createColumnHelper<SuppliedRow>()
export const suppliedColumns = (onAction: OnRowAction) => [
  supplied.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  supplied.display({
    header: "Balance",
    ...right,
    cell: ({ row }) => (
      <AmountCell
        amount={row.original.position.underlyingBalance}
        usd={row.original.position.underlyingBalanceUsd}
      />
    ),
  }),
  supplied.display({
    header: "APY",
    ...right,
    cell: ({ row }) => (
      <ReserveApyCell reserve={row.original.reserve} side="supply" />
    ),
  }),
  supplied.display({
    header: "Collateral",
    ...center,
    cell: ({ row }) => (
      <CollateralSwitch row={row.original} onAction={onAction} />
    ),
  }),
  supplied.display({
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell
        asset={row.original.reserve.underlyingAsset}
        actions={["withdraw"]}
        onAction={onAction}
      />
    ),
  }),
]

export const borrowedColumns = (onAction: OnRowAction) => [
  supplied.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  supplied.display({
    header: "Debt",
    ...right,
    cell: ({ row }) => (
      <AmountCell
        amount={row.original.position.variableBorrows}
        usd={row.original.position.variableBorrowsUsd}
      />
    ),
  }),
  supplied.display({
    header: "APY",
    ...right,
    cell: ({ row }) => (
      <ReserveApyCell reserve={row.original.reserve} side="borrow" />
    ),
  }),
  supplied.display({
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell
        asset={row.original.reserve.underlyingAsset}
        actions={["repay"]}
        more={["borrow"]}
        onAction={onAction}
      />
    ),
  }),
]

const toSupply = createColumnHelper<SupplyRow>()
/**
 * `pinned` is the swap-in table: supplied from any asset, so its balance
 * column is an empty placeholder that keeps the rest aligned with the
 * ordinary table below it.
 */
export const toSupplyColumns = (onAction: OnRowAction, pinned = false) => [
  toSupply.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  pinned
    ? toSupply.display({ id: "balancePlaceholder" })
    : toSupply.display({
        header: "Wallet balance",
        ...right,
        cell: ({ row }) => {
          const { balance, balanceUsd } = row.original
          return balance && balanceUsd ? (
            <AmountCell amount={balance} usd={balanceUsd} />
          ) : (
            <Text color={getToken("text.low")}>—</Text>
          )
        },
      }),
  toSupply.display({
    header: "APY",
    ...right,
    cell: ({ row }) => (
      <ReserveApyCell reserve={row.original.reserve} side="supply" />
    ),
  }),
  toSupply.display({
    header: "Can be collateral",
    ...center,
    cell: ({ row }) => (
      <CollateralCell
        enabled={
          row.original.reserve.usageAsCollateralEnabled &&
          Big(row.original.reserve.ltv).gt(0)
        }
        isolated={row.original.reserve.isIsolated}
      />
    ),
  }),
  toSupply.display({
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell
        asset={row.original.reserve.underlyingAsset}
        actions={["supply"]}
        onAction={onAction}
      />
    ),
  }),
]

const toBorrow = createColumnHelper<BorrowRow>()
export const toBorrowColumns = (onAction: OnRowAction) => [
  toBorrow.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  toBorrow.display({
    header: "Available",
    ...right,
    cell: ({ row }) => (
      <AmountCell
        amount={row.original.available}
        usd={row.original.availableUsd}
      />
    ),
  }),
  toBorrow.display({
    header: "APY",
    ...right,
    cell: ({ row }) => (
      <ReserveApyCell reserve={row.original.reserve} side="borrow" />
    ),
  }),
  toBorrow.display({
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell
        asset={row.original.reserve.underlyingAsset}
        actions={["borrow"]}
        onAction={onAction}
        disabled={!Big(row.original.available).gt(0)}
      />
    ),
  }),
]

export type TableState = { isLoading: boolean; error: Error | null }

/** A failed read, with the chain's own reason underneath the wrapper's. */
export const ReadError: FC<{ error: Error }> = ({ error }) => (
  <Alert
    variant="error"
    title={`${error.name}: ${error.message}`}
    description={error.cause instanceof Error ? error.cause.message : undefined}
  />
)

/** Every row is a reserve, and clicking one opens that reserve's detail. */
export const ReserveDataTable = <T extends { reserve: ReserveSummary }>({
  data,
  columns,
  empty,
  isLoading = false,
  size,
  limit,
  flat,
}: {
  data: T[]
  columns: ColumnDef<T>[]
  empty: string
  isLoading?: boolean
  size?: TableSize
  /** Rows shown until "Show X more" is clicked; all rows when omitted. */
  limit?: number
  /** Square corners, for a table stacked with others inside a panel. */
  flat?: boolean
}) => {
  const navigateToReserve = useNavigateToReserve()
  const [expanded, setExpanded] = useState(false)
  const hidden = !expanded && limit ? Math.max(data.length - limit, 0) : 0

  return (
    <TableContainer borderRadius={flat ? undefined : "xl"}>
      <DataTable
        fixedLayout
        size={size}
        skeletonRowCount={4}
        isLoading={isLoading}
        data={hidden ? data.slice(0, limit) : data}
        columns={columns}
        onRowClick={(row) => navigateToReserve(row.reserve.underlyingAsset)}
        emptyState={
          <Text fw={500} color={getToken("text.low")}>
            {empty}
          </Text>
        }
      />
      {hidden > 0 && (
        <>
          <Separator />
          <Box p="base">
            <Button
              iconEnd={ChevronDown}
              variant="transparent"
              size="small"
              width="100%"
              onClick={() => setExpanded(true)}
            >
              Show {hidden} more
            </Button>
          </Box>
        </>
      )}
    </TableContainer>
  )
}

/**
 * A dashboard panel: title row with its actions or stats, the table, then an
 * optional footer. `pinned` is a second table stacked above the main one.
 */
export const ReserveTable = <T extends { reserve: ReserveSummary }>({
  title,
  actions,
  footer,
  error,
  pinned,
  ...table
}: TableState & {
  title: string
  actions?: ReactNode
  footer?: ReactNode
  data: T[]
  columns: ColumnDef<T>[]
  pinned?: { data: T[]; columns: ColumnDef<T>[] }
  empty: string
}) => {
  const hasPinned = !!pinned?.data.length
  const hasRows = table.isLoading || table.data.length > 0

  return (
    <TablePaper>
      <Flex justify="space-between" align="center" gap="base" p="xl">
        <Text as="h2" fs="p2" fw={500} font="primary">
          {title}
        </Text>
        {actions}
      </Flex>
      <Separator />
      {error ? (
        <Box p="xl">
          <ReadError error={error} />
        </Box>
      ) : !hasRows && !hasPinned ? (
        <Text p="xl" fw={500} color={getToken("text.low")}>
          {table.empty}
        </Text>
      ) : (
        <>
          {hasPinned && <ReserveDataTable {...table} {...pinned} flat />}
          {hasPinned && hasRows && <Separator />}
          {hasRows && <ReserveDataTable {...table} flat={!!pinned} />}
        </>
      )}
      {!error && footer}
    </TablePaper>
  )
}
