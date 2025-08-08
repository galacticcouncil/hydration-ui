import { Stack, StackProps } from "@galacticcouncil/ui/components"
import { ReactNode } from "react"

import { RowModel, SummaryRow } from "./SummaryRow"

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
        description={row.description}
        content={row.content}
        loading={row.loading}
      />
    )) ?? children}
  </Stack>
)
