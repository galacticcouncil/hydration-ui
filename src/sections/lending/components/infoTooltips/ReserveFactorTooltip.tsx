import { Link } from "sections/lending/components/primitives/Link"
import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

interface ReserveFactorTooltipProps extends TextWithTooltipProps {
  collectorLink?: string
}

export const ReserveFactorTooltip = ({
  collectorLink,
  ...rest
}: ReserveFactorTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Reserve factor is a percentage of interest which goes to a{" "}
        {collectorLink ? (
          <Link href={collectorLink}>collector contract</Link>
        ) : (
          "collector contract"
        )}{" "}
        that is controlled by Aave governance to promote ecosystem growth.{" "}
      </span>
    </TextWithTooltip>
  )
}
