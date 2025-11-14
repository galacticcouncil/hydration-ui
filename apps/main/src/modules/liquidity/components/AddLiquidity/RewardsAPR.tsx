import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { groupBy } from "remeda"

import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"

export const RewardsAPR = ({ farms }: { farms: Farm[] }) => {
  const { t } = useTranslation("common")
  const groupedFarms = groupBy(farms, (farm) => farm.rewardCurrency)

  return Object.entries(groupedFarms).map(([rewardCurrency, farms]) => {
    return (
      <Flex key={rewardCurrency} align="center" gap={4}>
        <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
          {t("percent", {
            prefix: "Up to ",
            value: farms
              .reduce((acc, farm) => acc.plus(farm.apr), Big(0))
              .toString(),
          })}
        </Text>
        <AssetLogo id={rewardCurrency.toString()} size="small" />
      </Flex>
    )
  })
}
