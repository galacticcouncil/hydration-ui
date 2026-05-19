import HdclLogoSvg from "@/modules/hdcl-vault/assets/hdcl-logo.svg?react"

interface Props {
  size?: number
}

/**
 * HDCL token logo. Black circle with three pink stacked rings.
 * Source SVG is 27×27; scale via the `size` prop.
 */
export const HdclLogo = ({ size = 24 }: Props) => (
  <HdclLogoSvg width={size} height={size} style={{ flexShrink: 0 }} />
)
