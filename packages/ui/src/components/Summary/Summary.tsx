import { Stack, StackProps } from "@galacticcouncil/ui/components"

import { RowModel, SummaryRow } from "./SummaryRow"
import { ReactNode } from "react"

type ContentProps =
  | {
      readonly rows: ReadonlyArray<RowModel>
      readonly children?: never
    }
  | {
      readonly children: ReactNode
      readonly rows?: never
    }

type SummaryProps = Omit<StackProps, "children"> & ContentProps

export const Summary = ({
  rows,
  children,
  separated = true,
  ...props
}: SummaryProps) => (
  <Stack separated={separated} {...props}>
    {rows?.map((row, i) => (
      <SummaryRow
        key={`${row.label}_${i}`}
        label={row.label}
        content={row.content}
      />
    )) ?? children}
  </Stack>
)
