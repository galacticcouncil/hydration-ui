import { Trans } from "@lingui/macro"
import { AlertProps } from "@mui/material"
import { AssetCapData } from "sections/lending/hooks/useAssetCaps"

import { Link } from "sections/lending/components/primitives/Link"
import { Warning } from "sections/lending/components/primitives/Warning"

type BorrowCapWarningProps = AlertProps & {
  borrowCap: AssetCapData
  icon?: boolean
}

export const BorrowCapWarning = ({
  borrowCap,
  icon = true,
  ...rest
}: BorrowCapWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!borrowCap.percentUsed || borrowCap.percentUsed < 98) return null

  const severity = "warning"

  const renderText = () => {
    return borrowCap.isMaxed ? (
      <span>
        Protocol borrow cap is at 100% for this asset. Further borrowing
        unavailable.
      </span>
    ) : (
      <span>
        Maximum amount available to borrow is limited because protocol borrow
        cap is nearly reached.
      </span>
    )
  }

  return (
    <Warning severity={severity} icon={icon} {...rest}>
      {renderText()}{" "}
      <Link
        href="https://docs.aave.com/developers/whats-new/supply-borrow-caps"
        underline="always"
      >
        <span>Learn more</span>
      </Link>
    </Warning>
  )
}
