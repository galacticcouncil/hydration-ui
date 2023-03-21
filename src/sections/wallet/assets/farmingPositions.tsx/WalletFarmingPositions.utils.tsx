import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useAssetDetailsList } from "api/assetDetails"
import { useAssetMetaList } from "api/assetMeta"
import { useBestNumber } from "api/chain"
import { useApiIds } from "api/consts"
import { useAccountDepositIds, useAllDeposits } from "api/deposits"
import { useSpotPrices } from "api/spotPrice"
import { Text } from "components/Typography/Text/Text"
import { isAfter } from "date-fns"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { getFloatingPointAmount } from "utils/balance"
import { getEnteredDate } from "utils/block"
import { BN_0 } from "utils/constants"
import { WalletAssetsTableName } from "../table/data/WalletAssetsTableData"

export const useFarmingPositionsTable = (data: any[]) => {
  const { t } = useTranslation()
  const { accessor } = createColumnHelper<any>()
  const [sorting, onSortingChange] = useState<SortingState>([])

  const columns = [
    accessor("symbol", {
      id: "name",
      header: t("wallet.assets.farmingPositions.header.name"),
      sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
      cell: ({ row }) => <WalletAssetsTableName {...row.original} />,
    }),
    accessor("date", {
      id: "date",
      header: t("wallet.assets.farmingPositions.header.date"),
      sortingFn: (a, b) => (isAfter(a.original.date, b.original.date) ? 1 : -1),
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
    accessor("value", {
      id: "value",
      header: t("wallet.assets.farmingPositions.header.value"),
      sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
      cell: ({ row }) => "TODO: " + row.original.value,
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
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

  const apiIds = useApiIds()
  const spotPrices = useSpotPrices(tokens ?? [], apiIds.data?.usdId)

  const queries = [
    allDeposits,
    accountDepositIds,
    assetMetas,
    assetDetails,
    bestNumber,
    apiIds,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !accountDeposits ||
      !assetMetas.data ||
      !assetDetails.data ||
      !bestNumber.data ||
      spotPrices.some((q) => !q.data)
    )
      return []

    return accountDeposits.map((deposit) => {
      const id = deposit.deposit.ammPoolId.toString()
      const meta = assetMetas.data.find((am) => am.id === id)
      const details = assetDetails.data.find((ad) => ad.id === id)
      const latestEnteredAt = deposit.deposit.yieldFarmEntries.reduce(
        (acc, curr) =>
          acc.lt(curr.enteredAt.toBigNumber())
            ? curr.enteredAt.toBigNumber()
            : acc,
        BN_0,
      )
      const spotPrice = spotPrices.find((sp) => sp.data?.tokenIn === id)?.data
        ?.spotPrice

      const symbol = meta?.symbol
      const name = details?.name
      const date = getEnteredDate(
        latestEnteredAt,
        bestNumber.data.relaychainBlockNumber.toBigNumber(),
      )
      const shares = getFloatingPointAmount(
        deposit.deposit.shares.toBigNumber(),
        meta?.decimals.toNumber() ?? 12,
      )

      return { symbol, name, date, shares }
    })
  }, [
    accountDeposits,
    assetMetas.data,
    assetDetails.data,
    bestNumber.data,
    spotPrices,
  ])

  return { data, isLoading }
}
