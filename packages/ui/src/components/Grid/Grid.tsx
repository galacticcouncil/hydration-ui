import type {
  ResponsiveStyleValue,
  ThemeUICSSProperties,
  ThemeUIEmpty,
} from "@theme-ui/css"
import { FC, Ref } from "react"

import { Box, BoxProps } from "@/components/Box"
import { px } from "@/utils"

const singleWidthToColumns = (
  width: string | number | ThemeUIEmpty,
  repeat: "fit" | "fill",
) => (width ? `repeat(auto-${repeat}, minmax(${px(width)}, 1fr))` : null)

const widthToColumns = (
  width: GridProps["columnWidth"],
  repeat: "fit" | "fill",
) =>
  Array.isArray(width)
    ? width.map((w) => singleWidthToColumns(w, repeat))
    : singleWidthToColumns(width, repeat)

const singleCountToColumns = (n: number | string | ThemeUIEmpty) =>
  n ? (typeof n === "number" ? `repeat(${n}, 1fr)` : n) : null

const countToColumns = (n: ResponsiveStyleValue<string | number>) =>
  Array.isArray(n) ? n.map(singleCountToColumns) : singleCountToColumns(n)

type GridOwnProps = {
  gap?: ThemeUICSSProperties["gap"]
  columnGap?: ThemeUICSSProperties["columnGap"]
  rowGap?: ThemeUICSSProperties["rowGap"]
  repeat?: "fit" | "fill"
  justify?: ThemeUICSSProperties["justifyContent"]
  justifyItems?: ThemeUICSSProperties["justifyItems"]
  align?: ThemeUICSSProperties["alignItems"]
  columns?: ResponsiveStyleValue<string | number>
  columnWidth?: ResponsiveStyleValue<string | number>
  columnTemplate?: ThemeUICSSProperties["gridTemplateColumns"]
  rowTemplate?: ThemeUICSSProperties["gridTemplateRows"]
}

export type GridProps = GridOwnProps & BoxProps

export const Grid: FC<GridProps & { ref?: Ref<HTMLElement> }> = ({
  columns,
  columnWidth,
  columnTemplate = "auto",
  rowTemplate = "auto",
  gap = 0,
  columnGap = 0,
  rowGap = 0,
  repeat = "fit",
  justify,
  justifyItems,
  align,
  sx,
  ref,
  ...props
}) => {
  const gridTemplateColumns = columnWidth
    ? widthToColumns(columnWidth, repeat)
    : columns
      ? countToColumns(columns)
      : columnTemplate

  const gapProps = gap ? { gap } : { columnGap, rowGap }

  return (
    <Box
      ref={ref}
      display="grid"
      sx={{
        gridTemplateColumns,
        gridTemplateRows: rowTemplate,
        justify,
        justifyItems,
        alignItems: align,
        ...gapProps,
        ...sx,
      }}
      {...props}
    />
  )
}
