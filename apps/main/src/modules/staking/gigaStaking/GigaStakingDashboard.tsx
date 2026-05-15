import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"

import { GigaHDXDescription } from "@/modules/staking/gigaStaking/GigaHDXDescription"
import { GigaHDXPosition } from "@/modules/staking/gigaStaking/GigaHDXPosition"
import { useAccountBalances } from "@/states/account"

export const GigaStakingDashboard = () => {
  const { getTransferableBalance } = useAccountBalances()

  const gigaHdxBalance = getTransferableBalance(HDX_ERC20_ASSET_ID)

  return gigaHdxBalance > 0n ? <GigaHDXPosition /> : <GigaHDXDescription />
}
