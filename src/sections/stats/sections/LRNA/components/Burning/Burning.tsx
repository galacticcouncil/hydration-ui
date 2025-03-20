import { PieChart } from "sections/stats/sections/LRNA/components/PieChart/PieChart"
import StakingRewardIcon from "assets/icons/StakingRewardIcon.svg?react"
import StakedAPRIcon from "assets/icons/StakedAPR.svg?react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SBurnContainer } from "./Burning.styled"
import { useTranslation } from "react-i18next"
import { useHubAssetImbalance } from "api/omnipool"
import { formatValue } from "sections/stats/sections/LRNA/StatsLRNA.utils"
import BigNumber from "bignumber.js"
import { BN_0 } from "utils/constants"
import { BlockSkeleton } from "./BlockSkeleton"
import { useAssets } from "providers/assets"
import { useAssetsPrice } from "state/displayPrice"

export const Burning = () => {
  const { t } = useTranslation()
  const { hub } = useAssets()

  const meta = hub

  const symbol = meta?.symbol

  const hubAssetImbalance = useHubAssetImbalance()
  const imbalance = hubAssetImbalance?.data?.value
    ? new BigNumber(hubAssetImbalance.data.value.toHex())
    : BN_0

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice([meta.id])
  const price = getAssetPrice(meta.id).price

  const toBeBurnedSpotPrice = imbalance
    .times(price)
    .shiftedBy(-meta.decimals)
    .toNumber()

  // TODO: fetch historical value form indexer
  const maxHistoricalValue = new BigNumber(4567456745674564)
  const percentage = imbalance.times(100).div(maxHistoricalValue).toNumber()

  // TODO: fetch protocol fees
  const fees = new BigNumber(14551455145514)
  const feesSpotPrice = fees.times(price).shiftedBy(-meta.decimals).toNumber()

  const isLoading = hubAssetImbalance.isLoading || isPriceLoading

  return (
    <SBurnContainer>
      <div>
        <PieChart percentage={percentage} loading={isLoading} />
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
        {isLoading ? (
          <BlockSkeleton />
        ) : (
          <>
            <Text fs={[20, 30]} lh={[20, 30]}>
              {t("value.tokenWithSymbol", {
                value: formatValue(imbalance, meta?.decimals),
                symbol,
              })}
            </Text>
            <Text color="darkBlue200" fs={14}>
              ≈{toBeBurnedSpotPrice}
            </Text>
          </>
        )}
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
        {isLoading ? (
          <BlockSkeleton />
        ) : (
          <>
            <Text fs={[20, 30]} lh={[20, 30]}>
              {t("value.tokenWithSymbol", {
                value: formatValue(fees, meta?.decimals),
                symbol,
              })}
            </Text>
            <Text color="darkBlue200" fs={14}>
              ≈{feesSpotPrice}
            </Text>
          </>
        )}
      </div>
    </SBurnContainer>
  )
}
