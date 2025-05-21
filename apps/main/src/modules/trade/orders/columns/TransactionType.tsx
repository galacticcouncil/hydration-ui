import { Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export type TransactionType = "buy" | "sell"

type Props = {
  readonly type: TransactionType
}

export const TransactionType: FC<Props> = ({ type }) => {
  return (
    <Text
      fw={500}
      fs={12}
      lh={px(15)}
      color={
        type === "buy"
          ? getToken("accents.success.emphasis")
          : getToken("alarm-red.500")
      }
      transform="capitalize"
    >
      {type}
    </Text>
  )
}
