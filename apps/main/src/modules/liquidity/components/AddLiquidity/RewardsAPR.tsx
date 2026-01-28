import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { groupBy } from "remeda"

import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"

export const RewardsAPR = ({ farms, fee }: { farms: Farm[]; fee?: string }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const groupedFarms = groupBy(farms, (farm) => farm.rewardCurrency)

  if (!farms.length)
    return (
      <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
        {t("common:percent", {
          value: fee ?? 0,
        })}
      </Text>
    )

  return Object.entries(groupedFarms).map(([rewardCurrency, farms]) => (
    <Flex key={rewardCurrency} align="center" gap="s">
      <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
        {t("liquidity.availableFarms.apr.short", {
          value: farms
            .reduce((acc, farm) => acc.plus(farm.apr), Big(0))
            .plus(fee ?? 0)
            .toString(),
        })}
      </Text>
      <AssetLogo id={rewardCurrency.toString()} size="small" />
    </Flex>
  ))
}
