import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { ButtonTransparent } from "components/Button/Button"
import { createColumnHelper } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import { TUseOmnipoolAssetDetailsData } from "sections/stats/StatsPage.utils"
import { OmnipoolAssetsTableColumn } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTable.utils"
import { useMedia } from "react-use"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"

export const useOmnipoolAssetsColumns = (): OmnipoolAssetsTableColumn[] => {
  const { accessor, display } =
    createColumnHelper<TUseOmnipoolAssetDetailsData[number]>()
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return [
    accessor("symbol", {
      id: "symbol",
      header: t("stats.overview.table.assets.header.asset"),
      sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
      cell: ({ row }) => (
        <div
          sx={{
            flex: "row",
            gap: 8,
            align: "center",
            justify: "start",
          }}
        >
          {typeof row.original.iconIds === "string" ? (
            <Icon
              size={[26, 30]}
              icon={<AssetLogo id={row.original.iconIds} />}
            />
          ) : (
            <MultipleIcons
              size={[26, 30]}
              icons={row.original.iconIds.map((id) => ({
                icon: <AssetLogo id={id} />,
              }))}
            />
          )}
          <div sx={{ flex: "column" }}>
            <Text fs={[14, 16]} color="white">
              {row.original.symbol}
            </Text>
            <Text
              fs={12}
              css={{ color: `rgba(${theme.rgbColors.whiteish500}, 0.61)` }}
              sx={{ display: ["inherit", "none"] }}
            >
              {row.original.name}
            </Text>
          </div>
        </div>
      ),
    }),
    accessor("tvl", {
      id: "tvl",
      header: t("stats.overview.table.assets.header.tvl"),
      sortingFn: (a, b) => (a.original.tvl.gt(b.original.tvl) ? 1 : -1),
      cell: ({ row }) => (
        <Text tAlign={isDesktop ? "left" : "right"} color="white" fs={[13, 16]}>
          <DisplayValue value={row.original.tvl} isUSD />
        </Text>
      ),
    }),
    accessor("volume", {
      id: "volume",
      header: t("stats.overview.table.assets.header.volume"),
      sortingFn: (a, b) => (a.original.volume.gt(b.original.volume) ? 1 : -1),
      cell: ({ row }) => (
        <Text color="white">
          <DisplayValue value={row.original.volume} isUSD />
        </Text>
      ),
    }),
    accessor("pol", {
      id: "pol",
      header: t("stats.overview.table.assets.header.pol"),
      sortingFn: (a, b) => (a.original.pol.gt(b.original.pol) ? 1 : -1),
      cell: ({ row }) => (
        <Text color="white">
          <DisplayValue value={row.original.pol} isUSD />
        </Text>
      ),
    }),
    display({
      id: "actions",
      cell: () => (
        <div>
          <ButtonTransparent css={{ color: theme.colors.iconGray }}>
            <ChevronRightIcon />
          </ButtonTransparent>
        </div>
      ),
    }),
  ]
}
