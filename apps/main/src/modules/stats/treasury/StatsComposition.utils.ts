import { HOLLAR_ASSETS } from "@galacticcouncil/utils"
import { useQueries, useQueryClient } from "@tanstack/react-query"

import {
  GroupedCompositionAsset,
  TreasuryCompositionAsset,
} from "@/api/treasury"
import {
  enhanceColorForTile,
  FALLBACK_COLOR,
  getLogoDominantColor,
  getPrecomputedCompositionColor,
  mixCompositionColors,
} from "@/modules/stats/treasury/getLogoDominantColor"
import { isErc20AToken, useAssets } from "@/providers/assetsProvider"

export type CompositionAssetWithColor = GroupedCompositionAsset & {
  color: string
}

export type CompositionOthersBlock = {
  kind: "others"
  id: string
  share: number
  totalValueDisplay: string
  color: string
  items: TreasuryCompositionAsset[]
}

export type CompositionAssetBlock = CompositionAssetWithColor & {
  kind: "asset"
}

export type CompositionDisplayBlock =
  | CompositionAssetBlock
  | CompositionOthersBlock

export const OTHERS_COMPOSITION_BLOCK_ID = "others"
export const OTHERS_COMPOSITION_BLOCK_COLOR = "#5a6270"

export type CompositionBlockTier = "hero" | "major" | "mid" | "minor" | "dust"

export type CompositionBlockLayout = {
  colSpan: number
  rowSpan: number
  tier: CompositionBlockTier
  shareSize: "xlarge" | "large" | "medium" | "small"
  logoSize: "medium" | "small" | "extra-small"
  symbolSize: "large" | "medium" | "small"
}

export type CompositionGridBlockSpec = Pick<
  CompositionBlockLayout,
  "colSpan" | "rowSpan"
>

type CompositionGridContext = {
  columns: number
  maxRows: number
}

type CompositionGridPlacement = CompositionGridBlockSpec & {
  index: number
  row: number
  col: number
}

const COMPOSITION_GRID_COLUMNS = 12
const COMPOSITION_GRID_COLUMNS_MOBILE = 2
const COMPOSITION_MAX_ROWS = 6
const COMPOSITION_MAX_ROWS_MOBILE = 10

const DESKTOP_GRID: CompositionGridContext = {
  columns: COMPOSITION_GRID_COLUMNS,
  maxRows: COMPOSITION_MAX_ROWS,
}

const MOBILE_GRID: CompositionGridContext = {
  columns: COMPOSITION_GRID_COLUMNS_MOBILE,
  maxRows: COMPOSITION_MAX_ROWS_MOBILE,
}

const MOBILE_MIN_COL_SPAN = 1
const STANDARD_DESKTOP_COL_SPAN = 2
const HERO_MIN_SHARE = 35
const LARGE_MIN_SHARE = 5
const TALL_MIN_SHARE = 4
const MID_MIN_SHARE = 3
const SMALL_MIN_SHARE = 1.5
const GAP_FILL_SINGLE_ROW_MAX_COL_SPAN = 3

export const DESKTOP_INITIAL_SKELETON_SPECS: CompositionGridBlockSpec[] = [
  { colSpan: 6, rowSpan: 2 },
  { colSpan: 3, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 3, rowSpan: 1 },
  { colSpan: 3, rowSpan: 1 },
  { colSpan: 3, rowSpan: 1 },
  { colSpan: 3, rowSpan: 1 },
  ...Array.from({ length: 6 }, () => ({ colSpan: 2, rowSpan: 1 })),
  ...Array.from({ length: 6 }, () => ({ colSpan: 1, rowSpan: 1 })),
]

export const MOBILE_INITIAL_SKELETON_SPECS: CompositionGridBlockSpec[] = [
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 1, rowSpan: 2 },
  { colSpan: 1, rowSpan: 2 },
  ...Array.from({ length: 10 }, () => ({ colSpan: 1, rowSpan: 1 })),
]

const getLayoutValueUsd = (valueUsd?: string | number | null) => {
  const value = Number(valueUsd ?? 0)

  return Number.isFinite(value) ? value : 0
}

