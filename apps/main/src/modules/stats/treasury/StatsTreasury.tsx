import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Drawer,
  DrawerBody,
  Flex,
  Icon,
  Input,
  Label,
  Pagination,
  Paper,
  SectionHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatCurrency as formatUsdValue } from "@galacticcouncil/utils"
import { Portal, Root, Trigger } from "@radix-ui/react-tooltip"
import Big from "big.js"
import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  type TreasuryAssetBalance,
  type TreasuryAssetBreakdown,
  type TreasuryAssetBreakdownPart,
  useTreasuryStats,
} from "@/api/treasury"
import { AssetLabelFull } from "@/components/AssetLabelFull"
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
  SPanelSearch,
  STablesGrid,
  STooltipAsset,
  STooltipAssetIdentity,
  STooltipColumn,
  STooltipColumns,
  STooltipHeader,
  STooltipLegend,
  STooltipRow,
  STooltipSection,
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
const ASSET_PAGE_SIZE = 20
const COMPOSITION_PRIMARY_MIN_VALUE_USD = 15_000
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
const CURSOR_TOOLTIP_OFFSET = 14
const CURSOR_TOOLTIP_VIEWPORT_PADDING = 12

type GroupedTreasuryAssetBalance = TreasuryAssetBalance & {
  groupedAssets?: TreasuryAssetBalance[]
}

type TooltipBreakdownRow = {
  label: string
  part: TreasuryAssetBreakdownPart
  negative?: boolean
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

const isPositiveNumberString = (value: string | null | undefined) => {
  const numberValue = Number(value ?? 0)

  return Number.isFinite(numberValue) && numberValue > 0
}

const sumDecimalStrings = (...values: Array<string | null | undefined>) =>
  values.reduce((acc, value) => {
    if (!value) return acc

    try {
      return acc.plus(value)
    } catch {
      return acc
    }
  }, new Big(0))

const getCompositionGroupKey = (item: TreasuryAssetBalance) =>
  item.asset.symbol.trim().toLowerCase()

const mergeBreakdownPart = (
  first?: TreasuryAssetBreakdownPart,
  second?: TreasuryAssetBreakdownPart,
): TreasuryAssetBreakdownPart | undefined => {
  if (!first) return second
  if (!second) return first

  return {
    balance: sumDecimalStrings(first.balance, second.balance).toString(),
    valueUsd: sumDecimalStrings(first.valueUsd, second.valueUsd).toString(),
  }
}

const mergeBreakdowns = (
  first: TreasuryAssetBreakdown,
  second: TreasuryAssetBreakdown,
): TreasuryAssetBreakdown => ({
  wallet: mergeBreakdownPart(first.wallet, second.wallet),
  moneyMarketSupply: mergeBreakdownPart(
    first.moneyMarketSupply,
    second.moneyMarketSupply,
  ),
  liquidity: mergeBreakdownPart(first.liquidity, second.liquidity),
  moneyMarketBorrow: mergeBreakdownPart(
    first.moneyMarketBorrow,
    second.moneyMarketBorrow,
  ),
})

const mergeCompositionAsset = (
  current: GroupedTreasuryAssetBalance,
  next: TreasuryAssetBalance,
): GroupedTreasuryAssetBalance => {
  const currentValueUsd = Number(current.valueUsd ?? 0)
  const nextValueUsd = Number(next.valueUsd ?? 0)
  const representative = nextValueUsd > currentValueUsd ? next : current
  const balance = sumDecimalStrings(current.balance, next.balance).toString()
  const valueUsd = sumDecimalStrings(current.valueUsd, next.valueUsd).toString()
  const groupedAssets = [...(current.groupedAssets ?? [current]), next].sort(
    (a, b) => Number(b.valueUsd ?? 0) - Number(a.valueUsd ?? 0),
  )

  return {
    ...representative,
    groupedAssets,
    balance,
    balanceRaw: balance,
    valueUsd,
    price: null,
    share: current.share + next.share,
    source: current.source === next.source ? current.source : "mixed",
    breakdown: mergeBreakdowns(current.breakdown, next.breakdown),
  }
}

const groupCompositionAssets = (items: TreasuryAssetBalance[]) =>
  Array.from(
    items
      .filter((asset) => asset.valueUsd && asset.share > 0)
      .reduce((groups, item) => {
        const key = getCompositionGroupKey(item)
        const existing = groups.get(key)

        groups.set(key, existing ? mergeCompositionAsset(existing, item) : item)

        return groups
      }, new Map<string, GroupedTreasuryAssetBalance>())
      .values(),
  ).sort((a, b) => Number(b.valueUsd ?? 0) - Number(a.valueUsd ?? 0))

const formatTokenAmount = (value: string) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return "-"

  return new Intl.NumberFormat("en-US", {
    notation: numericValue >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: numericValue >= 1 ? 4 : 8,
  }).format(numericValue)
}

