import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button, ButtonTransparent } from "components/Button/Button"
import { TableSkeleton } from "components/Table/TableSkeleton"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { theme } from "theme"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"

export const PoolsTableSkeleton = ({ isXyk = false }: { isXyk?: boolean }) => {
  const table = usePoolsTableSkeleton(isXyk)

  return <TableSkeleton table={table} css={assetsTableStyles} />
}

const usePoolsTableSkeleton = (isXYKPool: boolean, enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    spotPrice: isDesktop,
    tvlDisplay: isDesktop,
    volumeDisplay: true,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "name",
        header: t("liquidity.table.header.poolAsset"),
        size: 300,
        cell: () => (
          <div sx={{ flex: "row", gap: 8, height: [24, 32] }}>
            <div sx={{ width: [24, 32] }}>
              <Skeleton
                width="100%"
                height="100%"
                enableAnimation={enableAnimation}
              />
            </div>
            <Skeleton
              width={100}
              height="100%"
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      isXYKPool
        ? display({
            id: "fee",
            header: t("fee"),
            cell: () => (
              <Skeleton
                width={100}
                height={32}
                enableAnimation={enableAnimation}
              />
            ),
          })
        : display({
            id: "spotPrice",
            header: t("liquidity.table.header.price"),
            cell: () => (
              <Skeleton
                width={100}
                height={32}
                enableAnimation={enableAnimation}
              />
            ),
          }),
      display({
        id: "tvlDisplay",
        header: t("liquidity.table.header.tvl"),
        size: 250,
        cell: () => (
          <div
            sx={{ width: [90, 100], height: [24, 32], ml: ["auto", "initial"] }}
          >
            <Skeleton
              width="100%"
              height="100%"
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "volumeDisplay",
        header: t("liquidity.table.header.volume"),
        cell: () => (
          <Skeleton width={100} height={32} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        id: "actions",
        cell: () => (
          <div
            sx={{
              flex: "row",
              gap: 4,
              align: "center",
              justify: ["end", "start"],
            }}
          >
            <Button
              size="small"
              disabled
              css={{
                height: 26,
                padding: "6px 8px",
                "& > span": {
                  fontSize: 12,
                  gap: 2,
                  alignItems: "center",
                },
              }}
            >
              <Icon icon={<PlusIcon />} size={12} />
              {t("add")}
            </Button>
            <ButtonTransparent>
              <Icon sx={{ color: "darkBlue300" }} icon={<ChevronRightIcon />} />
            </ButtonTransparent>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableAnimation],
  )

  return useReactTable({
    data: mockData,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
  })
}

const mockData = [1, 2, 3, 4]
