export const COMPOSITION_GRID_COLUMNS = 12
export const COMPOSITION_GRID_COLUMNS_MOBILE = 2
export const COMPOSITION_MAX_ROWS = 4
// Tall composition anchors span two tracks but still belong to four visible bands.
export const COMPOSITION_DESKTOP_MAX_GRID_ROWS = COMPOSITION_MAX_ROWS + 1
export const COMPOSITION_MAX_ROWS_MOBILE = 10

export type CompositionBlockTier = "hero" | "major" | "mid" | "minor" | "dust"

export type CompositionBlockLayout = {
  colSpan: number
  rowSpan: number
  tier: CompositionBlockTier
  shareSize: "xlarge" | "large" | "medium" | "small"
  logoSize: "medium" | "small" | "extra-small"
  symbolSize: "large" | "medium" | "small"
}

export type CompositionBlockLayoutOptions = {
  symbol?: string
  valueUsd?: string | number | null
}

type CompositionGridContext = {
  columns: number
  maxRows: number
}

type CompositionGridAsset = {
  share: number
  symbol?: string
  valueUsd?: string | number | null
}

type CompositionGridPlacement = CompositionGridBlockSpec & {
  index: number
  row: number
  col: number
}

const DESKTOP_GRID: CompositionGridContext = {
  columns: COMPOSITION_GRID_COLUMNS,
  maxRows: COMPOSITION_DESKTOP_MAX_GRID_ROWS,
}

const MOBILE_GRID: CompositionGridContext = {
  columns: COMPOSITION_GRID_COLUMNS_MOBILE,
  maxRows: COMPOSITION_MAX_ROWS_MOBILE,
}

const MOBILE_MIN_COL_SPAN = 1
const STANDARD_DESKTOP_COL_SPAN = 2
const TALL_DESKTOP_MIN_SHARE = 6
const TALL_DESKTOP_MIN_VALUE_USD = 1_100_000
const WIDE_SINGLE_ROW_MIN_VALUE_USD = 400_000
const WIDE_SINGLE_ROW_MAX_VALUE_USD = 1_100_000
const GAP_FILL_SINGLE_ROW_MAX_COL_SPAN = 4

const getLayoutValueUsd = (valueUsd?: string | number | null) => {
  const value = Number(valueUsd ?? 0)

  return Number.isFinite(value) ? value : 0
}

const isCompositionRange = (
  share: number,
  valueUsd: number,
  minShare: number,
  minValueUsd: number,
) => share >= minShare || valueUsd >= minValueUsd

const isTallAnchorSymbol = (symbol?: string) => {
  const normalizedSymbol = symbol?.toUpperCase()

  return (
    normalizedSymbol?.includes("PRIME") || normalizedSymbol?.includes("TBTC")
  )
}

const isWideSingleRowRange = (valueUsd: number) =>
  valueUsd >= WIDE_SINGLE_ROW_MIN_VALUE_USD &&
  valueUsd < WIDE_SINGLE_ROW_MAX_VALUE_USD