const formatTooltipTokenAmount = (value: string) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return "-"

  return new Intl.NumberFormat("en-US", {
    notation: numericValue >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: numericValue >= 1 ? 2 : 6,
  }).format(numericValue)
}

const formatTooltipCurrency = (value: string | number | null | undefined) => {
  if (!value) return "-"

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return "-"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: numericValue >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: numericValue >= 1 ? 2 : 6,
  }).format(numericValue)
}

const getTreasuryBalanceAmountProps = (item: TreasuryAssetBalance) => ({
  value: formatTokenAmount(item.balance),
  displayValue:
    item.source === "moneyMarketBorrow"
      ? `-${formatCurrency(item.valueUsd)}`
      : formatCurrency(item.valueUsd),
})

const getPartValueUsd = (part?: TreasuryAssetBreakdownPart) => {
  const value = Number(part?.valueUsd ?? 0)

  return Number.isFinite(value) ? value : 0
}

const hasBreakdownPartValue = (part?: TreasuryAssetBreakdownPart) =>
  !!part && (isPositiveNumberString(part.balance) || getPartValueUsd(part) > 0)

const isTooltipBreakdownRow = (row: {
  label: string
  part?: TreasuryAssetBreakdownPart
  negative?: boolean
}): row is TooltipBreakdownRow => hasBreakdownPartValue(row.part)

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

const SuppliedAmount = ({ item }: { item: TreasuryAssetBalance }) => {
  const supplied = item.breakdown.moneyMarketSupply

  if (!supplied || !hasBreakdownPartValue(supplied)) {
    return (
      <Text fs="p6" color="text.low">
        -
      </Text>
    )
  }

  return (
    <Flex direction="column" align="flex-start">
      <Amount
        value={formatTokenAmount(supplied.balance)}
        displayValue={formatCurrency(supplied.valueUsd)}
      />
    </Flex>
  )
}

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

const getPositionGroupLabel = (item: TreasuryAssetBalance) => {
  switch (item.source) {
    case "moneyMarketBorrow":
      return "Borrow"
    case "moneyMarketSupply":
      return "Supply"
    case "mixed":
      return "Wallet + supply"
    case "wallet":
    default:
      return "Wallet"
  }
}

const getAssetCompositionLabel = (item: TreasuryAssetBalance) =>
  item.source === "moneyMarketBorrow" ? "-" : formatSharePercent(item.share)

const getAssetOffchainBreakdown = (
  item: TreasuryAssetBalance,
  isLiquidityAsset?: boolean,
): TreasuryAssetBreakdownPart | undefined => {
  if (isLiquidityAsset) return undefined

  return item.breakdown.wallet
}

const getAssetLiquidityBreakdown = (
  item: TreasuryAssetBalance,
  isLiquidityAsset?: boolean,
): TreasuryAssetBreakdownPart | undefined => {
  if (item.breakdown.liquidity) return item.breakdown.liquidity
  if (!isLiquidityAsset) return undefined

  return item.breakdown.wallet
}

const getAssetBreakdownRows = (
  item: TreasuryAssetBalance,
  isLiquidityAsset?: boolean,
): TooltipBreakdownRow[] =>
  [
    {
      label: "Supplied as collateral",
      part: item.breakdown.moneyMarketSupply,
    },
    {
      label: "Supplied as liquidity",
      part: getAssetLiquidityBreakdown(item, isLiquidityAsset),
    },
    {
      label: "Offchain",
      part: getAssetOffchainBreakdown(item, isLiquidityAsset),
    },
  ].filter(isTooltipBreakdownRow)

const BreakdownValue = ({
  part,
  negative,
}: {
  part?: TreasuryAssetBreakdownPart
  negative?: boolean
}) => {
  if (!part || !hasBreakdownPartValue(part)) {
    return (
      <Text fs="p7" color="text.low">
        -
      </Text>
    )
  }

  return (
    <STooltipValues $compact>
      <Text fs="p7" fw={600} color="text.high">
        {formatTooltipTokenAmount(part.balance)}
      </Text>
      <Text fs="p7" color={getToken("text.medium")}>
        {negative ? "-" : ""}
        {formatTooltipCurrency(part.valueUsd)}
      </Text>
    </STooltipValues>
  )
}

