import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { Link } from "sections/lending/components/primitives/Link"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"

type SupplyCapMaxedTooltipProps = {
  supplyCap: AssetCapData
}

export const SupplyCapMaxedTooltip = ({
  supplyCap,
}: SupplyCapMaxedTooltipProps) => {
  if (!supplyCap || !supplyCap.isMaxed) return null

  return (
    <InfoTooltip
      text={
        <Text>
          <span>
            Protocol supply cap at 100% for this asset. Further supply
            unavailable.
          </span>{" "}
          <Link
            href="https://docs.aave.com/developers/whats-new/supply-borrow-caps"
            underline="always"
          >
            <span>Learn more</span>
          </Link>
        </Text>
      }
    />
  )
}
