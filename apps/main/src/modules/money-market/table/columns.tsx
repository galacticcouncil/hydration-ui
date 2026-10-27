import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"

import {
  ActionsCell,
  AmountCell,
  BorrowRow,
  CollateralCell,
  CollateralSwitch,
  OnRowAction,
  ReserveApyCell,
  ReserveAsset,
  SuppliedRow,
  SupplyRow,
} from "@/modules/money-market/table/cells"

const right = { meta: { sx: { textAlign: "right" } } } as const
const center = { meta: { sx: { textAlign: "center" } } } as const

const supplied = createColumnHelper<SuppliedRow>()
export const suppliedColumns = (onAction: OnRowAction) => [
  supplied.display({
    header: "Asset",
    cell: ({ row }) => <ReserveAsset reserve={row.original.reserve} />,
  }),
  supplied.display({
    id: "amount",
    header: "Balance",
    ...right,
    cell: ({ row }) => (
      <AmountCell
        reserve={row.original.reserve}
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
    id: "amount",
    header: "Debt",
    ...right,
    cell: ({ row }) => (
      <AmountCell
        reserve={row.original.reserve}
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
        id: "amount",
        header: "Balance",
        ...right,
        cell: ({ row }) => (
          <AmountCell
            reserve={row.original.reserve}
            amount={row.original.balance}
            usd={row.original.balanceUsd}
          />
        ),
      }),
  toSupply.display({
    header: "APY",
    ...right,
    cell: ({ row }) => (
      <ReserveApyCell reserve={row.original.reserve} side="supply" />
    ),
  }),
  toSupply.display({
    header: "Collateral",
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
    id: "amount",
    header: "Available",
    ...right,
    cell: ({ row }) => (
      <AmountCell
        reserve={row.original.reserve}
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
