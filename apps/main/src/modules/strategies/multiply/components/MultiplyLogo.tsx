import { Image, LOGO_SIZES, LogoSize } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

import looperLogo from "./LooperLogo.svg"

// an <img>, not inline SVG, so the logo's gradient ids can't collide on a page
export const MultiplyLogo = ({ size = "medium" }: { size?: LogoSize }) => {
  const px = pxToRem(LOGO_SIZES[size])

  return (
    <Image
      src={looperLogo}
      alt=""
      lazy={false}
      style={{ width: px, height: px, flex: "none" }}
    />
  )
}
