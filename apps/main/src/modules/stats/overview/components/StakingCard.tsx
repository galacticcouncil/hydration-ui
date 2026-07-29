import { useTranslation } from "react-i18next"

import iconStaking from "@/assets/icons/icon-staking.png"
import { useStakingStats } from "@/modules/stats/hooks/useStakingStats"
import { ProductCard } from "@/modules/stats/overview/components/ProductCard"

export const StakingCard = () => {
  const { t } = useTranslation(["stats", "common"])
  const { data, isLoading } = useStakingStats()

  return (
    <ProductCard
      title={t("overview.products.staking.title")}
      desc={t("overview.products.staking.desc")}
      icon={iconStaking}
      isLoading={isLoading}
      span={3}
      metrics={[
        {
          label: t("overview.products.staking.projectedApr"),
          value: isLoading
            ? "-"
            : t("common:percent", { value: data.gigaProjectedApr }),
        },
        {
          label: t("overview.products.staking.hdxStaked"),
          value: isLoading
            ? "-"
            : t("common:number.compact", {
                value: data.gigaHdxStaked,
              }),
        },
        {
          label: t("overview.products.staking.hdxSupplyPercent"),
          value: isLoading
            ? "-"
            : t("common:percent", {
                value: data.gigaHdxStakedPercent,
              }),
        },
      ]}
    />
  )
}
