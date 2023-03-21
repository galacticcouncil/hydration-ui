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
import { useAccountDepositIds, useAllDeposits } from "api/deposits"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { isAfter } from "date-fns"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { useAccountStore } from "state/store"
import { getFloatingPointAmount } from "utils/balance"
import { getEnteredDate } from "utils/block"
import { BN_0 } from "utils/constants"
import { WalletAssetsHydraPositionsData } from "../hydraPositions/data/WalletAssetsHydraPositionsData"
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
      cell: ({ row }) => (
        <div>
          <WalletAssetsHydraPositionsData
            symbol={row.original.position.symbol}
            value={row.original.position.value}
            lrna={row.original.position.lrna}
          />
          <DollarAssetValue
            value={row.original.position.valueUSD}
            wrapper={(children) => (
              <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                {children}
              </Text>
            )}
          >
            {t("value.usd", { amount: row.original.position.valueUSD })}
          </DollarAssetValue>
        </div>
      ),
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

    return accountDeposits.map((deposit) => {
      const id = deposit.deposit.ammPoolId.toString()
      const meta = assetMetas.data.find((am) => am.id === id)
      const details = assetDetails.data.find((ad) => ad.id === id)
      const latestEnteredAtBlock = deposit.deposit.yieldFarmEntries.reduce(
        (acc, curr) =>
          acc.lt(curr.enteredAt.toBigNumber())
            ? curr.enteredAt.toBigNumber()
            : acc,
        BN_0,
      )

      const symbol = meta?.symbol
      const name = details?.name
      const date = getEnteredDate(
        latestEnteredAtBlock,
        bestNumber.data.relaychainBlockNumber.toBigNumber(),
      )
      const shares = getFloatingPointAmount(
        deposit.deposit.shares.toBigNumber(),
        meta?.decimals.toNumber() ?? 12,
      )
      const position = accountDepositsShare.data[id]?.find(
        (d) => d.depositId?.toString() === deposit.id.toString(),
      )

      return { symbol, name, date, shares, position }
    })
  }, [
    accountDeposits,
    accountDepositsShare.data,
    assetMetas.data,
    assetDetails.data,
    bestNumber.data,
  ])

  return { data, isLoading }
}