export const getCompositionBlockLayout = (
  share: number,
  options?: CompositionBlockLayoutOptions,
): CompositionBlockLayout => {
  let layout: CompositionBlockLayout
  const valueUsd = getLayoutValueUsd(options?.valueUsd)

  if (isTallAnchorSymbol(options?.symbol)) {
    layout = {
      colSpan: 2,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "small",
      symbolSize: "medium",
    }
  } else if (share >= 35) {
    layout = {
      colSpan: 6,
      rowSpan: 2,
      tier: "hero",
      shareSize: "xlarge",
      logoSize: "medium",
      symbolSize: "large",
    }
  } else if (share >= 22) {
    layout = {
      colSpan: 4,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "medium",
      symbolSize: "medium",
    }
  } else if (share >= 12) {
    layout = {
      colSpan: valueUsd >= 4_000_000 || share >= 18 ? 4 : 3,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "small",
      symbolSize: "medium",
    }
  } else if (share >= 6) {
    const shouldUseTallMidTile =
      share >= TALL_DESKTOP_MIN_SHARE || valueUsd >= TALL_DESKTOP_MIN_VALUE_USD
    const colSpan =
      valueUsd >= 2_000_000 || share >= 10
        ? 4
        : valueUsd >= 1_500_000 || share >= 8
          ? 3
          : 2

    layout = {
      colSpan,
      rowSpan: shouldUseTallMidTile ? 2 : 1,
      tier: shouldUseTallMidTile ? "major" : "mid",
      shareSize: shouldUseTallMidTile ? "large" : "medium",
      logoSize: "small",
      symbolSize: "medium",
    }
  } else if (valueUsd >= 1_100_000) {
    layout = {
      colSpan: 2,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "small",
      symbolSize: "medium",
    }
  } else if (isWideSingleRowRange(valueUsd)) {
    layout = {
      colSpan: 3,
      rowSpan: 1,
      tier: "mid",
      shareSize: "medium",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  } else if (isCompositionRange(share, valueUsd, 1.25, 250_000)) {
    layout = {
      colSpan: 2,
      rowSpan: 1,
      tier: "minor",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  } else if (share >= 1 || valueUsd >= 100_000) {
    layout = {
      colSpan: 2,
      rowSpan: 1,
      tier: "minor",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  } else {
    layout = {
      colSpan: 1,
      rowSpan: 1,
      tier: "dust",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  return layout
}

export const getCompositionMobileBlockLayout = (
  share: number,
  options?: CompositionBlockLayoutOptions,
): CompositionBlockLayout => {
  const valueUsd = getLayoutValueUsd(options?.valueUsd)

  if (share >= 35) {
    return {
      colSpan: COMPOSITION_GRID_COLUMNS_MOBILE,
      rowSpan: 2,
      tier: "hero",
      shareSize: "large",
      logoSize: "medium",
      symbolSize: "medium",
    }
  }

  if (share >= 15) {
    return {
      colSpan: COMPOSITION_GRID_COLUMNS_MOBILE,
      rowSpan: 2,
      tier: "major",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "medium",
    }
  }

  if (share >= 6) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 2,
      tier: "major",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "small",
    }
  }

  if (isCompositionRange(share, valueUsd, 1, 350_000)) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 1,
      tier: "major",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "small",
    }
  }

  if (isCompositionRange(share, valueUsd, 0.5, 100_000)) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 1,
      tier: "mid",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  if (valueUsd >= 15_000) {
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

  let cursorRow = 0
  let cursorCol = 0

  for (const [index, { colSpan, rowSpan }] of blocks.entries()) {
    let placed = false

    for (let row = cursorRow; !placed; row++) {
      const startCol = row === cursorRow ? cursorCol : 0

      for (let col = startCol; col <= columns - colSpan; col++) {
        if (fits(row, col, colSpan, rowSpan)) {
          occupy(row, col, colSpan, rowSpan)
          placements.push({ index, row, col, colSpan, rowSpan })
          cursorRow = row
          cursorCol = col + colSpan

          if (cursorCol >= columns) {
            cursorRow += 1
            cursorCol = 0
          }

          placed = true
          break
        }
      }
    }
  }

  return { occupied, placements }
}

export const getOthersCompositionBlockLayout = (
  share: number,
  primarySpecs: ReadonlyArray<CompositionGridBlockSpec> = [],
): CompositionBlockLayout => {
  const base = getCompositionBlockLayout(share)
  let colSpan = STANDARD_DESKTOP_COL_SPAN

  for (
    let nextColSpan = colSpan + 1;
    nextColSpan <= COMPOSITION_GRID_COLUMNS;
    nextColSpan++
  ) {
    const rows = estimateCompositionGridRows(
      [...primarySpecs, { colSpan: nextColSpan, rowSpan: 1 }],
      DESKTOP_GRID,
    )

    if (rows > COMPOSITION_DESKTOP_MAX_GRID_ROWS) break

    colSpan = nextColSpan
  }

  return {
    ...base,
    colSpan,
    rowSpan: 1,
    tier: "mid",
    shareSize: "small",
  }
}

export const getOthersCompositionMobileBlockLayout = (
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

export const estimateCompositionGridRows = (
  blocks: ReadonlyArray<CompositionGridBlockSpec>,
  grid: CompositionGridContext = DESKTOP_GRID,
): number => packCompositionGrid(blocks, grid).occupied.length

export type CompositionGridBlockSpec = Pick<
  CompositionBlockLayout,
  "colSpan" | "rowSpan"
>

const getBalancedMaxColSpan = (
  asset: CompositionGridAsset,
  spec: CompositionGridBlockSpec,
  grid: CompositionGridContext,
) => {
  const valueUsd = getLayoutValueUsd(asset.valueUsd)
  if (spec.rowSpan > 1) {
    if (grid.columns === COMPOSITION_GRID_COLUMNS_MOBILE) return spec.colSpan

    if (isTallAnchorSymbol(asset.symbol)) {
      return spec.colSpan
    }

    if (valueUsd >= 3_000_000 || asset.share >= 10) {
      return Math.max(spec.colSpan, 5)
    }

    if (valueUsd >= 1_100_000 || asset.share >= 7) {
      return Math.max(spec.colSpan, 4)
    }

    if (valueUsd >= 500_000 || asset.share >= 4) {
      return Math.max(spec.colSpan, 3)
    }

    return spec.colSpan
  }

  if (grid.columns === COMPOSITION_GRID_COLUMNS_MOBILE) {
    return valueUsd >= 250_000 || asset.share >= 1
      ? COMPOSITION_GRID_COLUMNS_MOBILE
      : spec.colSpan
  }

  if (valueUsd >= 1_100_000) {
    return Math.max(spec.colSpan, 4)
  }

  if (isWideSingleRowRange(valueUsd)) {
    return Math.max(spec.colSpan, GAP_FILL_SINGLE_ROW_MAX_COL_SPAN)
  }

  if (valueUsd >= 250_000 || asset.share >= 1.25) {
    return Math.max(spec.colSpan, 3)
  }

  if (valueUsd >= 15_000) {
    return Math.max(spec.colSpan, 2)
  }

  return spec.colSpan
}

const getCompactMinColSpan = (
  asset: CompositionGridAsset,
  spec: CompositionGridBlockSpec,
  grid: CompositionGridContext,
) => {
  if (spec.rowSpan > 1) return spec.colSpan

  if (grid.columns === COMPOSITION_GRID_COLUMNS_MOBILE) {
    return MOBILE_MIN_COL_SPAN
  }

  const valueUsd = getLayoutValueUsd(asset.valueUsd)

  if (isWideSingleRowRange(valueUsd)) {
    return Math.min(spec.colSpan, 3)
  }

  if (valueUsd >= 500_000 || asset.share >= 1.25) {
    return Math.min(spec.colSpan, STANDARD_DESKTOP_COL_SPAN)
  }

  return 1
}

const balanceCompositionGridSpecs = (
  specs: ReadonlyArray<CompositionGridBlockSpec>,
  assets: ReadonlyArray<CompositionGridAsset>,
  grid: CompositionGridContext,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
) => {
  const balancedSpecs = specs.map((spec) => ({ ...spec }))
  const getPackedSpecs = () => {
    if (!othersShare || othersShare <= 0) return balancedSpecs

    const { colSpan, rowSpan } = getOthersLayout(othersShare, balancedSpecs)

    return [...balancedSpecs, { colSpan, rowSpan }]
  }

  for (let step = 0; step < grid.columns * balancedSpecs.length; step++) {
    const { occupied, placements } = packCompositionGrid(getPackedSpecs(), grid)

    if (occupied.length <= grid.maxRows) break

    const candidates = placements
      .filter((placement) => placement.index < assets.length)
      .map((placement) => {
        const spec = balancedSpecs[placement.index]!
        const asset = assets[placement.index]!
        const minColSpan = getCompactMinColSpan(asset, spec, grid)

        return {
          index: placement.index,
          valueUsd: getLayoutValueUsd(asset.valueUsd),
          share: asset.share,
          remaining: spec.colSpan - minColSpan,
        }
      })
      .filter((candidate) => candidate.remaining > 0)
      .sort((a, b) => a.valueUsd - b.valueUsd || a.share - b.share)

    const candidate = candidates[0]

    if (!candidate) break

    balancedSpecs[candidate.index]!.colSpan -= 1
  }

  for (let step = 0; step < grid.columns * balancedSpecs.length; step++) {
    const { occupied, placements } = packCompositionGrid(getPackedSpecs(), grid)
    const rowGaps = occupied
      .map((row, index) => ({
        row: index,
        freeColumns: grid.columns - row.filter(Boolean).length,
      }))
      .filter(({ freeColumns }) => freeColumns > 0)
      .sort((a, b) => a.row - b.row || b.freeColumns - a.freeColumns)

    let didResize = false

    for (const rowGap of rowGaps) {
      const candidates = placements
        .filter(
          (placement) =>
            placement.index < assets.length &&
            placement.row <= rowGap.row &&
            rowGap.row < placement.row + placement.rowSpan,
        )
        .map((placement) => {
          const spec = balancedSpecs[placement.index]!
          const asset = assets[placement.index]!
          const valueUsd = getLayoutValueUsd(asset.valueUsd)
          const balancedMax = getBalancedMaxColSpan(asset, spec, grid)
          const canFillRowGap =
            spec.rowSpan === 1 &&
            grid.columns === COMPOSITION_GRID_COLUMNS &&
            (valueUsd >= 15_000 || asset.share >= 0.5)
          const maxColSpan =
            rowGap.row === occupied.length - 1 &&
            grid.columns === COMPOSITION_GRID_COLUMNS &&
            valueUsd > 0 &&
            valueUsd < 205_000
              ? Math.max(spec.colSpan, 2)
              : canFillRowGap
                ? Math.max(
                    balancedMax,
                    Math.min(
                      spec.colSpan + rowGap.freeColumns,
                      GAP_FILL_SINGLE_ROW_MAX_COL_SPAN,
                    ),
                  )
                : balancedMax

          return {
            index: placement.index,
            valueUsd,
            share: asset.share,
            remaining: maxColSpan - spec.colSpan,
          }
        })
        .filter((item) => item.remaining > 0)
        .sort((a, b) => b.valueUsd - a.valueUsd || b.share - a.share)

      for (const candidate of candidates) {
        for (
          let increment = Math.min(rowGap.freeColumns, candidate.remaining);
          increment > 0;
          increment--
        ) {
          balancedSpecs[candidate.index]!.colSpan += increment

          if (
            packCompositionGrid(getPackedSpecs(), grid).occupied.length <=
            grid.maxRows
          ) {
            didResize = true
            break
          }

          balancedSpecs[candidate.index]!.colSpan -= increment
        }

        if (didResize) break
      }

      if (didResize) {
        break
      }
    }

    if (!didResize) break
  }

  return balancedSpecs
}

const fillFinalRowSpecs = (
  specs: ReadonlyArray<CompositionGridBlockSpec>,
  assets: ReadonlyArray<CompositionGridAsset>,
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
        const valueUsd = getLayoutValueUsd(asset.valueUsd)

        return {
          index,
          valueUsd,
          share: asset.share,
          canGrow:
            spec.rowSpan === 1 &&
            spec.colSpan < GAP_FILL_SINGLE_ROW_MAX_COL_SPAN &&
            (isWideSingleRowRange(valueUsd) ||
              valueUsd >= 250_000 ||
              asset.share >= 1.25),
        }
      })
      .filter(({ canGrow }) => canGrow)
      .sort((a, b) => b.valueUsd - a.valueUsd || b.share - a.share)

    const candidate = candidates.find(({ index }) => {
      filledSpecs[index]!.colSpan += 1

      const isValid =
        packCompositionGrid(filledSpecs, grid).occupied.length <= grid.maxRows

      if (!isValid) {
        filledSpecs[index]!.colSpan -= 1
      }

      return isValid
    })

    if (!candidate) break

    remainingFreeColumns = getLastRowFreeColumns(filledSpecs)
  }

  return filledSpecs
}

