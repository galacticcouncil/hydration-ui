import {
  Amount,
  Drawer,
  DrawerBody,
  Flex,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  Text,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatCurrency as formatUsdValue } from "@galacticcouncil/utils"
import { Portal, Root, Trigger } from "@radix-ui/react-tooltip"
import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from "react"

import { TreasuryAssetBalance, useTreasuryStats } from "@/api/treasury"
import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"

import {
  type CompositionBlockLayout,
  type CompositionGridBlockSpec,
  estimateCompositionGridRows,
  getCompositionGridBlockSpecs,
  getCompositionGridContext,
  getCompositionMobileGridBlockSpecs,
  getCompositionMobilePrimaryBlockSpecs,
  getCompositionPrimaryBlockSpecs,
  getOthersCompositionBlockLayout,
  getOthersCompositionMobileBlockLayout,
  getResolvedCompositionBlockLayout,
  getResolvedCompositionMobileBlockLayout,
} from "./compositionGridLayout"
import {
  SAssetCell,
  SAssetLabel,
  SComposition,
  SCompositionBlock,
  SCompositionBlockIdentity,
  SCompositionBlockLeft,
  SCompositionBlockLogo,
  SCompositionBlockMain,
  SCompositionBlockMeta,
  SCompositionBlockRight,
  SCompositionBlockShare,
  SCompositionBlockSymbol,
  SCompositionBlockValue,
  SCompositionGrid,
  SCompositionOthersLogos,
  SCompositionOthersTooltipContent,
  SCompositionTooltipShell,
  SCursorAssetTooltipContent,
  SInteractiveTableRow,
  SKpiGrid,
  SLoadedContent,
  SMuted,
  SPanelHeader,
  SPanelSectionHeader,
  STablesGrid,
  STooltipAsset,
  STooltipAssetIdentity,
  STooltipColumn,
  STooltipColumns,
  STooltipLegend,
  STooltipRow,
  STooltipTitle,
  STooltipValues,
  STreasuryGrid,
  STreasuryOverview,
} from "./StatsTreasury.styled"
import {
  type CompositionTileColors,
  useCompositionAssetColors,
} from "./useCompositionAssetColors"

const getCompositionLayoutOptions = (
  asset: TreasuryAssetBalance["asset"],
  valueUsd?: string | null,
) => ({
  symbol: asset.symbol,
  valueUsd,
})
const PAGE_SIZE = 8
const OTHERS_VALUE_THRESHOLD_USD = 600
const OTHERS_GROUP_ID = "others"
const FORCE_OTHERS_ASSET_SYMBOLS = new Set(["ibtc", "wsteth"])

const OTHERS_BLOCK_COLOR = "#5a6270"
const OTHERS_BLOCK_COLORS: CompositionTileColors = {
  base: OTHERS_BLOCK_COLOR,
  dark: "#4d5562",
  light: "#d0d3d8",
}
const COMPOSITION_COLOR_FALLBACK: CompositionTileColors = {
  base: "#4b5160",
  dark: "#3f4652",
  light: "#c9ccd2",
}

const DESKTOP_SKELETON_SPECS: CompositionGridBlockSpec[] = [
  { colSpan: 6, rowSpan: 2 },
  { colSpan: 3, rowSpan: 2 },
  { colSpan: 3, rowSpan: 2 },
  ...Array.from({ length: 18 }, () => ({ colSpan: 2, rowSpan: 1 })),
]

const MOBILE_SKELETON_SPECS: CompositionGridBlockSpec[] = [
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
  ...Array.from({ length: 10 }, () => ({ colSpan: 1, rowSpan: 1 })),
]

const shouldForceAssetIntoOthers = (asset: TreasuryAssetBalance["asset"]) =>
  FORCE_OTHERS_ASSET_SYMBOLS.has(asset.symbol.trim().toLowerCase())

const formatCompositionUsd = (value: string | number | null | undefined) =>
  formatUsdValue(value, "en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  })

const formatCurrency = (value: string | number | null | undefined) => {
  if (!value) return "-"

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return "-"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: numericValue >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: numericValue >= 1 ? 2 : 6,
  }).format(numericValue)
}

const sumAssetValuesUsd = (items: ReadonlyArray<TreasuryAssetBalance>) =>
  items.reduce((acc, item) => {
    const value = Number(item.valueUsd ?? 0)

    return Number.isFinite(value) ? acc + value : acc
  }, 0)

