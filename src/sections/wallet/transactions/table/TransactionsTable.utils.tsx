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
  safeConvertAddressSS58,
  shortenAccountAddress,
} from "utils/formatting"
import { AssetLogo, ChainLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useAccountIdentity } from "api/stats"
import { H160, isEvmAccount } from "utils/evm"
import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
import { chainsMap } from "@galacticcouncil/xcm-cfg"

const AccountName = ({
  address,
  chainKey,
}: {
  address: string
  chainKey?: string
}) => {
  const identity = useAccountIdentity(address)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const chain = chainKey ? chainsMap.get(chainKey) : null

  const strLen = isDesktop ? 6 : 4

  if (identity.data?.identity) return <>{identity.data.identity}</>

  const isEvmChain = chain?.isEvmParachain() || chainKey === "hydradx"

  if (isEvmAccount(address) && isEvmChain) {
    return <>{shortenAccountAddress(H160.fromAccount(address), strLen)}</>
  }

  const convertedAddress = safeConvertAddressSS58(
    address,
    chain?.ss58Format ?? HYDRADX_SS58_PREFIX,
  )

  return <>{shortenAccountAddress(convertedAddress ?? address, strLen)}</>
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
            <MultipleIcons
              size={24}
              icons={row.original.iconIds.map((id) => ({
                icon: <AssetLogo id={id} />,
              }))}
            />
            <Text css={{ whiteSpace: "nowrap" }}>
              {t("value.tokenWithSymbol", {
                value: row.original.amount,
                symbol: row.original.asset.symbol,
                fixedPointScale: row.original.asset.decimals,
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
        <Text color="white" sx={{ flex: "row", gap: 8, align: "center" }}>
          {row.original.sourceChain && (
            <span sx={{ display: "block", width: 24, height: 24 }}>
              <ChainLogo symbol={row.original.sourceChain.key} />
            </span>
          )}
          {row.original.source && (
            <AccountName
              address={getChainSpecificAddress(row.original.source)}
              chainKey={row.original.sourceChain?.key}
            />
          )}
        </Text>
      ),
    }),
    accessor("dest", {
      id: "dest",
      header: t("wallet.transactions.table.header.destination"),
      cell: ({ row }) => {
        return (
          <Text color="white" sx={{ flex: "row", gap: 8, align: "center" }}>
            {row.original.destChain && (
              <span sx={{ display: "block", width: 24, height: 24 }}>
                <ChainLogo symbol={row.original.destChain.key} />
              </span>
            )}
            {row.original.dest && (
              <AccountName
                address={row.original.dest}
                chainKey={row.original.destChain?.key}
              />
            )}
          </Text>
        )
      },
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
