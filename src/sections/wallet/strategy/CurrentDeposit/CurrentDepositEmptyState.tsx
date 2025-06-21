import { Text } from "components/Typography/Text/Text"
import { FC } from "react"

type Props = {
  readonly emptyState: string
}

export const CurrentDepositEmptyState: FC<Props> = ({ emptyState }) => {
  return (
    <Text fs={[13, 14]} lh={["1.3", "1.4"]} color="basic100">
      {emptyState}
    </Text>
  )
}