const formatTokenAmount = (value: string) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return "-"

  return new Intl.NumberFormat("en-US", {
    notation: numericValue >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: numericValue >= 1 ? 4 : 8,
  }).format(numericValue)
}

const getTreasuryBalanceAmountProps = (item: TreasuryAssetBalance) => ({
  value: formatTokenAmount(item.balance),
  displayValue:
    item.source === "moneyMarketBorrow"
      ? `-${formatCurrency(item.valueUsd)}`
      : formatCurrency(item.valueUsd),
})

const TreasuryBalanceAmount = ({
  item,
  align = "start",
}: {
  item: TreasuryAssetBalance
  align?: "start" | "end"
}) => (
  <Flex direction="column" align={align === "end" ? "flex-end" : "flex-start"}>
    <Amount {...getTreasuryBalanceAmountProps(item)} />
  </Flex>
)

const formatSharePercent = (share: number) => {
  if (!Number.isFinite(share) || share <= 0) return "0%"

  const format = (maximumFractionDigits: number, minimumFractionDigits = 0) =>
    `${new Intl.NumberFormat("en-US", {
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(share)}%`

  if (share >= 10) return format(1)
  if (share >= 1) return format(2)
  if (share >= 0.1) return format(2, 2)
  if (share >= 0.01) return format(3, 2)

  return format(4, 3)
}

const getTreasurySourceLabel = (item: TreasuryAssetBalance) => {
  switch (item.source) {
    case "moneyMarketBorrow":
      return "Borrowed"
    case "wallet":
    case "moneyMarketSupply":
    case "mixed":
    default:
      return undefined
  }
}

const AssetDetailsTooltipContent = ({
  item,
}: {
  item: TreasuryAssetBalance
}) => (
  <SCompositionTooltipShell>
    <STooltipLegend $compact>
      <STooltipAsset>
        <AssetLogo id={item.asset.id} size="extra-small" />
        <STooltipAssetIdentity>
          <Text fs="p6" fw={600} lh={1.1} color="text.high">
            {item.asset.symbol}
          </Text>
          <Text fs="p7" lh={1.1} color="text.medium">
            {item.asset.name}
          </Text>
        </STooltipAssetIdentity>
      </STooltipAsset>
      <STooltipRow $compact>
        <Text fs="p7" color="text.medium">
          Balance
        </Text>
        <STooltipValues $compact>
          <Text fs="p7" fw={600} color="text.high">
            {formatTokenAmount(item.balance)}
          </Text>
          <Text fs="p7" color="text.low">
            {item.source === "moneyMarketBorrow" ? "-" : ""}
            {formatCurrency(item.valueUsd)}
          </Text>
        </STooltipValues>
      </STooltipRow>
      <STooltipRow $compact>
        <Text fs="p7" color="text.medium">
          Composition
        </Text>
        <STooltipValues $compact>
          <Text fs="p7" fw={600} color="text.high">
            {formatSharePercent(item.share)}
          </Text>
        </STooltipValues>
      </STooltipRow>
    </STooltipLegend>
  </SCompositionTooltipShell>
)

const AssetDetailsTooltip = ({
  item,
  children,
}: {
  item: TreasuryAssetBalance
  children: ReactNode
}) => (
  <Tooltip asChild text={<AssetDetailsTooltipContent item={item} />}>
    {children}
  </Tooltip>
)

