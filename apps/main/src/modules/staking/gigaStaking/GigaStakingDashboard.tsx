import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { Flex } from "@galacticcouncil/ui/components"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { GigaHDXDescription } from "@/modules/staking/gigaStaking/GigaHDXDescription"
import { GigaHDXPosition } from "@/modules/staking/gigaStaking/GigaHDXPosition"
import { GigaStake } from "@/modules/staking/gigaStaking/GigaStake"
import { GigaStakingMigration } from "@/modules/staking/gigaStaking/GigaStakingMigration"
import { UnstakingPositions } from "@/modules/staking/gigaStaking/UnstakingPositions"
import { useAccountBalances } from "@/states/account"

export const GigaStakingDashboard = () => {
  const { getTransferableBalance } = useAccountBalances()
  const gigaHdxBalance = getTransferableBalance(HDX_ERC20_ASSET_ID)

  return (
    <TwoColumnGrid template="sidebar">
      {gigaHdxBalance > 0n ? <GigaHDXPosition /> : <GigaHDXDescription />}

      <Flex direction="column" gap="xl">
        <GigaStakingMigration />
        <GigaStake />
        <UnstakingPositions />
      </Flex>
    </TwoColumnGrid>
  )
}
