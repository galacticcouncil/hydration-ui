import { type LogoSize } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

import { AssetLogo } from "@/components/AssetLogo"

const SPinkAccent = styled("span")(css`
  display: inline-flex;
  line-height: 0;
  filter: invert(1) sepia(1) saturate(3) hue-rotate(260deg) brightness(1);
`)

type Props = {
  id: string
  size?: LogoSize
}

export const PropellerAssetLogo = ({ id, size = "medium" }: Props) => (
  <SPinkAccent>
    <AssetLogo id={id} size={size} hideChain />
  </SPinkAccent>
)
