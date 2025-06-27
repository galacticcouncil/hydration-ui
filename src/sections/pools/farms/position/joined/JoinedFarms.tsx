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
import { Badge } from "components/Badge/Badge"
import { Icon } from "components/Icon/Icon"
import WarningIcon from "assets/icons/WarningIconRed.svg?react"

type JoinedFarmsProps = { depositNft: TDeposit }

export const JoinedFarms = ({ depositNft }: JoinedFarmsProps) => {
  const { t } = useTranslation()
  const {
    pool: { allFarms, farms },
  } = usePoolData()

  const { getCurrentPeriod } = useFarmCurrentPeriod()

  const activeFarming = depositNft.data.yieldFarmEntries.every((entry) =>
    farms.find((farm) => farm.yieldFarmId === entry.yieldFarmId),
  )

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
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
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

        {!activeFarming && (
          <Badge
            size="medium"
            variant="orange"
            sx={{ flex: "row", gap: 4 }}
            css={{
              width: "fit-content",
              fontFamily: "GeistSemiBold",
            }}
          >
            <Icon
              size={12}
              css={{ color: `rgba(247, 191, 6, 1)` }}
              icon={<WarningIcon />}
            />
            {t("farms.details.card.badge.depleted")}
          </Badge>
        )}
      </div>
    </div>
  )
}
