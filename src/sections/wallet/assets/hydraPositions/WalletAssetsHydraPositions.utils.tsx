import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletAssetsHydraPositionsDetails } from "./details/WalletAssetsHydraPositionsDetails"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { useMedia } from "react-use"
import { theme } from "theme"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import {
  isXYKPosition,
  TXYKPosition,
} from "./data/WalletAssetsHydraPositionsData.utils"
import { TLPData } from "utils/omnipool"

export const useHydraPositionsTable = (data: (TLPData | TXYKPosition)[]) => {
  const { t } = useTranslation()
  const { accessor } = createColumnHelper<TLPData | TXYKPosition>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    symbol: true,
    amount: isDesktop,
    valueDisplay: true,
  }

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "symbol",
        header: t("wallet.assets.hydraPositions.header.name"),
        cell: ({ row }) => <AssetTableName id={row.original.assetId} />,
      }),
      accessor("amount", {
        id: "amount",
        header: t("wallet.assets.hydraPositions.header.providedAmount"),
        sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
        cell: ({ row }) =>
          isXYKPosition(row.original) ? (
            <Text>-</Text>
          ) : (
            <WalletAssetsHydraPositionsDetails
              assetId={row.original.assetId}
              amount={row.original.amountShifted}
            />
          ),
      }),
      accessor("valueDisplay", {
        id: "valueDisplay",
        header: t("wallet.assets.hydraPositions.header.valueUSD"),
        sortingFn: (a, b) =>
          b.original.valueDisplay.isNaN()
            ? 1
            : a.original.valueDisplay.gt(b.original.valueDisplay)
              ? 1
              : -1,
        cell: ({ row }) => (
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
              lrna={
                isXYKPosition(row.original)
                  ? undefined
                  : row.original.lrnaShifted
              }
              amount={
                isXYKPosition(row.original)
                  ? undefined
                  : row.original.valueShifted
              }
              amountPair={
                isXYKPosition(row.original) ? row.original.balances : undefined
              }
              amountDisplay={row.original.valueDisplay}
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
