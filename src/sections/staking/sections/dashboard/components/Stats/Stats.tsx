import { SContainer } from "sections/staking/StakingPage.styled"
import { StakingValues } from "./Values/StakingValues"
import { PieChart } from "../PieChart/PieChart"

export const Stats = ({
  isConnected,
  loading,
}: {
  isConnected: boolean
  loading?: boolean
}) => {
  const hasStakingPos = true && isConnected

  return (
    <SContainer sx={{ p: [24, 40] }}>
      <div
        sx={{
          flex: hasStakingPos ? "column" : ["column", "row"],
          align: "center",
          justify: "space-between",
          gap: 40,
        }}
      >
        <PieChart percentage={60.5} loading={!!loading} />

        <StakingValues
          loading={!!loading}
          data={null}
          isStakingPosition={hasStakingPos}
        />
      </div>
    </SContainer>
  )
}
