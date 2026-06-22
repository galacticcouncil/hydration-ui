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

export const getCompositionBlockLayout = (
  share: number,
  options?: CompositionBlockLayoutOptions,
): CompositionBlockLayout => {
  let layout: CompositionBlockLayout
  const valueUsd = getLayoutValueUsd(options?.valueUsd)

  if (share >= 35) {
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
      colSpan: 5,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "medium",
      symbolSize: "medium",
    }
  } else if (share >= 12) {
    layout = {
      colSpan: 4,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "medium",
      symbolSize: "medium",
    }
  } else if (share >= 6) {
    layout = {
      colSpan: 3,
      rowSpan: 2,
      tier: "major",
      shareSize: "large",
      logoSize: "small",
      symbolSize: "medium",
    }
  } else if (share >= 3) {
    layout = {
      colSpan: 3,
      rowSpan: 1,
      tier: "mid",
      shareSize: "medium",
      logoSize: "small",
      symbolSize: "medium",
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
  } else if (share >= 1) {
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

  if (isCompositionRange(share, valueUsd, 1, 250_000)) {
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
  getLayout: (
    share: number,
    options?: CompositionBlockLayoutOptions,
  ) => CompositionBlockLayout,
) => {
  const baseSpecs = assets.map(({ share, symbol, valueUsd }) => {
    const { colSpan, rowSpan } = getLayout(share, {
      symbol,
      valueUsd,
    })

    return { colSpan, rowSpan }
  })

  return baseSpecs
}

export const getCompositionPrimaryBlockSpecs = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  _othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(assets, getCompositionBlockLayout)

export const getCompositionMobilePrimaryBlockSpecs = (
  assets: ReadonlyArray<{
    share: number
    symbol?: string
    valueUsd?: string | number | null
  }>,
  _othersShare?: number,
): CompositionGridBlockSpec[] =>
  getCompositionPrimaryBlockSpecsForGrid(
    assets,
    getCompositionMobileBlockLayout,
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
