import { Grid, GridProps } from "@galacticcouncil/ui/components/Grid"

export type TwoColumnGridProps = Omit<
  GridProps,
  "columnTemplate" | "rowTemplate"
> & {
  children: React.ReactNode
  template?: "default" | "sidebar"
}

export const TwoColumnGrid: React.FC<TwoColumnGridProps> = ({
  children,
  template = "default",
  align = "start",
  gap = "xl",
  ...props
}) => {
  const columnTemplate =
    template === "default"
      ? [null, null, "repeat(2, 1fr)"]
      : [
          null,
          null,
          "minmax(24rem, 1fr) minmax(0, 25rem)",
          "minmax(30rem, 1fr) minmax(0, 27rem)",
        ]

  return (
    <Grid
      columnTemplate={columnTemplate}
      rowTemplate="auto auto"
      align={align}
      gap={gap}
      {...props}
    >
      {children}
    </Grid>
  )
}
