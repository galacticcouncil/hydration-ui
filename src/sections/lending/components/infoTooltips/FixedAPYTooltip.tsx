import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { GHO_SYMBOL } from "sections/lending/utils/ghoUtilities"

export const FixedAPYTooltip = () => {
  return (
    <InfoTooltip
      text={
        <Text fs={12}>
          This rate may be changed over time depending on the need for the{" "}
          {GHO_SYMBOL} supply to contract/expand.
        </Text>
      }
    />
  )
}
