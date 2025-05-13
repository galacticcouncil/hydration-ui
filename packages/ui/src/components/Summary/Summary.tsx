import { Stack, StackProps } from "@galacticcouncil/ui/components"

import { RowModel, SummaryRow } from "./SummaryRow"

type SummaryProps = Omit<StackProps, "children"> & {
  rows: RowModel[]
}

export const Summary = ({ rows, separated = true, ...props }: SummaryProps) => (
  <Stack separated={separated} {...props}>
    {rows.map((row, i) => (
      <SummaryRow
        key={`${row.label}_${i}`}
        label={row.label}
        content={row.content}
      />
    ))}
  </Stack>
)
