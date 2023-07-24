import { SContainer } from "sections/staking/StakingPage.styled"
import { StakingValues } from "./Values/StakingValues"
import { PieChart } from "../PieChart/PieChart"
import { useAccountStore } from "state/store"
import { TStakingData } from "api/staking"

export const Stats = ({
  loading,
  data,
}: {
  loading?: boolean
  data?: TStakingData
}) => {
  const { account } = useAccountStore()
  const hasStakingPos = !!data?.stakingPosition

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

        {account && (
          <StakingValues
            loading={!!loading}
            data={data}
            isStakingPosition={hasStakingPos}
          />
        )}
      </div>
    </SContainer>
  )
}
