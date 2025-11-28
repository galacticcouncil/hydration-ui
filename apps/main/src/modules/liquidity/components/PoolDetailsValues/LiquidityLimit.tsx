import {
  Flex,
  ProgressBar,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useOmnipoolCapacity } from "@/modules/liquidity/Liquidity.utils"

export const LiquidityLimit = ({ poolId }: { poolId: string }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { data: capacity, isLoading } = useOmnipoolCapacity(poolId)

  return (
    <Flex direction="column">
      <Text
        font="primary"
        fw={500}
        fs={14}
        lh="130%"
        color={getToken("text.high")}
        sx={{ pb: getTokenPx("containers.paddings.primary") }}
      >
        {t("liquidity:details.values.liquidityLimit")}
      </Text>

      <ProgressBar
        value={Number(capacity?.filledPercent ?? 0)}
        size="large"
        orientation="vertical"
        format={() =>
          `${t("number.compact", { value: capacity?.filled })} / ${t("number.compact", { value: capacity?.capacity })}`
        }
        customLabel={isLoading ? <Skeleton width={100} /> : undefined}
      />
    </Flex>
  )
}
