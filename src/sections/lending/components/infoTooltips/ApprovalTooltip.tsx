import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"

export const ApprovalTooltip = () => {
  return (
    <InfoTooltip
      text={
        <Text fs={12}>
          To continue, you need to grant Hydration smart contracts permission to
          move your funds from your wallet. Depending on the asset and wallet
          you use, it is done by signing the permission message (gas free), or
          by submitting an approval transaction (requires gas).
        </Text>
      }
    />
  )
}
