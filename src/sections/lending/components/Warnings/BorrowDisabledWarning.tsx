import { getFrozenProposalLink } from "sections/lending/components/infoTooltips/FrozenTooltip"
import { Link } from "sections/lending/components/primitives/Link"

interface BorrowDisabledWarningProps {
  symbol: string
  currentMarket: string
}
export const BorrowDisabledWarning = ({
  symbol,
  currentMarket,
}: BorrowDisabledWarningProps) => {
  return (
    <span>
      Borrowing is disabled due to an Hydration community decision.{" "}
      <Link
        href={getFrozenProposalLink(symbol, currentMarket)}
        css={{ textDecoration: "underline" }}
      >
        <span>More details</span>
      </Link>
    </span>
  )
}
