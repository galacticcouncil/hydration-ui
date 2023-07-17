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
import { useDisplayAssetStore } from "utils/displayAsset"
import { useSpotPrice } from "api/spotPrice"

export const Burning = () => {
  const api = useApiPromise()
  const { t } = useTranslation()

  const meta = useLRNAMeta(api)
  const symbol = meta.data?.data?.symbol

  const hubAssetImbalance = useHubAssetImbalance(api)
  const imbalance = hubAssetImbalance?.data?.value
    ? new BigNumber(hubAssetImbalance.data.value.toHex())
    : BN_0

  const displayAsset = useDisplayAssetStore()
  const spotPrice = useSpotPrice(meta.data?.id, displayAsset.stableCoinId)
  const toBeBurnedSpotPrice = formatValue(
    spotPrice?.data?.spotPrice.multipliedBy(imbalance),
    meta.data,
  ).toNumber()

  // TODO: fetch historical value form indexer
  const maxHistoricalValue = new BigNumber(4567456745674564)
  const percentage = imbalance.times(100).div(maxHistoricalValue).toNumber()

  // TODO: fetch protocol fees
  const fees = new BigNumber(14551455145514)
  const feesSpotPrice = formatValue(
    spotPrice?.data?.spotPrice.multipliedBy(fees),
    meta.data,
  ).toNumber()

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
            value: formatValue(imbalance, meta.data),
            symbol,
          })}
        </Text>
        <Text color="darkBlue200" fs={14}>
          ≈{displayAsset.symbol}
          {toBeBurnedSpotPrice}
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
            value: formatValue(fees, meta.data),
            symbol,
          })}
        </Text>
        <Text color="darkBlue200" fs={14}>
          ≈{displayAsset.symbol}
          {feesSpotPrice}
        </Text>
      </div>
    </SBurnContainer>
  )
}
