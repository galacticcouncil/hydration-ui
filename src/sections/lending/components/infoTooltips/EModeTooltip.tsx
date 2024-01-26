import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const EModeTooltip = ({
  eModeLtv,
  ...rest
}: TextWithTooltipProps & { eModeLtv: number }) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        E-Mode increases your LTV for a selected category of assets up to
        <FormattedNumber
          value={Number(eModeLtv) / 10000}
          percent
          variant="secondary12"
          color="text.secondary"
        />
        .{" "}
        <Link
          href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
          sx={{ textDecoration: "underline" }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </span>
    </TextWithTooltip>
  )
}