const getCompositionBlockLayout = (
  share: number,
  _symbol?: string,
  _valueUsdInput?: string | number | null,
): CompositionBlockLayout => {
  if (share >= HERO_MIN_SHARE) {
    return {
      colSpan: 6,
      rowSpan: 2,
      tier: "hero",
      shareSize: "xlarge",
      logoSize: "medium",
      symbolSize: "large",
    }
  }

  if (share > LARGE_MIN_SHARE) {
    return {
      colSpan: 3,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "small",
      symbolSize: "medium",
    }
  }

  if (share > TALL_MIN_SHARE) {
    return {
      colSpan: 2,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "small",
      symbolSize: "medium",
    }
  }

  if (share > MID_MIN_SHARE) {
    return {
      colSpan: 3,
      rowSpan: 1,
      tier: "mid",
      shareSize: "medium",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  if (share > SMALL_MIN_SHARE) {
    return {
      colSpan: 2,
      rowSpan: 1,
      tier: "minor",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  return {
    colSpan: 1,
    rowSpan: 1,
    tier: "dust",
    shareSize: "small",
    logoSize: "extra-small",
    symbolSize: "small",
  }
}

const getCompositionMobileBlockLayout = (
  share: number,
  _symbol?: string,
  _valueUsdInput?: string | number | null,
): CompositionBlockLayout => {
  if (share >= HERO_MIN_SHARE) {
    return {
      colSpan: COMPOSITION_GRID_COLUMNS_MOBILE,
      rowSpan: 2,
      tier: "hero",
      shareSize: "large",
      logoSize: "medium",
      symbolSize: "medium",
    }
  }

  if (share > LARGE_MIN_SHARE) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 2,
      tier: "major",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "small",
    }
  }

  if (share > TALL_MIN_SHARE) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 2,
      tier: "major",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "small",
    }
  }

  if (share > MID_MIN_SHARE) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 1,
      tier: "mid",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  if (share > SMALL_MIN_SHARE) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 1,
      tier: "minor",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  return {
    colSpan: MOBILE_MIN_COL_SPAN,
    rowSpan: 1,
    tier: "dust",
    shareSize: "small",
    logoSize: "extra-small",
    symbolSize: "small",
  }
}

const packCompositionGrid = (
  blocks: ReadonlyArray<CompositionGridBlockSpec>,
  { columns }: CompositionGridContext,
) => {
  const occupied: boolean[][] = []
  const placements: CompositionGridPlacement[] = []

  const ensureRows = (count: number) => {
    while (occupied.length < count) {
      occupied.push(Array(columns).fill(false))
    }
  }

  const fits = (row: number, col: number, colSpan: number, rowSpan: number) => {
    if (col + colSpan > columns) return false

    ensureRows(row + rowSpan)

    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        if (occupied[r]![c]) return false
      }
    }

    return true
  }

  const occupy = (
    row: number,
    col: number,
    colSpan: number,
    rowSpan: number,
  ) => {
    ensureRows(row + rowSpan)

    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        occupied[r]![c] = true
      }
    }
  }

  for (const [index, { colSpan, rowSpan }] of blocks.entries()) {
    let placed = false

    for (let row = 0; !placed; row++) {
      for (let col = 0; col <= columns - colSpan; col++) {
        if (fits(row, col, colSpan, rowSpan)) {
          occupy(row, col, colSpan, rowSpan)
          placements.push({ index, row, col, colSpan, rowSpan })

          placed = true
          break
        }
      }
    }
  }

  return { occupied, placements }
}

const getOthersCompositionBlockLayout = (
  share: number,
  _primarySpecs: ReadonlyArray<CompositionGridBlockSpec> = [],
): CompositionBlockLayout => {
  const base = getCompositionBlockLayout(share)

  return {
    ...base,
    colSpan: STANDARD_DESKTOP_COL_SPAN,
    rowSpan: 1,
    tier: "mid",
    shareSize: "small",
  }
}

