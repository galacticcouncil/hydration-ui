import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useBestNumber } from "api/chain"
import { useUserDeposits } from "api/deposits"
import BN from "bignumber.js"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { isAfter } from "date-fns"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { useAllOmnipoolDeposits } from "sections/pools/farms/position/FarmingPosition.utils"
import { theme } from "theme"
import { getFloatingPointAmount } from "utils/balance"
import { getEnteredDate } from "utils/block"
import { BN_0, BN_NAN } from "utils/constants"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { useRpcProvider } from "providers/rpcProvider"
import { arraySearch, isNotNil } from "utils/helpers"
import { WalletAssetsHydraPositionsDetails } from "sections/wallet/assets/hydraPositions/details/WalletAssetsHydraPositionsDetails"
import { ButtonTransparent } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import { useXYKDepositValues } from "sections/pools/PoolsPage.utils"
import { scaleHuman } from "utils/balance"

export const useFarmingPositionsTable = (data: FarmingPositionsTableData[]) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
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
        id: "symbol",
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
          <Text fs={14} fw={500} color="white">
            {t("wallet.assets.farmingPositions.data.date", {
              date: row.original.date,
            })}
          </Text>
        ),
      }),
      accessor("shares", {
        id: "shares",
        header: t("wallet.assets.farmingPositions.header.initial"),
        sortingFn: (a, b) => (a.original.shares.gt(b.original.shares) ? 1 : -1),
        cell: ({ row }) => {
          const meta = assets.getAsset(row.original.assetId)
          return isXYKPosition(row.original.position) ? (
            <Text fs={14} fw={500} color="white">
              -
            </Text>
          ) : (
            <>
              <Text fs={14} fw={500} color="white">
                {t("value.token", {
                  value: scaleHuman(
                    row.original.position.providedAmount,
                    meta.decimals,
                  ),
                })}
              </Text>
              <DollarAssetValue
                value={row.original.position.providedAmountDisplay}
                wrapper={(children) => (
                  <Text fs={[12, 13]} lh={[14, 16]} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue
                  value={row.original.position.providedAmountDisplay}
                />
              </DollarAssetValue>
            </>
          )
        },
      }),
      accessor("position", {
        id: "position",
        header: t("wallet.assets.farmingPositions.header.value"),
        sortingFn: (a, b) =>
          a.original.position.valueDisplay.gt(b.original.position.valueDisplay)
            ? 1
            : -1,
        cell: ({ row }) => {
          const position = row.original.position
          const isXYK = isXYKPosition(position)

          return (
            <div
              sx={{
                flex: "row",
                gap: 1,
                align: "center",
                justify: ["end", "start"],
                textAlign: "center",
              }}
            >
              <WalletAssetsHydraPositionsDetails
                assetId={row.original.assetId}
                lrna={isXYK ? undefined : position.lrna}
                amount={isXYK ? undefined : position.value}
                amountPair={isXYK ? position.balances : undefined}
                amountDisplay={position.valueDisplay}
              />
              {!isDesktop && (
                <ButtonTransparent>
                  <Icon
                    sx={{ color: "darkBlue300" }}
                    icon={<ChevronRightIcon />}
                  />
                </ButtonTransparent>
              )}
            </div>
          )
        },
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
  const { omnipoolDeposits, xykDeposits } = useUserDeposits()
  const xykDepositValues = useXYKDepositValues(xykDeposits)
  const accountDepositsShare = useAllOmnipoolDeposits()

  const bestNumber = useBestNumber()

  const queries = [accountDepositsShare, bestNumber]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!omnipoolDeposits || !accountDepositsShare.data || !bestNumber.data)
      return []

    const rows = [...omnipoolDeposits, ...xykDeposits]
      .map((deposit) => {
        const depositId = deposit.id
        const isXyk = deposit.isXyk
        const poolId = deposit.data.ammPoolId.toString()

        const meta = isXyk
          ? assets.getShareTokenByAddress(poolId)
          : assets.getAsset(poolId)

        if (!meta) return undefined

        const { symbol, decimals, name, id } = meta
        const latestEnteredAtBlock = deposit.data.yieldFarmEntries.reduce(
          (acc, curr) =>
            acc.lt(curr.enteredAt.toBigNumber())
              ? curr.enteredAt.toBigNumber()
              : acc,
          BN_0,
        )

        const date = getEnteredDate(
          latestEnteredAtBlock,
          bestNumber.data.relaychainBlockNumber.toBigNumber(),
        )
        const shares = getFloatingPointAmount(
          deposit.data.shares.toBigNumber(),
          decimals,
        )

        let position
        if (isXyk) {
          const values = xykDepositValues.data.find(
            (value) => value.assetId === id,
          )

          if (values?.amountUSD) {
            const { assetA, assetB, amountUSD } = values

            position = {
              balances: [
                {
                  amount: assetA.amount,
                  symbol: assetA.symbol,
                },
                {
                  amount: assetB.amount,
                  symbol: assetB.symbol,
                },
              ],
              valueDisplay: amountUSD,
            }
          } else {
            position = {
              valueDisplay: BN_NAN,
            }
          }
        } else {
          position = accountDepositsShare.data[poolId]?.find(
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
        }

        return {
          id: depositId,
          symbol,
          name,
          date,
          shares,
          position,
          assetId: id,
        }
      })
      .filter(isNotNil)
      .sort((a, b) =>
        b.position.valueDisplay.minus(a.position.valueDisplay).toNumber(),
      )

    return search ? arraySearch(rows, search, ["symbol", "name"]) : rows
  }, [
    omnipoolDeposits,
    accountDepositsShare.data,
    bestNumber.data,
    xykDeposits,
    search,
    assets,
    xykDepositValues,
  ])

  return { data, isLoading }
}

export const isXYKPosition = (
  position: XYKPosition | OmnipoolPosition,
): position is XYKPosition => !!(position as XYKPosition).balances

type XYKPosition = {
  valueDisplay: BN
  balances: { amount: BN; symbol: string }[]
}

type OmnipoolPosition = {
  symbol: string
  value: BN
  valueDisplay: BN
  lrna: BN
  providedAmount: BN
  providedAmountDisplay: BN
}

export type FarmingPositionsTableData = {
  id: string
  assetId: string
  symbol: string
  name: string
  date: Date
  shares: BN
  position: XYKPosition | OmnipoolPosition
}
