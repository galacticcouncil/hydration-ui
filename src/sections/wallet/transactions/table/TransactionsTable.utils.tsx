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
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { TTransactionsTableData } from "./data/TransactionsTableData.utils"
import { getSubscanLinkByType, shortenAccountAddress } from "utils/formatting"
import { AssetLogo, ChainLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useAccountIdentity } from "api/stats"

import BuyIcon from "assets/icons/BuyIcon.svg?react"
import SellIcon from "assets/icons/SellIcon.svg?react"

const AccountName = ({ address }: { address: string }) => {
  const identity = useAccountIdentity(address)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const strLen = isDesktop ? 6 : 4

  if (identity.data?.identity) return <>{identity.data.identity}</>

  return <>{shortenAccountAddress(address, strLen)}</>
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
        const isDeposit = row.original.type === "deposit"
        return (
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            {isDeposit ? (
              <BuyIcon sx={{ color: "green500" }} width={18} height={18} />
            ) : (
              <SellIcon
                sx={{ color: "brightBlue300" }}
                width={18}
                height={18}
              />
            )}
            <div>
              <Text color="basic300" fs={13}>
                {isDeposit
                  ? t("wallet.transactions.table.type.deposit")
                  : t("wallet.transactions.table.type.withdraw")}
              </Text>
              <Text color="darkBlue300" fs={11} lh={14}>
                <span
                  title={t("stats.overview.table.trades.value.totalValueTime", {
                    date: row.original.date,
                  })}
                >
                  {t("stats.overview.chart.tvl.label.time", {
                    date: row.original.date,
                  })}
                </span>
              </Text>
            </div>
          </div>
        )
      },
    }),
    accessor("amount", {
      id: "amount",
      header: t("wallet.transactions.table.header.amount"),
      sortingFn: (a, b) => (a.original.amount.gt(b.original.amount) ? 1 : -1),
      cell: ({ row }) => {
        return (
          <div
            sx={{
              color: "white",
              flex: "row",
              gap: 8,
              align: "center",
            }}
          >
            <MultipleIcons
              size={16}
              icons={row.original.assetIconIds.map((id) => ({
                icon: <AssetLogo id={id} />,
              }))}
            />
            <Text fs={13} css={{ whiteSpace: "nowrap" }}>
              {t("value.tokenWithSymbol", {
                value: row.original.amountDisplay,
                symbol: row.original.assetSymbol,
              })}
            </Text>
          </div>
        )
      },
    }),
    accessor("source", {
      id: "source",
      header: t("wallet.transactions.table.header.source"),
      cell: ({ row }) => (
        <Text
          color="basic400"
          fs={13}
          sx={{ flex: "row", gap: 8, align: "center" }}
        >
          {row.original.sourceChain && (
            <span sx={{ display: "block", width: 16, height: 16 }}>
              <ChainLogo symbol={row.original.sourceChain.key} />
            </span>
          )}
          {row.original.sourceDisplay && (
            <AccountName address={row.original.sourceDisplay} />
          )}
        </Text>
      ),
    }),
    accessor("dest", {
      id: "dest",
      header: t("wallet.transactions.table.header.destination"),
      cell: ({ row }) => {
        return (
          <Text
            color="white"
            fs={13}
            sx={{ flex: "row", gap: 8, align: "center" }}
          >
            {row.original.destChain && (
              <span sx={{ display: "block", width: 16, height: 16 }}>
                <ChainLogo symbol={row.original.destChain.key} />
              </span>
            )}
            {row.original.destDisplay && (
              <AccountName address={row.original.destDisplay} />
            )}
          </Text>
        )
      },
    }),
    display({
      id: "actions",
      cell: ({ row }) => {
        const hash = row.original.extrinsicHash
        return (
          <div>
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
