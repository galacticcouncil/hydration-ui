import { FC } from "react"
import { SBar, SFill } from "components/FillBar/FillBar.styled"

export type FillBarVariant = "primary" | "secondary"

type Props = { percentage: number; variant?: FillBarVariant }

export const FillBar: FC<Props> = ({ percentage, variant = "primary" }) => {
  return (
    <SBar>
      <SFill percentage={percentage} variant={variant} />
    </SBar>
  )
}
