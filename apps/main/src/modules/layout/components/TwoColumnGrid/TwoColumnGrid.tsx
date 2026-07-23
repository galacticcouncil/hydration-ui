import { Grid, GridProps } from "@galacticcouncil/ui/components/Grid"

export type TwoColumnGridProps = Omit<
  GridProps,
  "columnTemplate" | "rowTemplate"
> & {
  children: React.ReactNode
  template?: "default" | "sidebar" | "sidebar-left"
}

const getColumnTemplate = (template: TwoColumnGridProps["template"]) => {
  switch (template) {
    case "sidebar":
      return [
        null,
        null,
        "minmax(24rem, 1fr) minmax(0, 25rem)",
        "minmax(30rem, 1fr) minmax(0, 27rem)",
      ]
    case "sidebar-left":
      return [
        null,
        null,
        "minmax(0, 25rem) minmax(24rem, 1fr)",
        "minmax(0, 27rem) minmax(30rem, 1fr)",
      ]
    default:
      return [null, null, "repeat(2, 1fr)"]
  }
}

export const TwoColumnGrid: React.FC<TwoColumnGridProps> = ({
  children,
  template = "default",
  align = "start",
  gap = "xl",
  ...props
}) => {
  return (
    <Grid
      columnTemplate={getColumnTemplate(template)}
      rowTemplate="auto auto"
      align={align}
      gap={gap}
      {...props}
    >
      {children}
    </Grid>
  )
}
