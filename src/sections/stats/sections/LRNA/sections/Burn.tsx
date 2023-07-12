import { PieChart } from "../components/PieChart/PieChart"
import { ReactComponent as StakingRewardIcon } from "assets/icons/StakingRewardIcon.svg"
import { ReactComponent as StakedAPRIcon } from "assets/icons/StakedAPR.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SBurnContainer } from "./Burn.styled"

export const Burn = () => {
  return (
    <SBurnContainer>
      <div>
        <PieChart percentage={20} loading={false} />
      </div>
      <div>
        <Icon
          size={18}
          sx={{ color: "brightBlue300", m: "auto" }}
          icon={<StakingRewardIcon />}
        />
        <Text color="brightBlue300" sx={{ my: "10px" }}>
          To be burned:
        </Text>
        <Text fs={[20, 30]} lh={[20, 30]} font="FontOver">
          2 455 LRNA
        </Text>
        <Text color="darkBlue200" fs={14}>
          ≈$59509,2
        </Text>
      </div>
      <div>
        <Icon
          size={18}
          sx={{ color: "brightBlue300", m: "auto" }}
          icon={<StakedAPRIcon />}
        />
        <Text color="brightBlue300" sx={{ my: "10px" }}>
          Protocol fees last 24h
        </Text>
        <Text fs={[20, 30]} lh={[20, 30]} font="FontOver">
          1 455 LRNA
        </Text>
        <Text color="darkBlue200" fs={14}>
          ≈$24.24
        </Text>
      </div>
    </SBurnContainer>
  )
}
