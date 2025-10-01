import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"

export const AssetLabelFarms = ({
  farms,
  children,
}: {
  farms: Farm[]
  children: React.ReactNode
}) => {
  const { t } = useTranslation("common")
  const farmRewardsIconIds = farms.map((farm) => farm.rewardCurrency.toString())

  return (
    <Flex direction="column">
      {children}
      <Flex align="center" gap={4}>
        <AssetLogo id={farmRewardsIconIds} size="extra-small" />
        <Text color={getToken("text.tint.secondary")} fs="p6" lh={1}>
          {t("percent", {
            value: Number(
              farms
                .reduce((acc, farm) => acc.plus(farm.apr), new Big(0))
                .toString(),
            ),
          })}
        </Text>
        <TooltipAPR farms={farms} />
      </Flex>
    </Flex>
  )
}
