import { Link as MuiLink, LinkProps as MuiLinkProps } from "@mui/material"
import * as React from "react"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"

// Add support for the sx prop for consistency with the other branches.

export type LinkProps = MuiLinkProps

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
export const Link = React.forwardRef<HTMLAnchorElement, MuiLinkProps>(
  function Link(props, ref) {
    const { className, children, ...other } = props

    return (
      <MuiLink className={className} underline="none" {...other} ref={ref}>
        {children}
      </MuiLink>
    )
  },
)

export const ROUTES = {
  dashboard: "/",
  markets: "/markets",
  staking: "/staking",
  governance: "/governance",
  faucet: "/faucet",
  migrationTool: "/v3-migration",
  dynamicRenderedProposal: (proposalId: number) =>
    `/governance/v3/proposal?proposalId=${proposalId}`,
  reserveOverview: (underlyingAsset: string, marketName: CustomMarket) =>
    `/reserve-overview/?underlyingAsset=${underlyingAsset}&marketName=${marketName}`,
  history: "/history",
}
