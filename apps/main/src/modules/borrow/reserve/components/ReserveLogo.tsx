import { AssetLogoProps } from "@galacticcouncil/ui/components"
import {
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
  GSOL_ASSET_ID,
  GSOL_ERC20_ID,
} from "@galacticcouncil/utils"

import { AssetLogo } from "@/components/AssetLogo"

const RESERVE_LOGO_OVERRIDE_MAP: Record<string, string> = {
  [GDOT_ASSET_ID]: GDOT_ERC20_ID,
  [GETH_ASSET_ID]: GETH_ERC20_ID,
  [GSOL_ASSET_ID]: GSOL_ERC20_ID,
}

type ReserveLogoProps = {
  id: string
  size?: AssetLogoProps["size"]
  className?: string
}

export const ReserveLogo: React.FC<ReserveLogoProps> = ({ id, ...props }) => (
  <AssetLogo id={RESERVE_LOGO_OVERRIDE_MAP[id] ?? id} {...props} />
)
