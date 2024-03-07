import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import BN from "bignumber.js"
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
import { DisplayValue } from "components/DisplayValue/DisplayValue"

export const useHydraPositionsTable = (
  data: (HydraPositionsTableData | TXYKPosition)[],
) => {
  const { t } = useTranslation()
  const { accessor } = createColumnHelper<
    HydraPositionsTableData | TXYKPosition
  >()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    symbol: true,
    providedAmount: isDesktop,
    valueDisplay: true,
  }

  const columns = useMemo(
    () => [
      accessor("symbol", {
        id: "symbol",
        header: t("wallet.assets.hydraPositions.header.name"),
        cell: ({ row }) => (
          <AssetTableName {...row.original} id={row.original.assetId} />
        ),
      }),
      accessor("providedAmount", {
        id: "providedAmount",
        header: t("wallet.assets.hydraPositions.header.providedAmount"),
        sortingFn: (a, b) => (a.original.value.gt(b.original.value) ? 1 : -1),
        cell: ({ row }) =>
          isXYKPosition(row.original) ? (
            <Text>-</Text>
          ) : (
            <WalletAssetsHydraPositionsDetails
              assetId={row.original.assetId}
              amount={row.original.providedAmountShifted}
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
            {isXYKPosition(row.original) ? (
              <div sx={{ flex: "column", align: ["end", "start"] }}>
                <div sx={{ flex: "row", gap: 4 }}>
                  <Text fs={14} lh={14} fw={500} color="white">
                    {row.original.balances
                      ?.map((balance) =>
                        t("value.tokenWithSymbol", {
                          value: balance.balanceHuman,
                          symbol: balance.symbol,
                        }),
                      )
                      .join(" | ")}
                  </Text>
                </div>
                <Text
                  fs={13}
                  lh={20}
                  fw={500}
                  css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.6)` }}
                >
                  <DisplayValue value={row.original.valueDisplay} />
                </Text>
              </div>
            ) : (
              <WalletAssetsHydraPositionsDetails
                assetId={row.original.assetId}
                lrna={row.original.lrna}
                amount={row.original.value}
                amountDisplay={row.original.valueDisplay}
              />
            )}
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

export type HydraPositionsTableData = {
  id: string
  assetId: string
  symbol: string
  name: string
  lrna: BN
  value: BN
  valueDisplay: BN
  valueDisplayWithoutLrna: BN
  price: BN
  providedAmount: BN
  providedAmountDisplay: BN
  providedAmountShifted: BN
  shares: BN
}
