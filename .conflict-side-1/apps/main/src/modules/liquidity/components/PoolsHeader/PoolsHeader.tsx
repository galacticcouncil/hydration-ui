import { Flex, Separator, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"
export const PoolsHeader = () => {
  const { t } = useTranslation(["liquidity", "common"])

  return (
    <Flex gap={20} justify="space-between" sx={{ py: 20, overflowX: "auto" }}>
      <ValueStats
        label={t("liquidity:header.totalLiquidity")}
        value={t("common:currency", { value: 1000000 })}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", { value: 1000000 })}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency", { value: 1000000 })}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency", { value: 1000000 })}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency", { value: 1000000 })}
        size="medium"
        alwaysWrap
      />
    </Flex>
  )
}
