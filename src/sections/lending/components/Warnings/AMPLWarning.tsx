import { Trans } from "@lingui/macro"

import { Link } from "sections/lending/components/primitives/Link"

export const AMPLWarning = () => {
  return (
    <span>
      <b>Ampleforth</b> is a rebasing asset. Visit the{" "}
      <Link
        href="https://docs.aave.com/developers/v/2.0/guides/ampl-asset-listing"
        underline="always"
      >
        <span>documentation</span>
      </Link>{" "}
      to learn more.
    </span>
  )
}