const getOthersCompositionMobileBlockLayout = (
  share: number,
  _primarySpecs: ReadonlyArray<CompositionGridBlockSpec> = [],
): CompositionBlockLayout => {
  const base = getCompositionMobileBlockLayout(share)

  return {
    ...base,
    colSpan: MOBILE_MIN_COL_SPAN,
    rowSpan: 1,
    tier: "mid",
    shareSize: "small",
  }
}

const getBalancedMaxColSpan = (
  asset: TreasuryCompositionAsset,
  spec: CompositionGridBlockSpec,
  grid: CompositionGridContext,
) => {
  // Keep tiles close to the share-based size ladder; only fill tiny leftover gaps.
  if (asset.share >= HERO_MIN_SHARE) {
    return Math.max(spec.colSpan, 6)
  }

  if (grid.columns === COMPOSITION_GRID_COLUMNS_MOBILE) {
    return asset.share > SMALL_MIN_SHARE
      ? COMPOSITION_GRID_COLUMNS_MOBILE
      : spec.colSpan
  }

  if (asset.share > LARGE_MIN_SHARE) {
    return Math.max(spec.colSpan, 3)
  }

  if (asset.share > TALL_MIN_SHARE) {
    return Math.max(spec.colSpan, STANDARD_DESKTOP_COL_SPAN)
  }

  if (asset.share > MID_MIN_SHARE) {
    return Math.max(spec.colSpan, GAP_FILL_SINGLE_ROW_MAX_COL_SPAN)
  }

  if (asset.share > SMALL_MIN_SHARE) {
    return Math.max(spec.colSpan, STANDARD_DESKTOP_COL_SPAN)
  }

  return Math.max(spec.colSpan, 1)
}

const getCompactMinColSpan = (
  asset: TreasuryCompositionAsset,
  spec: CompositionGridBlockSpec,
  grid: CompositionGridContext,
) => {
  // Never crush the hero — otherwise HDX ends up the same size as mid tiles.
  if (asset.share >= HERO_MIN_SHARE) return spec.colSpan

  if (grid.columns === COMPOSITION_GRID_COLUMNS_MOBILE) {
    return MOBILE_MIN_COL_SPAN
  }

  if (asset.share > TALL_MIN_SHARE) {
    // Tall mid tiles may narrow slightly to claim earlier gaps.
    return Math.min(spec.colSpan, STANDARD_DESKTOP_COL_SPAN)
  }

  if (asset.share > MID_MIN_SHARE) {
    return Math.min(spec.colSpan, STANDARD_DESKTOP_COL_SPAN)
  }

  if (asset.share > SMALL_MIN_SHARE) {
    return Math.min(spec.colSpan, 1)
  }

  return 1
}

const getEarliestFitColSpan = (
  precedingSpecs: ReadonlyArray<CompositionGridBlockSpec>,
  preferred: CompositionGridBlockSpec,
  minColSpan: number,
  grid: CompositionGridContext,
) => {
  const maxRowProbe = precedingSpecs.reduce(
    (rows, spec) => rows + spec.rowSpan,
    preferred.rowSpan,
  )

  for (let row = 0; row <= maxRowProbe; row++) {
    for (let col = 0; col < grid.columns; col++) {
      for (
        let colSpan = Math.min(preferred.colSpan, grid.columns - col);
        colSpan >= minColSpan;
        colSpan--
      ) {
        const candidate = { colSpan, rowSpan: preferred.rowSpan }
        const { placements } = packCompositionGrid(
          [...precedingSpecs, candidate],
          grid,
        )
        const placement = placements[precedingSpecs.length]

        if (placement?.row === row && placement.col === col) {
          return colSpan
        }
      }
    }
  }

  return preferred.colSpan
}

/**
 * Shrink tiles (in share order) just enough to claim the earliest free slot.
 * Prevents smaller later assets from visually preceding larger ones that were
 * skipped because their preferred width did not fit a leftover gap.
 */