const getCompositionPrimaryBlockSpecsForGrid = (
  assets: ReadonlyArray<CompositionGridAsset>,
  getLayout: (
    share: number,
    options?: CompositionBlockLayoutOptions,
  ) => CompositionBlockLayout,
  grid: CompositionGridContext,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
) => {
  const baseSpecs = assets.map(({ share, symbol, valueUsd }) => {
    const { colSpan, rowSpan } = getLayout(share, {
      symbol,
      valueUsd,
    })

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

export const getCompositionPrimaryBlockSpecs = (
  assets: ReadonlyArray<CompositionGridAsset>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(
    assets,
    getCompositionBlockLayout,
    DESKTOP_GRID,
    othersShare,
  )

export const getCompositionMobilePrimaryBlockSpecs = (
  assets: ReadonlyArray<CompositionGridAsset>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(
    assets,
    getCompositionMobileBlockLayout,
    MOBILE_GRID,
    othersShare,
    getOthersCompositionMobileBlockLayout,
  )

export const getResolvedCompositionBlockLayout = (
  share: number,
  options: CompositionBlockLayoutOptions | undefined,
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  assetIndex: number,
  othersShare?: number,
): CompositionBlockLayout => {
  const layout = getCompositionBlockLayout(share, options)
  const resolvedSpecs = getCompositionPrimaryBlockSpecs(assets, othersShare)
  const resolvedSpec = resolvedSpecs[assetIndex]

  return {
    ...layout,
    colSpan: resolvedSpec?.colSpan ?? layout.colSpan,
    rowSpan: resolvedSpec?.rowSpan ?? layout.rowSpan,
  }
}

export const getResolvedCompositionMobileBlockLayout = (
  share: number,
  options: CompositionBlockLayoutOptions | undefined,
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  assetIndex: number,
  othersShare?: number,
): CompositionBlockLayout => {
  const layout = getCompositionMobileBlockLayout(share, options)
  const resolvedSpecs = getCompositionMobilePrimaryBlockSpecs(
    assets,
    othersShare,
  )
  const resolvedSpec = resolvedSpecs[assetIndex]

  return {
    ...layout,
    colSpan: resolvedSpec?.colSpan ?? layout.colSpan,
    rowSpan: resolvedSpec?.rowSpan ?? layout.rowSpan,
  }
}

const getCompositionGridBlockSpecsForGrid = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  getPrimarySpecs: typeof getCompositionPrimaryBlockSpecs,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
  grid: CompositionGridContext = DESKTOP_GRID,
) => {
  const specs = getPrimarySpecs(assets, othersShare)

  if (othersShare !== undefined && othersShare > 0) {
    const { colSpan, rowSpan } = getOthersLayout(othersShare, specs)

    specs.push({ colSpan, rowSpan })
  }

  return fillFinalRowSpecs(specs, assets, grid)
}

export const getCompositionGridBlockSpecs = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionGridBlockSpecsForGrid(
    assets,
    getCompositionPrimaryBlockSpecs,
    othersShare,
    getOthersCompositionBlockLayout,
    DESKTOP_GRID,
  )

export const getCompositionGridContext = (isMobile: boolean) =>
  isMobile ? MOBILE_GRID : DESKTOP_GRID

export const getCompositionMobileGridBlockSpecs = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionGridBlockSpecsForGrid(
    assets,
    getCompositionMobilePrimaryBlockSpecs,
    othersShare,
    getOthersCompositionMobileBlockLayout,
    MOBILE_GRID,
  )
