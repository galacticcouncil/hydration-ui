import { Flex, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import type { TreasuryData } from "@/api/treasury"
import {
  STooltipRow,
  STooltipSection,
  STooltipTitle,
} from "@/modules/stats/treasury/StatsTreasury.styled"

export const NetTreasuryTooltipContent = ({
  data,
}: {
  data: TreasuryData | undefined
}) => {
  const { t } = useTranslation("stats")

  if (!data) return null

  return (
    <Flex direction="column" gap="base">
      <STooltipTitle>{t("treasury.holdings.breakdown")}</STooltipTitle>
      <STooltipSection>
        <TreasuryHoldingsTooltipRow
          label={t("treasury.composition.assetBalance")}
          value={data.totalAssetWalletDisplay}
        />
        <TreasuryHoldingsTooltipRow
          label={t("treasury.composition.offchain")}
          value={data.totalOffchainBalanceDisplay}
        />
        <TreasuryHoldingsTooltipRow
          label={t("treasury.composition.suppliedAsLiquidity")}
          value={data.totaLiquidityBalanceDisplay}
        />
        <TreasuryHoldingsTooltipRow
          label={t("treasury.composition.suppliedAsCollateral")}
          value={data.totalNetSupplyBalanceDisplay}
        />
        <TreasuryHoldingsTooltipRow
          label={t("treasury.holdings.borrowed")}
          value={data.totalDebtBalanceDisplay}
          negative
        />
      </STooltipSection>
      <STooltipSection>
        <TreasuryHoldingsTooltipRow
          label={t("treasury.holdings.total")}
          value={Big(data.totalValueDisplay)
            .plus(data.totalDebtBalanceDisplay)
            .toString()}
        />
        <TreasuryHoldingsTooltipRow
          label={t("treasury.netValue")}
          value={data.totalValueDisplay}
        />
      </STooltipSection>
    </Flex>
  )
}

const TreasuryHoldingsTooltipRow = ({
  label,
  value,
  negative,
}: {
  label: string
  value: string
  negative?: boolean
}) => {
  const { t } = useTranslation("common")
  return (
    <STooltipRow>
      <Text fs="p7" fw={500} color="text.high">
        {label}
      </Text>
      <Text fs="p7" fw={600} color="text.high" sx={{ textAlign: "right" }}>
        {negative && "-"}
        {t("currency.compact", { value })}
      </Text>
    </STooltipRow>
  )
}