const claimEarliestSlotSpecs = (
  specs: ReadonlyArray<CompositionGridBlockSpec>,
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  grid: CompositionGridContext,
) => {
  const claimedSpecs = specs.map((spec) => ({ ...spec }))

  for (let index = 0; index < assets.length; index++) {
    const asset = assets[index]
    const preferred = claimedSpecs[index]

    if (!asset || !preferred) continue

    const minColSpan = getCompactMinColSpan(asset, preferred, grid)

    if (minColSpan >= preferred.colSpan) continue

    claimedSpecs[index] = {
      ...preferred,
      colSpan: getEarliestFitColSpan(
        claimedSpecs.slice(0, index),
        preferred,
        minColSpan,
        grid,
      ),
    }
  }

  return claimedSpecs
}

type ResizeCandidate = {
  index: number
  valueUsd: number
  share: number
  remaining: number
}

type ResizeCandidateScore = Pick<ResizeCandidate, "valueUsd" | "share">

const compareResizeCandidateAsc = (
  a: ResizeCandidateScore,
  b: ResizeCandidateScore,
) => a.valueUsd - b.valueUsd || a.share - b.share

const compareResizeCandidateDesc = (
  a: ResizeCandidateScore,
  b: ResizeCandidateScore,
) => b.valueUsd - a.valueUsd || b.share - a.share

const getGapFillMaxColSpan = (
  asset: TreasuryCompositionAsset,
  spec: CompositionGridBlockSpec,
  grid: CompositionGridContext,
  freeColumns: number,
) => {
  const balancedMax = getBalancedMaxColSpan(asset, spec, grid)
  const canFillRowGap =
    spec.rowSpan === 1 &&
    grid.columns === COMPOSITION_GRID_COLUMNS &&
    asset.share > SMALL_MIN_SHARE

  if (!canFillRowGap) return balancedMax

  return Math.max(
    balancedMax,
    Math.min(spec.colSpan + freeColumns, GAP_FILL_SINGLE_ROW_MAX_COL_SPAN),
  )
}

const withOthersSpec = (
  specs: CompositionGridBlockSpec[],
  othersShare: number | undefined,
  getOthersLayout: typeof getOthersCompositionBlockLayout,
): CompositionGridBlockSpec[] => {
  if (!othersShare || othersShare <= 0) return specs

  const { colSpan, rowSpan } = getOthersLayout(othersShare, specs)

  return [...specs, { colSpan, rowSpan }]
}

const fitsWithinMaxRows = (
  specs: ReadonlyArray<CompositionGridBlockSpec>,
  grid: CompositionGridContext,
) => packCompositionGrid(specs, grid).occupied.length <= grid.maxRows

/** Narrow smallest tiles first until the pack fits within maxRows. */
const shrinkSpecsToFitMaxRows = (
  specs: CompositionGridBlockSpec[],
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  grid: CompositionGridContext,
  getPackedSpecs: () => CompositionGridBlockSpec[],
) => {
  const maxSteps = grid.columns * specs.length

  for (let step = 0; step < maxSteps; step++) {
    const { occupied, placements } = packCompositionGrid(getPackedSpecs(), grid)

    if (occupied.length <= grid.maxRows) break

    const candidate = placements
      .filter((placement) => placement.index < assets.length)
      .map((placement) => {
        const spec = specs[placement.index]!
        const asset = assets[placement.index]!
        const minColSpan = getCompactMinColSpan(asset, spec, grid)

        return {
          index: placement.index,
          valueUsd: getLayoutValueUsd(asset.totalValueDisplay),
          share: asset.share,
          remaining: spec.colSpan - minColSpan,
        } satisfies ResizeCandidate
      })
      .filter((item) => item.remaining > 0)
      .sort(compareResizeCandidateAsc)[0]

    if (!candidate) break

    specs[candidate.index]!.colSpan -= 1
  }
}

