import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { Flex } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { GigaAction } from "@/modules/staking/gigaStaking/GigaAction"
import { GigaHDXDescription } from "@/modules/staking/gigaStaking/GigaHDXDescription"
import { GigaHDXPosition } from "@/modules/staking/gigaStaking/GigaHDXPosition"
import { PendingPositions } from "@/modules/staking/gigaStaking/pendingPositions/PendingPositions"
import { useAccountBalances } from "@/states/account"

export const GigaStakingDashboard = () => {
  const { getTransferableBalance } = useAccountBalances()
  const { account } = useAccount()
  const gigaHdxBalance = getTransferableBalance(HDX_ERC20_ASSET_ID)

  const address = account?.address ?? ""

  return (
    <TwoColumnGrid template="sidebar">
      {gigaHdxBalance > 0n ? <GigaHDXPosition /> : <GigaHDXDescription />}

      <Flex direction="column" gap="xl">
        <GigaAction key={address} />
        <PendingPositions />
      </Flex>
    </TwoColumnGrid>
  )
}
