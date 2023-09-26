import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useTranslation } from "react-i18next"
import { ReactComponent as TradeIcon } from "assets/icons/TradeTypeIcon.svg"
import { ReactComponent as SuccessIcon } from "assets/icons/SuccessIcon.svg"
import { ReactComponent as Link } from "assets/icons/LinkPixeled.svg"
import BN from "bignumber.js"
import { theme } from "theme"

export type Transaction = {
  date: string
  price: BN
  in: {
    assetId: string
    symbol: string
    amount: string
  }
  out: {
    assetId: string
    symbol: string
    amount: string
  }
  link: string
  isBuy: boolean
}

export const useTransactionsTable = (data: Transaction[]) => {
  const { t } = useTranslation()

  const { accessor, display } = createColumnHelper<Transaction>()

  const columns = useMemo(
    () => [
      accessor("date", {
        header: t("bonds.transactions.table.date"),
        cell: ({ getValue }) => (
          <Text color="basic400" tAlign="center">
            {getValue()}
          </Text>
        ),
      }),
      accessor("price", {
        header: t("bonds.transactions.table.price"),
        cell: ({ row }) => (
          <Text color="basic400" tAlign="center">
            {t("value.token", { value: row.original.price })}
          </Text>
        ),
      }),
      display({
        header: t("bonds.transactions.table.transaction"),
        cell: ({ row }) => (
          <div sx={{ flex: "row", align: "center", gap: 6, justify: "center" }}>
            <Icon size={18} icon={<AssetLogo id={row.original.in.assetId} />} />
            <Text>
              {t("value.tokenWithSymbol", {
                value: row.original.in.amount,
                symbol: row.original.in.symbol,
              })}
            </Text>
            <Icon sx={{ color: "brightBlue600" }} icon={<TradeIcon />} />
            <Icon
              size={18}
              icon={<AssetLogo id={row.original.out.assetId} />}
            />
            <Text>
              {t("value.tokenWithSymbol", {
                value: row.original.out.amount,
                symbol: row.original.out.symbol,
              })}
            </Text>
          </div>
        ),
      }),
      display({
        header: t("bonds.transactions.table.status"),
        cell: () => (
          <div sx={{ flex: "row", gap: 4, align: "center", justify: "center" }}>
            <Icon icon={<SuccessIcon />} />
            <Text fs={13} color="green600">
              {t("complete")}
            </Text>
          </div>
        ),
      }),
      accessor("link", {
        header: () => (
          <div sx={{ textAlign: "center" }}>
            {t("bonds.transactions.table.link")}
          </div>
        ),
        cell: ({ getValue }) => (
          <a
            href={getValue()}
            target="_blank"
            rel="noreferrer"
            sx={{ width: "min-content", display: "block", m: "auto" }}
          >
            <Icon
              sx={{ color: "brightBlue300" }}
              icon={<Link />}
              css={{
                "&:hover": {
                  color: theme.colors.brightBlue100,
                },
              }}
            />
          </a>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
