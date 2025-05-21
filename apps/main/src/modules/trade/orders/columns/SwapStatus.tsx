import { Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export type SwapStatus =
  | { readonly type: "filled" | "canceled" }
  | { readonly type: "active" }

type Props = {
  readonly status: SwapStatus
}

export const SwapStatus: FC<Props> = ({ status }) => {
  return (
    <Text
      fw={500}
      fs={11}
      lh={px(15)}
      color={(() => {
        switch (status.type) {
          case "filled":
            return "#AAEEFC"
          case "canceled":
            return getToken("colors.utility.red.400")
          default:
            return getToken("accents.success.emphasis")
        }
      })()}
      transform="capitalize"
    >
      {status.type}
    </Text>
  )
}
