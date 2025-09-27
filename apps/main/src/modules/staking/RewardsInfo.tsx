import { HydrationLogo } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

// TODO integrate
const allocated = 1255000

export const RewardsInfo: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()

  return (
    <Flex align="center" justify="space-between">
      <Flex align="center" gap={8}>
        <Icon component={HydrationLogo} size={18} />
        <Text fs={15} fw={500} lh={1.2} color={getToken("text.high")}>
          {t("staking:dashboard.allocated")}
        </Text>
      </Flex>
      <Text fw={700} color={getToken("text.high")}>
        {t("currency", {
          value: allocated,
          symbol: native.symbol,
        })}
      </Text>
    </Flex>
  )
}
