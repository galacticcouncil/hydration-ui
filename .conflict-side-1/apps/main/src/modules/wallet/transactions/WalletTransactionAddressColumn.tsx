import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { px } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"

type Props = {
  readonly children: string
}

export const WalletTransactionAddressColumn = ({ children }: Props) => {
  return (
    <Text fw={500} fs={13} lh={px(18)} color={getToken("text.medium")}>
      {shortenAccountAddress(children)}
    </Text>
  )
}
