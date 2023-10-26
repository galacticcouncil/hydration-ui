import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useBestNumber } from "api/chain"
import { useAccountDepositIds, useAllDeposits } from "api/deposits"
import BN from "bignumber.js"
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
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { useRpcProvider } from "providers/rpcProvider"
import { arraySearch } from "utils/helpers"

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
        cell: ({ row }) => (
          <AssetTableName {...row.original} id={row.original.assetId} />
        ),
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
      accessor("position.providedAmount", {
        id: "initial",
        header: t("wallet.assets.farmingPositions.header.initial"),
        sortingFn: (a, b) => (a.original.shares.gt(b.original.shares) ? 1 : -1),
        cell: ({ row }) => (
          <>
            <Text fs={16} fw={500} color="white">
              {t("value.token", {
                value: row.original.position.providedAmount,
              })}
            </Text>
            <DollarAssetValue
              value={row.original.position.providedAmountDisplay}
              wrapper={(children) => (
                <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                  {children}
                </Text>
              )}
            >
              <DisplayValue
                value={row.original.position.providedAmountDisplay}
              />
            </DollarAssetValue>
          </>
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDesktop],
  )

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}

export const useFarmingPositionsData = ({
  search,
}: {
  search?: string
} = {}) => {
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()
  const allDeposits = useAllDeposits()
  const accountDepositIds = useAccountDepositIds(account?.address)
  const accountDepositsShare = useAllUserDepositShare()

  const accountDeposits = useMemo(
    () =>
      allDeposits.data?.filter(
        (deposit) =>
          accountDepositIds.data?.some(
            (d) => d.instanceId.toString() === deposit.id.toString(),
          ),
      ),
    [allDeposits.data, accountDepositIds.data],
  )

  const bestNumber = useBestNumber()

  const queries = [
    allDeposits,
    accountDepositIds,
    accountDepositsShare,
    bestNumber,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!accountDeposits || !accountDepositsShare.data || !bestNumber.data)
      return []

    const rows: FarmingPositionsTableData[] = accountDeposits
      .map((deposit) => {
        const id = deposit.id.toString()
        const assetId = deposit.deposit.ammPoolId.toString()
        const meta = assets.getAsset(assetId)
        const latestEnteredAtBlock = deposit.deposit.yieldFarmEntries.reduce(
          (acc, curr) =>
            acc.lt(curr.enteredAt.toBigNumber())
              ? curr.enteredAt.toBigNumber()
              : acc,
          BN_0,
        )

        const symbol = meta.symbol
        const name = meta.name
        const date = getEnteredDate(
          latestEnteredAtBlock,
          bestNumber.data.relaychainBlockNumber.toBigNumber(),
        )
        const shares = getFloatingPointAmount(
          deposit.deposit.shares.toBigNumber(),
          meta.decimals,
        )
        const position = accountDepositsShare.data[assetId]?.find(
          (d) => d.depositId?.toString() === deposit.id.toString(),
        ) ?? {
          symbol,
          value: BN_NAN,
          valueDisplay: BN_NAN,
          lrna: BN_NAN,
          amount: BN_NAN,
          providedAmount: BN_NAN,
          providedAmountDisplay: BN_NAN,
        }

        return {
          id,
          symbol,
          name,
          date,
          shares,
          position,
          assetId,
        }
      })
      .sort((a, b) =>
        b.position.valueDisplay.minus(a.position.valueDisplay).toNumber(),
      )

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [
    search,
    accountDeposits,
    accountDepositsShare.data,
    assets,
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
    providedAmount: BN
    providedAmountDisplay: BN
  }
}
