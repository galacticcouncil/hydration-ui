import { Link as RouterLink } from "@tanstack/react-location"
import React, { forwardRef } from "react"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    const { className, children, href } = props

    const isExternal =
      typeof href === "string" &&
      (href.indexOf("http") === 0 || href.indexOf("mailto:") === 0)

    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    }

    return (
      <RouterLink to={href} className={className}>
        {children}
      </RouterLink>
    )
  },
)

export const ROUTES = {
  dashboard: "/borrow",
  markets: "/borrow/markets",
  faucet: "/borrow/faucet",
  migrationTool: "/borrow/v3-migration",
  dynamicRenderedProposal: (proposalId: number) =>
    `/borrow/governance/v3/proposal?proposalId=${proposalId}`,
  reserveOverview: (underlyingAsset: string, marketName: CustomMarket) =>
    `/borrow/markets/${underlyingAsset}?marketName=${marketName}`,
  history: "/borrow/history",
}
