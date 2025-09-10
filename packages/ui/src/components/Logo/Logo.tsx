import { QuestionCircleRegular } from "@/assets/icons"
import { ImageProps } from "@/components/Image"

import { SLogo, SLogoPlaceholder } from "./Logo.styled"

export type LogoSize = "large" | "medium" | "small" | "extra-small"
export type LogoProps = ImageProps & { size?: LogoSize }

export const Logo: React.FC<LogoProps> = ({ size = "medium", ...props }) => (
  <SLogo
    size={size}
    {...props}
    placeholder={
      <SLogoPlaceholder component={QuestionCircleRegular} size={size} />
    }
  />
)