type CursorTooltipChildProps = {
  onMouseMove?: (event: MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void
}

const CursorAssetDetailsTooltip = ({
  item,
  children,
}: {
  item: TreasuryAssetBalance
  children: ReactElement<CursorTooltipChildProps>
}) => {
  const [position, setPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  if (!isValidElement(children)) return children

  return (
    <>
      {cloneElement(children, {
        onMouseMove: (event: MouseEvent<HTMLElement>) => {
          children.props.onMouseMove?.(event)

          const offset = 14
          const maxLeft = window.innerWidth - 340
          const maxTop = window.innerHeight - 180

          setPosition({
            x: Math.max(12, Math.min(event.clientX + offset, maxLeft)),
            y: Math.max(12, Math.min(event.clientY + offset, maxTop)),
          })
        },
        onMouseLeave: (event: MouseEvent<HTMLElement>) => {
          children.props.onMouseLeave?.(event)
          setPosition(null)
        },
      })}
      {position ? (
        <SCursorAssetTooltipContent
          style={{ left: position.x, top: position.y }}
        >
          <AssetDetailsTooltipContent item={item} />
        </SCursorAssetTooltipContent>
      ) : null}
    </>
  )
}

const CompositionBlockContent = ({
  logo,
  symbol,
  valueUsd,
  share,
  layout,
}: {
  logo: ReactNode
  symbol: string
  valueUsd: string | null | undefined
  share: number
  layout: CompositionBlockLayout
}) => (
  <SCompositionBlockMeta>
    <SCompositionBlockMain>
      <SCompositionBlockLeft>
        {logo}
        <SCompositionBlockIdentity>
          <SCompositionBlockSymbol size={layout.symbolSize}>
            {symbol}
          </SCompositionBlockSymbol>
        </SCompositionBlockIdentity>
      </SCompositionBlockLeft>
    </SCompositionBlockMain>
    <SCompositionBlockRight>
      <SCompositionBlockValue size={layout.shareSize}>
        {formatCompositionUsd(valueUsd)}
      </SCompositionBlockValue>
      <SCompositionBlockShare size={layout.shareSize}>
        {formatSharePercent(share)}
      </SCompositionBlockShare>
    </SCompositionBlockRight>
  </SCompositionBlockMeta>
)

type CompositionAssetBlock = TreasuryAssetBalance & {
  color: string
  colors: CompositionTileColors
}

type CompositionOthersBlock = {
  kind: "others"
  id: string
  share: number
  valueUsd: string
  colors: CompositionTileColors
  items: CompositionAssetBlock[]
}

type CompositionDisplayBlock =
  | ({ kind: "asset" } & CompositionAssetBlock)
  | CompositionOthersBlock

const OTHERS_TOOLTIP_MAX_COLUMNS = 3
const OTHERS_TOOLTIP_ITEMS_PER_COLUMN = 12
const OTHERS_TOOLTIP_MIN_DISPLAY_USD = 20

const getOthersTooltipColumns = (itemCount: number) =>
  Math.min(
    OTHERS_TOOLTIP_MAX_COLUMNS,
    Math.max(1, Math.ceil(itemCount / OTHERS_TOOLTIP_ITEMS_PER_COLUMN)),
  )

const CompositionTooltipRow = ({
  item,
}: {
  item: TreasuryAssetBalance & { color: string }
}) => (
  <STooltipRow $compact>
    <STooltipAsset>
      <AssetLogo id={item.asset.id} size="extra-small" />
      <Text
        fs="p7"
        fw={500}
        color="text.high"
        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {item.asset.symbol}
      </Text>
    </STooltipAsset>
    <STooltipValues $compact>
      <Text
        fs="p7"
        fw={600}
        color="text.high"
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatCompositionUsd(item.valueUsd)}
      </Text>
      <Text
        fs="p7"
        fw={500}
        color={getToken("text.medium")}
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatSharePercent(item.share)}
      </Text>
    </STooltipValues>
  </STooltipRow>
)

const splitTooltipItems = <T,>(items: T[], columns: number) => {
  const columnSize = Math.ceil(items.length / columns)

  return Array.from({ length: columns }, (_, index) =>
    items.slice(index * columnSize, (index + 1) * columnSize),
  ).filter((column) => column.length > 0)
}

const partitionOthersTooltipItems = (
  items: Array<TreasuryAssetBalance & { color: string }>,
) => {
  const sortedItems = [...items].sort(
    (a, b) => Number(b.valueUsd ?? 0) - Number(a.valueUsd ?? 0),
  )
  const visibleItems = sortedItems.filter(
    (item) => Number(item.valueUsd ?? 0) >= OTHERS_TOOLTIP_MIN_DISPLAY_USD,
  )
  const hiddenItems = sortedItems.filter(
    (item) => Number(item.valueUsd ?? 0) < OTHERS_TOOLTIP_MIN_DISPLAY_USD,
  )
  const hiddenTotalUsd = hiddenItems.reduce(
    (acc, item) => acc + Number(item.valueUsd ?? 0),
    0,
  )

  return {
    visibleItems,
    hiddenCount: hiddenItems.length,
    hiddenTotalUsd,
  }
}

