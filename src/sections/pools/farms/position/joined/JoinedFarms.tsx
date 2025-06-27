import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useFarmCurrentPeriod } from "api/farms"
import { getCurrentLoyaltyFactor } from "utils/farms/apr"
import { isNotNil } from "utils/helpers"
import { usePoolData } from "sections/pools/pool/Pool"
import { TDeposit } from "api/deposits"
import BN from "bignumber.js"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

type JoinedFarmsProps = { depositNft: TDeposit }

export const JoinedFarms = ({ depositNft }: JoinedFarmsProps) => {
  const { t } = useTranslation()
  const {
    pool: { allFarms },
  } = usePoolData()

  const { getCurrentPeriod } = useFarmCurrentPeriod()

  const joinedFarmsAprs =
    allFarms
      ?.map((farm) => {
        const joinedYieldFarm = depositNft.data.yieldFarmEntries.find(
          (nft) => nft.yieldFarmId.toString() === farm.yieldFarmId,
        )

        if (!joinedYieldFarm) return null

        const currentPeriod = getCurrentPeriod(farm.blocksPerPeriod)

        const currentPeriodInFarm = currentPeriod
          ? BN(currentPeriod).minus(joinedYieldFarm.enteredAt)
          : undefined

        const currentApr =
          farm.loyaltyCurve && currentPeriodInFarm
            ? BN(farm.apr).times(
                getCurrentLoyaltyFactor(farm.loyaltyCurve, currentPeriodInFarm),
              )
            : BN(farm.apr)

        return { currentApr, assetId: farm.rewardCurrency }
      })
      .filter(isNotNil) ?? []

  const aprs = joinedFarmsAprs.map(
    (joinedFarmsApr) => joinedFarmsApr.currentApr,
  )

  return (
    <div sx={{ flex: "column", gap: 6 }}>
      <Text fs={14} color="basic500">
        {t("farms.positions.labels.joinedFarms.title")}
      </Text>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <MultipleIcons
          size={22}
          icons={joinedFarmsAprs.map((joinedFarmsApr) => ({
            icon: (
              <AssetLogo
                key={joinedFarmsApr.assetId}
                id={joinedFarmsApr.assetId}
              />
            ),
          }))}
        />
        <Text fs={16} color="white">
          {aprs.length
            ? aprs
                .map((apr) =>
                  t("value.percentage", { value: apr, decimalPlaces: 1 }),
                )
                .join(" + ")
            : t("value.percentage", { value: 0, decimalPlaces: 1 })}
          {" " + t("apr")}
        </Text>
      </div>
    </div>
  )
}
