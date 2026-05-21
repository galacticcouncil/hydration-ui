import { USDC_ASSET_ID } from "@galacticcouncil/utils"
import { useMemo } from "react"
import { useForm } from "react-hook-form"

import { TAssetData } from "@/api/assets"
import { useAssets } from "@/providers/assetsProvider"

export type StableBondsFormValues = {
  depositAsset: TAssetData | null
  depositAmount: string
}

export const useStableBondsForm = () => {
  const { getAssetWithFallback } = useAssets()

  const defaultDepositAsset = useMemo(
    () => getAssetWithFallback(USDC_ASSET_ID),
    [getAssetWithFallback],
  )

  return useForm<StableBondsFormValues>({
    defaultValues: {
      depositAsset: defaultDepositAsset,
      depositAmount: "",
    },
  })
}
