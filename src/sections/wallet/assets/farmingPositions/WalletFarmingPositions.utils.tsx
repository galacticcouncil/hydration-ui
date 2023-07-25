import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useAssetDetailsList } from "api/assetDetails"
import { useAssetMetaList } from "api/assetMeta"
import { useBestNumber } from "api/chain"
import { useAccountDepositIds, useAllDeposits } from "api/deposits"
import BN from "bignumber.js"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { isAfter } from "date-fns"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { useAccountStore } from "state/store"
import { theme } from "theme"
import { getFloatingPointAmount } from "utils/balance"
import { getEnteredDate } from "utils/block"
import { BN_0, BN_NAN } from "utils/constants"
import { WalletAssetsHydraPositionsData } from "../hydraPositions/data/WalletAssetsHydraPositionsData"
import { WalletAssetsTableName } from "../table/data/WalletAssetsTableData"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"

export const useFarmingPositionsTable = (data: FarmingPositionsTableData[]) => {
  const { t } = useTranslation()
  const { accessor } = createColumnHelper<FarmingPositionsTableData>()
  const [sorting, onSortingChange] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    symbol: true,
    date: isDesktop,
    shares: isDesktop,
    position: true,
  }

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "name",
        header: isDesktop
          ? t("wallet.assets.farmingPositions.header.name")
          : t("selectAssets.asset"),
        sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
        cell: ({ row }) => <WalletAssetsTableName {...row.original} />,
      }),
      accessor("date", {
        id: "date",
        header: t("wallet.assets.farmingPositions.header.date"),
        sortingFn: (a, b) =>
          isAfter(a.original.date, b.original.date) ? 1 : -1,
        cell: ({ row }) => (
          <Text fs={16} fw={500} color="white">
            {t("wallet.assets.farmingPositions.data.date", {
              date: row.original.date,
            })}
          </Text>
        ),
      }),
      accessor("shares", {
        id: "shares",
        header: t("wallet.assets.farmingPositions.header.shares"),
        sortingFn: (a, b) => (a.original.shares.gt(b.original.shares) ? 1 : -1),
        cell: ({ row }) => (
          <Text fs={16} fw={500} color="white">
            {t("value.token", { value: row.original.shares })}
          </Text>
        ),
      }),
      accessor("position", {
        id: "value",
        header: t("wallet.assets.farmingPositions.header.value"),
        sortingFn: (a, b) =>
          a.original.position.valueDisplay.gt(b.original.position.valueDisplay)
            ? 1
            : -1,
        cell: ({ row }) => (
          <div sx={{ flex: "column", align: ["end", "start"], gap: 2 }}>
            <div sx={{ flex: "row", gap: 4 }}>
              <WalletAssetsHydraPositionsData
                symbol={row.original.position.symbol}
                value={row.original.position.value}
                lrna={row.original.position.lrna}
              />
              <LrnaPositionTooltip
                lrnaPosition={row.original.position.lrna}
                tokenPosition={row.original.position.value}
                assetId={row.original.assetId}
              />
            </div>
            <DollarAssetValue
              value={row.original.position.valueDisplay}
              wrapper={(children) => (
                <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                  {children}
                </Text>
              )}
            >
              <DisplayValue value={row.original.position.valueDisplay} />
            </DollarAssetValue>
          </div>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return table
}

export const useFarmingPositionsData = () => {
  const { account } = useAccountStore()
  const allDeposits = useAllDeposits()
  const accountDepositIds = useAccountDepositIds(account?.address)
  const accountDepositsShare = useAllUserDepositShare()

  const accountDeposits = useMemo(
    () =>
      allDeposits.data?.filter((deposit) =>
        accountDepositIds.data?.some(
          (d) => d.instanceId.toString() === deposit.id.toString(),
        ),
      ),
    [allDeposits.data, accountDepositIds.data],
  )
  const tokens = accountDeposits?.map((deposit) =>
    deposit.deposit.ammPoolId.toString(),
  )

  const assetMetas = useAssetMetaList(tokens ?? [])
  const assetDetails = useAssetDetailsList(tokens)

  const bestNumber = useBestNumber()

  const queries = [
    allDeposits,
    accountDepositIds,
    accountDepositsShare,
    assetMetas,
    assetDetails,
    bestNumber,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !accountDeposits ||
      !accountDepositsShare.data ||
      !assetMetas.data ||
      !assetDetails.data ||
      !bestNumber.data
    )
      return []

    const rows: FarmingPositionsTableData[] = accountDeposits.map((deposit) => {
      const id = deposit.id.toString()
      const assetId = deposit.deposit.ammPoolId.toString()
      const meta = assetMetas.data.find((am) => am.id === assetId)
      const details = assetDetails.data.find((ad) => ad.id === assetId)
      const latestEnteredAtBlock = deposit.deposit.yieldFarmEntries.reduce(
        (acc, curr) =>
          acc.lt(curr.enteredAt.toBigNumber())
            ? curr.enteredAt.toBigNumber()
            : acc,
        BN_0,
      )

      const symbol = meta?.symbol ?? "N/A"
      const name = details?.name || getAssetName(meta?.symbol)
      const date = getEnteredDate(
        latestEnteredAtBlock,
        bestNumber.data.relaychainBlockNumber.toBigNumber(),
      )
      const shares = getFloatingPointAmount(
        deposit.deposit.shares.toBigNumber(),
        meta?.decimals.toNumber() ?? 12,
      )
      const position = accountDepositsShare.data[assetId]?.find(
        (d) => d.depositId?.toString() === deposit.id.toString(),
      ) ?? { symbol, value: BN_NAN, valueDisplay: BN_NAN, lrna: BN_NAN }

      return { id, symbol, name, date, shares, position, assetId }
    })

    return rows
  }, [
    accountDeposits,
    accountDepositsShare.data,
    assetMetas.data,
    assetDetails.data,
    bestNumber.data,
  ])

  return { data, isLoading }
}

export type FarmingPositionsTableData = {
  id: string
  assetId: string
  symbol: string
  name: string
  date: Date
  shares: BN
  position: {
    symbol: string
    value: BN
    valueDisplay: BN
    lrna: BN
  }
}
