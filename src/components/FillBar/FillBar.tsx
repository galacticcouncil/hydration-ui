import { FC } from "react"
import { StyledBar, StyledFill } from "components/FillBar/FillBar.styled"

type Props = { percentage: number }

export const FillBar: FC<Props> = ({ percentage }) => {
  return (
    <StyledBar>
      <StyledFill percentage={percentage} />
    </StyledBar>
  )
}