const AssetDetailsTooltipContent = ({
  item,
  relatedPositions = [],
  isLiquidityAsset,
}: {
  item: GroupedTreasuryAssetBalance
  relatedPositions?: TreasuryAssetBalance[]
  isLiquidityAsset?: boolean
}) => {
  const groupedAssets = item.groupedAssets ?? []
  const isGroupedAsset = groupedAssets.length > 1
  const breakdownRows = getAssetBreakdownRows(item, isLiquidityAsset)
  const tooltipPositions = relatedPositions.filter(
    (position) =>
      getCompositionGroupKey(position) === getCompositionGroupKey(item) &&
      (position.source !== item.source ||
        position.balance !== item.balance ||
        position.valueUsd !== item.valueUsd),
  )

  return (
    <SCompositionTooltipShell>
      <STooltipLegend $compact>
        <STooltipHeader>
          <STooltipAsset>
            <AssetLogo
              id={item.asset.id}
              size="extra-small"
              hideChain={isGroupedAsset}
            />
            <STooltipAssetIdentity>
              <Text fs="p6" fw={600} lh={1.1} color="text.high">
                {item.asset.symbol}
              </Text>
              <Text fs="p7" lh={1.1} color="text.high">
                {item.asset.name}
              </Text>
            </STooltipAssetIdentity>
          </STooltipAsset>
          <Text fs="p7" fw={600} color="text.high">
            {getAssetCompositionLabel(item)}
          </Text>
        </STooltipHeader>
        <STooltipRow $compact $noDivider>
          <Text fs="p7" color="text.high">
            Balance
          </Text>
          <STooltipValues $compact>
            <Text fs="p7" fw={600} color="text.high">
              {formatTooltipTokenAmount(item.balance)}
            </Text>
            <Text fs="p7" color={getToken("text.medium")}>
              {item.source === "moneyMarketBorrow" ? "-" : ""}
              {formatTooltipCurrency(item.valueUsd)}
            </Text>
          </STooltipValues>
        </STooltipRow>
        {isGroupedAsset ? (
          <>
            <STooltipTitle>Consisting of</STooltipTitle>
            <STooltipSection>
              {groupedAssets.map((groupedAsset) => (
                <STooltipRow key={groupedAsset.asset.id} $compact>
                  <STooltipAsset>
                    <AssetLogo id={groupedAsset.asset.id} size="extra-small" />
                    <STooltipAssetIdentity>
                      <Text fs="p7" fw={600} lh={1.1} color="text.high">
                        {groupedAsset.asset.symbol}
                      </Text>
                      <Text fs="p7" lh={1.1} color="text.high">
                        {groupedAsset.asset.name}
                      </Text>
                    </STooltipAssetIdentity>
                  </STooltipAsset>
                  <STooltipValues $compact>
                    <Text fs="p7" fw={600} color="text.high">
                      {formatTooltipTokenAmount(groupedAsset.balance)}
                    </Text>
                    <Text fs="p7" color={getToken("text.medium")}>
                      {formatTooltipCurrency(groupedAsset.valueUsd)}
                    </Text>
                  </STooltipValues>
                </STooltipRow>
              ))}
            </STooltipSection>
          </>
        ) : null}
        <STooltipTitle>Breakdown</STooltipTitle>
        <STooltipSection>
          <STooltipRow $compact>
            <Text fs="p7" color="text.high">
              Total
            </Text>
            <BreakdownValue
              part={{
                balance: item.balance,
                valueUsd: item.valueUsd,
              }}
              negative={item.source === "moneyMarketBorrow"}
            />
          </STooltipRow>
          {breakdownRows.map(({ label, part }) => (
            <STooltipRow key={label} $compact>
              <Text fs="p7" color={getToken("text.medium")}>
                {label}
              </Text>
              <BreakdownValue part={part} />
            </STooltipRow>
          ))}
        </STooltipSection>
        {tooltipPositions.length ? (
          <>
            <STooltipTitle>Related positions</STooltipTitle>
            {tooltipPositions.map((position) => (
              <STooltipRow key={position.source} $compact>
                <Text fs="p7" color={getToken("text.medium")}>
                  {getPositionGroupLabel(position)}
                </Text>
                <STooltipValues $compact>
                  <Text fs="p7" fw={600} color="text.high">
                    {formatTooltipTokenAmount(position.balance)}
                  </Text>
                  <Text fs="p7" color={getToken("text.medium")}>
                    {position.source === "moneyMarketBorrow" ? "-" : ""}
                    {formatTooltipCurrency(position.valueUsd)}
                  </Text>
                </STooltipValues>
              </STooltipRow>
            ))}
          </>
        ) : null}
      </STooltipLegend>
    </SCompositionTooltipShell>
  )
}

