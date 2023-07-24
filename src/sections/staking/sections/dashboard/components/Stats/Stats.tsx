import { SContainer } from "sections/staking/StakingPage.styled"
import { StakingValues } from "./Values/StakingValues"
import { PieChart } from "../PieChart/PieChart"
import { useAccountStore } from "state/store"

export const Stats = ({
  isConnected,
  loading,
}: {
  isConnected: boolean
  loading?: boolean
}) => {
  const { account } = useAccountStore()
  const hasStakingPos = true && isConnected

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
          <PieChart percentage={60.5} loading={!!loading} />
        </div>

        {account && (
          <StakingValues
            loading={!!loading}
            data={null}
            isStakingPosition={hasStakingPos}
          />
        )}
      </div>
    </SContainer>
  )
}
