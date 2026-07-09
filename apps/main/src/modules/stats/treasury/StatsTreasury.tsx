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
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  formatCurrency as formatUsdValue,
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
  GSOL_ASSET_ID,
  GSOL_ERC20_ID,
} from "@galacticcouncil/utils"
import { Portal, Root, Trigger } from "@radix-ui/react-tooltip"
import Big from "big.js"
import {
  cloneElement,
  Fragment,
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
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { useAssets } from "@/providers/assetsProvider"

import {
  COMPOSITION_MAX_ROWS_MOBILE,
  type CompositionBlockLayout,
  type CompositionGridBlockSpec,
  estimateCompositionGridRows,
  getCompositionGridBlockSpecs,
  getCompositionGridContext,
  getCompositionMobileGridBlockSpecs,
  getOthersCompositionBlockLayout,
  getOthersCompositionMobileBlockLayout,
  getResolvedCompositionBlockLayout,
  getResolvedCompositionMobileBlockLayout,
} from "./compositionGridLayout"
import {
  SCompactAssetIdentity,
  SCompactAssetLabel,
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
  SKpiTooltipTrigger,
  SLoadedContent,
  SMuted,
  SPanelSearch,
  STableHeadTooltipTrigger,
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
const FORCE_PRIMARY_COMPOSITION_SYMBOLS = new Set(["eurc", "gdot"])

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
const TREASURY_SINGLE_LOGO_ASSET_IDS = new Map<string, string>([
  [GDOT_ASSET_ID, GDOT_ERC20_ID],
  [GETH_ASSET_ID, GETH_ERC20_ID],
  [GSOL_ASSET_ID, GSOL_ERC20_ID],
])

type GroupedTreasuryAssetBalance = TreasuryAssetBalance & {
  groupedAssets?: TreasuryAssetBalance[]
}

type TooltipBreakdownRow = {
  label: string
  part: TreasuryAssetBreakdownPart
  negative?: boolean
}

const DESKTOP_INITIAL_SKELETON_SPECS: CompositionGridBlockSpec[] = [
  { colSpan: 6, rowSpan: 2 },
  { colSpan: 4, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 4, rowSpan: 2 },
  { colSpan: 3, rowSpan: 2 },
  { colSpan: 3, rowSpan: 2 },
  ...Array.from({ length: 8 }, () => ({ colSpan: 2, rowSpan: 1 })),
]

const MOBILE_INITIAL_SKELETON_SPECS: CompositionGridBlockSpec[] = [
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
  ...Array.from({ length: 10 }, () => ({ colSpan: 1, rowSpan: 1 })),
]

const COMPOSITION_GRID_SPECS_STORAGE_KEY =
  "hydration:stats:treasury:compositionGridSpecs"

const isCompositionGridBlockSpec = (
  value: unknown,
): value is CompositionGridBlockSpec =>
  typeof value === "object" &&
  value !== null &&
  "colSpan" in value &&
  "rowSpan" in value &&
  Number.isFinite(Number(value.colSpan)) &&
  Number.isFinite(Number(value.rowSpan))

const getCompositionGridSpecsStorageKey = (isMobileLayout: boolean) =>
  `${COMPOSITION_GRID_SPECS_STORAGE_KEY}:${isMobileLayout ? "mobile" : "desktop"}`

const readStoredCompositionGridSpecs = (isMobileLayout: boolean) => {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(
      getCompositionGridSpecsStorageKey(isMobileLayout),
    )
    const parsed = stored ? JSON.parse(stored) : null

    return Array.isArray(parsed) && parsed.every(isCompositionGridBlockSpec)
      ? parsed.map(({ colSpan, rowSpan }) => ({
          colSpan: Number(colSpan),
          rowSpan: Number(rowSpan),
        }))
      : []
  } catch {
    return []
  }
}

const writeStoredCompositionGridSpecs = (
  isMobileLayout: boolean,
  specs: CompositionGridBlockSpec[],
) => {
  if (typeof window === "undefined") return

  window.localStorage.setItem(
    getCompositionGridSpecsStorageKey(isMobileLayout),
    JSON.stringify(specs),
  )
}

const shouldForceAssetIntoOthers = (asset: TreasuryAssetBalance["asset"]) =>
  FORCE_OTHERS_ASSET_SYMBOLS.has(asset.symbol.trim().toLowerCase())

const shouldForceAssetIntoPrimaryComposition = (
  asset: TreasuryAssetBalance["asset"],
) => FORCE_PRIMARY_COMPOSITION_SYMBOLS.has(asset.symbol.trim().toLowerCase())

const getCompositionPlacementAsset = (item: GroupedTreasuryAssetBalance) => ({
  id: item.asset.id,
  share: item.share,
  ...getCompositionLayoutOptions(item.asset, item.valueUsd),
})

const getDemotableCompositionAssetIndex = (
  items: ReadonlyArray<GroupedTreasuryAssetBalance>,
) => {
  for (let index = items.length - 1; index >= 0; index--) {
    const item = items[index]

    if (item && !shouldForceAssetIntoPrimaryComposition(item.asset)) {
      return index
    }
  }

  return -1
}

const getTreasuryAssetLogoId = (asset: TreasuryAssetBalance["asset"]) =>
  TREASURY_SINGLE_LOGO_ASSET_IDS.get(asset.id) ?? asset.id

const hasTreasurySingleLogo = (asset: TreasuryAssetBalance["asset"]) =>
  TREASURY_SINGLE_LOGO_ASSET_IDS.has(asset.id)

const formatCompositionUsd = (value: string | number | null | undefined) =>
  formatUsdValue(value, "en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  })

const formatTreasuryValue = (value: string | number | null | undefined) => {
  if (!value) return "-"

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return "-"

  const formatCompact = (divisor: number, suffix: string) =>
    `$${(numericValue / divisor).toFixed(2)}${suffix}`

  if (Math.abs(numericValue) >= 1_000_000_000) {
    return formatCompact(1_000_000_000, "B")
  }

  if (Math.abs(numericValue) >= 1_000_000) {
    return formatCompact(1_000_000, "M")
  }

  if (Math.abs(numericValue) >= 1_000) {
    return formatCompact(1_000, "K")
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: numericValue >= 1 ? 2 : 6,
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
  offchain: mergeBreakdownPart(first.offchain, second.offchain),
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

const formatTableTokenAmount = (value: string) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return "-"

  return new Intl.NumberFormat("en-US", {
    notation: numericValue >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 2,
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

const formatTooltipTokenAmountWithSymbol = (
  value: string,
  symbol?: string,
  negative?: boolean,
) => {
  const amount = formatTooltipTokenAmount(value)

  if (amount === "-") return amount

  return `${negative ? "-" : ""}${amount}${symbol ? ` ${symbol}` : ""}`
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

const hasPricedValue = (item: TreasuryAssetBalance) => {
  const value = Number(item.valueUsd ?? 0)

  return Number.isFinite(value) && value > 0
}

const getTreasuryBalanceAmountProps = (item: TreasuryAssetBalance) => ({
  value: formatTableTokenAmount(item.balance),
  displayValue:
    item.source === "moneyMarketBorrow"
      ? `-${formatCompositionUsd(item.valueUsd)}`
      : formatCompositionUsd(item.valueUsd),
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

const getTooltipAssetName = (
  item: GroupedTreasuryAssetBalance,
  isGroupedAsset: boolean,
) => (isGroupedAsset ? "Aggregated balances" : item.asset.name)

const getAssetLiquidityBreakdown = (
  item: TreasuryAssetBalance,
  isLiquidityAsset?: boolean,
): TreasuryAssetBreakdownPart | undefined => {
  if (item.breakdown.liquidity) return item.breakdown.liquidity
  if (!isLiquidityAsset) return undefined

  return item.breakdown.wallet
}

const getAssetOffchainBreakdown = (item: TreasuryAssetBalance) =>
  item.breakdown.offchain

const hasAssetOffchainBreakdown = (item: TreasuryAssetBalance) =>
  hasBreakdownPartValue(getAssetOffchainBreakdown(item))

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
      label: "Debt offset",
      part: item.breakdown.moneyMarketBorrow,
      negative: true,
    },
    {
      label: "Supplied as liquidity",
      part: getAssetLiquidityBreakdown(item, isLiquidityAsset),
    },
    {
      label: "Offchain",
      part: getAssetOffchainBreakdown(item),
    },
  ].filter(isTooltipBreakdownRow)

const getAssetTotalBalanceLabel = (item: TreasuryAssetBalance) =>
  item.breakdown.moneyMarketBorrow ? "Net balance" : "Total balance"

const BreakdownValue = ({
  part,
  negative,
  symbol,
}: {
  part?: TreasuryAssetBreakdownPart
  negative?: boolean
  symbol?: string
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
        {formatTooltipTokenAmountWithSymbol(part.balance, symbol, negative)}
      </Text>
      <Text fs="p7" color={getToken("text.medium")}>
        {negative ? "-" : ""}
        {formatTooltipCurrency(part.valueUsd)}
      </Text>
    </STooltipValues>
  )
}

const BreakdownTableValue = ({
  part,
  negative,
}: {
  part?: TreasuryAssetBreakdownPart
  negative?: boolean
}) => {
  if (!part || !hasBreakdownPartValue(part)) {
    return (
      <Text fs="p6" color="text.low">
        -
      </Text>
    )
  }

  return (
    <Flex direction="column" align="flex-end">
      <Amount
        value={formatTableTokenAmount(part.balance)}
        displayValue={`${negative ? "-" : ""}${formatCompositionUsd(part.valueUsd)}`}
      />
    </Flex>
  )
}

const MobileAmountRow = ({
  label,
  value,
  displayValue,
}: {
  label: string
  value: string
  displayValue?: string
}) => (
  <Amount
    variant="horizontalLabel"
    label={label}
    value={value}
    displayValue={displayValue}
  />
)

const MobileBreakdownRow = ({
  label,
  part,
  negative,
  symbol,
}: {
  label: string
  part?: TreasuryAssetBreakdownPart
  negative?: boolean
  symbol?: string
}) => (
  <MobileAmountRow
    label={label}
    value={
      part
        ? formatTooltipTokenAmountWithSymbol(part.balance, symbol, negative)
        : "-"
    }
    displayValue={
      part
        ? `${negative ? "-" : ""}${formatTooltipCurrency(part.valueUsd)}`
        : "-"
    }
  />
)

const TooltipLabel = ({ children }: { children: ReactNode }) => (
  <Text fs="p7" fw={500} color="text.high">
    {children}
  </Text>
)

type TreasuryHoldingsBreakdown = {
  regular: string
  offchain: string
  liquidity: string
  supplied: string
  borrowed: string
  holdings: string
  net: string
}

const sumBreakdownUsd = (
  items: TreasuryAssetBalance[],
  getPart: (
    item: TreasuryAssetBalance,
  ) => TreasuryAssetBreakdownPart | undefined,
) =>
  items
    .reduce((acc, item) => acc.plus(getPartValueUsd(getPart(item))), Big(0))
    .toString()

const getTreasuryHoldingsBreakdown = (
  assets: TreasuryAssetBalance[] = [],
  borrowValueUsd = "0",
): TreasuryHoldingsBreakdown => {
  const regular = sumBreakdownUsd(assets, (item) => item.breakdown.wallet)
  const offchain = sumBreakdownUsd(assets, (item) => item.breakdown.offchain)
  const liquidity = sumBreakdownUsd(assets, (item) => item.breakdown.liquidity)
  const supplied = sumBreakdownUsd(
    assets,
    (item) => item.breakdown.moneyMarketSupply,
  )
  const borrowedFromNettedAssets = sumBreakdownUsd(
    assets,
    (item) => item.breakdown.moneyMarketBorrow,
  )
  const borrowedFromPositions = borrowValueUsd
  const borrowed = sumDecimalStrings(
    borrowedFromNettedAssets,
    borrowedFromPositions,
  ).toString()
  const holdings = sumDecimalStrings(
    regular,
    offchain,
    liquidity,
    supplied,
    Big(borrowedFromNettedAssets).times(-1).toString(),
  ).toString()
  const net = sumDecimalStrings(
    holdings,
    Big(borrowedFromPositions).times(-1).toString(),
  ).toString()

  return {
    regular,
    offchain,
    liquidity,
    supplied,
    borrowed,
    holdings,
    net,
  }
}

const TreasuryHoldingsTooltipRow = ({
  label,
  value,
  negative,
}: {
  label: string
  value: string
  negative?: boolean
}) => (
  <STooltipRow $compact>
    <TooltipLabel>{label}</TooltipLabel>
    <Text fs="p7" fw={600} color="text.high" sx={{ textAlign: "right" }}>
      {negative && isPositiveNumberString(value) ? "-" : ""}
      {formatTooltipCurrency(value)}
    </Text>
  </STooltipRow>
)

const TreasuryHoldingsTooltipContent = ({
  breakdown,
}: {
  breakdown: TreasuryHoldingsBreakdown
}) => (
  <SCompositionTooltipShell>
    <STooltipLegend $compact>
      <STooltipTitle>Treasury holdings breakdown</STooltipTitle>
      <STooltipSection>
        <TreasuryHoldingsTooltipRow
          label="Asset balance"
          value={breakdown.regular}
        />
        <TreasuryHoldingsTooltipRow
          label="Offchain"
          value={breakdown.offchain}
        />
        <TreasuryHoldingsTooltipRow
          label="Supplied as liquidity"
          value={breakdown.liquidity}
        />
        <TreasuryHoldingsTooltipRow
          label="Supplied as collateral"
          value={breakdown.supplied}
        />
        <TreasuryHoldingsTooltipRow
          label="Borrowed"
          value={breakdown.borrowed}
          negative
        />
      </STooltipSection>
      <STooltipSection>
        <TreasuryHoldingsTooltipRow
          label="Total holdings"
          value={breakdown.holdings}
        />
        <TreasuryHoldingsTooltipRow
          label="Net treasury value"
          value={breakdown.net}
        />
      </STooltipSection>
    </STooltipLegend>
  </SCompositionTooltipShell>
)

const DebtOffsetTooltipContent = () => (
  <Flex direction="column" gap="xs">
    <Text fs="p6" fw={600} lh={1.2} color="text.high">
      Debt offset
    </Text>
    <Text fs="p7" lh={1.4} color={getToken("text.medium")}>
      Some supplied collateral is backing borrowed assets. We subtract that part
      from the asset net balance.
    </Text>
  </Flex>
)

const OffchainTooltipContent = () => (
  <Flex direction="column" gap="xs">
    <Text fs="p6" fw={600} lh={1.2} color="text.high">
      Offchain
    </Text>
    <Text fs="p7" lh={1.4} color={getToken("text.medium")}>
      Treasury funds held outside Hydration, like DOT on Asset Hub. Normal
      Hydration wallet balances, including H2O, stay in net balance.
    </Text>
  </Flex>
)

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
              id={getTreasuryAssetLogoId(item.asset)}
              size="extra-small"
              hideChain={isGroupedAsset}
            />
            <STooltipAssetIdentity>
              <Text fs="p6" fw={600} lh={1.1} color="text.high">
                {item.asset.symbol}
              </Text>
              <Text fs="p7" lh={1.1} color="text.high">
                {getTooltipAssetName(item, isGroupedAsset)}
              </Text>
            </STooltipAssetIdentity>
          </STooltipAsset>
          <Text fs="p7" fw={600} color="text.high">
            {getAssetCompositionLabel(item)}
          </Text>
        </STooltipHeader>
        {isGroupedAsset ? (
          <>
            <STooltipTitle>Consisting of</STooltipTitle>
            <STooltipSection>
              {groupedAssets.map((groupedAsset) => (
                <STooltipRow key={groupedAsset.asset.id} $compact>
                  <STooltipAsset>
                    <AssetLogo
                      id={getTreasuryAssetLogoId(groupedAsset.asset)}
                      size="extra-small"
                    />
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
                      {formatTooltipTokenAmountWithSymbol(
                        groupedAsset.balance,
                        groupedAsset.asset.symbol,
                      )}
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
            <TooltipLabel>{getAssetTotalBalanceLabel(item)}</TooltipLabel>
            <BreakdownValue
              part={{
                balance: item.balance,
                valueUsd: item.valueUsd,
              }}
              negative={item.source === "moneyMarketBorrow"}
              symbol={item.asset.symbol}
            />
          </STooltipRow>
          {breakdownRows.map(({ label, part, negative }) => (
            <STooltipRow key={label} $compact>
              <TooltipLabel>{label}</TooltipLabel>
              <BreakdownValue
                part={part}
                negative={negative}
                symbol={item.asset.symbol}
              />
            </STooltipRow>
          ))}
        </STooltipSection>
        {tooltipPositions.length ? (
          <>
            <STooltipTitle>Related positions</STooltipTitle>
            {tooltipPositions.map((position) => (
              <STooltipRow key={position.source} $compact>
                <TooltipLabel>{getPositionGroupLabel(position)}</TooltipLabel>
                <STooltipValues $compact>
                  <Text fs="p7" fw={600} color="text.high">
                    {formatTooltipTokenAmountWithSymbol(
                      position.balance,
                      position.asset.symbol,
                      position.source === "moneyMarketBorrow",
                    )}
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
    const centeredX = clientX - tooltipWidth / 2
    const hasRoomRight = preferredX <= maxX
    const hasRoomLeft = flippedX >= minX
    const hasRoomBelow = preferredY <= maxY
    const x = hasRoomRight ? preferredX : hasRoomLeft ? flippedX : centeredX
    const y = hasRoomBelow ? preferredY : maxY

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
      <AssetLogo id={getTreasuryAssetLogoId(item.asset)} size="extra-small" />
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
              id={getTreasuryAssetLogoId(item.asset)}
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
          <DrawerBody p={0}>
            <MobileCompositionAssetsDetails items={block.items} />
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
            id={getTreasuryAssetLogoId(block.asset)}
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
          symbol={block.asset.symbol}
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
          customTitle={
            <AssetLabelFull
              asset={block.asset}
              logoId={getTreasuryAssetLogoId(block.asset)}
            />
          }
          title={block.asset.symbol}
        >
          <DrawerBody p={0}>
            <MobileAssetDetails
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
        symbol={block.asset.symbol}
        tier={layout.tier}
        colSpan={layout.colSpan}
        rowSpan={layout.rowSpan}
      >
        {blockContent}
      </SCompositionBlock>
    </CursorAssetDetailsTooltip>
  )
}

const CompactAssetLabel = ({
  asset,
}: {
  asset: GroupedTreasuryAssetBalance["asset"]
}) => (
  <SCompactAssetLabel>
    <AssetLogo id={getTreasuryAssetLogoId(asset)} size="extra-small" />
    <SCompactAssetIdentity>
      <Text fs="p5" fw={600} lh={1} color="text.high" truncate>
        {asset.symbol}
      </Text>
      <Text fs="p7" lh={1} color="text.medium" truncate>
        {asset.name}
      </Text>
    </SCompactAssetIdentity>
  </SCompactAssetLabel>
)

const MobileAssetDetails = ({
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
  const drawerPositions = relatedPositions.filter(
    (position) =>
      getCompositionGroupKey(position) === getCompositionGroupKey(item) &&
      (position.source !== item.source ||
        position.balance !== item.balance ||
        position.valueUsd !== item.valueUsd),
  )

  return (
    <SAssetDetailModalBody>
      {isGroupedAsset ? (
        <Flex direction="column" gap="base">
          <Text fs="p6" fw={600} color="text.high">
            Consisting of
          </Text>
          {groupedAssets.map((groupedAsset, index) => (
            <Fragment key={groupedAsset.asset.id}>
              {index > 0 ? <SAssetDetailMobileSeparator /> : null}
              <MobileAmountRow
                label={groupedAsset.asset.symbol}
                value={formatTooltipTokenAmountWithSymbol(
                  groupedAsset.balance,
                  groupedAsset.asset.symbol,
                )}
                displayValue={formatTooltipCurrency(groupedAsset.valueUsd)}
              />
            </Fragment>
          ))}
        </Flex>
      ) : null}
      {isGroupedAsset ? <SAssetDetailMobileSeparator /> : null}
      <Flex direction="column" gap="base">
        <MobileBreakdownRow
          label={getAssetTotalBalanceLabel(item)}
          part={{
            balance: item.balance,
            valueUsd: item.valueUsd,
          }}
          negative={item.source === "moneyMarketBorrow"}
          symbol={item.asset.symbol}
        />
        {breakdownRows.map(({ label, part, negative }) => (
          <Fragment key={label}>
            <SAssetDetailMobileSeparator />
            <MobileBreakdownRow
              label={label}
              part={part}
              negative={negative}
              symbol={item.asset.symbol}
            />
          </Fragment>
        ))}
        <SAssetDetailMobileSeparator />
        <MobileAmountRow
          label="Composition"
          value={getAssetCompositionLabel(item)}
          displayValue={formatTooltipCurrency(item.valueUsd)}
        />
      </Flex>
      {drawerPositions.length ? (
        <>
          <SAssetDetailMobileSeparator />
          <Flex direction="column" gap="base">
            <Text fs="p6" fw={600} color="text.high">
              Related positions
            </Text>
            {drawerPositions.map((position, index) => (
              <Fragment key={position.source}>
                {index > 0 ? <SAssetDetailMobileSeparator /> : null}
                <MobileAmountRow
                  label={getPositionGroupLabel(position)}
                  value={formatTooltipTokenAmountWithSymbol(
                    position.balance,
                    position.asset.symbol,
                    position.source === "moneyMarketBorrow",
                  )}
                  displayValue={`${position.source === "moneyMarketBorrow" ? "-" : ""}${formatTooltipCurrency(position.valueUsd)}`}
                />
              </Fragment>
            ))}
          </Flex>
        </>
      ) : null}
    </SAssetDetailModalBody>
  )
}

const MobileCompositionAssetsDetails = ({
  items,
}: {
  items: Array<TreasuryAssetBalance & { color: string }>
}) => {
  const { visibleItems, hiddenCount, hiddenTotalUsd } =
    partitionOthersTooltipItems(items)

  return (
    <SAssetDetailModalBody>
      <Flex direction="column" gap="base">
        {visibleItems.map((item, index) => (
          <Fragment key={item.asset.id}>
            {index > 0 ? <SAssetDetailMobileSeparator /> : null}
            <MobileAmountRow
              label={item.asset.symbol}
              value={formatCompositionUsd(item.valueUsd)}
              displayValue={formatSharePercent(item.share)}
            />
          </Fragment>
        ))}
        {hiddenCount > 0 ? (
          <>
            {visibleItems.length ? <SAssetDetailMobileSeparator /> : null}
            <MobileAmountRow
              label={`+ ${hiddenCount} more ${hiddenCount === 1 ? "asset" : "assets"}`}
              value={formatCompositionUsd(hiddenTotalUsd)}
            />
          </>
        ) : null}
      </Flex>
    </SAssetDetailModalBody>
  )
}

const AssetRow = ({
  item,
  showBreakdown,
  showOffchain,
  isCompact,
  balanceAlign = "start",
}: {
  item: GroupedTreasuryAssetBalance
  showBreakdown?: boolean
  showOffchain?: boolean
  isCompact?: boolean
  balanceAlign?: "start" | "end"
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (isCompact) {
    return (
      <>
        <SInteractiveTableRow
          role="button"
          tabIndex={0}
          onClick={() => setIsDrawerOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setIsDrawerOpen(true)
            }
          }}
        >
          <TableCell
            sx={{
              minWidth: 0,
              maxWidth: 0,
              overflow: "hidden",
              width: "62%",
            }}
          >
            <CompactAssetLabel asset={item.asset} />
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
              whiteSpace: "nowrap",
              width: "38%",
            }}
          >
            <TreasuryBalanceAmount item={item} align="end" />
          </TableCell>
        </SInteractiveTableRow>
        <Drawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          customTitle={
            <AssetLabelFull
              asset={item.asset}
              logoId={getTreasuryAssetLogoId(item.asset)}
            />
          }
          title={item.asset.symbol}
        >
          <DrawerBody p={0}>
            <MobileAssetDetails item={item} />
          </DrawerBody>
        </Drawer>
      </>
    )
  }

  return (
    <SInteractiveTableRow>
      <TableCell>
        <AssetLabelFull
          asset={item.asset}
          logoId={getTreasuryAssetLogoId(item.asset)}
        />
      </TableCell>
      <TableCell
        sx={balanceAlign === "end" ? { textAlign: "right" } : undefined}
      >
        <TreasuryBalanceAmount item={item} align={balanceAlign} />
      </TableCell>
      {showBreakdown && (
        <TableCell sx={{ textAlign: "right" }}>
          <BreakdownTableValue part={item.breakdown.moneyMarketSupply} />
        </TableCell>
      )}
      {showBreakdown && (
        <TableCell sx={{ textAlign: "right" }}>
          <BreakdownTableValue
            part={item.breakdown.moneyMarketBorrow}
            negative
          />
        </TableCell>
      )}
      {showBreakdown && (
        <TableCell sx={{ textAlign: "right" }}>
          <BreakdownTableValue part={getAssetLiquidityBreakdown(item)} />
        </TableCell>
      )}
      {showBreakdown && showOffchain && (
        <TableCell sx={{ textAlign: "right" }}>
          <BreakdownTableValue part={getAssetOffchainBreakdown(item)} />
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
  const isCompactTable = isMobile
  const [assetPage, setAssetPage] = useState(1)
  const [assetSearch, setAssetSearch] = useState("")
  const storedCompositionGridSpecs = useMemo(
    () => readStoredCompositionGridSpecs(useCompositionMobileLayout),
    [useCompositionMobileLayout],
  )
  const lastCompositionGridSpecsRef = useRef<CompositionGridBlockSpec[]>([])

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
        (Number(item.valueUsd) >= COMPOSITION_PRIMARY_MIN_VALUE_USD ||
          shouldForceAssetIntoPrimaryComposition(item.asset)) &&
        !shouldForceAssetIntoOthers(item.asset),
    )
    let othersAssets = pricedAssets.filter(
      (item) =>
        (Number(item.valueUsd) < COMPOSITION_PRIMARY_MIN_VALUE_USD &&
          !shouldForceAssetIntoPrimaryComposition(item.asset)) ||
        shouldForceAssetIntoOthers(item.asset),
    )

    if (useCompositionMobileLayout) {
      while (primaryAssets.length > 1) {
        const othersShare =
          othersAssets.reduce((acc, item) => acc + item.share, 0) || undefined
        const rows = estimateCompositionGridRows(
          getCompositionMobileGridBlockSpecs(
            primaryAssets.map(getCompositionPlacementAsset),
            othersShare,
          ),
          getCompositionGridContext(true),
        )

        if (rows <= COMPOSITION_MAX_ROWS_MOBILE) break

        const assetIndex = getDemotableCompositionAssetIndex(primaryAssets)

        if (assetIndex === -1) break

        const [asset] = primaryAssets.splice(assetIndex, 1)

        if (!asset) break

        othersAssets = [asset, ...othersAssets]
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
  }, [compositionAssetColors, compositionAssets, useCompositionMobileLayout])

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

  const compositionGridSpecs = useMemo(
    () =>
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
        : [],
    [
      compositionLayoutAssets,
      compositionOthersShare,
      useCompositionMobileLayout,
    ],
  )

  const compositionPrimarySpecs = useMemo(
    () => compositionGridSpecs.slice(0, compositionLayoutAssets.length),
    [compositionGridSpecs, compositionLayoutAssets.length],
  )

  useEffect(() => {
    if (compositionGridSpecs.length) {
      lastCompositionGridSpecsRef.current = compositionGridSpecs
      writeStoredCompositionGridSpecs(
        useCompositionMobileLayout,
        compositionGridSpecs,
      )
    }
  }, [compositionGridSpecs, useCompositionMobileLayout])

  const compositionSkeletonSpecs = useMemo(() => {
    if (compositionGridSpecs.length) return compositionGridSpecs

    if (storedCompositionGridSpecs.length) return storedCompositionGridSpecs

    if (lastCompositionGridSpecsRef.current.length) {
      return lastCompositionGridSpecsRef.current
    }

    return useCompositionMobileLayout
      ? MOBILE_INITIAL_SKELETON_SPECS
      : DESKTOP_INITIAL_SKELETON_SPECS
  }, [
    compositionGridSpecs,
    storedCompositionGridSpecs,
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

    return [...assets, ...borrowOnlyAssets]
      .filter(hasPricedValue)
      .sort((a, b) => {
        const valueA = Number(a.valueUsd ?? 0)
        const valueB = Number(b.valueUsd ?? 0)

        return valueB - valueA
      })
  }, [data?.assets, data?.borrowPositions])
  const offchainAssetCount = useMemo(
    () => allTreasuryAssets.filter(hasAssetOffchainBreakdown).length,
    [allTreasuryAssets],
  )
  const showOffchainColumn = !isTablet && offchainAssetCount > 1
  const assetTableColumnCount = isCompactTable ? 2 : showOffchainColumn ? 6 : 5
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

  const holdingsBreakdown = useMemo(
    () => getTreasuryHoldingsBreakdown(data?.assets, data?.borrowValueUsd),
    [data?.assets, data?.borrowValueUsd],
  )
  const assetSearchControl = (
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
  )

  return (
    <STreasuryGrid>
      <STreasuryOverview>
        <SLoadedContent key={isLoading ? "stats-loading" : "stats-loaded"}>
          <Root delayDuration={0}>
            <Trigger asChild>
              <SKpiTooltipTrigger tabIndex={0}>
                <ValueStats
                  wrap
                  size="medium"
                  label="Net treasury value"
                  value={formatTreasuryValue(holdingsBreakdown.net)}
                  isLoading={isLoading}
                />
              </SKpiTooltipTrigger>
            </Trigger>
            <Portal>
              <SCompositionOthersTooltipContent
                side="top"
                align="start"
                sideOffset={8}
                collisionPadding={12}
              >
                <TreasuryHoldingsTooltipContent breakdown={holdingsBreakdown} />
              </SCompositionOthersTooltipContent>
            </Portal>
          </Root>
        </SLoadedContent>

        <SComposition>
          <SCompositionGrid data-composition-grid="">
            {isCompositionLoading && compositionSkeletonSpecs.length ? (
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
              compositionBlocks.map((block, blockIndex) => {
                if (block.kind === "others") {
                  const baseLayout = useCompositionMobileLayout
                    ? getOthersCompositionMobileBlockLayout(
                        block.share,
                        compositionPrimarySpecs,
                      )
                    : getOthersCompositionBlockLayout(
                        block.share,
                        compositionPrimarySpecs,
                      )
                  const spec = compositionGridSpecs[blockIndex]
                  const layout = {
                    ...baseLayout,
                    colSpan: spec?.colSpan ?? baseLayout.colSpan,
                    rowSpan: spec?.rowSpan ?? baseLayout.rowSpan,
                  }

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
                const baseLayout = useCompositionMobileLayout
                  ? getResolvedCompositionMobileBlockLayout(
                      block.share,
                      getCompositionLayoutOptions(block.asset, block.valueUsd),
                      compositionLayoutAssets,
                      assetIndex,
                      compositionOthersShare,
                    )
                  : getResolvedCompositionBlockLayout(
                      block.share,
                      getCompositionLayoutOptions(block.asset, block.valueUsd),
                      compositionLayoutAssets,
                      assetIndex,
                      compositionOthersShare,
                    )
                const spec = compositionGridSpecs[blockIndex]
                const layout = {
                  ...baseLayout,
                  colSpan: spec?.colSpan ?? baseLayout.colSpan,
                  rowSpan: spec?.rowSpan ?? baseLayout.rowSpan,
                }

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
                    isMultipleLogo={
                      isStableSwap(block.asset) &&
                      !hasTreasurySingleLogo(block.asset)
                    }
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

      {isError && (
        <Text color="warning">
          Treasury balances could not be loaded from the active RPC provider.
        </Text>
      )}

      <STablesGrid>
        <SectionHeader
          title="All treasury assets"
          actions={isCompactTable ? undefined : assetSearchControl}
        />
        {isCompactTable ? assetSearchControl : null}
        <TableContainer as={Paper}>
          <Table
            size="small"
            sx={isCompactTable ? { tableLayout: "fixed" } : undefined}
          >
            <TableHeader>
              <tr>
                <TableHead sx={isCompactTable ? { width: "62%" } : undefined}>
                  Asset
                </TableHead>
                {isCompactTable ? (
                  <TableHead sx={{ textAlign: "right", width: "38%" }}>
                    Net balance
                  </TableHead>
                ) : (
                  <>
                    <TableHead>Net balance</TableHead>
                    <TableHead sx={{ textAlign: "right" }}>
                      Collateral
                    </TableHead>
                    <TableHead sx={{ textAlign: "right" }}>
                      <Tooltip
                        text={<DebtOffsetTooltipContent />}
                        side="top"
                        align="end"
                        asChild
                      >
                        <STableHeadTooltipTrigger tabIndex={0}>
                          Debt offset
                        </STableHeadTooltipTrigger>
                      </Tooltip>
                    </TableHead>
                    <TableHead sx={{ textAlign: "right" }}>Liquidity</TableHead>
                    {showOffchainColumn && (
                      <TableHead sx={{ textAlign: "right" }}>
                        <Tooltip
                          text={<OffchainTooltipContent />}
                          side="top"
                          align="end"
                          asChild
                        >
                          <STableHeadTooltipTrigger tabIndex={0}>
                            Offchain
                          </STableHeadTooltipTrigger>
                        </Tooltip>
                      </TableHead>
                    )}
                  </>
                )}
              </tr>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows colSpan={assetTableColumnCount} />
              ) : paginatedAssets.length ? (
                paginatedAssets.map((item) => (
                  <AssetRow
                    key={`${item.source}-${item.asset.id}`}
                    item={item}
                    showBreakdown={!isCompactTable}
                    showOffchain={showOffchainColumn}
                    isCompact={isCompactTable}
                  />
                ))
              ) : (
                <EmptyRow colSpan={assetTableColumnCount}>
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
