import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { Link } from "sections/lending/components/primitives/Link"
import { AssetCapData } from "sections/lending/hooks/useAssetCaps"

type BorrowCapMaxedTooltipProps = {
  borrowCap: AssetCapData
}

export const BorrowCapMaxedTooltip = ({
  borrowCap,
}: BorrowCapMaxedTooltipProps) => {
  if (!borrowCap || !borrowCap.isMaxed) return null

  return (
    <InfoTooltip
      text={
        <Text>
          <span>
            Protocol borrow cap at 100% for this asset. Further borrowing
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
