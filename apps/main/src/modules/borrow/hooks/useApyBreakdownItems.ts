import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData, ExternalApyType } from "@/api/borrow"
import { ApyRowProps } from "@/components/DetailedApy/DetailedApy"
import i18n from "@/i18n"
import { ApyBreakdownProps } from "@/modules/borrow/components/ApyBreakdown"

type Options = Pick<ApyBreakdownProps, "type"> &
  Pick<BorrowAssetApyData, "underlyingAssetsApyData" | "incentives">

export const getApyLabel = (apyType?: ExternalApyType, isSupply?: boolean) => {
  if (apyType === "stake") {
    return i18n.t("stakeApy")
  }

  if (apyType === "nativeYield") {
    return i18n.t("nativeYieldApy")
  }

  if (isSupply) {
    return i18n.t("supplyApy")
  } else {
    return i18n.t("borrowApy")
  }
}

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
      ({ id, apyType, borrowApy, supplyApy }) => {
        const label = getApyLabel(apyType, isSupply)
        return {
          assetId: id,
          label,
          value: t("percent", {
            value: isSupply ? supplyApy : borrowApy,
          }),
        }
      },
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
