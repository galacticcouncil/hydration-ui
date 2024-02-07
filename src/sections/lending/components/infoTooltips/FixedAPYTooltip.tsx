import { Link } from "sections/lending/components/primitives/Link"
import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

type FixedToolTipProps = TextWithTooltipProps

export const FixedAPYTooltipText = (
  <span>
    Interest rate that is determined by Aave Governance. This rate may be
    changed over time depending on the need for the GHO supply to
    contract/expand.{" "}
    <Link
      href="https://docs.gho.xyz/concepts/how-gho-works/interest-rate-discount-model#interest-rate-model"
      underline="always"
    >
      <span>Learn more</span>
    </Link>
  </span>
)

export const FixedAPYTooltip = (props: FixedToolTipProps) => {
  return <TextWithTooltip {...props}>{FixedAPYTooltipText}</TextWithTooltip>
}
