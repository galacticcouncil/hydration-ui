import { Flex, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const SupplyAssetsHeader = () => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <Flex gap={40} p={20}>
      <ValueStats
        label={t("balance")}
        value={t("currency", { value: 12245 })}
        size="small"
        alwaysWrap
      />
      <ValueStats
        label={t("apy")}
        value={t("percent", { value: 12.25 })}
        size="small"
        alwaysWrap
      />
      <ValueStats
        label={t("borrow:collateral")}
        value={t("currency", { value: 12245 })}
        size="small"
        alwaysWrap
      />
    </Flex>
  )
}
