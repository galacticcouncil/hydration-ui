import { PieChart } from "../components/PieChart/PieChart"
import { ReactComponent as StakingRewardIcon } from "assets/icons/StakingRewardIcon.svg"
import { ReactComponent as StakedAPRIcon } from "assets/icons/StakedAPR.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SBurnContainer } from "./Burn.styled"
import { useTranslation } from "react-i18next"
import { useAssetMeta } from "api/assetMeta"
import { useApiIds } from "api/consts"
import { useHubAssetImbalance } from "api/omnipool"
import { useApiPromise } from "utils/api"

export const Burn = () => {
  const { t } = useTranslation()
  const api = useApiPromise()

  const toBeBurned = 2455
  const fees = 1455

  const apiIds = useApiIds()
  const imbalance = useHubAssetImbalance(api)
  const lrnaMeta = useAssetMeta(apiIds.data?.hubId)

  return (
    <SBurnContainer>
      <div>
        <PieChart
          percentage={20}
          loading={false}
          state={
            imbalance.data?.negative?.toPrimitive() ? "BURNING" : "BIDDING"
          }
        />
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
          {t("value.tokenWithSymbol", {
            value: toBeBurned,
            symbol: lrnaMeta.data?.symbol,
          })}
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
          {t("value.tokenWithSymbol", {
            value: fees,
            symbol: lrnaMeta.data?.symbol,
          })}
        </Text>
        <Text color="darkBlue200" fs={14}>
          ≈$24.24
        </Text>
      </div>
    </SBurnContainer>
  )
}
