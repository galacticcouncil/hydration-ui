import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { shortenAccountAddress } from "utils/formatting"
import AccountIcon from "assets/icons/StakingAccountIcon.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { TLiquidityProvidersTableData } from "./data/LiquidityProvidersTableData.utils"
import { useAccountIdentity } from "api/stats"

const AccountName = ({ address }: { address: string }) => {
  const identity = useAccountIdentity(address)

  if (identity.data?.identity)
    return <>{identity.data.identity.info.display.asRaw.toUtf8()}</>

  return <>{shortenAccountAddress(address)}</>
}

export const useLiquidityProvidersTable = (
  data: TLiquidityProvidersTableData,
) => {
  const { t } = useTranslation()
  const { accessor, display } =
    createColumnHelper<TLiquidityProvidersTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    account: true,
    position: true,
    tvl: isDesktop,
    share: isDesktop,
    actions: true,
  }

  const columns = useMemo(
    () => [
      accessor("account", {
        id: "account",
        header: t("account"),
        sortingFn: (a, b) =>
          a.original.account.localeCompare(b.original.account),
        cell: ({ row }) => (
          <div
            sx={{
              flex: "row",
              gap: 8,
              align: "center",
              justify: "start",
            }}
          >
            <Icon size={26} icon={<AccountIcon />} />
            <Text fs={[14]} color="basic300">
              <AccountName address={row.original.account} />
            </Text>
          </div>
        ),
      }),
      accessor("value", {
        id: "position",
        header: t("position"),
        sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
        cell: ({ row }) => (
          <div sx={{ flex: "row", justify: ["right", "left"] }}>
            <WalletAssetsHydraPositionsData
              assetId={row.original.assetId}
              value={row.original.value}
              lrna={row.original.lrna}
              fontSize={[13, 16]}
            />
          </div>
        ),
      }),
      accessor("valueDisplay", {
        id: "tvl",
        header: t("totalValueLocked"),
        sortingFn: (a, b) =>
          a.original.valueDisplay.gt(b.original.valueDisplay) ? 1 : -1,
        cell: ({ row }) => (
          <Text color="white">
            <DisplayValue value={row.original.valueDisplay} isUSD />
          </Text>
        ),
      }),
      accessor("sharePercent", {
        id: "share",
        header: t("stats.omnipool.table.header.share"),
        sortingFn: (a, b) =>
          a.original.sharePercent.gt(b.original.sharePercent) ? 1 : -1,
        cell: ({ row }) => (
          <Text color="white">
            {t("value.percentage", {
              value: row.original.sharePercent,
            })}
          </Text>
        ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <div sx={{ pl: [5, 0] }}>
            <a
              href={`https://hydradx.subscan.io/account/${row.original.account}`}
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
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDesktop],
  )

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
