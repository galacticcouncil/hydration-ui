import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { ApyRowProps } from "@/components/DetailedApy/DetailedApy"
import { ApyBreakdownProps } from "@/modules/borrow/components/ApyBreakdown"

type Options = Pick<ApyBreakdownProps, "type" | "omnipoolFee"> &
  Pick<BorrowAssetApyData, "lpAPY" | "underlyingAssetsApyData" | "incentives">

export const useApyBreakdownItems = ({
  type,
  omnipoolFee,
  lpAPY,
  underlyingAssetsApyData,
  incentives,
}: Options) => {
  const { t } = useTranslation()

  const isSupply = type === "supply"

  return useMemo(() => {
    const items: ApyRowProps[] = []
    if (Big(omnipoolFee ?? 0).gt(0)) {
      items.push({
        label: t("apr.lpFeeOmnipool"),
        value: t("percent", { value: omnipoolFee }),
      })
    }

    if (Big(lpAPY ?? 0).gt(0)) {
      items.push({
        label: t("apr.lpFeeOmnipool"),
        value: t("percent", { value: lpAPY }),
      })
    }

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
  }, [incentives, isSupply, lpAPY, omnipoolFee, t, underlyingAssetsApyData])
}
