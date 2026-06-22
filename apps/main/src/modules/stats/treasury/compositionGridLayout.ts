export const COMPOSITION_GRID_COLUMNS = 12
export const COMPOSITION_GRID_COLUMNS_MOBILE = 2
export const COMPOSITION_MAX_ROWS = 5
export const COMPOSITION_MAX_ROWS_MOBILE = 9

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
const DESKTOP_WIDE_TILE_MIN_COL_SPAN = 3
const DESKTOP_WIDE_TILE_MAX_COL_SPAN = 4
const DESKTOP_WIDE_USDT_MIN_VALUE_USD = 1_000_000

const DESKTOP_WIDE_TILE_SYMBOLS = new Set(["tbtc", "susds", "2-pool-geth"])

const normalizeCompositionSymbol = (symbol?: string) =>
  symbol?.trim().toLowerCase() ?? ""

const isDesktopWideUsdt = (
  symbol?: string,
  valueUsd?: string | number | null,
) => {
  if (normalizeCompositionSymbol(symbol) !== "usdt") return false

  const value = Number(valueUsd ?? 0)

  return Number.isFinite(value) && value >= DESKTOP_WIDE_USDT_MIN_VALUE_USD
}

const isDesktopWideTile = (options?: CompositionBlockLayoutOptions) => {
  if (!options?.symbol) return false

  if (
    DESKTOP_WIDE_TILE_SYMBOLS.has(normalizeCompositionSymbol(options.symbol))
  ) {
    return true
  }

  return isDesktopWideUsdt(options.symbol, options.valueUsd)
}

const applyDesktopWideTileAdjustments = (
  layout: CompositionBlockLayout,
  options?: CompositionBlockLayoutOptions,
): CompositionBlockLayout => {
  if (!isDesktopWideTile(options)) return layout

  return {
    ...layout,
    colSpan: Math.min(
      Math.max(layout.colSpan, DESKTOP_WIDE_TILE_MIN_COL_SPAN),
      DESKTOP_WIDE_TILE_MAX_COL_SPAN,
    ),
  }
}

