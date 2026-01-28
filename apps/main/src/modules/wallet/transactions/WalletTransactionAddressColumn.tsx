import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"

type Props = {
  readonly children: string
}

export const WalletTransactionAddressColumn = ({ children }: Props) => {
  return (
    <Text fw={500} fs="p4" lh="m" color={getToken("text.medium")}>
      {shortenAccountAddress(children)}
    </Text>
  )
}
