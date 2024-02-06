import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useFarmAprs, useFarms } from "api/farms"
import { getCurrentLoyaltyFactor } from "utils/farms/apr"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import BigNumber from "bignumber.js"
import { isNotNil } from "utils/helpers"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"

type JoinedFarmsProps = { depositNft: TMiningNftPosition; poolId: string }

export const JoinedFarms = ({ depositNft, poolId }: JoinedFarmsProps) => {
  const { t } = useTranslation()
  const farms = useFarms([poolId])

  const joinedFarms =
    farms.data?.filter((farm) => {
      return depositNft.data.yieldFarmEntries.some(
        (entry) =>
          entry.globalFarmId.eq(farm.globalFarm.id) &&
          entry.yieldFarmId.eq(farm.yieldFarm.id) &&
          entry.yieldFarmId.toString() === farm.yieldFarm.id.toString(),
      )
    }) ?? []

  const farmAprs = useFarmAprs(joinedFarms)

  const joinedFarmsAprs =
    farmAprs.data
      ?.map((farmApr) => {
        const joinedYieldFarm = depositNft.data.yieldFarmEntries.find(
          (nft) => nft.yieldFarmId.toString() === farmApr.yieldFarmId,
        )

        if (!joinedYieldFarm) return null

        const currentPeriodInFarm = farmApr.currentPeriod.minus(
          joinedYieldFarm.enteredAt.toBigNumber(),
        )

        const currentApr = farmApr.loyaltyCurve
          ? farmApr.apr.times(
              getCurrentLoyaltyFactor(
                farmApr.loyaltyCurve,
                currentPeriodInFarm,
              ),
            )
          : farmApr.apr

        return { currentApr, assetId: farmApr.assetId.toString() }
      })
      .filter(isNotNil) ?? []

  const aprs = joinedFarmsAprs.map(
    (joinedFarmsApr) => joinedFarmsApr.currentApr,
  )

  const minApr = BigNumber.minimum(...aprs)
  const maxApr = BigNumber.maximum(...aprs)

  return (
    <div sx={{ flex: "column", gap: 6 }}>
      <Text fs={14} color="basic500">
        {t("farms.positions.labels.joinedFarms.title")}
      </Text>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <MultipleIcons
          size={22}
          icons={joinedFarmsAprs.map((joinedFarmsApr) => ({
            icon: <AssetLogo id={joinedFarmsApr.assetId} />,
          }))}
        />
        <Text fs={16} color="white">
          {t(`value.multiAPR`, { minApr, maxApr })}
        </Text>
      </div>
    </div>
  )
}
