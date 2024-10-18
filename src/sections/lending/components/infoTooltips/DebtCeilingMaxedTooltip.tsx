import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Link } from "sections/lending/components/primitives/Link"
import { Text } from "components/Typography/Text/Text"

type DebtCeilingMaxedTooltipProps = {
  debtCeiling: AssetCapData
}

export const DebtCeilingMaxedTooltip = ({
  debtCeiling,
}: DebtCeilingMaxedTooltipProps) => {
  if (!debtCeiling || !debtCeiling.isMaxed) return null

  return (
    <InfoTooltip
      text={
        <Text>
          <span>
            Protocol debt ceiling is at 100% for this asset. Futher borrowing
            against this asset is unavailable.
          </span>{" "}
          <Link
            href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
            underline="always"
          >
            <span>Learn more</span>
          </Link>
        </Text>
      }
    />
  )
}
