import { Paper, PaperProps } from "@galacticcouncil/ui/components"

export type TablePaperProps = PaperProps & {
  isTransparent?: boolean
}

export const TablePaper: React.FC<TablePaperProps> = ({
  isTransparent,
  ...props
}) => {
  return (
    <Paper
      {...props}
      sx={{
        background: isTransparent ? "transparent" : undefined,
        overflow: "hidden",
      }}
    />
  )
}
