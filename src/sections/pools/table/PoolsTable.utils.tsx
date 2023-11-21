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
import { useRpcProvider } from "providers/rpcProvider"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { TPool } from "sections/pools/PoolsPage.utils"
import { useFarms } from "api/farms"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { Button, ButtonTransparent } from "components/Button/Button"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { BN_1 } from "utils/constants"
import { useVolume } from "api/volume"

const AssetTableName = ({ id }: { id: string }) => {
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(id)

  const farms = useFarms([id])

  const iconIds = assets.isStableSwap(asset) ? asset.assets : asset.id

  return (
    <div>
      <div sx={{ flex: "row", gap: 8, align: "center" }}>
        {typeof iconIds === "string" ? (
          <Icon
            size={26}
            icon={<AssetLogo id={iconIds} />}
            css={{ flex: "1 0 auto" }}
          />
        ) : (
          <MultipleIcons
            size={26}
            icons={iconIds.map((asset) => ({
              icon: <AssetLogo id={asset} />,
            }))}
          />
        )}

        <div sx={{ flex: "column", width: "100%", gap: [0, 4] }}>
          <Text fs={14} lh={16} fw={700} color="white">
            {asset.symbol}
          </Text>
          {farms.data?.length ? (
            <GlobalFarmRowMulti farms={farms.data} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

const Volume = ({ assetId }: { assetId: string }) => {
  const volume = useVolume(assetId)

  if (!volume.data) return <div />

  return (
    <div
      sx={{
        flex: "row",
        gap: 4,
        align: "center",
        justify: ["end", "start"],
        minWidth: [110, "auto"],
      }}
    >
      <Text color="white" fs={14}>
        <DisplayValue value={volume.data.volume} />
      </Text>

      <ButtonTransparent sx={{ display: ["inherit", "none"] }}>
        <Icon sx={{ color: "darkBlue300" }} icon={<ChevronRightIcon />} />
      </ButtonTransparent>
    </div>
  )
}

export const useOmnipoolPoolTable = (
  data: TPool[],
  addLiquidity: (pool: TPool) => void,
) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<TPool>()
  const [sorting, setSorting] = useState<SortingState>([])

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
      accessor("name", {
        id: "name",
        header: t("liquidity.table.header.poolAsset"),
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
        cell: ({ row }) => <AssetTableName id={row.original.assetId} />,
      }),
      accessor("spotPrice", {
        id: "spotPrice",
        header: t("liquidity.table.header.price"),
        sortingFn: (a, b) =>
          (a.original.spotPrice ?? BN_1).gt(b.original.spotPrice ?? 1) ? 1 : -1,
        cell: ({ row }) => (
          <Text color="white" fs={14}>
            <DisplayValue value={row.original.spotPrice} type="token" />
          </Text>
        ),
      }),
      accessor("tvlDisplay", {
        id: "tvlDisplay",
        header: t("liquidity.table.header.tvl"),
        sortingFn: (a, b) =>
          a.original.tvlDisplay.gt(b.original.tvlDisplay) ? 1 : -1,
        cell: ({ row }) => (
          <Text color="white" fs={14}>
            <DisplayValue value={row.original.tvlDisplay} />
          </Text>
        ),
      }),
      accessor("assetId", {
        id: "volumeDisplay",
        header: t("liquidity.table.header.volume"),
        cell: ({ row }) => <Volume assetId={row.original.assetId} />,
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
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
              disabled={!row.original.canAddLiquidity}
              css={{
                height: 26,
                padding: "6px 8px",
                "& > span": {
                  fontSize: 12,
                  gap: 2,
                  alignItems: "center",
                },
              }}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                addLiquidity(row.original)
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
