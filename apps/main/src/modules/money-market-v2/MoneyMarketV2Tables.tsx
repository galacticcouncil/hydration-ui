import { useMoneyMarket } from "@galacticcouncil/money-market-v2/react"
import type {
  IncentiveApr,
  MarketDescriptor,
  PositionSummary,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"
import { Check } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Amount,
  AssetLabel,
  Box,
  Button,
  Chip,
  DataTable,
  Flex,
  Icon,
  LogoSize,
  SectionHeader,
  Separator,
  TableContainer,
  TableSize,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  getAssetIdFromAddress,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
  GSOL_ASSET_ID,
  GSOL_ERC20_ID,
  HOLLAR_ASSET_ID,
} from "@galacticcouncil/utils"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { useNavigateToReserve } from "@/modules/money-market-v2/hooks"

export type SuppliedRow = { reserve: ReserveSummary; position: PositionSummary }
export type SupplyRow = {
  reserve: ReserveSummary
  balance: string | undefined
  balanceUsd: string | undefined
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

// ponytail: mirrors ReserveLabel's override map, which is typed to v1 reserves
const LOGO_OVERRIDES: Record<string, string> = {
  [GDOT_ASSET_ID]: GDOT_ERC20_ID,
  [GETH_ASSET_ID]: GETH_ERC20_ID,
  [GSOL_ASSET_ID]: GSOL_ERC20_ID,
}

/**
 * The registry asset behind a reserve's token. HOLLAR's token is not an asset
 * precompile, so it can't be decoded from its address. Takes any string, as
 * it also resolves raw URL params.
 */
export const reserveAssetId = (address: string, market: MarketDescriptor) =>
  isHollar(address, market) ? HOLLAR_ASSET_ID : getAssetIdFromAddress(address)

/**
 * Hollar is minted rather than lent: nothing is supplied to its reserve, its
 * rate is set by governance rather than by utilization, and its borrowing is
 * capped by the facilitator bucket instead of the reserve's borrow cap.
 */
export const isHollar = (address: string, market: MarketDescriptor) =>
  address.toLowerCase() === market.addresses.HOLLAR_TOKEN.toLowerCase()

export const useReserveLogoId = (reserve: ReserveSummary) => {
  const { market } = useMoneyMarket()
  const assetId = reserveAssetId(reserve.underlyingAsset, market)

  return LOGO_OVERRIDES[assetId] ?? assetId
}

export const ReserveAsset: FC<{
  reserve: ReserveSummary
  size?: LogoSize
}> = ({ reserve, size }) => {
  const logoId = useReserveLogoId(reserve)

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={logoId} size={size} />
      <AssetLabel symbol={reserve.symbol} />
    </AssetLabelFullContainer>
  )
}

/**
 * Base APY, with each incentive APR listed underneath rather than summed in -
 * v2 never composes the two (ADR-0005).
 */
export const ApyCell: FC<{ apy: string; incentives: IncentiveApr[] }> = ({
  apy,
  incentives,
}) => {
  const { t } = useTranslation()

  return (
    <Amount
      value={t("percent", { value: Number(apy) * 100 })}
      displayValue={
        incentives.length
          ? incentives
              .map(
                (i) =>
                  `+${t("percent", { value: Number(i.rewardApr) * 100 })} ${i.rewardTokenSymbol}`,
              )
              .join(" · ")
          : undefined
      }
    />
  )
}

export const AmountCell: FC<{ amount: string; usd: string }> = ({
  amount,
  usd,
}) => {
  const { t } = useTranslation()

  return (
    <Amount
      value={t("number", { value: amount })}
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
      <Chip variant="warning" size="small">
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
const CollateralSwitch: FC<{ row: SuppliedRow; onAction: OnRowAction }> = ({
  row: { reserve, position },
  onAction,
}) => (
  <Flex direction="column" align="center" gap="xs">
    <Toggle
      checked={position.usageAsCollateralEnabledOnUser}
      disabled={!onAction}
      onClick={(e) => e.stopPropagation()}
      onCheckedChange={() => onAction?.("collateral", reserve.underlyingAsset)}
    />
    {reserve.isIsolated && (
      <Chip variant="warning" size="small">
        Isolated
      </Chip>
    )}
  </Flex>
)

const ActionsCell: FC<{
  asset: Address
  actions: Exclude<RowAction, "collateral">[]
  onAction: OnRowAction
}> = ({ asset, actions, onAction }) => {
  const { t } = useTranslation("moneyMarket")

  return (
    <Flex justify="flex-end" gap="s">
      {actions.map((action) => (
        <Button
          key={action}
          variant="tertiary"
          size="small"
          disabled={!onAction}
          onClick={(e) => {
            e.stopPropagation()
            onAction?.(action, asset)
          }}
        >
          {t(action)}
        </Button>
      ))}
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
      <ApyCell
        apy={row.original.reserve.supplyApy}
        incentives={row.original.reserve.supplyIncentives}
      />
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
      <ApyCell
        apy={row.original.reserve.variableBorrowApy}
        incentives={row.original.reserve.borrowIncentives}
      />
    ),
  }),
  supplied.display({
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell
        asset={row.original.reserve.underlyingAsset}
        actions={["repay", "borrow"]}
        onAction={onAction}
      />
    ),
  }),
]

const toSupply = createColumnHelper<SupplyRow>()
export const toSupplyColumns = (onAction: OnRowAction) => [
  toSupply.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  toSupply.display({
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
      <ApyCell
        apy={row.original.reserve.supplyApy}
        incentives={row.original.reserve.supplyIncentives}
      />
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
      <ApyCell
        apy={row.original.reserve.variableBorrowApy}
        incentives={row.original.reserve.borrowIncentives}
      />
    ),
  }),
  toBorrow.display({
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell
        asset={row.original.reserve.underlyingAsset}
        actions={["borrow"]}
        onAction={onAction}
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
}: {
  data: T[]
  columns: ColumnDef<T>[]
  empty: string
  isLoading?: boolean
  size?: TableSize
}) => {
  const navigateToReserve = useNavigateToReserve()

  return (
    <TableContainer borderRadius="xl">
      <DataTable
        fixedLayout
        size={size}
        skeletonRowCount={4}
        isLoading={isLoading}
        data={data}
        columns={columns}
        onRowClick={(row) => navigateToReserve(row.reserve.underlyingAsset)}
        emptyState={
          <Text fw={500} color={getToken("text.low")}>
            {empty}
          </Text>
        }
      />
    </TableContainer>
  )
}

export const ReserveTable = <T extends { reserve: ReserveSummary }>({
  title,
  header,
  error,
  ...table
}: TableState & {
  title: string
  header?: ReactNode
  data: T[]
  columns: ColumnDef<T>[]
  empty: string
}) => (
  <Box>
    <SectionHeader title={title} as="h2" noTopPadding />
    {error ? (
      <ReadError error={error} />
    ) : (
      <TablePaper>
        {header && (
          <>
            {header}
            <Separator />
          </>
        )}
        <ReserveDataTable {...table} />
      </TablePaper>
    )}
  </Box>
)
