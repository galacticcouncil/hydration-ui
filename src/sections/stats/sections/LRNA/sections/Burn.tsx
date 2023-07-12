import { PieChart } from "../components/PieChart/PieChart"
import { ReactComponent as StakingRewardIcon } from "assets/icons/StakingRewardIcon.svg"
import { ReactComponent as StakedAPRIcon } from "assets/icons/StakedAPR.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SBurnContainer } from "./Burn.styled"
import { useTranslation } from "react-i18next"

export const Burn = () => {
  const { t, i18n } = useTranslation()

  const toBeBurned = 2455;
  const fees = 1455;

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
          {t("stats.lrna.burn.toBeBurned")}
        </Text>
        <Text fs={[20, 30]} lh={[20, 30]} font="FontOver">
          {i18n.format(toBeBurned, "bignumber")} LRNA
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
          {t("stats.lrna.burn.fees")}
        </Text>
        <Text fs={[20, 30]} lh={[20, 30]} font="FontOver">
          {i18n.format(fees, "bignumber")} LRNA
        </Text>
        <Text color="darkBlue200" fs={14}>
          ≈$24.24
        </Text>
      </div>
    </SBurnContainer>
  )
}
