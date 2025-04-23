import { ResponsiveValue } from "utils/responsive"
import { Gradient, SSpinnerContainer } from "./Spinner.styled"

export const Spinner = ({
  size = 34,
  className,
}: {
  size?: ResponsiveValue<number>
  className?: string
}) => {
  return (
    <SSpinnerContainer size={size} className={className}>
      <Gradient />
    </SSpinnerContainer>
  )
}
