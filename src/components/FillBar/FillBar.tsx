import { FC } from "react"
import { SBar, SFill } from "components/FillBar/FillBar.styled"

type Props = { percentage: number }

export const FillBar: FC<Props> = ({ percentage }) => {
  return (
    <SBar>
      <SFill percentage={percentage} />
    </SBar>
  )
}
