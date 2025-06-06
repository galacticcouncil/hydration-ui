import { AssetLogo, AssetLogoProps } from "@galacticcouncil/ui/components"

const BASE_URL =
  "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets"

export type TokenIconProps = AssetLogoProps & {
  id: string
}

export const TokenIcon: React.FC<TokenIconProps> = ({ id, ...props }) => {
  const src = `${BASE_URL}/${id}/icon.svg`
  return <AssetLogo src={src} {...props} />
}
