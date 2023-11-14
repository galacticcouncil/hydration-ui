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
import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"
import { useFarms } from "api/farms"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { Button, ButtonTransparent } from "components/Button/Button"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"

const AssetTableName = ({
  large,
  symbol,
  name,
  id,
}: {
  symbol: string
  name: string
  large?: boolean
  id: string
}) => {
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(id)

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
          <Text
            fs={[large ? 18 : 14, 16]}
            lh={[large ? 16 : 23, 16]}
            fw={700}
            color="white"
          >
            {symbol}
          </Text>
          <Text
            fs={[large ? 13 : 12, 13]}
            lh={[large ? 17 : 14, 13]}
            fw={500}
            css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.61)` }}
          >
            {name}
          </Text>
        </div>
      </div>
    </div>
  )
}

const Incentives = ({ poolId }: { poolId: string }) => {
  const farms = useFarms([poolId])

  if (!farms.data?.length) {
    return <div />
  }

  return <GlobalFarmRowMulti farms={farms.data} />
}

export const useOmnipoolPoolTable = (
  data: TOmnipoolAsset[],
  addLiquidity: (pool: TOmnipoolAsset) => void,
) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<TOmnipoolAsset>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    spotPrice: true,
    totalDisplay: isDesktop,
    volumeDisplay: true,
  }
  console.log(data)
  const columns = useMemo(
    () => [
      accessor("name", {
        id: "name",
        header: "Pool asset",
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
        cell: ({ row }) => (
          <AssetTableName {...row.original} id={row.original.id} />
        ),
      }),
      accessor("spotPrice", {
        id: "spotPrice",
        header: "Price",
        cell: ({ row }) => (
          <Text tAlign="center" color="white">
            <DisplayValue value={row.original.spotPrice} type="token" />
          </Text>
        ),
      }),
      accessor("totalDisplay", {
        id: "totalDisplay",
        header: t("totalValueLocked"),

        cell: ({ row }) => (
          <Text tAlign="center" color="white">
            <DisplayValue value={row.original.totalDisplay} />
          </Text>
        ),
      }),
      accessor("volumeDisplay", {
        id: "volumeDisplay",
        header: "24 volume",

        cell: ({ row }) => (
          <Text tAlign="center" color="white">
            <DisplayValue value={row.original.volumeDisplay} />
          </Text>
        ),
      }),
      accessor("id", {
        id: "id",
        header: "Incentives apr",

        cell: ({ row }) => <Incentives poolId={row.original.id} />,
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
              textAlign: "center",
            }}
          >
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                addLiquidity(row.original)
              }}
            >
              add
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