const findGapFillCandidate = (
  specs: CompositionGridBlockSpec[],
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  grid: CompositionGridContext,
  occupied: boolean[][],
  placements: CompositionGridPlacement[],
): { candidate: ResizeCandidate; freeColumns: number } | undefined => {
  const rowGaps = occupied
    .map((row, index) => ({
      row: index,
      freeColumns: grid.columns - row.filter(Boolean).length,
    }))
    .filter(({ freeColumns }) => freeColumns > 0)
    .sort((a, b) => b.row - a.row || b.freeColumns - a.freeColumns)

  for (const rowGap of rowGaps) {
    const candidate = placements
      .filter(
        (placement) =>
          placement.index < assets.length &&
          placement.row <= rowGap.row &&
          rowGap.row < placement.row + placement.rowSpan,
      )
      .map((placement) => {
        const spec = specs[placement.index]!
        const asset = assets[placement.index]!

        return {
          index: placement.index,
          valueUsd: getLayoutValueUsd(asset.totalValueDisplay),
          share: asset.share,
          remaining:
            getGapFillMaxColSpan(asset, spec, grid, rowGap.freeColumns) -
            spec.colSpan,
        } satisfies ResizeCandidate
      })
      .filter((item) => item.remaining > 0)
      .sort(compareResizeCandidateDesc)[0]

    if (candidate) {
      return { candidate, freeColumns: rowGap.freeColumns }
    }
  }

  return undefined
}

/**
 * Try growing a tile by `increment` columns. Rolls back if the pack exceeds
 * maxRows. Prefers the largest valid increment (caller tries high → low).
 */
const tryGrowColSpan = (
  specs: CompositionGridBlockSpec[],
  index: number,
  increment: number,
  grid: CompositionGridContext,
  getPackedSpecs: () => CompositionGridBlockSpec[],
) => {
  specs[index]!.colSpan += increment

  if (fitsWithinMaxRows(getPackedSpecs(), grid)) return true

  specs[index]!.colSpan -= increment

  return false
}

/**
 * Expand highest-value tiles into leftover row gaps without exceeding maxRows.
 * Last-row-only cleanup when there is no Others tile lives in fillFinalRowSpecs.
 */
const growSpecsIntoRowGaps = (
  specs: CompositionGridBlockSpec[],
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  grid: CompositionGridContext,
  getPackedSpecs: () => CompositionGridBlockSpec[],
) => {
  const maxSteps = grid.columns * specs.length

  for (let step = 0; step < maxSteps; step++) {
    const { occupied, placements } = packCompositionGrid(getPackedSpecs(), grid)
    const gapFill = findGapFillCandidate(
      specs,
      assets,
      grid,
      occupied,
      placements,
    )

    if (!gapFill) break

    const { candidate, freeColumns } = gapFill
    let didResize = false

    for (
      let increment = Math.min(freeColumns, candidate.remaining);
      increment > 0;
      increment--
    ) {
      if (
        tryGrowColSpan(specs, candidate.index, increment, grid, getPackedSpecs)
      ) {
        didResize = true
        break
      }
    }

    if (!didResize) break
  }
}

const balanceCompositionGridSpecs = (
  specs: ReadonlyArray<CompositionGridBlockSpec>,
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  grid: CompositionGridContext,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
) => {
  const balancedSpecs = claimEarliestSlotSpecs(specs, assets, grid)
  const getPackedSpecs = () =>
    withOthersSpec(balancedSpecs, othersShare, getOthersLayout)

  shrinkSpecsToFitMaxRows(balancedSpecs, assets, grid, getPackedSpecs)
  growSpecsIntoRowGaps(balancedSpecs, assets, grid, getPackedSpecs)

  return balancedSpecs
}

/**
 * Last-row gap fill when there is no Others tile. Complements
 * growSpecsIntoRowGaps, which handles gaps across all rows during balance.
 */
