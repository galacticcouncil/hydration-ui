import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { isGho } from "@galacticcouncil/money-market/utils"
import { Amount, Skeleton } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import {
  ApyBreakdown,
  ApyBreakdownProps,
} from "@/modules/borrow/components/ApyBreakdown"
import { NoData } from "@/modules/borrow/components/NoData"
import { useApyContext } from "@/modules/borrow/context/ApyContext"

type ApyColumnProps = Omit<ApyBreakdownProps, "apyData"> & {
  reserve: ComputedReserveData
}

export const ApyColumn: React.FC<ApyColumnProps> = ({ reserve, ...props }) => {
  const { t } = useTranslation()

  const { apyMap, isLoading } = useApyContext()

  if (isGho(reserve))
    return props.type === "supply" ? (
      <NoData />
    ) : (
      <Amount
        value={t("percent", {
          value: Number(reserve.variableBorrowAPY) * 100,
        })}
      />
    )

  if (isLoading) return <Skeleton />

  const apyData = apyMap.get(props.assetId)
  if (!apyData) return <NoData />

  const hasMultipleUnderlying = apyData.underlyingAssetsApyData.length > 1
  const hasIncentives = apyData.incentives.length > 0

  const shouldRenderDetailedApy = hasMultipleUnderlying || hasIncentives

  return shouldRenderDetailedApy ? (
    <ApyBreakdown apyData={apyData} {...props} justify="end" />
  ) : (
    <Amount
      value={t("percent", {
        value:
          props.type === "supply"
            ? apyData.underlyingSupplyApy
            : apyData.underlyingBorrowApy,
      })}
    />
  )
}
