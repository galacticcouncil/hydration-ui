import { Grid, GridProps } from "@galacticcouncil/ui/components/Grid"

export type TwoColumnGridProps = Omit<
  GridProps,
  "columnTemplate" | "rowTemplate"
> & {
  children: React.ReactNode
  template?: "default" | "sidebar"
  breakpoint?: "md" | "lg"
}

const templates = {
  default: ["repeat(2, 1fr)"],
  sidebar: [
    "minmax(24rem, 1fr) minmax(0, 25rem)",
    "minmax(30rem, 1fr) minmax(0, 27rem)",
  ],
}

export const TwoColumnGrid: React.FC<TwoColumnGridProps> = ({
  children,
  template = "default",
  breakpoint = "md",
  align = "start",
  gap = "xl",
  ...props
}) => {
  const [md, lg = md] = templates[template]

  return (
    <Grid
      columnTemplate={[null, null, breakpoint === "md" ? md : null, lg]}
      rowTemplate="auto auto"
      align={align}
      gap={gap}
      {...props}
    >
      {children}
    </Grid>
  )
}
