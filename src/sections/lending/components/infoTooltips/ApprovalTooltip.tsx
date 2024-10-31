import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { Link } from "sections/lending/components/primitives/Link"

export const ApprovalTooltip = () => {
  return (
    <InfoTooltip
      text={
        <Text>
          To continue, you need to grant Hydration smart contracts permission to
          move your funds from your wallet. Depending on the asset and wallet
          you use, it is done by signing the permission message (gas free), or
          by submitting an approval transaction (requires gas).{" "}
          <Link
            href="https://eips.ethereum.org/EIPS/eip-2612"
            css={{ textDecoration: "underline" }}
          >
            Learn more
          </Link>
        </Text>
      }
    />
  )
}
