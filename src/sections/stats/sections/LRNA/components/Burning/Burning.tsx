import { PieChart } from "../PieChart/PieChart"
import { ReactComponent as StakingRewardIcon } from "assets/icons/StakingRewardIcon.svg"
import { ReactComponent as StakedAPRIcon } from "assets/icons/StakedAPR.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SBurnContainer } from "./Burning.styled"
import { useTranslation } from "react-i18next"
import { useLRNAMeta } from "api/assetMeta"
import { useHubAssetImbalance } from "api/omnipool"
import { useApiPromise } from "utils/api"
import { formatValue } from "../../StatsLRNA.utils"
import BigNumber from "bignumber.js"
import { BN_0 } from "utils/constants"
import { useMemo } from 'react'
import { useDisplayAssetStore } from 'utils/displayAsset'
export const Burning = () => {
  const api = useApiPromise()
  const { t } = useTranslation()

  const imbalance = useHubAssetImbalance(api)
  const meta = useLRNAMeta(api)

  const imbalanceValue = imbalance?.data?.value
  const symbol = meta.data?.data?.symbol

  const toBeBurned = formatValue(
    imbalanceValue ? new BigNumber(imbalanceValue.toHex()) : BN_0,
    meta.data,
  )

  const displayAsset = useDisplayAssetStore()

  // console.log('display asset', displayAsset.stableCoinId)

  // TODO: fetch historical value form indexer
  const maxHistoricalValue = 4567;
  const percentage = useMemo(() => toBeBurned.times(100).div(maxHistoricalValue).toNumber(), [maxHistoricalValue, toBeBurned]);
  const fees = 1455

  return (
    <SBurnContainer>
      <div>
        <PieChart percentage={percentage} loading={false} />
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
            symbol,
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
            symbol,
          })}
        </Text>
        <Text color="darkBlue200" fs={14}>
          ≈$24.24
        </Text>
      </div>
    </SBurnContainer>
  )
}
