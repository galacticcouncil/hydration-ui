import {
  Flex,
  ProgressBar,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useOmnipoolCapacity } from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"

export const LiquidityLimit = ({ poolId }: { poolId: string }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { data: capacity, isLoading } = useOmnipoolCapacity(poolId)
  const { getAssetWithFallback } = useAssets()

  const { symbol } = getAssetWithFallback(poolId)

  return (
    <Flex direction="column">
      <Text
        font="primary"
        fw={500}
        fs="p3"
        lh="130%"
        color={getToken("text.high")}
        sx={{ pb: "s" }}
      >
        {t("liquidity:details.values.liquidityLimit")}
      </Text>

      <ProgressBar
        value={Number(capacity?.filledPercent ?? 0)}
        size="large"
        orientation="vertical"
        hideLabel
      />

      <Flex justify="space-between" align="center" mt="-m">
        {isLoading ? (
          <Skeleton width={100} />
        ) : (
          <Text fw={500} fs="p4" color={getToken("text.high")}>
            {t("number.compact", { value: capacity?.filled })} /{" "}
            {t("number.compact", { value: capacity?.capacity })} {symbol}
          </Text>
        )}
        {isLoading ? (
          <Skeleton width={40} />
        ) : (
          <Text fw={600} fs="p4" color={getToken("text.tint.quart")}>
            {t("percent", { value: capacity?.filledPercent })}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
