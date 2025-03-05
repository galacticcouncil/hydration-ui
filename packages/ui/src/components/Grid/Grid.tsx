import type {
  ResponsiveStyleValue,
  ThemeUICSSProperties,
  ThemeUIEmpty,
} from "@theme-ui/css"
import { forwardRef } from "react"

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
  columnWidth?: ResponsiveStyleValue<string | number>
  columns?: ResponsiveStyleValue<string | number>
  gap?: ResponsiveStyleValue<string | number>
  repeat?: "fit" | "fill"
  justify?: ThemeUICSSProperties["justifyContent"]
  align?: ThemeUICSSProperties["alignItems"]
}

export type GridProps = GridOwnProps & BoxProps

export const Grid = forwardRef<HTMLElement, GridProps>(
  (
    {
      columnWidth,
      columns,
      gap = 0,
      repeat = "fit",
      justify,
      align,
      sx,
      ...props
    },
    ref,
  ) => {
    const gridTemplateColumns = columnWidth
      ? widthToColumns(columnWidth, repeat)
      : countToColumns(columns)

    return (
      <Box
        ref={ref}
        display="grid"
        sx={{
          gridGap: gap,
          gridTemplateColumns,
          justify,
          alignItems: align,
          ...sx,
        }}
        {...props}
      />
    )
  },
)

Grid.displayName = "Grid"
