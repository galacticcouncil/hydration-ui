import { SContainer } from "sections/staking/StakingPage.styled"
import { PieChart } from "./PieChart/PieChart"
import { StakingValues } from "./Values/StakingValues"

export const Stats = ({ isConnected }: { isConnected: boolean }) => {
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
        <PieChart percentage={60.5} />

        <StakingValues
          loading={false}
          data={null}
          isStakingPosition={hasStakingPos}
        />
      </div>
    </SContainer>
  )
}