const CompositionTooltipMoreRow = ({
  count,
  totalUsd,
}: {
  count: number
  totalUsd: number
}) => (
  <STooltipRow $compact>
    <STooltipAsset>
      <Text fs="p7" fw={500} color={getToken("text.medium")}>
        + {count} more {count === 1 ? "asset" : "assets"}
      </Text>
    </STooltipAsset>
    <STooltipValues $compact>
      <Text
        fs="p7"
        fw={600}
        color="text.high"
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatCompositionUsd(totalUsd)}
      </Text>
    </STooltipValues>
  </STooltipRow>
)

const CompositionTooltip = ({
  items,
}: {
  items: Array<TreasuryAssetBalance & { color: string }>
}) => {
  const { visibleItems, hiddenCount, hiddenTotalUsd } =
    partitionOthersTooltipItems(items)
  const hasListContent = visibleItems.length > 0 || hiddenCount > 0

  if (!hasListContent) {
    return (
      <SCompositionTooltipShell>
        <STooltipLegend $compact>
          <STooltipTitle>Other assets</STooltipTitle>
        </STooltipLegend>
      </SCompositionTooltipShell>
    )
  }

  const columns = getOthersTooltipColumns(Math.max(visibleItems.length, 1))
  const columnItems = visibleItems.length
    ? splitTooltipItems(visibleItems, columns)
    : [[]]
  const lastColumnIndex = columnItems.length - 1

  return (
    <SCompositionTooltipShell>
      <STooltipLegend $compact>
        <STooltipTitle>Other assets</STooltipTitle>
        <STooltipColumns $columns={columns} $compact>
          {columnItems.map((column, columnIndex) => (
            <STooltipColumn key={columnIndex} $compact>
              {column.map((item) => (
                <CompositionTooltipRow key={item.asset.id} item={item} />
              ))}
              {hiddenCount > 0 && columnIndex === lastColumnIndex ? (
                <CompositionTooltipMoreRow
                  count={hiddenCount}
                  totalUsd={hiddenTotalUsd}
                />
              ) : null}
            </STooltipColumn>
          ))}
        </STooltipColumns>
      </STooltipLegend>
    </SCompositionTooltipShell>
  )
}

const OthersCompositionBlock = ({
  block,
  layout,
}: {
  block: CompositionOthersBlock
  layout: CompositionBlockLayout
}) => {
  const { isMobile } = useBreakpoints()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const blockContent = (
    <CompositionBlockContent
      logo={
        <SCompositionOthersLogos>
          {block.items.slice(0, 4).map((item) => (
            <AssetLogo
              key={item.asset.id}
              id={item.asset.id}
              size="extra-small"
            />
          ))}
        </SCompositionOthersLogos>
      }
      symbol="Others"
      valueUsd={block.valueUsd}
      share={block.share}
      layout={layout}
    />
  )

  if (isMobile) {
    return (
      <>
        <SCompositionBlock
          data-composition-block=""
          color={block.colors.base}
          darkColor={block.colors.dark}
          lightColor={block.colors.light}
          tier={layout.tier}
          colSpan={layout.colSpan}
          rowSpan={layout.rowSpan}
          role="button"
          tabIndex={0}
          onClick={() => setDrawerOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setDrawerOpen(true)
            }
          }}
        >
          {blockContent}
        </SCompositionBlock>
        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          customTitle=" "
          title="Other assets"
        >
          <DrawerBody>
            <CompositionTooltip items={block.items} />
          </DrawerBody>
        </Drawer>
      </>
    )
  }

  return (
    <Root delayDuration={0}>
      <Trigger asChild>
        <SCompositionBlock
          data-composition-block=""
          color={block.colors.base}
          darkColor={block.colors.dark}
          lightColor={block.colors.light}
          tier={layout.tier}
          colSpan={layout.colSpan}
          rowSpan={layout.rowSpan}
        >
          {blockContent}
        </SCompositionBlock>
      </Trigger>
      <Portal>
        <SCompositionOthersTooltipContent
          side="bottom"
          align="center"
          sideOffset={3}
          collisionPadding={12}
        >
          <CompositionTooltip items={block.items} />
        </SCompositionOthersTooltipContent>
      </Portal>
    </Root>
  )
}

const MOBILE_NAME_MAX_LENGTH = 5
const TABLET_NAME_MAX_LENGTH = 10

const truncateDisplayName = (name: string, maxLength: number) => {
  if (!Number.isFinite(maxLength) || name.length <= maxLength) return name

  return `${name.slice(0, maxLength)}…`
}