type CursorTooltipChildProps = {
  onMouseMove?: (event: MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void
}

const CursorAssetDetailsTooltip = ({
  item,
  relatedPositions,
  isLiquidityAsset,
  children,
}: {
  item: GroupedTreasuryAssetBalance
  relatedPositions?: TreasuryAssetBalance[]
  isLiquidityAsset?: boolean
  children: ReactElement<CursorTooltipChildProps>
}) => {
  const [position, setPosition] = useState<{
    clientX: number
    clientY: number
    x: number
    y: number
  } | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const getTooltipPosition = useCallback((clientX: number, clientY: number) => {
    const tooltipRect = tooltipRef.current?.getBoundingClientRect()
    const tooltipWidth = tooltipRect?.width ?? 0
    const tooltipHeight = tooltipRect?.height ?? 0
    const minX = CURSOR_TOOLTIP_VIEWPORT_PADDING
    const minY = CURSOR_TOOLTIP_VIEWPORT_PADDING
    const maxX = Math.max(
      minX,
      window.innerWidth - CURSOR_TOOLTIP_VIEWPORT_PADDING - tooltipWidth,
    )
    const maxY = Math.max(
      minY,
      window.innerHeight - CURSOR_TOOLTIP_VIEWPORT_PADDING - tooltipHeight,
    )
    const preferredX = clientX + CURSOR_TOOLTIP_OFFSET
    const preferredY = clientY + CURSOR_TOOLTIP_OFFSET
    const flippedX = clientX - CURSOR_TOOLTIP_OFFSET - tooltipWidth
    const flippedY = clientY - CURSOR_TOOLTIP_OFFSET - tooltipHeight
    const centeredX = clientX - tooltipWidth / 2
    const centeredY = clientY - tooltipHeight / 2
    const hasRoomRight = preferredX <= maxX
    const hasRoomLeft = flippedX >= minX
    const hasRoomBelow = preferredY <= maxY
    const hasRoomAbove = flippedY >= minY
    const x = hasRoomRight ? preferredX : hasRoomLeft ? flippedX : centeredX
    const y = hasRoomBelow ? preferredY : hasRoomAbove ? flippedY : centeredY

    return {
      clientX,
      clientY,
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    }
  }, [])

  useLayoutEffect(() => {
    if (!position) return

    const nextPosition = getTooltipPosition(position.clientX, position.clientY)

    if (nextPosition.x === position.x && nextPosition.y === position.y) return

    setPosition(nextPosition)
  }, [getTooltipPosition, position])

  if (!isValidElement(children)) return children

  return (
    <>
      {cloneElement(children, {
        onMouseMove: (event: MouseEvent<HTMLElement>) => {
          children.props.onMouseMove?.(event)

          setPosition(getTooltipPosition(event.clientX, event.clientY))
        },
        onMouseLeave: (event: MouseEvent<HTMLElement>) => {
          children.props.onMouseLeave?.(event)
          setPosition(null)
        },
      })}
      {position ? (
        <SCursorAssetTooltipContent
          ref={tooltipRef}
          style={{ left: position.x, top: position.y }}
        >
          <AssetDetailsTooltipContent
            item={item}
            relatedPositions={relatedPositions}
            isLiquidityAsset={isLiquidityAsset}
          />
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

type CompositionAssetBlock = GroupedTreasuryAssetBalance & {
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
const OTHERS_TOOLTIP_MAX_COLUMNS_MOBILE = 2
const OTHERS_TOOLTIP_ITEMS_PER_COLUMN = 12
const OTHERS_TOOLTIP_MIN_DISPLAY_USD = 20

const getOthersTooltipColumns = (
  itemCount: number,
  maxColumns = OTHERS_TOOLTIP_MAX_COLUMNS,
) =>
  Math.min(
    maxColumns,
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
  maxColumns = OTHERS_TOOLTIP_MAX_COLUMNS,
}: {
  items: Array<TreasuryAssetBalance & { color: string }>
  maxColumns?: number
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

  const columns = getOthersTooltipColumns(
    Math.max(visibleItems.length, 1),
    maxColumns,
  )
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
            <CompositionTooltip
              items={block.items}
              maxColumns={OTHERS_TOOLTIP_MAX_COLUMNS_MOBILE}
            />
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

const AssetCompositionBlock = ({
  block,
  layout,
  relatedPositions,
  isLiquidityAsset,
  isMultipleLogo,
  useDrawer,
}: {
  block: CompositionAssetBlock
  layout: CompositionBlockLayout
  relatedPositions?: TreasuryAssetBalance[]
  isLiquidityAsset?: boolean
  isMultipleLogo?: boolean
  useDrawer: boolean
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const blockContent = (
    <CompositionBlockContent
      logo={
        <SCompositionBlockLogo $isMultiple={isMultipleLogo}>
          <AssetLogo
            id={block.asset.id}
            size="extra-small"
            hideChain={(block.groupedAssets?.length ?? 0) > 1}
          />
        </SCompositionBlockLogo>
      }
      symbol={block.asset.symbol}
      valueUsd={block.valueUsd}
      share={block.share}
      layout={layout}
    />
  )

  if (useDrawer) {
    return (
      <>
        <SCompositionBlock
          data-composition-block=""
          color={block.color}
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
          title={block.asset.symbol}
        >
          <DrawerBody>
            <AssetDetailsTooltipContent
              item={block}
              relatedPositions={relatedPositions}
              isLiquidityAsset={isLiquidityAsset}
            />
          </DrawerBody>
        </Drawer>
      </>
    )
  }

  return (
    <CursorAssetDetailsTooltip
      item={block}
      relatedPositions={relatedPositions}
      isLiquidityAsset={isLiquidityAsset}
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
        {blockContent}
      </SCompositionBlock>
    </CursorAssetDetailsTooltip>
  )
}

const AssetRow = ({
  item,
  showComposition,
  isCompact,
  balanceAlign = "start",
}: {
  item: GroupedTreasuryAssetBalance
  showComposition?: boolean
  isCompact?: boolean
  balanceAlign?: "start" | "end"
}) => {
  if (isCompact) {
    return (
      <SInteractiveTableRow>
        <TableCell>
          <AssetLabelFull asset={item.asset} />
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
        <AssetLabelFull asset={item.asset} />
      </TableCell>
      <TableCell
        sx={balanceAlign === "end" ? { textAlign: "right" } : undefined}
      >
        <TreasuryBalanceAmount item={item} align={balanceAlign} />
      </TableCell>
      {showComposition && (
        <TableCell sx={{ textAlign: "left" }}>
          <SuppliedAmount item={item} />
        </TableCell>
      )}
      {showComposition && (
        <TableCell sx={{ textAlign: "right" }}>
          {getAssetCompositionLabel(item)}
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
  const searchInputId = useId()
  const useCompositionMobileLayout = isMobile || isTablet
  const isCompactTable = useCompositionMobileLayout
  const [assetPage, setAssetPage] = useState(1)
  const [assetSearch, setAssetSearch] = useState("")
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

  const compositionAssets = useMemo(
    () => groupCompositionAssets(data?.assets ?? []),
    [data?.assets],
  )

  const compositionAssetIds = useMemo(
    () => compositionAssets.map((item) => item.asset.id),
    [compositionAssets],
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

  const { compositionBlocks } = useMemo(() => {
    const pricedAssets = compositionAssets.map((item) => ({
      ...item,
      colors:
        compositionAssetColors.get(item.asset.id) ?? COMPOSITION_COLOR_FALLBACK,
      color:
        compositionAssetColors.get(item.asset.id)?.base ??
        COMPOSITION_COLOR_FALLBACK.base,
    }))

    const primaryAssets = pricedAssets.filter(
      (item) =>
        Number(item.valueUsd) >= COMPOSITION_PRIMARY_MIN_VALUE_USD &&
        !shouldForceAssetIntoOthers(item.asset),
    )
    let othersAssets = pricedAssets.filter(
      (item) =>
        Number(item.valueUsd) < COMPOSITION_PRIMARY_MIN_VALUE_USD ||
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
    compositionAssets,
    compositionGridContext,
    compositionMaxRows,
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

  const relatedPositionsBySymbol = useMemo(() => {
    const positionsBySymbol = new Map<string, TreasuryAssetBalance[]>()

    for (const position of data?.borrowPositions ?? []) {
      const key = getCompositionGroupKey(position)
      const positions = positionsBySymbol.get(key) ?? []

      positions.push(position)
      positionsBySymbol.set(key, positions)
    }

    return positionsBySymbol
  }, [data?.borrowPositions])
  const allTreasuryAssets = useMemo(() => {
    const assets = data?.assets ?? []
    const holdingAssetIds = new Set(assets.map((item) => item.asset.id))
    const borrowOnlyAssets =
      data?.borrowPositions.filter(
        (position) => !holdingAssetIds.has(position.asset.id),
      ) ?? []

    return [...assets, ...borrowOnlyAssets].sort((a, b) => {
      const valueA = Number(a.valueUsd ?? 0)
      const valueB = Number(b.valueUsd ?? 0)

      return valueB - valueA
    })
  }, [data?.assets, data?.borrowPositions])
  const filteredTreasuryAssets = useMemo(() => {
    const search = assetSearch.trim().toLowerCase()

    if (!search) return allTreasuryAssets

    return allTreasuryAssets.filter(
      (item) =>
        item.asset.symbol.toLowerCase().includes(search) ||
        item.asset.name.toLowerCase().includes(search),
    )
  }, [allTreasuryAssets, assetSearch])
  const totalAssetPages = Math.max(
    1,
    Math.ceil(filteredTreasuryAssets.length / ASSET_PAGE_SIZE),
  )
  const paginatedAssets = filteredTreasuryAssets.slice(
    (assetPage - 1) * ASSET_PAGE_SIZE,
    assetPage * ASSET_PAGE_SIZE,
  )

  useEffect(() => {
    if (assetPage > totalAssetPages) {
      setAssetPage(totalAssetPages)
    }
  }, [assetPage, totalAssetPages])

  useEffect(() => {
    setAssetPage(1)
  }, [assetSearch])

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
                label="Assets held"
                value={data ? allTreasuryAssets.length.toString() : "-"}
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
                    <AssetCompositionBlock
                      key={block.asset.id}
                      block={block}
                      layout={layout}
                      relatedPositions={relatedPositionsBySymbol.get(
                        getCompositionGroupKey(block),
                      )}
                      isLiquidityAsset={
                        isShareToken(block.asset) || isStableSwap(block.asset)
                      }
                      isMultipleLogo={isStableSwap(block.asset)}
                      useDrawer={useCompositionMobileLayout}
                    />
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
        <SectionHeader
          title="All treasury assets"
          actions={
            <SPanelSearch>
              <Input
                id={searchInputId}
                value={assetSearch}
                placeholder="Search assets"
                leadingElement={
                  <Label asChild htmlFor={searchInputId}>
                    <Icon
                      as="label"
                      sx={{ cursor: "text" }}
                      size="m"
                      component={Search}
                      mr="base"
                    />
                  </Label>
                }
                onChange={(event) => setAssetSearch(event.target.value)}
              />
            </SPanelSearch>
          }
        />
        <TableContainer as={Paper}>
          <Table size="small">
            <TableHeader>
              <tr>
                <TableHead>Asset</TableHead>
                {isCompactTable ? (
                  <TableHead sx={{ textAlign: "right" }}>Balance</TableHead>
                ) : (
                  <>
                    <TableHead>Balance</TableHead>
                    <TableHead sx={{ textAlign: "left" }}>
                      Of which supplied
                    </TableHead>
                    <TableHead sx={{ textAlign: "right" }}>
                      Composition
                    </TableHead>
                  </>
                )}
              </tr>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows colSpan={isCompactTable ? 2 : 4} />
              ) : paginatedAssets.length ? (
                paginatedAssets.map((item) => (
                  <AssetRow
                    key={`${item.source}-${item.asset.id}`}
                    item={item}
                    showComposition
                    isCompact={isCompactTable}
                  />
                ))
              ) : (
                <EmptyRow colSpan={isCompactTable ? 2 : 4}>
                  {assetSearch
                    ? "No treasury assets match your search."
                    : "No treasury assets found."}
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
      </STablesGrid>
    </STreasuryGrid>
  )
}
