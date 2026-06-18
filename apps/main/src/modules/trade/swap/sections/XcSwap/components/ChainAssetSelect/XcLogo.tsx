import { Logo, LogoProps } from "@galacticcouncil/ui/components/Logo"

export const XcLogo: React.FC<LogoProps> = ({ size = "medium", ...props }) => (
  <Logo size={size} {...props} />
)
