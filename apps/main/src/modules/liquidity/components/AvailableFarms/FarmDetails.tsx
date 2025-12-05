import { Calendar, Droplet, Percent } from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  Flex,
  Icon,
  ModalContentDivider,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { addSeconds } from "date-fns/addSeconds"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import {
  TJoinedFarm,
  useSecondsToLeft,
} from "@/modules/liquidity/components/Farms/Farms.utils"
import { LoyaltyGraph } from "@/modules/liquidity/components/Farms/LoyaltyGraph"
import { getCurrentLoyaltyFactor } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import {
  useFormatRewards,
  useTotalRewardsToReceive,
} from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquidity.utils"
import { useAssets } from "@/providers/assetsProvider"

export const FarmDetails = ({
  farm,
  joinedFarm,
}: {
  farm: Farm
  joinedFarm?: TJoinedFarm
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(farm.rewardCurrency)

  const secondsToLeft = useSecondsToLeft(farm.estimatedEndBlock)

  const { value: rewards } = useTotalRewardsToReceive(
    joinedFarm
      ? [{ ...joinedFarm.position, yield_farm_entries: [joinedFarm.farmEntry] }]
      : [],
  )

  const formattedRewards = useFormatRewards(rewards)

  const currentApr = useMemo(() => {
    if (!joinedFarm) return undefined
    if (!farm.loyaltyCurve) return farm.apr

    return Big(farm.apr)
      .times(
        getCurrentLoyaltyFactor(
          farm.loyaltyCurve,
          Big(joinedFarm.period)
            .minus(joinedFarm.farmEntry.entered_at)
            .toNumber(),
        ),
      )
      .toString()
  }, [farm, joinedFarm])

  return (
    <Flex
      direction="column"
      gap={14}
      px={20}
      py={getTokenPx("containers.paddings.primary")}
      sx={{
        backgroundColor: getToken("surfaces.containers.mid.primary"),
        borderRadius: getTokenPx("containers.cornerRadius.containersPrimary"),
      }}
    >
      <Flex align="center" gap={10} justify="space-between">
        <Flex align="center" gap={10}>
          <AssetLogo id={meta.id} />
          <Text color={getToken("text.high")} fs="p3" fw={600}>
            {meta.symbol}
          </Text>
        </Flex>

        <Chip variant="green" size="small">
          {t("liquidity.availableFarms.apr", {
            value: farm.apr,
          })}
        </Chip>
      </Flex>

      <ModalContentDivider />

      {farm.loyaltyCurve && <LoyaltyGraph farm={farm} />}

      <Summary
        rows={[
          ...(currentApr
            ? [
                {
                  label: (
                    <Flex align="center" gap={4}>
                      <Icon
                        component={Percent}
                        size={18}
                        color={getToken("text.medium")}
                      />
                      <Text fs="p3" color={getToken("text.high")}>
                        {t("common:currentApr")}
                      </Text>
                    </Flex>
                  ),
                  content: (
                    <Text
                      fs="p3"
                      fw={600}
                      color={getToken("text.tint.secondary")}
                    >
                      {t("common:percent", {
                        value: currentApr,
                      })}
                    </Text>
                  ),
                },
              ]
            : []),
          {
            label: (
              <Flex align="center" gap={4}>
                <Icon
                  component={Calendar}
                  size={18}
                  color={getToken("text.medium")}
                />
                <Text fs="p3" color={getToken("text.high")}>
                  {t("liquidity.farmDetails.expectedEnd.label")}
                </Text>
              </Flex>
            ),
            content: (
              <Text fs="p3" fw={600} color={getToken("text.tint.secondary")}>
                {secondsToLeft
                  ? t("common:date.default", {
                      value: addSeconds(new Date(), secondsToLeft.toNumber()),
                      format: "dd.MM.yyyy",
                    })
                  : "N/A"}
              </Text>
            ),
          },
          ...(rewards.length
            ? [
                {
                  label: (
                    <Flex align="center" gap={4}>
                      <Icon
                        component={Droplet}
                        size={18}
                        color={getToken("text.medium")}
                      />
                      <Text fs="p3" color={getToken("text.high")}>
                        {t("liquidity.farmDetails.accumulatedRewards.label")}
                      </Text>
                    </Flex>
                  ),
                  content: (
                    <Text
                      fs="p3"
                      fw={600}
                      color={getToken("text.tint.secondary")}
                    >
                      {formattedRewards}
                    </Text>
                  ),
                },
              ]
            : []),
        ]}
      />
    </Flex>
  )
}
