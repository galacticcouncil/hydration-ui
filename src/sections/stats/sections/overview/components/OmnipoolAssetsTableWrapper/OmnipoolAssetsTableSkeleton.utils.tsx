import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { ButtonTransparent } from "components/Button/Button"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import { useMemo } from "react"
import { AssetSkeleton } from "components/Skeleton/AssetSkeleton"
import { CellSkeleton } from "components/Skeleton/CellSkeleton"

export const useOmnipoolAssetsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    symbol: true,
    tvl: true,
    volume: isDesktop,
    apy: isDesktop,
    price: isDesktop,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "symbol",
        header: t("stats.overview.table.assets.header.asset"),
        cell: () => <AssetSkeleton enableAnimation={enableAnimation} />,
      }),
      display({
        id: "tvl",
        header: t("stats.overview.table.assets.header.tvl"),
        cell: () => <CellSkeleton enableAnimation={enableAnimation} />,
      }),
      display({
        id: "volume",
        header: t("stats.overview.table.assets.header.volume"),
        cell: () => <CellSkeleton enableAnimation={enableAnimation} />,
      }),
      // display({
      //   id: "apy",
      //   header: t("stats.overview.table.assets.header.apy"),
      //   cell: () => <CellSkeleton enableAnimation={enableAnimation} />,
      // }),
      display({
        id: "price",
        header: t("stats.overview.table.assets.header.price"),
        cell: () => <CellSkeleton enableAnimation={enableAnimation} />,
      }),
      display({
        id: "actions",
        cell: () => (
          <div>
            <ButtonTransparent sx={{ color: "darkBlue300" }}>
              <ChevronRightIcon />
            </ButtonTransparent>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDesktop, enableAnimation],
  )

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
  })
}

const mockData = [1, 2, 3, 4, 5]
