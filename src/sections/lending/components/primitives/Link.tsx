import { Link as MuiLink, LinkProps as MuiLinkProps } from "@mui/material"
import { Link as RouterLink } from "@tanstack/react-location"
import { SxProps as MuiSxProps } from "@mui/system"
import * as React from "react"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"

const RouterLinkComposed = (props: MuiLinkProps) => (
  <RouterLink to={props.href} title={props.title} className={props.className}>
    {props.children}
  </RouterLink>
)

export type LinkProps = MuiLinkProps

export const Link = React.forwardRef<HTMLAnchorElement, MuiLinkProps>(
  function Link(props, ref) {
    const { className, children, sx, ...other } = props

    return (
      <MuiLink
        className={className}
        component={RouterLinkComposed}
        underline="none"
        {...other}
        sx={sx as MuiSxProps}
        ref={ref}
      >
        {children}
      </MuiLink>
    )
  },
)

export const ROUTES = {
  dashboard: "/lending",
  markets: "/lending/markets",
  staking: "/lending/staking",
  governance: "/lending/governance",
  faucet: "/lending/faucet",
  migrationTool: "/lending/v3-migration",
  dynamicRenderedProposal: (proposalId: number) =>
    `/lending/governance/v3/proposal?proposalId=${proposalId}`,
  reserveOverview: (underlyingAsset: string, marketName: CustomMarket) =>
    `/lending/reserve-overview/?underlyingAsset=${underlyingAsset}&marketName=${marketName}`,
  history: "/lending/history",
}
