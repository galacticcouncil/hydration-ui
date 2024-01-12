import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { isAfter } from "date-fns"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { TTransactionsTableData } from "./data/TransactionsTableData.utils"
import {
  getChainSpecificAddress,
  getSubscanLinkByType,
  shortenAccountAddress,
} from "utils/formatting"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useAccountIdentity } from "api/stats"

const AccountName = ({ address }: { address: string }) => {
  const identity = useAccountIdentity(address)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  if (identity.data?.identity) return <>{identity.data.identity}</>

  return <>{shortenAccountAddress(address, isDesktop ? 6 : 4)}</>
}

export const useTransactionsTable = (data: TTransactionsTableData) => {
  const { t } = useTranslation()

  const { accessor, display } =
    createColumnHelper<TTransactionsTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    type: true,
    amount: true,
    from: isDesktop,
    to: isDesktop,
    date: isDesktop,
    actions: isDesktop,
  }

  const columns = [
    accessor("type", {
      id: "type",
      header: t("wallet.transactions.table.header.type"),
      cell: ({ row }) => {
        const isIngoing = row.original.type === "IN"
        return (
          <Text color={isIngoing ? "green400" : "red400"}>
            {isIngoing
              ? t("wallet.transactions.table.type.ingoing")
              : t("wallet.transactions.table.type.outgoing")}
          </Text>
        )
      },
    }),
    accessor("amount", {
      id: "amount",
      header: t("wallet.transactions.table.header.amount"),
      sortingFn: (a, b) => (a.original.amount.gt(b.original.amount) ? 1 : -1),
      cell: ({ row }) => {
        return (
          <div sx={{ color: "white", flex: "row", gap: 8, align: "center" }}>
            {typeof row.original.iconIds === "string" ? (
              <Icon size={24} icon={<AssetLogo id={row.original.iconIds} />} />
            ) : (
              <MultipleIcons
                size={24}
                icons={row.original.iconIds.map((id) => ({
                  icon: <AssetLogo id={id} />,
                }))}
              />
            )}
            <Text css={{ whiteSpace: "nowrap" }}>
              {t("value.tokenWithSymbol", {
                value: row.original.amount,
                symbol: row.original.asset.symbol,
                fixedPointScale: row.original.asset.decimals,
                type: "token",
              })}
            </Text>
          </div>
        )
      },
    }),
    accessor("from", {
      id: "from",
      header: t("wallet.transactions.table.header.source"),
      cell: ({ getValue }) => (
        <Text color="white">
          <AccountName address={getChainSpecificAddress(getValue())} />
        </Text>
      ),
    }),
    accessor("to", {
      id: "to",
      header: t("wallet.transactions.table.header.destination"),
      cell: ({ getValue }) => (
        <Text color="white">
          <AccountName address={getChainSpecificAddress(getValue())} />
        </Text>
      ),
    }),
    accessor("date", {
      id: "date",
      header: t("wallet.transactions.table.header.date"),
      sortingFn: (a, b) => (isAfter(a.original.date, b.original.date) ? 1 : -1),
      cell: ({ row }) => (
        <Text color="white" css={{ whiteSpace: "nowrap" }}>
          {t("stats.overview.table.trades.value.totalValueTime", {
            date: new Date(row.original.date),
          })}
        </Text>
      ),
    }),
    display({
      id: "actions",
      cell: ({ row }) => {
        const hash = row.original.extrinsicHash
        return (
          <div sx={{ pl: [5, 0] }}>
            <a
              href={`${getSubscanLinkByType("extrinsic")}/${hash}`}
              target="blank"
              rel="noreferrer"
            >
              <Icon
                size={12}
                sx={{ color: "darkBlue300" }}
                icon={<LinkIcon />}
              />
            </a>
          </div>
        )
      },
    }),
  ]

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