const fillFinalRowSpecs = (
  specs: ReadonlyArray<CompositionGridBlockSpec>,
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  grid: CompositionGridContext,
) => {
  if (grid.columns !== COMPOSITION_GRID_COLUMNS) {
    return specs.map((spec) => ({ ...spec }))
  }

  const filledSpecs = specs.map((spec) => ({ ...spec }))
  const getLastRowFreeColumns = (
    candidateSpecs: ReadonlyArray<CompositionGridBlockSpec>,
  ) => {
    const { occupied } = packCompositionGrid(candidateSpecs, grid)
    const lastRow = occupied[occupied.length - 1]

    return grid.columns - (lastRow?.filter(Boolean).length ?? 0)
  }

  let remainingFreeColumns = getLastRowFreeColumns(filledSpecs)

  while (remainingFreeColumns > 0) {
    const candidates = assets
      .map((asset, index) => {
        const spec = filledSpecs[index]!

        return {
          index,
          valueUsd: getLayoutValueUsd(asset.totalValueDisplay),
          share: asset.share,
          canGrow:
            spec.rowSpan === 1 &&
            spec.colSpan < GAP_FILL_SINGLE_ROW_MAX_COL_SPAN &&
            asset.share > SMALL_MIN_SHARE,
        }
      })
      .filter(({ canGrow }) => canGrow)
      .sort(compareResizeCandidateDesc)

    const candidate = candidates.find(({ index }) =>
      tryGrowColSpan(filledSpecs, index, 1, grid, () => filledSpecs),
    )

    if (!candidate) break

    remainingFreeColumns = getLastRowFreeColumns(filledSpecs)
  }

  return filledSpecs
}

const getCompositionPrimaryBlockSpecsForGrid = (
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  getLayout: typeof getCompositionBlockLayout,
  grid: CompositionGridContext,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
) => {
  const baseSpecs = assets.map((asset) => {
    const { colSpan, rowSpan } = getLayout(
      asset.share,
      asset.asset.symbol,
      asset.totalValueDisplay,
    )

    return { colSpan, rowSpan }
  })

  return balanceCompositionGridSpecs(
    baseSpecs,
    assets,
    grid,
    othersShare,
    getOthersLayout,
  )
}