const getNameMaxLength = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return MOBILE_NAME_MAX_LENGTH
  if (isTablet) return TABLET_NAME_MAX_LENGTH

  return Number.POSITIVE_INFINITY
}

const AssetName = ({
  item,
  maxLength,
}: {
  item: TreasuryAssetBalance
  maxLength: number
}) => {
  const { symbol } = item.asset
  const displayName = truncateDisplayName(symbol, maxLength)
  const isTruncated = displayName !== symbol

  const label = (
    <Text fs="p5" fw={500}>
      {displayName}
    </Text>
  )

  if (!isTruncated) return label

  return <AssetDetailsTooltip item={item}>{label}</AssetDetailsTooltip>
}

const FluidAssetName = ({ item }: { item: TreasuryAssetBalance }) => {
  const label = (
    <Text
      fs="p5"
      fw={500}
      sx={{
        minWidth: 0,
        flex: "1 1 auto",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {item.asset.symbol}
    </Text>
  )

  return <AssetDetailsTooltip item={item}>{label}</AssetDetailsTooltip>
}

const AssetRow = ({
  item,
  typeLabel,
  showComposition,
  isCompact,
  nameMaxLength,
  useFluidName,
  balanceAlign = "start",
}: {
  item: TreasuryAssetBalance
  typeLabel?: string
  showComposition?: boolean
  isCompact?: boolean
  nameMaxLength?: number
  useFluidName?: boolean
  balanceAlign?: "start" | "end"
}) => {
  if (isCompact) {
    return (
      <SInteractiveTableRow>
        <TableCell
          sx={
            useFluidName
              ? {
                  maxWidth: 0,
                  width: "100%",
                }
              : undefined
          }
        >
          <SAssetCell $reserveGap={useFluidName}>
            <AssetLogo id={item.asset.id} size="small" />
            {useFluidName ? (
              <FluidAssetName item={item} />
            ) : (
              <AssetName
                item={item}
                maxLength={nameMaxLength ?? Number.POSITIVE_INFINITY}
              />
            )}
          </SAssetCell>
        </TableCell>
        <TableCell sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
          <TreasuryBalanceAmount item={item} align="end" />
        </TableCell>
      </SInteractiveTableRow>
    )
  }

  return (
    <SInteractiveTableRow>
      <TableCell>
        <SAssetCell>
          <AssetLogo id={item.asset.id} size="small" />
          <SAssetLabel>
            <Text fs="p5" fw={500}>
              {item.asset.symbol}
            </Text>
            {typeLabel && (
              <Text fs="p6" color="text.medium">
                {typeLabel}
              </Text>
            )}
          </SAssetLabel>
        </SAssetCell>
      </TableCell>
      <TableCell
        sx={balanceAlign === "end" ? { textAlign: "right" } : undefined}
      >
        <TreasuryBalanceAmount item={item} align={balanceAlign} />
      </TableCell>
      {showComposition && (
        <TableCell sx={{ textAlign: "right" }}>
          {formatSharePercent(item.share)}
        </TableCell>
      )}
    </SInteractiveTableRow>
  )
}

const SkeletonRows = ({ colSpan = 3 }: { colSpan?: number }) => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <SInteractiveTableRow key={index}>
        <TableCell colSpan={colSpan}>
          <Skeleton height={24} />
        </TableCell>
      </SInteractiveTableRow>
    ))}
  </>
)

const EmptyRow = ({
  children,
  colSpan = 3,
}: {
  children: string
  colSpan?: number
}) => (
  <SInteractiveTableRow>
    <TableCell colSpan={colSpan}>
      <SMuted>{children}</SMuted>
    </TableCell>
  </SInteractiveTableRow>
)

