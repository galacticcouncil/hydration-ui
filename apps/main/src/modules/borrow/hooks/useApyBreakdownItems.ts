import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { ApyRowProps } from "@/components/DetailedApy/DetailedApy"
import { ApyBreakdownProps } from "@/modules/borrow/components/ApyBreakdown"

type Options = Pick<ApyBreakdownProps, "type"> &
  Pick<BorrowAssetApyData, "underlyingAssetsApyData" | "incentives">

export const useApyBreakdownItems = ({
  type,
  underlyingAssetsApyData,
  incentives,
}: Options) => {
  const { t } = useTranslation()

  const isSupply = type === "supply"

  return useMemo(() => {
    const items: ApyRowProps[] = []

    const underlyingAssetsItems = underlyingAssetsApyData.map(
      ({ id, isStaked, borrowApy, supplyApy }) => ({
        assetId: id,
        label: isStaked
          ? t("stakeApy")
          : isSupply
            ? t("supplyApy")
            : t("borrowApy"),
        value: t("percent", {
          value: isSupply ? supplyApy : borrowApy,
        }),
      }),
    )

    const incentivesItems = incentives.map(
      ({ incentiveAPR, rewardTokenAddress }) => ({
        assetId: getAssetIdFromAddress(rewardTokenAddress),
        label: t("incentivesApr"),
        value: t("percent", {
          value: Big(incentiveAPR).times(100),
        }),
      }),
    )

    return items.concat(underlyingAssetsItems).concat(incentivesItems)
  }, [incentives, isSupply, t, underlyingAssetsApyData])
}
