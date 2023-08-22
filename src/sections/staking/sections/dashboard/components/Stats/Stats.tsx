import { SContainer } from "sections/staking/StakingPage.styled"
import { StakingValues } from "./Values/StakingValues"
import { PieChart } from "sections/staking/sections/dashboard/components/PieChart/PieChart"
import { useAccountStore } from "state/store"
import { TStakingData } from "sections/staking/StakingPage.utils"

export const Stats = ({
  loading,
  data,
}: {
  loading?: boolean
  data?: TStakingData
}) => {
  const { account } = useAccountStore()

  return (
    <SContainer sx={{ p: [24, 40] }}>
      <div
        sx={{
          flex: "column",
          justify: "space-between",
          gap: 40,
        }}
      >
        <div css={{ alignSelf: "center" }}>
          <PieChart
            percentage={data?.supplyStaked?.toNumber() ?? 0}
            circulatigSupply={data?.circulatingSupply.toNumber() ?? 0}
            loading={!!loading}
          />
        </div>

        {account && data && (
          <StakingValues
            loading={!!loading}
            data={data}
            isStakingPosition={!!data?.stakePosition}
          />
        )}
      </div>
    </SContainer>
  )
}
