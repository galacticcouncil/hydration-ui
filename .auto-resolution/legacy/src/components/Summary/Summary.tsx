import { RowModel, SummaryRow } from "./SummaryRow"

type SummaryProps = {
  rows: RowModel[]
}

export const Summary = ({ rows }: SummaryProps) => (
  <div>
    {rows.map((row, i) => (
      <SummaryRow
        key={`${row.label}_${i}`}
        label={row.label}
        content={row.content}
        withSeparator
      />
    ))}
  </div>
)
