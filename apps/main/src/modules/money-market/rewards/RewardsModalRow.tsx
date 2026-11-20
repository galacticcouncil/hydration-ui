import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

type RewardsModalRowProps = {
  assetId: string
  label: string
  symbol: string
  amount: string
  amountUsd: string
}

/** One reward in the rewards window: the token on the left, the amount on the right. */
export const RewardsModalRow: FC<RewardsModalRowProps> = ({
  assetId,
  label,
  symbol,
  amount,
  amountUsd,
}) => {
  const { t } = useTranslation()

  return (
    <Flex justify="space-between" align="center" gap="m">
      <Flex align="center" gap="s">
        <AssetLogo id={assetId} />
        <Text fs="p3" fw={600}>
          {label}
        </Text>
      </Flex>
      <Flex direction="column" align="flex-end" sx={{ flexShrink: 0 }}>
        <Text fs="p4" fw={600}>
          {t("currency", { value: amount, symbol })}
        </Text>
        {/* no price: the amount alone, not a value of zero */}
        {Big(amountUsd).gt(0) && (
          <Text fs="p5" lh={1} color={getToken("text.low")}>
            {t("currency", { value: amountUsd, maximumFractionDigits: 2 })}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
