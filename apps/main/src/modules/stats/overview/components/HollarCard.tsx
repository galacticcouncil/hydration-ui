import { Flex } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import iconHollar from "@/assets/icons/icon-hollar.png"
import { useHollarStats } from "@/modules/stats/hooks/useHollarStats"
import { ProductCard } from "@/modules/stats/overview/components/ProductCard"
import { SPegDot } from "@/modules/stats/overview/components/ProductCards.styled"

export const HollarCard = () => {
  const { t } = useTranslation(["stats", "common"])
  const { stats, isLoading } = useHollarStats()
  const isStable =
    !isLoading && stats.hollarPeg >= 0.99 && stats.hollarPeg <= 1.01

  return (
    <ProductCard
      title={t("overview.products.hollar.title")}
      desc={t("overview.products.hollar.desc")}
      icon={iconHollar}
      span={2}
      isLoading={isLoading}
      metrics={[
        {
          label: t("overview.products.hollar.totalSupply"),
          value: isLoading
            ? "-"
            : t("common:currency.compact", { value: stats.hollarSupply }),
        },
        {
          label: t("overview.products.hollar.pegStatus"),
          value: isLoading ? (
            "-"
          ) : (
            <Flex align="center" gap="xs">
              <SPegDot $stable={isStable} />
              {isStable
                ? t("overview.products.hollar.peg.stable")
                : t("overview.products.hollar.peg.depegged")}
            </Flex>
          ),
        },
      ]}
    />
  )
}
