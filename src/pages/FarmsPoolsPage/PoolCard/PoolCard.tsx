import { FC, useState } from "react"
import { ActionButtons } from "./mainContent/ActionButtons/ActionButtons"
import { FarmingIncentives } from "./mainContent/FarmingIncentives/FarmingIncentives"
import { CardWrapper } from "./PoolCard.styled"
import { ClaimFarmsFooter } from "./ClaimFarmsFooter/ClaimFarmsFooter"
import { Box } from "components/Box/Box"
import { PoolDetails } from "./mainContent/PoolDetails/PoolDetails"
import { LiquidityShares } from "./LiquidityShares/LiquidityShares"
import { Input } from "components/Input/Input"

type PoolCardProps = {
  hasJoinedFarms: boolean
  hasLiquidity: boolean
}

export const PoolCard: FC<PoolCardProps> = ({
  hasJoinedFarms,
  hasLiquidity,
}) => {
  const [openCard, setOpenCard] = useState(false)

  return (
    <CardWrapper onClick={() => setOpenCard(prev => !prev)}>
      <Box width={250} p={30}>
        <Input width={150} />
      </Box>
      <Box flex spread p={"22px 26px 0"} gap={10}>
        <PoolDetails />
        <FarmingIncentives />
        <ActionButtons
          hasJoinedFarms={hasJoinedFarms}
          closeCard={() => setOpenCard(false)}
        />
      </Box>
      {hasLiquidity && <LiquidityShares />}
      {hasJoinedFarms && <ClaimFarmsFooter />}
    </CardWrapper>
  )
}
