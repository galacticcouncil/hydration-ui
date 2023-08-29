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
import { ExternalLink } from "components/Link/ExternalLink"

export type Transaction = {
  id: string
  date: string
  price: string
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
}

export const useTransactionsTable = (data: Transaction[]) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<Transaction>()

  const columns = useMemo(
    () => [
      accessor("date", {
        header: t("bonds.transactions.table.date"),
        cell: ({ getValue }) => <Text color="basic400">{getValue()}</Text>,
      }),
      display({
        header: t("bonds.transactions.table.transaction"),
        cell: ({ row }) => (
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
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
      accessor("price", {
        header: t("bonds.transactions.table.price"),
        cell: ({ getValue }) => <Text color="basic400">{getValue()}</Text>,
      }),
      accessor("link", {
        header: () => (
          <div sx={{ textAlign: "center" }}>
            {t("bonds.transactions.table.link")}
          </div>
        ),
        cell: ({ getValue }) => (
          <ExternalLink
            sx={{
              color: "brightBlue300",
              textAlign: "center",
              display: "block",
            }}
            css={{ textDecoration: "none" }}
            href={getValue()}
          />
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