const getCompositionPrimaryBlockSpecs = (
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(
    assets,
    getCompositionBlockLayout,
    DESKTOP_GRID,
    othersShare,
  )

const getCompositionMobilePrimaryBlockSpecs = (
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(
    assets,
    getCompositionMobileBlockLayout,
    MOBILE_GRID,
    othersShare,
    getOthersCompositionMobileBlockLayout,
  )

const getCompositionGridBlockSpecsForGrid = (
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  getPrimarySpecs: typeof getCompositionPrimaryBlockSpecs,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
  grid: CompositionGridContext = DESKTOP_GRID,
) => {
  const primarySpecs = getPrimarySpecs(assets, othersShare)

  if (othersShare !== undefined && othersShare > 0) {
    const { colSpan, rowSpan } = getOthersLayout(othersShare, primarySpecs)

    return [...primarySpecs, { colSpan, rowSpan }]
  }

  return fillFinalRowSpecs(primarySpecs, assets, grid)
}

const getCompositionGridBlockSpecsFromAssets = (
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionGridBlockSpecsForGrid(
    assets,
    getCompositionPrimaryBlockSpecs,
    othersShare,
    getOthersCompositionBlockLayout,
    DESKTOP_GRID,
  )

const getCompositionMobileGridBlockSpecsFromAssets = (
  assets: ReadonlyArray<TreasuryCompositionAsset>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionGridBlockSpecsForGrid(
    assets,
    getCompositionMobilePrimaryBlockSpecs,
    othersShare,
    getOthersCompositionMobileBlockLayout,
    MOBILE_GRID,
  )

export const getCompositionBlockLayouts = (
  assets: ReadonlyArray<CompositionAssetWithColor>,
  others: ReadonlyArray<TreasuryCompositionAsset>,
  othersAggregate: { share: number; totalValueDisplay: string },
  isMobile: boolean,
) => {
  const othersShare =
    othersAggregate.share > 0 ? othersAggregate.share : undefined
  const specs = isMobile
    ? getCompositionMobileGridBlockSpecsFromAssets(assets, othersShare)
    : getCompositionGridBlockSpecsFromAssets(assets, othersShare)
  const getLayout = isMobile
    ? getCompositionMobileBlockLayout
    : getCompositionBlockLayout

  const layouts: Array<{
    block: CompositionDisplayBlock
    layout: CompositionBlockLayout
  }> = assets.map((asset, index) => {
    const layout = getLayout(
      asset.share,
      asset.asset.symbol,
      asset.totalValueDisplay,
    )
    const spec = specs[index]

    return {
      block: {
        kind: "asset",
        ...asset,
      },
      layout: {
        ...layout,
        colSpan: spec?.colSpan ?? layout.colSpan,
        rowSpan: spec?.rowSpan ?? layout.rowSpan,
      },
    }
  })

  if (othersShare !== undefined && others.length) {
    const othersLayout = isMobile
      ? getOthersCompositionMobileBlockLayout(
          othersShare,
          specs.slice(0, assets.length),
        )
      : getOthersCompositionBlockLayout(
          othersShare,
          specs.slice(0, assets.length),
        )
    const spec = specs[assets.length]

    layouts.push({
      block: {
        kind: "others",
        id: OTHERS_COMPOSITION_BLOCK_ID,
        share: othersShare,
        totalValueDisplay: othersAggregate.totalValueDisplay,
        color: OTHERS_COMPOSITION_BLOCK_COLOR,
        items: [...others],
      },
      layout: {
        ...othersLayout,
        colSpan: spec?.colSpan ?? othersLayout.colSpan,
        rowSpan: spec?.rowSpan ?? othersLayout.rowSpan,
      },
    })
  }

  return layouts
}

export const useAssetsColorsQuery = (assets: TreasuryCompositionAsset[]) => {
  const { isStableSwap, getAssetWithFallback } = useAssets()
  const queryClient = useQueryClient()

  return useQueries({
    queries: assets.map((item) => ({
      queryKey: ["compositionLogoColor", item.asset.id],
      queryFn: async () => {
        const precomputed = getPrecomputedCompositionColor(item.asset.id)

        if (precomputed) return precomputed

        const asset = isErc20AToken(item.asset)
          ? HOLLAR_ASSETS.includes(item.asset.underlyingAssetId)
            ? getAssetWithFallback(item.asset.underlyingAssetId)
            : item.asset
          : item.asset
        if (isStableSwap(asset)) {
          if (Array.isArray(asset.underlyingAssetId)) {
            const assets = asset.underlyingAssetId.map(async (id) => {
              const meta = getAssetWithFallback(id)
              const savedColor = getPrecomputedCompositionColor(meta.id)

              if (savedColor) return savedColor

              const iconSrc = isErc20AToken(meta)
                ? getAssetWithFallback(meta.underlyingAssetId).iconSrc
                : meta.iconSrc

              return await queryClient.ensureQueryData({
                queryKey: ["compositionLogoColor", meta.id],
                queryFn: async () => {
                  if (!iconSrc) return FALLBACK_COLOR
                  return getLogoDominantColor(iconSrc)
                },
              })
            })

            const colors = await Promise.all(assets)
            const [firstColor, ...restColors] = colors

            if (!firstColor) return FALLBACK_COLOR

            return enhanceColorForTile(
              restColors.reduce(
                (mixedColor, color, index) =>
                  mixCompositionColors(
                    mixedColor,
                    color,
                    (index + 1) / (index + 2),
                  ),
                firstColor,
              ),
            )
          } else {
            if (asset.underlyingAssetId) {
              const underlyingId = asset.underlyingAssetId
              const savedColor = getPrecomputedCompositionColor(underlyingId)

              if (savedColor) return savedColor

              const iconSrc = getAssetWithFallback(underlyingId).iconSrc
              if (!iconSrc) return FALLBACK_COLOR
              return getLogoDominantColor(iconSrc)
            } else {
              return FALLBACK_COLOR
            }
          }
        }

        if (!item.asset.iconSrc) return FALLBACK_COLOR

        return getLogoDominantColor(item.asset.iconSrc)
      },
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    })),
    combine: (queries) =>
      queries.flatMap((query, index) => {
        const asset = assets[index]

        if (!asset) return []

        return [
          {
            ...asset,
            color: query.data ?? FALLBACK_COLOR,
          },
        ]
      }),
  })
}