export const StatsTreasury = () => {
  const {
    all,
    xykShareTokens,
    isShareToken,
    isStableSwap,
    getAssetWithFallback,
    getShareToken,
  } = useAssets()
  const { isMobile, isTablet } = useBreakpoints()
  const useCompositionMobileLayout = isMobile || isTablet
  const isCompactTable = useCompositionMobileLayout
  const nameMaxLength = getNameMaxLength(isMobile, isTablet)
  const [assetPage, setAssetPage] = useState(1)
  const compositionGridContext = getCompositionGridContext(
    useCompositionMobileLayout,
  )
  const compositionMaxRows = compositionGridContext.maxRows

  const assets = useMemo(() => {
    const assetMap = new Map(
      [...Array.from(all.values()), ...xykShareTokens].map((asset) => [
        asset.id,
        asset,
      ]),
    )

    return Array.from(assetMap.values())
  }, [all, xykShareTokens])

  const { data, isLoading, isError } = useTreasuryStats(assets)

  const compositionAssetIds = useMemo(
    () =>
      data?.assets
        .filter((asset) => asset.valueUsd && asset.share > 0)
        .map((item) => item.asset.id) ?? [],
    [data?.assets],
  )

  const {
    colors: compositionAssetColors,
    isLoading: isCompositionColorsLoading,
  } = useCompositionAssetColors(
    compositionAssetIds,
    getAssetWithFallback,
    getShareToken,
    xykShareTokens,
  )
  const isCompositionLoading = isLoading || isCompositionColorsLoading

  const allAssets = data?.assets ?? []
  const { compositionBlocks } = useMemo(() => {
    const pricedAssets =
      data?.assets
        .filter((asset) => asset.valueUsd && asset.share > 0)
        .map((item) => ({
          ...item,
          colors:
            compositionAssetColors.get(item.asset.id) ??
            COMPOSITION_COLOR_FALLBACK,
          color:
            compositionAssetColors.get(item.asset.id)?.base ??
            COMPOSITION_COLOR_FALLBACK.base,
        })) ?? []

    const primaryAssets = pricedAssets.filter(
      (item) =>
        Number(item.valueUsd) >= OTHERS_VALUE_THRESHOLD_USD &&
        !shouldForceAssetIntoOthers(item.asset),
    )
    let othersAssets = pricedAssets.filter(
      (item) =>
        Number(item.valueUsd) < OTHERS_VALUE_THRESHOLD_USD ||
        shouldForceAssetIntoOthers(item.asset),
    )

    while (primaryAssets.length > 0) {
      const othersShare = othersAssets.reduce(
        (acc, item) => acc + item.share,
        0,
      )
      const layoutAssets = primaryAssets.map((item) => ({
        share: item.share,
        ...getCompositionLayoutOptions(item.asset, item.valueUsd),
      }))
      const gridSpecs = useCompositionMobileLayout
        ? getCompositionMobileGridBlockSpecs(
            layoutAssets,
            othersAssets.length ? othersShare : undefined,
          )
        : getCompositionGridBlockSpecs(
            layoutAssets,
            othersAssets.length ? othersShare : undefined,
          )

      if (
        estimateCompositionGridRows(gridSpecs, compositionGridContext) <=
        compositionMaxRows
      ) {
        break
      }

      if (primaryAssets.length === 1) {
        break
      }

      const overflowAsset = primaryAssets.pop()

      if (overflowAsset) {
        othersAssets = [...othersAssets, overflowAsset]
      }
    }

    const blocks: CompositionDisplayBlock[] = primaryAssets.map((item) => ({
      kind: "asset",
      ...item,
    }))

    if (othersAssets.length) {
      blocks.push({
        kind: "others",
        id: OTHERS_GROUP_ID,
        share: othersAssets.reduce((acc, item) => acc + item.share, 0),
        valueUsd: othersAssets
          .reduce((acc, item) => acc + Number(item.valueUsd ?? 0), 0)
          .toString(),
        colors: OTHERS_BLOCK_COLORS,
        items: othersAssets,
      })
    }

    return {
      compositionBlocks: blocks,
    }
  }, [
    compositionAssetColors,
    compositionGridContext,
    compositionMaxRows,
    data?.assets,
    useCompositionMobileLayout,
  ])

  const compositionLayoutAssets = useMemo(
    () =>
      compositionBlocks
        .filter((block) => block.kind === "asset")
        .map((block) => ({
          id: block.asset.id,
          share: block.share,
          ...getCompositionLayoutOptions(block.asset, block.valueUsd),
        })),
    [compositionBlocks],
  )

  const compositionOthersShare = useMemo(() => {
    const othersBlock = compositionBlocks.find(
      (block) => block.kind === "others",
    )

    return othersBlock?.share
  }, [compositionBlocks])

  const compositionPrimarySpecs = useMemo(
    () =>
      useCompositionMobileLayout
        ? getCompositionMobilePrimaryBlockSpecs(
            compositionLayoutAssets,
            compositionOthersShare,
          )
        : getCompositionPrimaryBlockSpecs(
            compositionLayoutAssets,
            compositionOthersShare,
          ),
    [
      compositionLayoutAssets,
      compositionOthersShare,
      useCompositionMobileLayout,
    ],
  )

  const compositionSkeletonSpecs = useMemo(() => {
    const specs =
      compositionLayoutAssets.length || compositionOthersShare
        ? useCompositionMobileLayout
          ? getCompositionMobileGridBlockSpecs(
              compositionLayoutAssets,
              compositionOthersShare,
            )
          : getCompositionGridBlockSpecs(
              compositionLayoutAssets,
              compositionOthersShare,
            )
        : []

    if (specs.length) return specs

    return useCompositionMobileLayout
      ? MOBILE_SKELETON_SPECS
      : DESKTOP_SKELETON_SPECS
  }, [
    compositionLayoutAssets,
    compositionOthersShare,
    useCompositionMobileLayout,
  ])

  const liquidityPositions = allAssets.filter(
    (item) => isShareToken(item.asset) || isStableSwap(item.asset),
  )
  const positionAssets = [
    ...liquidityPositions,
    ...(data?.borrowPositions ?? []),
  ]
  const treasuryValueBreakdown = useMemo(() => {
    const assets = data?.assets ?? []
    const liquidityValueUsd = sumAssetValuesUsd(
      assets.filter(
        (item) => isShareToken(item.asset) || isStableSwap(item.asset),
      ),
    )
    const supplyValueUsd = sumAssetValuesUsd(
      assets.filter(
        (item) =>
          item.source === "moneyMarketSupply" || item.source === "mixed",
      ),
    )
    const borrowValueUsd = sumAssetValuesUsd(data?.borrowPositions ?? [])

    return {
      liquidityValueUsd,
      borrowSupplyValueUsd: supplyValueUsd - borrowValueUsd,
    }
  }, [data?.assets, data?.borrowPositions, isShareToken, isStableSwap])
  const totalAssetPages = Math.max(1, Math.ceil(allAssets.length / PAGE_SIZE))
  const paginatedAssets = allAssets.slice(
    (assetPage - 1) * PAGE_SIZE,
    assetPage * PAGE_SIZE,
  )

  return (
    <STreasuryGrid>
      <Paper
        p="xl"
        sx={{
          "@media (width < 640px)": {
            p: "l",
          },
        }}
      >
        <STreasuryOverview>
          <SLoadedContent key={isLoading ? "stats-loading" : "stats-loaded"}>
            <SKpiGrid>
              <ValueStats
                wrap
                size="medium"
                label="Treasury value"
                value={formatCurrency(data?.totalValueUsd)}
                isLoading={isLoading}
              />
              <ValueStats
                wrap
                size="medium"
                label="Liquidity positions"
                value={formatCurrency(treasuryValueBreakdown.liquidityValueUsd)}
                isLoading={isLoading}
              />
              <ValueStats
                wrap
                size="medium"
                label="Borrow/supply"
                value={formatCurrency(
                  treasuryValueBreakdown.borrowSupplyValueUsd,
                )}
                isLoading={isLoading}
              />
              <ValueStats
                wrap
                size="medium"
                label="Priced assets"
                value={data?.pricedAssetCount.toString() ?? "-"}
                isLoading={isLoading}
              />
            </SKpiGrid>
          </SLoadedContent>

          <SComposition>
            <SCompositionGrid data-composition-grid="">
              {isCompositionLoading ? (
                compositionSkeletonSpecs.map((spec, index) => (
                  <Skeleton
                    key={index}
                    height="100%"
                    sx={{
                      gridColumn: `span ${spec.colSpan}`,
                      gridRow: `span ${spec.rowSpan}`,
                    }}
                  />
                ))
              ) : compositionBlocks.length ? (
                compositionBlocks.map((block) => {
                  if (block.kind === "others") {
                    const layout = useCompositionMobileLayout
                      ? getOthersCompositionMobileBlockLayout(
                          block.share,
                          compositionPrimarySpecs,
                        )
                      : getOthersCompositionBlockLayout(
                          block.share,
                          compositionPrimarySpecs,
                        )

                    return (
                      <OthersCompositionBlock
                        key={block.id}
                        block={block}
                        layout={layout}
                      />
                    )
                  }

                  const assetIndex = compositionLayoutAssets.findIndex(
                    (asset) => asset.id === block.asset.id,
                  )
                  const layout = useCompositionMobileLayout
                    ? getResolvedCompositionMobileBlockLayout(
                        block.share,
                        getCompositionLayoutOptions(
                          block.asset,
                          block.valueUsd,
                        ),
                        compositionLayoutAssets,
                        assetIndex,
                        compositionOthersShare,
                      )
                    : getResolvedCompositionBlockLayout(
                        block.share,
                        getCompositionLayoutOptions(
                          block.asset,
                          block.valueUsd,
                        ),
                        compositionLayoutAssets,
                        assetIndex,
                        compositionOthersShare,
                      )

                  return (
                    <CursorAssetDetailsTooltip
                      key={block.asset.id}
                      item={block}
                    >
                      <SCompositionBlock
                        data-composition-block=""
                        color={block.color}
                        darkColor={block.colors.dark}
                        lightColor={block.colors.light}
                        tier={layout.tier}
                        colSpan={layout.colSpan}
                        rowSpan={layout.rowSpan}
                      >
                        <CompositionBlockContent
                          logo={
                            <SCompositionBlockLogo
                              $isMultiple={isStableSwap(block.asset)}
                            >
                              <AssetLogo
                                id={block.asset.id}
                                size="extra-small"
                              />
                            </SCompositionBlockLogo>
                          }
                          symbol={block.asset.symbol}
                          valueUsd={block.valueUsd}
                          share={block.share}
                          layout={layout}
                        />
                      </SCompositionBlock>
                    </CursorAssetDetailsTooltip>
                  )
                })
              ) : (
                <SMuted>No priced balances found</SMuted>
              )}
            </SCompositionGrid>
          </SComposition>
        </STreasuryOverview>
      </Paper>

      {isError && (
        <Text color="warning">
          Treasury balances could not be loaded from the active RPC provider.
        </Text>
      )}

      <STablesGrid>
        <TableContainer as={Paper}>
          <SPanelHeader>
            <SPanelSectionHeader title="All treasury assets" noTopPadding />
            <Text fs="p6" color="text.medium">
              {allAssets.length} assets
            </Text>
          </SPanelHeader>
          <Table size="small">
            <TableHeader>
              <tr>
                <TableHead>Asset</TableHead>
                {isCompactTable ? (
                  <TableHead sx={{ textAlign: "right" }}>Balance</TableHead>
                ) : (
                  <>
                    <TableHead>Balance</TableHead>
                    <TableHead sx={{ textAlign: "right" }}>
                      Composition
                    </TableHead>
                  </>
                )}
              </tr>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows colSpan={isCompactTable ? 2 : 3} />
              ) : paginatedAssets.length ? (
                paginatedAssets.map((item) => (
                  <AssetRow
                    key={item.asset.id}
                    item={item}
                    showComposition
                    isCompact={isCompactTable}
                    nameMaxLength={nameMaxLength}
                  />
                ))
              ) : (
                <EmptyRow colSpan={isCompactTable ? 2 : 3}>
                  No treasury assets found.
                </EmptyRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            totalPages={totalAssetPages}
            currentPage={assetPage}
            onPageChange={setAssetPage}
          />
        </TableContainer>

        <TableContainer as={Paper}>
          <SPanelHeader>
            <SPanelSectionHeader title="Treasury positions" noTopPadding />
            <Text fs="p6" color="text.medium">
              {positionAssets.length} positions
            </Text>
          </SPanelHeader>
          <Table size="small">
            <TableHeader>
              <tr>
                <TableHead>Position</TableHead>
                {isCompactTable ? (
                  <TableHead sx={{ textAlign: "right" }}>Balance</TableHead>
                ) : (
                  <TableHead sx={{ textAlign: "right" }}>Balance</TableHead>
                )}
              </tr>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows colSpan={2} />
              ) : positionAssets.length ? (
                positionAssets.map((item) => (
                  <AssetRow
                    key={`${item.source}-${item.asset.id}`}
                    item={item}
                    typeLabel={
                      getTreasurySourceLabel(item) ??
                      (isShareToken(item.asset) ? "XYK share" : "Stablepool")
                    }
                    isCompact={isCompactTable}
                    useFluidName
                    balanceAlign="end"
                  />
                ))
              ) : (
                <EmptyRow colSpan={2}>
                  No liquidity positions found for this treasury.
                </EmptyRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </STablesGrid>
    </STreasuryGrid>
  )
}