export const getCompositionBlockLayout = (
  share: number,
  options?: CompositionBlockLayoutOptions,
): CompositionBlockLayout => {
  let layout: CompositionBlockLayout

  if (share >= 35) {
    layout = {
      colSpan: 6,
      rowSpan: 2,
      tier: "hero",
      shareSize: "xlarge",
      logoSize: "medium",
      symbolSize: "large",
    }
  } else if (share >= 18) {
    layout = {
      colSpan: 4,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "medium",
      symbolSize: "medium",
    }
  } else if (share >= 8) {
    layout = {
      colSpan: 3,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "small",
      symbolSize: "medium",
    }
  } else if (share >= 4) {
    layout = {
      colSpan: 2,
      rowSpan: 1,
      tier: "mid",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "medium",
    }
  } else if (share >= 1.5) {
    layout = {
      colSpan: 2,
      rowSpan: 1,
      tier: "minor",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  } else if (share >= 0.5) {
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
      colSpan: 2,
      rowSpan: 1,
      tier: "dust",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  return applyDesktopWideTileAdjustments(layout, options)
}

export const getCompositionMobileBlockLayout = (
  share: number,
  _options?: CompositionBlockLayoutOptions,
): CompositionBlockLayout => {
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

  if (share >= 8) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 1,
      tier: "major",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "small",
    }
  }

  if (share >= 4) {
    return {
      colSpan: MOBILE_MIN_COL_SPAN,
      rowSpan: 1,
      tier: "mid",
      shareSize: "small",
      logoSize: "extra-small",
      symbolSize: "small",
    }
  }

  if (share >= 1.5) {
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

  for (const { colSpan, rowSpan } of blocks) {
    let placed = false

    for (let row = 0; !placed; row++) {
      for (let col = 0; col <= columns - colSpan; col++) {
        if (fits(row, col, colSpan, rowSpan)) {
          occupy(row, col, colSpan, rowSpan)
          placed = true
          break
        }
      }
    }
  }

  return occupied
}

const getFreeColsOnRow = (
  occupied: boolean[][],
  row: number,
  startCol: number,
  columns: number,
) => {
  let freeCols = 0

  for (let col = startCol; col < columns; col++) {
    if (occupied[row]?.[col]) break

    freeCols++
  }

  return freeCols
}

const fitsOccupied = (
  occupied: boolean[][],
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
  columns: number,
) => {
  if (col + colSpan > columns) return false

  for (let r = row; r < row + rowSpan; r++) {
    for (let c = col; c < col + colSpan; c++) {
      if (occupied[r]?.[c]) return false
    }
  }

  return true
}

const fitsWithinMaxRows = (
  primarySpecs: ReadonlyArray<CompositionGridBlockSpec>,
  grid: CompositionGridContext,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
) => {
  const allSpecs = [...primarySpecs]

  if (othersShare !== undefined && othersShare > 0) {
    const { colSpan, rowSpan } = getOthersLayout(othersShare, primarySpecs)

    allSpecs.push({ colSpan, rowSpan })
  }

  return estimateCompositionGridRows(allSpecs, grid) <= grid.maxRows
}

const getTileFillColSpan = (
  specs: ReadonlyArray<CompositionGridBlockSpec>,
  targetIndex: number,
  minColSpan: number,
  rowSpan: number,
  grid: CompositionGridContext,
  getStretchLimit: (freeCols: number) => number,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
) => {
  const occupiedBefore = packCompositionGrid(specs.slice(0, targetIndex), grid)

  for (let row = 0; row < grid.maxRows + 2; row++) {
    for (let col = 0; col <= grid.columns - minColSpan; col++) {
      if (
        !fitsOccupied(
          occupiedBefore,
          row,
          col,
          minColSpan,
          rowSpan,
          grid.columns,
        )
      ) {
        continue
      }

      const freeCols = getFreeColsOnRow(occupiedBefore, row, col, grid.columns)
      const stretchLimit = getStretchLimit(freeCols)

      if (stretchLimit < minColSpan) continue

      for (let span = stretchLimit; span >= minColSpan; span--) {
        const candidateSpecs = specs.map((spec, index) =>
          index === targetIndex ? { colSpan: span, rowSpan } : spec,
        )

        if (
          fitsWithinMaxRows(candidateSpecs, grid, othersShare, getOthersLayout)
        ) {
          return span
        }
      }
    }
  }

  return minColSpan
}

const applyDesktopWideTileStretchToSpecs = (
  specs: CompositionGridBlockSpec[],
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  grid: CompositionGridContext,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
) => {
  const stretchedSpecs = specs.map((spec) => ({ ...spec }))

  assets.forEach((asset, index) => {
    if (
      !isDesktopWideTile({
        symbol: asset.symbol,
        valueUsd: asset.valueUsd,
      })
    ) {
      return
    }

    const spec = stretchedSpecs[index]

    if (!spec) return

    spec.colSpan = getTileFillColSpan(
      stretchedSpecs,
      index,
      spec.colSpan,
      spec.rowSpan,
      grid,
      (freeCols) => freeCols,
      othersShare,
      getOthersLayout,
    )
  })

  return stretchedSpecs
}

export const getOthersCompositionBlockLayout = (
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
): number => packCompositionGrid(blocks, grid).length

export type CompositionGridBlockSpec = Pick<
  CompositionBlockLayout,
  "colSpan" | "rowSpan"
>

const getCompositionPrimaryBlockSpecsForGrid = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  grid: CompositionGridContext,
  getLayout: (
    share: number,
    options?: CompositionBlockLayoutOptions,
  ) => CompositionBlockLayout,
  othersShare?: number,
  getOthersLayout = getOthersCompositionBlockLayout,
  applyStretch = false,
) => {
  const baseSpecs = assets.map(({ share, symbol, valueUsd }) => {
    const { colSpan, rowSpan } = getLayout(share, {
      symbol,
      valueUsd,
    })

    return { colSpan, rowSpan }
  })

  if (!applyStretch) return baseSpecs

  return applyDesktopWideTileStretchToSpecs(
    baseSpecs,
    assets,
    grid,
    othersShare,
    getOthersLayout,
  )
}

export const getCompositionPrimaryBlockSpecs = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(
    assets,
    DESKTOP_GRID,
    getCompositionBlockLayout,
    othersShare,
    getOthersCompositionBlockLayout,
    true,
  )

export const getCompositionMobilePrimaryBlockSpecs = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(
    assets,
    MOBILE_GRID,
    getCompositionMobileBlockLayout,
    othersShare,
    getOthersCompositionMobileBlockLayout,
    false,
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
  const resolvedColSpan = resolvedSpecs[assetIndex]?.colSpan ?? layout.colSpan

  return {
    ...layout,
    colSpan: resolvedColSpan,
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
  const resolvedColSpan = resolvedSpecs[assetIndex]?.colSpan ?? layout.colSpan

  return {
    ...layout,
    colSpan: resolvedColSpan,
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
) => {
  const specs = getPrimarySpecs(assets, othersShare)

  if (othersShare !== undefined && othersShare > 0) {
    const { colSpan, rowSpan } = getOthersLayout(othersShare, specs)

    specs.push({ colSpan, rowSpan })
  }

  return specs
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
  )
