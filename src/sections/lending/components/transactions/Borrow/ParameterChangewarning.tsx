import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"

export const ParameterChangewarning = ({
  underlyingAsset,
}: {
  underlyingAsset: string
}) => {
  return (
    <Alert variant="info" sx={{ my: 24 }}>
      <Text fs={13}>
        Attention: Parameter changes via governance can alter your account
        health factor and risk of liquidation.
      </Text>
    </Alert>
  )
}
