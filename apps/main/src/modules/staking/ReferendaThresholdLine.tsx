import { Box } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

type Props = {
  readonly percentage: number
  readonly voted: boolean
  readonly className?: string
}

export const ReferendaThresholdLine: FC<Props> = ({
  percentage,
  voted,
  className,
}) => {
  return (
    <Box
      position="absolute"
      left={`${percentage}%`}
      bg={voted ? getToken("text.medium") : getToken("text.tint.primary")}
      width={1}
      height={32}
      className={className}
    />
  )
}
