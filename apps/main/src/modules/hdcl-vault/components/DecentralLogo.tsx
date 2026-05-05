import DecentralLogoSvg from "../assets/decentral-logo.svg?react"

interface Props {
  size?: number
}

/**
 * Decentral strategy brand logo. Black circle with three white stacked rings.
 * Used as the strategy / position icon on the HDCL vault page.
 *
 * Distinct from `HdclLogo` (the token symbol — same shape, pink rings).
 * Source SVG is 133×133; scale via the `size` prop.
 */
export const DecentralLogo = ({ size = 32 }: Props) => (
  <DecentralLogoSvg width={size} height={size} style={{ flexShrink: 0 }} />
)
