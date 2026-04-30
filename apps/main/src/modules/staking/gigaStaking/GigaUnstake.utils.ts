import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { TAssetData } from "@/api/assets"
import { GigaUnstakeProps } from "@/modules/staking/gigaStaking/GigaUnstake"
import { useAssets } from "@/providers/assetsProvider"
import { positive } from "@/utils/validators"

export type GigaUnstakeFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaUnstake = ({ userBorrowSummary }: GigaUnstakeProps) => {
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation(["common"])
  const meta = getAssetWithFallback(HDX_ERC20_ASSET_ID)

  const hdxReserve = userBorrowSummary.hdxReserve
  const borrowableHollar = userBorrowSummary.borrowableHollar

  const suppliedHdx = Big(hdxReserve.underlyingBalance)
  const availableBorrowUsd = Big(borrowableHollar)
  const currentLoanToValue = Big(
    userBorrowSummary.userSummary.currentLoanToValue,
  )

  const hdxPriceUsd = Big(hdxReserve.reserve.priceInUSD)
  const debtConstrainedMaxUnstake =
    currentLoanToValue.gt(0) && hdxPriceUsd.gt(0)
      ? availableBorrowUsd.div(currentLoanToValue).div(hdxPriceUsd)
      : suppliedHdx
  const maxUnstake = Big.min(suppliedHdx, debtConstrainedMaxUnstake).toString()

  const form = useForm<GigaUnstakeFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: meta,
    },

    resolver: standardSchemaResolver(
      z.object({
        amount: positive.refine((value) => Big(value || "0").lte(maxUnstake), {
          error: t("error.maxBalance"),
        }),
        asset: z.custom<TAssetData>(),
      }),
    ),
  })

  const onSubmit = form.handleSubmit((values) => {
    console.log(values)
  })

  return {
    form,
    meta,
    maxUnstake,
    onSubmit,
  }
}
