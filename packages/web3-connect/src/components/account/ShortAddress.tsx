import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  parseNearAccountName,
  shortenAccountAddress,
} from "@galacticcouncil/utils"

type Props = {
  readonly address: string
  readonly length?: number
}

export const ShortAddress: React.FC<Props> = ({ address, length }) => {
  if (parseNearAccountName(address)) return <>{address}</>

  const value = length ? shortenAccountAddress(address, length) : address
  return (
    <>
      {value.slice(0, -3)}
      <Text
        as="span"
        color={getToken("text.high")}
        sx={{ fontFamily: "inherit" }}
      >
        {value.slice(-3)}
      </Text>
    </>
  )
}
